# Quickstart: validar 001-infra-base

Cada paso cierra un criterio con su comando y su salida literal en el PR (principio V). Perfil local `fintrack-dev`; en CI, OIDC.

## 0 · Requisitos

- `aws sso login --profile fintrack-dev`; `aws sts get-caller-identity --profile fintrack-dev` devuelve la cuenta `966378755474`.
- Terraform ≥ 1.6, Python 3.11, `pytest`.

## 1 · Estado remoto (FR-001)

```bash
AWS_PROFILE=fintrack-dev infra/bootstrap.sh          # solo tras OK de Andrés
AWS_PROFILE=fintrack-dev infra/bootstrap.sh          # segunda vez: idempotente, sin errores
aws s3api get-bucket-versioning --bucket cardea-terraform-state-966378755474 --profile fintrack-dev   # Status: Enabled
aws dynamodb describe-table --table-name cardea-terraform-locks --profile fintrack-dev --query Table.TableStatus   # ACTIVE
```

## 2 · Estático (sin credenciales)

```bash
terraform -chdir=infra fmt -check -recursive
terraform -chdir=infra/environments/dev init -backend=false && terraform -chdir=infra/environments/dev validate
python3 -m pytest .github/scripts/test_guardia_plan.py -q
```

## 3 · Primer apply local (parada: plan, resumen y OK)

```bash
cd infra/environments/dev
terraform init -backend-config="bucket=cardea-terraform-state-966378755474"
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json && python3 ../../../.github/scripts/guardia_plan.py tfplan.json
# Comprobar en el plan: 0 recursos con fenora/fintrack en el nombre; ningún cambio en asociaciones Amplify ajenas;
# ningún aws_iam_openid_connect_provider como resource.
terraform apply tfplan                                  # solo con OK
terraform plan -detailed-exitcode                       # exit 0: idempotente (SC-001)
```

## 4 · Arranque de CI (FR-004, FR-007)

Andrés adjunta la política de arranque por CLI (`infra/bootstrap/README.md`) y se dan de alta los secretos `AWS_GITHUB_OIDC_ROLE_ARN` y `AWS_GITHUB_OIDC_PLAN_ROLE_ARN` con `gh secret set` (tras OK). Validación:

- PR que toca `infra/**`: `infra · formato` y `infra · plan` en verde.
- Merge: `infra · aplicar` en verde y `No changes` si no había diferencias.

## 5 · Landing y formulario (US1, SC-002)

```bash
curl -sI https://cardea.tekhos.com | head -1                     # HTTP/2 200
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$(terraform output -raw contact_endpoint)" \
  -H 'content-type: application/json' -d '{"nombre":"Prueba","email":"prueba@example.com","uso":"api"}'    # 200
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$(terraform output -raw contact_endpoint)" \
  -H 'content-type: application/json' -d '{"email":"no-es-correo"}'                          # 400
aws dynamodb get-item --table-name cardea-contact-dev --key '{"email":{"S":"prueba@example.com"}}' --profile fintrack-dev
```

El aviso llega a ramejiafernandez@gmail.com reenviado desde `cardea@tekhos.com`. Después, borrar el ítem de prueba.

## 6 · Control plane (US3)

```bash
terraform output   # incluye las salidas de contracts/terraform-outputs.md
$(terraform output -raw bastion_ssm_command) --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters host=$(terraform output -raw aurora_connection_endpoint),portNumber=5432,localPortNumber=15432 &
psql "host=localhost port=15432 dbname=cardea_dev user=cardea_admin sslmode=require" -c 'select 1'
nc -vz -w 5 $(terraform output -raw aurora_connection_endpoint) 5432        # desde internet: timeout
```

Pausa: tras 5 min sin conexiones, `aws rds describe-db-clusters --db-cluster-identifier cardea-dev` y CloudWatch `ServerlessDatabaseCapacity = 0`.

Cognito: en https://cardea-app.tekhos.com, «Entrar» abre la Hosted UI de `cardea-dev.auth.eu-west-1.amazoncognito.com`. Para comprobar el `iss` sin la sesión de la spec 002, un usuario de prueba creado con `aws cognito-idp admin-create-user` hace el flujo PKCE a mano: `scripts/cognito-pkce.sh` imprime la URL de autorización con `code_challenge`, se inicia sesión en el navegador, se pega el `code` de la URL de vuelta y el script canjea en `/oauth2/token` y decodifica el `iss` del ID token (igual a `cognito_issuer`). El usuario de prueba se borra al terminar.

Zona `tekhos.com`: `aws route53 list-resource-record-sets` comparado con la foto de [inventario.md](inventario.md); solo aparecen registros nuevos de `cardea`, `cardea-app` y su validación.

Rol de plan (escenario 3 de US2): `aws iam simulate-principal-policy --policy-source-arn <plan_role_arn> --action-names s3:PutObject dynamodb:PutItem ec2:CreateVpc secretsmanager:GetSecretValue` → solo `dynamodb:PutItem` sobre `cardea-terraform-locks` sale `allowed`.

## 7 · Inventario (SC-004)

```bash
aws resourcegroupstaggingapi get-resources --tag-filters Key=Project,Values=cardea --profile fintrack-dev \
  --query 'ResourceTagMappingList[].ResourceARN' --output text | tr '\t' '\n' | sort > /tmp/etiquetados.txt
terraform state list | sort
```

Todo lo etiquetado tiene su recurso en el estado; las excepciones declaradas son los CNAME de Amplify en `tekhos.com` y la política de arranque de CI.
