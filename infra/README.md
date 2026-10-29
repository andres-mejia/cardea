# Infra de Cardea

Terraform plano en `environments/dev`, módulos en `modules/`, estado en `cardea-terraform-state-966378755474` con locks en `cardea-terraform-locks`. Cuenta `966378755474` (compartida con Fenora), región `eu-west-1`, perfil local `fintrack-dev`. Especificación: `specs/001-infra-base/`.

## Qué hay

| Fichero | Contenido |
|---|---|
| `main.tf` | Landing (`cardea.tekhos.com`) y panel (`cardea-app.tekhos.com`) en Amplify; formulario de contacto (HTTP API + Lambda + DynamoDB + SES). |
| `network.tf` | VPC `10.20.0.0/16`, NAT instance fck-nat, bastión SSM, SG de las Lambdas, Aurora Serverless v2 privada (ADR-004). |
| `identity.tf` | Cognito (Hosted UI en `cardea-dev.auth.eu-west-1.amazoncognito.com`) y HTTP API del control plane con autorizador JWT. |
| `platform.tf` | ECR por servicio, cola `cardea-usage-dev` con DLQ, bucket de informes, conjunto de configuración SES. |
| `ci.tf` | Roles OIDC de GitHub Actions: apply (`main`) y plan (PR). |
| `outputs.tf` | Contrato con las demás specs: `specs/001-infra-base/contracts/terraform-outputs.md`. |

## Lo que se usa y no se gestiona aquí

- **Zona `tekhos.com`**: se lee con un data source. Amplify escribe en ella los registros de `cardea` y `cardea-app`; nada más se toca.
- **Correo**: la identidad SES `tekhos.com` (stack CloudFormation `tekhos-email-sending`, eu-west-1) permite enviar como `cardea@tekhos.com`; la regla `catch-all-tekhos` (stack `tekhos-email-receiving`, us-east-1) reenvía todo `@tekhos.com` a Andrés.
- **Proveedor OIDC de GitHub**: lo gestiona el estado de Fenora; aquí es un data source.
- `cardea.ai` no está disponible (es de un tercero). Pasar a un dominio propio es cambiar `base_domain`, `landing_prefix`, `panel_prefix` y `mail_address`.

## Orden de arranque (una vez)

1. **Estado remoto**: `AWS_PROFILE=fintrack-dev infra/bootstrap.sh` (idempotente).
2. **Primer apply local**, con plan, resumen y OK (crea los roles de CI, que aún no existen):
   ```bash
   cd infra/environments/dev
   export AWS_PROFILE=fintrack-dev
   terraform init -backend-config="bucket=cardea-terraform-state-966378755474"
   terraform plan -out=tfplan
   terraform show -json tfplan > tfplan.json && python3 ../../../.github/scripts/guardia_plan.py tfplan.json
   terraform apply tfplan
   ```
   El backend S3 no usa `aws_profile`: exporta `AWS_PROFILE` antes de `init`.
3. **Política de arranque de CI** por CLI: `infra/bootstrap/README.md`.
4. **Secretos de GitHub** con las salidas del apply:
   ```bash
   gh secret set AWS_GITHUB_OIDC_ROLE_ARN --body "$(terraform output -raw github_actions_role_arn)"
   gh secret set AWS_GITHUB_OIDC_PLAN_ROLE_ARN --body "$(terraform output -raw github_actions_plan_role_arn)"
   ```
5. **Conexión Amplify–GitHub**: Amplify no deja conectar un repositorio a una app que ya tiene ramas de despliegue manual, así que el token va en el apply que **crea** las apps (en el primero, o recreándolas si se crearon sin él):
   ```bash
   # gh ≥ 2.17: gh auth token. gh 2.4 (Ubuntu) no lo tiene y su mensaje de error acabaría
   # como token: Amplify responde "There was an issue setting up your repository".
   export TF_VAR_github_access_token="$(gh auth token 2>/dev/null || gh auth status --show-token 2>&1 | grep -oE 'gh[opu]_[A-Za-z0-9_]+' | head -1)"
   terraform apply -replace=module.panel.aws_amplify_app.this
   unset TF_VAR_github_access_token
   ```
   Solo el panel se conecta: la landing se publica por despliegue manual desde `landing-deploy.yml`.
   Después, `ignore_changes = [repository, access_token]` en `amplify-site` hace que los applies del pipeline (sin token) no toquen la conexión. El token no va al repo; sí queda en el estado (bucket cifrado, sin acceso público) como atributo sensible de la app.
6. **A partir de aquí, el pipeline**: `infra · plan` en cada PR que toca `infra/**` y `infra · aplicar` en cada push a `main`.

## Pasos manuales declarados

Fuera de Terraform y siempre por CLI (nunca por consola): `bootstrap.sh`, la política de arranque de CI y los secretos de GitHub. La conexión Amplify–GitHub va por Terraform, pero con el token de `gh` pasado a mano en el apply que crea las apps.

## Operación

- **Acceso a Aurora**: `terraform output -raw bastion_ssm_command` y port forwarding:
  ```bash
  aws ssm start-session --target <bastion> --profile fintrack-dev \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters host=<aurora_connection_endpoint>,portNumber=5432,localPortNumber=15432
  PGPASSWORD="$(aws rds generate-db-auth-token --hostname <aurora> --port 5432 --username <usuario_iam> --profile fintrack-dev)" \
    psql "host=localhost port=15432 dbname=cardea_dev user=<usuario_iam> sslmode=require"
  ```
  El usuario maestro `cardea_admin` usa la contraseña del secreto `aurora_master_secret_arn`; los usuarios de servicio con IAM los crea la migración de la spec 002.
- **Aurora en pausa**: con `min_acu = 0` se pausa a los 5 minutos sin conexiones; la primera conexión tras la pausa tarda unos segundos (`DatabaseResumingException`) y hay que reintentar.
- **Coste en reposo**: unos 12 €/mes (NAT, bastión, una IPv4 pública, discos, secreto). El bastión se puede parar cuando no se use: `aws ec2 stop-instances --instance-ids <bastion> --profile fintrack-dev`.
- **Destrucciones**: la guardia del plan para cualquier borrado de datos. Para autorizar uno a mano: `workflow_dispatch` de `infra-apply.yml` con `permitir_destruccion` y la dirección exacta.

## Riesgos de la cuenta compartida

- El rol de CI de Fenora tiene `Allow *` hasta el 2027-01-31 y puede tocar recursos de Cardea; el de Cardea tiene `Deny` explícito sobre lo de Fenora (`infra/bootstrap/README.md`).
- Si Fenora retira el proveedor OIDC, los roles de Cardea dejan de funcionar.
