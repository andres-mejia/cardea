# Data Model: 001-infra-base

No hay modelo de datos de aplicación. Las «entidades» son los recursos con nombre estable que otras specs referencian. Todos llevan `Project=cardea`, `Environment=dev`, `ManagedBy=terraform` salvo donde se indica.

## Estado de Terraform (fuera del estado, `bootstrap.sh`)

| Recurso | Nombre | Reglas |
|---|---|---|
| S3 | `cardea-terraform-state-966378755474` | Versionado, SSE, acceso público bloqueado. Clave `dev/terraform.tfstate`. |
| DynamoDB | `cardea-terraform-locks` | `LockID` (S), PAY_PER_REQUEST. |

## Identidad de CI

| Recurso | Nombre | Confianza (`sub`) | Permisos |
|---|---|---|---|
| Rol IAM | `cardea-dev-github-actions` | `repo:andres-mejia/cardea:ref:refs/heads/main` | Permanente: ECR push `cardea/*`, `lambda:UpdateFunctionCode` `cardea-dev-*`. Arranque (CLI): `Allow *` hasta 2027-01-31 con Deny de guarda. |
| Rol IAM | `cardea-dev-github-actions-plan` | `repo:andres-mejia/cardea:pull_request` | `ReadOnlyAccess` + estado + locks; Deny de lectura de datos. |
| Proveedor OIDC | `token.actions.githubusercontent.com` | — | **Data source**; lo gestiona Fenora. |

## Red

| Recurso | Nombre | Reglas |
|---|---|---|
| VPC | `cardea-dev-vpc` | `10.20.0.0/16`, DNS hostnames. |
| Subredes | `cardea-dev-public-{0,1,2}`, `cardea-dev-private-{0,1,2}` | `/24`, 3 AZ. |
| NAT | `cardea-dev-nat` (fck-nat t4g.nano) | Ruta `0.0.0.0/0` de la tabla privada. |
| Bastión | `cardea-dev-bastion` (t3.nano) | Subred privada, SSM, sin SSH ni clave. |
| SG | `cardea-dev-lambdas-vpc-sg` | Egress total; lo usan las Lambdas del control plane. |
| SG | `cardea-dev-aurora-*` | Ingress 5432 solo desde el SG de Lambdas y el del bastión. |

## Datos

| Recurso | Nombre | Reglas |
|---|---|---|
| Aurora | `cardea-dev` (base `cardea_dev`, usuario `cardea_admin`) | Serverless v2, 0–8 ACU, auto-pause 300 s, IAM auth, cifrado, contraseña maestra en Secrets Manager gestionada por RDS, sin RDS Proxy en dev. |
| DynamoDB | `cardea-contact-dev` | `email` (S), TTL `ttl`, SSE. |
| SQS | `cardea-usage-dev`, `cardea-usage-dev-dlq` | Visibilidad 300 s, retención 1 día; DLQ 14 días; `maxReceiveCount = 3`; SSE-SQS. Mensajes conformes a `contracts/asyncapi/usage-events.yaml` (sin contenido). |
| S3 | `cardea-dev-reports-966378755474` | Privado, versionado, SSE-S3. |
| ECR | `cardea/{identity-service,policy-service,usage-ingest,insights-api,evidence-service}` | Inmutable, escaneo, KMS, conservar 10. |

## Acceso y publicación

| Recurso | Nombre | Reglas |
|---|---|---|
| Amplify | `cardea-landing-dev` (WEB) | `frontend/cardea-web`, rama `main`, `cardea.tekhos.com`. |
| Amplify | `cardea-app-dev` (WEB_COMPUTE) | `frontend/cardea-app`, rama `main`, `cardea-app.tekhos.com`. |
| HTTP API | `cardea-dev-contact-api` | `POST /contact`, CORS solo desde la landing. |
| HTTP API | `cardea-dev-api` | Autorizador JWT (issuer del pool, audiencia el cliente), sin rutas. |
| Cognito | pool `cardea-dev`, cliente `cardea-app-dev`, dominio `cardea-dev` | Correo como usuario, PKCE, callback del panel y `localhost:3000`. |
| SES | conjunto `cardea-dev` | Eventos a CloudWatch; alarmas de rebote (> 5 %) y queja (> 0,1 %). |

## Recursos ajenos que se leen o usan sin gestionarlos

| Recurso | Dueño | Uso |
|---|---|---|
| Zona `tekhos.com` | ninguno en Terraform | `data "aws_route53_zone"`; Amplify escribe sus CNAME. |
| Identidad SES `tekhos.com` (eu-west-1) | stack `tekhos-email-sending` | Remitente `cardea@tekhos.com`. |
| Rule set `tekhos-inbound` (us-east-1) | stack `tekhos-email-receiving` | Reenvía `cardea@tekhos.com` a ramejiafernandez@gmail.com. |
| Proveedor OIDC de GitHub | estado de Fenora | Data source. |

## Relaciones

```text
github-oidc ──(data)── proveedor OIDC (Fenora)
amplify-site x2 ──(dominio)── zona tekhos.com
contact ──► DynamoDB, SES (identidad tekhos.com, conjunto cardea-dev)
landing ──(env PUBLIC_WAITLIST_ENDPOINT)── contact
panel ──(env)── cognito (pool, cliente, dominio)
api-gateway ──(JWT)── cognito
aurora ◄── SG lambdas-vpc, SG bastión ; vpc privada ──► nat-instance
```
