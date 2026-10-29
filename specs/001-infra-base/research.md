# Research: 001-infra-base

Fuentes: inventario de solo lectura de la cuenta `966378755474` (2026-10-29, perfil `fintrack-dev`) y Fenora `origin/main` @ `95484504`. Las decisiones marcadas «Andrés» salen de las aclaraciones de la spec.

## R1 · Dominio provisional

- **Decision** (Andrés): `tekhos.com` (zona `Z025408038NPHX3W382AH`, en Route 53 de la cuenta). Landing `cardea.tekhos.com`, panel `cardea-app.tekhos.com`.
- **Rationale**: `cardea.ai` es de un tercero (NS de Cloudflare) y `cardea.eu` también tiene dueño (NS `gpk.eu`); tekhos.com ya existe y no es de Fenora.
- **Cómo**: `aws_amplify_domain_association` con `domain_name = "tekhos.com"` y un único prefijo por app. Fenora ya asocia `fenora.ai` a dos apps (`www` y `app`) y funciona, así que varias apps pueden compartir dominio raíz con prefijos distintos. Amplify crea la validación del certificado y los CNAME en la zona.
- **Alternatives**: `domain_name = "cardea.tekhos.com"` con prefijo vacío (descartado: no hay precedente en la cuenta); zona delegada `cardea.tekhos.com` (descartado: crea un NS en una zona no gestionada por Cardea sin ganar nada).

## R2 · Correo

- **Decision** (Andrés): `cardea@tekhos.com` como remitente y destinatario del aviso.
- **Hallazgo**: la identidad `tekhos.com` está verificada en `eu-west-1` con DKIM y MAIL FROM `mail.tekhos.com` (stack CloudFormation `tekhos-email-sending`). La recepción vive en `us-east-1`: rule set activo `tekhos-inbound`, regla `catch-all-tekhos` para `tekhos.com` → S3 + Lambda `tekhos-email-forwarder` con `FORWARD_TO = ramejiafernandez@gmail.com` (stack `tekhos-email-receiving`). Cualquier `@tekhos.com` ya se reenvía; no hay nada que crear.
- La cuenta tiene acceso de producción a SES en `eu-west-1` (`ProductionAccessEnabled = true`, 50 000 envíos/día): la nota de sandbox de la spec original no aplicaba.
- **Alternatives**: rule set propio (descartado: un solo rule set activo por región y en `eu-west-1` es `fenora-dev-rules`).

## R3 · Permisos de CI

- **Decision** (Andrés): patrón Fenora. Política permanente mínima en Terraform + política de arranque `Allow *` con `DateLessThan 2027-01-31T23:59:59Z` y `Deny` de guarda, adjuntada por CLI.
- **Añadidos de Cardea a los Deny**: `NoTocarFenora` (todo recurso con `fenora`/`fintrack` en el ARN, incluidos `fenora-terraform-state-966378755474`, `fintrack-terraform-state-966378755474`, `fenora-terraform-locks`, `fintrack-terraform-locks`) y `NoBorrarEstadoDeCardea`. `NoDejarseSinAcceso` apunta a `cardea-dev-github-actions` y al proveedor OIDC.
- **Rationale**: crear roles IAM para las Lambdas exige permisos IAM amplios; un modelo por prefijo con permissions boundary se descartó por velocidad.

## R4 · Plan en PR

- **Decision** (Andrés): rol `cardea-dev-github-actions-plan` con `sub = repo:andres-mejia/cardea:pull_request`.
- **Permisos**: `ReadOnlyAccess` (lo que `terraform plan` necesita para refrescar) + estado de Cardea (lectura) + tabla de locks (escritura) + `Deny` explícito de lectura de datos (`secretsmanager:GetSecretValue`, `s3:GetObject` fuera del bucket de estado, `dynamodb:GetItem/Query/Scan/BatchGetItem` fuera de la tabla de locks, `ssm:GetParameter*`, `rds-db:connect`).
- **Nota**: los PR desde forks no reciben token OIDC con `id-token: write`; el repo es de un solo mantenedor.

## R5 · Red y Aurora

- **Decision** (Andrés): patrón actual de Fenora. Aurora privada; Lambdas en VPC con JDBC; NAT instance fck-nat; bastión SSM.
- **Hallazgo**: Fenora revirtió Aurora pública en su primer apply (`18e7e2cd`, 2026-05-01: «Aurora ya NO acepta 0.0.0.0/0») y migró sus Lambdas a VPC con JDBC (#34). `AGENTS.md` §4 de Cardea describía el estado anterior.
- **Ajustes de Cardea**: CIDR `10.20.0.0/16` (Fenora `10.0.0.0/16`) para poder emparejar VPC si alguna vez hiciera falta; bastión en subred privada (Fenora lo tiene en la pública) para ahorrar una IPv4 pública; `enable_http_endpoint = false`.
- **Consecuencia**: ADR-004 y enmienda de `AGENTS.md` §4 y de la constitución (principio IV y «Stack y restricciones») en el PR.

## R6 · API Gateway

- **Decision**: HTTP API con autorizador JWT de Cognito, sin rutas en esta spec.
- **Rationale**: Fenora usa REST API + WAF; para Cardea el WAF cuesta ~5 € + reglas al mes y rompe SC-003, y la HTTP API es la que ya usa `contact` y la que exige la política de cuenta (sin Function URL).
- **Alternatives**: portar `api-gateway` de Fenora tal cual (descartado por coste y por mezclar REST y HTTP).

## R7 · Cognito

- **Decision**: dominio de prefijo `cardea-dev` (`cardea-dev.auth.eu-west-1.amazoncognito.com`); correo `COGNITO_DEFAULT`.
- **Rationale**: un dominio propio de Cognito exige que el dominio padre tenga registro A; `tekhos.com` no tiene A en el apex. El correo de Cognito con SES exigiría la identidad de `tekhos.com`, que no es nuestra; en dev basta el límite por defecto.
- **Alternatives**: `auth.cardea.tekhos.com` (posible cuando el apex de `cardea.tekhos.com` resuelva, pero crea dependencia de orden con Amplify; se aplaza al dominio definitivo).

## R8 · Repositorios ECR

- **Decision**: `cardea/identity-service`, `cardea/policy-service`, `cardea/usage-ingest`, `cardea/insights-api`, `cardea/evidence-service` (lista de `backend/AGENTS.md`). La imagen del gateway la añade la spec 003.

## R9 · Estado y bootstrap

- **Hallazgo**: en la cuenta existen `fenora-terraform-state-966378755474`, `fintrack-terraform-state-966378755474`, `fenora-terraform-locks` y `fintrack-terraform-locks`. No existe nada `cardea-*`.
- **Decision**: `bootstrap.sh` crea `cardea-terraform-state-966378755474` y `cardea-terraform-locks`; se ejecuta una vez en local tras OK (crea recursos fuera de Terraform por definición, como en Fenora).
