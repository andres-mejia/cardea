# Implementation Plan: Infraestructura base en AWS (dev)

**Branch**: `001-infra-base` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-infra-base/spec.md`

## Summary

Entorno `dev` de Cardea en la cuenta `966378755474` (compartida con Fenora), `eu-west-1`, con Terraform plano y estado propio. Se portan de Fenora (`andres-mejia/fintrack`, `origin/main` @ `95484504`) los módulos de base: OIDC, VPC, NAT instance, bastión, Aurora, Cognito, ECR, mensajería, bucket y los workflows de plan/apply con su guardia. Se adaptan al prefijo `cardea-`, al proveedor OIDC que ya existe, a la HTTP API en lugar de Function URL y REST API, y al dominio provisional `tekhos.com`. Se quita todo lo de negocio de Fenora. Hosting y formulario ya existen en Cardea (`amplify-site`, `contact`) y se ajustan. La única decisión de arquitectura nueva es abandonar «Lambdas sin VPC»: se documenta en ADR-004 y se enmienda `AGENTS.md` §4 en el mismo PR.

## Technical Context

**Language/Version**: Terraform ≥ 1.6 (CI fija 1.9.8, como Fenora); provider `hashicorp/aws ~> 6.1`, `archive ~> 2.0`; Python 3.11 para `guardia_plan.py`; Bash para `bootstrap.sh`; Node 20 para la Lambda de contacto (ya escrita).

**Primary Dependencies**: GitHub Actions (`hashicorp/setup-terraform`, `aws-actions/configure-aws-credentials` con OIDC), AMI fck-nat (cuenta `568608671756`), AMI Amazon Linux 2023 para el bastión.

**Storage**: S3 (`cardea-terraform-state-966378755474`, `cardea-dev-reports`), DynamoDB (`cardea-terraform-locks`, `cardea-contact-dev`), Aurora PostgreSQL Serverless v2 17.x (`cardea-dev`).

**Testing**: `terraform fmt -check`, `terraform validate`, `terraform plan`; `pytest .github/scripts/test_guardia_plan.py`; comprobaciones de humo con `aws` y `curl` documentadas en [quickstart.md](quickstart.md).

**Target Platform**: AWS `eu-west-1` (Amplify, Lambda, API Gateway v2, Cognito, RDS, EC2, ECR, SQS, S3, SES) y `us-east-1` solo como alias del provider (sin recursos en esta spec).

**Project Type**: infraestructura como código + CI.

**Performance Goals**: publicación de la landing en < 10 min desde el merge (SC del US1); `infra · aplicar` en < 15 min.

**Constraints**: coste en reposo < 15 €/mes sin Fargate (SC-003); nada a mano en la consola; ningún recurso de Fenora ni de `tekhos.com` gestionado; `apply` manual solo con plan, resumen y OK.

**Scale/Scope**: un entorno, un estado, ~16 módulos, 3 workflows.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / norma | Estado | Nota |
|---|---|---|
| I. Gobierna el uso | N/A | Infra base, sin funcionalidad de producto. |
| II. Prompts no se almacenan | ✅ | Ningún recurso guarda contenido; la cola `cardea-usage-dev` transporta eventos sin contenido (contrato `contracts/asyncapi/usage-events.yaml`). Logs de la Lambda de contacto solo con metadatos. |
| III. Contract-first y hexagonal | ✅ | Las salidas de Terraform que consumen otras specs se fijan en [contracts/terraform-outputs.md](contracts/terraform-outputs.md) antes de escribir los módulos. |
| IV. Mismo artefacto en nuestra cuenta y en casa del cliente | ✅ (mejora) | Lambdas en VPC con JDBC: el mismo adaptador Postgres sirve en Lambda y en Helm. |
| V. Evidencia | ✅ | Cada criterio se cierra con comando y salida literal (quickstart). |
| AGENTS §4 «Sin VPC para las Lambdas» | ⚠️ **desviación declarada** | Decisión de Andrés (Clarifications, 2026-10-29). Se resuelve con ADR-004 y la enmienda de `AGENTS.md` §4 y de la constitución en este PR. Ver Complexity Tracking. |
| AGENTS §8 credenciales OIDC; apply de dev desde `main` con guardia | ✅ | Roles de apply y plan separados; guardia portada con tests. |
| AGENTS §8 «apply/destroy fuera del pipeline: plan, resumen y OK» | ✅ | El primer apply (que crea los roles de CI) es local y pasa por esa parada. |
| Constitución: prefijo `cardea-`, OIDC por data source, HTTP API, estado propio | ✅ | Ver tabla de módulos. |
| Constitución: «nada a mano en la consola» | ✅ con excepciones declaradas | Adjuntar la política de arranque (CLI, no consola) y autorizar la conexión Amplify–GitHub si el token falla. Ambas en `infra/README.md`. |

**Re-check tras la fase 1**: sin cambios; la única desviación sigue siendo la de §4, cubierta por ADR-004.

## Qué se porta de Fenora y cómo

Origen: `~/py/fintrack/src/fintrack` (`origin/main` @ `95484504`, 2026-10-11 o posterior). El clon local está 1529 commits por detrás; se lee de `origin/main`, no del árbol de trabajo.

### Se portan con adaptación

| Módulo Fenora | Destino Cardea | Adaptaciones |
|---|---|---|
| `infra/bootstrap.sh` | `infra/bootstrap.sh` | Bucket `cardea-terraform-state-<account>` y tabla `cardea-terraform-locks`; perfil por `AWS_PROFILE` (por defecto `fintrack-dev`); comprobación previa que aborta si el nombre resultante empieza por `fenora-`/`fintrack-`. |
| `infra/bootstrap/{README.md,politica-arranque-ci.json}` | igual | Rol `cardea-dev-github-actions`; caducidad 2027-01-31; `Deny` de guarda de Fenora más `NoTocarFenora` (Deny `*` sobre ARN `*fenora*`/`*fintrack*`, el bucket y la tabla de estado de Fenora y Fintrack, y Deny `*` sobre recursos con etiqueta `Project=fenora` para EC2, VPC y SG, cuyo ARN no lleva el nombre) y `NoBorrarEstadoDeCardea` (Deny `s3:DeleteBucket`/`DeleteObjectVersion` y `dynamodb:DeleteTable` sobre el estado de Cardea). Sin el historial de issues. |
| `modules/github-oidc` | `modules/github-oidc` | `data "aws_iam_openid_connect_provider"` (URL `https://token.actions.githubusercontent.com`) en vez de `resource`. Rol de apply `cardea-dev-github-actions` (`sub` = `repo:andres-mejia/cardea:ref:refs/heads/main`, `job_workflow_ref` limitado a `infra-apply.yml` y los de despliegue). Rol nuevo `cardea-dev-github-actions-plan` (`sub` = `repo:andres-mejia/cardea:pull_request`; `ReadOnlyAccess` + `s3:GetObject` del estado + `dynamodb:PutItem/DeleteItem/GetItem` en la tabla de locks; `Deny` de lectura de datos: `secretsmanager:GetSecretValue`, `s3:GetObject` fuera del estado, `dynamodb:GetItem/Query/Scan` fuera de los locks). Política permanente de apply: solo ECR push a `cardea/*` y `lambda:UpdateFunctionCode` sobre `cardea-dev-*`. Fuera: `agente_lectura`, escenario, ECR público, costes. |
| `modules/vpc` | `modules/vpc` | Nombres `cardea-dev-*`; CIDR `10.20.0.0/16` (Fenora usa `10.0.0.0/16`); 3 AZ; mismo endpoint gateway de S3. |
| `modules/nat-instance` | `modules/nat-instance` | Nombres `cardea-dev-*`; fck-nat t4g.nano; `ignore_changes = [ami]` como Fenora. |
| `modules/bastion` | `modules/bastion` | Nombres `cardea-dev-*`; **en subred privada** (SSM sale por la NAT) para no pagar una segunda IPv4 pública; salida `ssm_session_command` con `--profile fintrack-dev`. |
| `modules/aurora` | `modules/aurora` | `cardea-dev`, base `cardea_dev`, usuario `cardea_admin`; 17.x; `min_acu = 0`, auto-pause 300 s; `enable_rds_proxy = false` en dev; `enable_http_endpoint = false` (Cardea no tiene triggers de Cognito fuera de VPC); IAM auth y TLS. |
| SG `lambdas_vpc` de `environments/dev/main.tf` | `environments/dev/network.tf` | `cardea-dev-lambdas-vpc-sg`; lo consumen el módulo `lambda` en specs siguientes. |
| `modules/cognito` | `modules/cognito` | Pool `cardea-dev`, cliente `cardea-app-dev` (PKCE, sin secreto, `code`, scopes `openid email profile`); callback y logout `https://cardea-app.tekhos.com/` y `http://localhost:3000/`; dominio de prefijo `cardea-dev`; correo `COGNITO_DEFAULT` en dev. Fuera: Google, Apple, passkeys, MFA por correo, triggers, atributos `tenantId`/`plan` (llegan con la spec 002). |
| `modules/ecr` | `modules/ecr` | Repos `cardea/<servicio>` para `identity-service`, `policy-service`, `usage-ingest`, `insights-api`, `evidence-service` (`backend/AGENTS.md`); `IMMUTABLE`, escaneo, KMS, conservar 10. |
| `modules/messaging` | `modules/messaging` | Solo `cardea-usage-dev` + `cardea-usage-dev-dlq` (`maxReceiveCount = 3`, DLQ 14 días, cifrado SSE-SQS). Fuera: event bus, colas y topics de negocio. |
| `modules/assets` | `modules/reports` | Bucket `cardea-dev-reports-<account>`: privado, versionado, SSE-S3, caducidad configurable. Fuera: CloudFront, URLs firmadas, claves en Secrets Manager (los informes se sirven con URL prefirmada de S3 desde el servicio). |
| `modules/email` | `modules/email` | Solo `aws_sesv2_configuration_set` `cardea-dev`, destino CloudWatch y alarmas de rebote y queja con SNS a `cardea@tekhos.com`. La identidad es la de `tekhos.com` (no gestionada). Fuera: identidad, DKIM, MAIL FROM, DMARC, recepción, reenviador, bucket de entrada. |
| `.github/scripts/guardia_plan.py` + `test_guardia_plan.py` | igual | Mismas clases (`SEGUROS`, `PERDIDA_POR_TIPO`); se quitan referencias a recursos y issues de Fenora; añade `aws_sesv2_configuration_set`, reglas de SG, subnet group y parameter group a seguros; `aws_instance` sigue en pérdida como en Fenora (el bastión es el único acceso a Aurora y la NAT la única salida). **Desviación declarada**: `aws_ecr_repository` pasa a pérdida (Fenora lo trata como seguro), porque destruirlo borra las imágenes publicadas y deja las Lambdas sin rollback. |
| `.github/workflows/infra-formato.yml` | igual | Check `infra · formato`. |
| `.github/workflows/infra-plan.yml` | igual | Check `infra · plan`; en PR; rol `secrets.AWS_GITHUB_OIDC_PLAN_ROLE_ARN`; `-var aws_profile=""`; guardia informativa; sin pasos de `billing-api`/`push-dispatcher`. |
| `.github/workflows/infra-apply.yml` | igual | Check `infra · aplicar`; push a `main` con `paths: infra/**` y la guardia; rol `secrets.AWS_GITHUB_OIDC_ROLE_ARN`; `concurrency` sin cancelar; entrada `permitir_destruccion`; sin aviso ntfy. |

### Ya existen en Cardea y se ajustan

| Módulo | Ajuste |
|---|---|
| `modules/amplify-site` | Las apps se crean con `github_access_token` en el primer apply: Amplify no deja conectar un repositorio a una app con ramas de despliegue manual. `domain_name` = `tekhos.com` y `subdomains` = `["cardea"]` (landing) y `["cardea-app"]` (panel), el patrón que Fenora usa con `fenora.ai` en dos apps. `ignore_changes = [repository, access_token]` se mantiene. Fijar `corepack prepare` a la versión de `packageManager` de `package.json`. |
| `modules/contact` | Orígenes CORS desde variables (`https://cardea.tekhos.com`); `ses_from_address` y `notify_address` = `cardea@tekhos.com`; envío con el conjunto de configuración `cardea-dev`; política `ses:SendEmail` limitada a la identidad `tekhos.com`. |
| `environments/dev/{provider,backend}.tf` | Sin cambios de fondo (ya adaptados). |
| `environments/dev/main.tf` | Se parte en `main.tf` (sitios y contacto), `network.tf`, `data.tf`, `identity.tf`, `ci.tf`, `outputs.tf`; variables `base_domain`, `landing_prefix`, `panel_prefix`, `mail_address`. |

### Nuevo (no existe en Fenora con esta forma)

| Módulo | Por qué |
|---|---|
| `modules/api-gateway` | HTTP API (`apigatewayv2`) `cardea-dev-api` con autorizador JWT de Cognito y stage `$default`, sin rutas. Fenora usa REST API + WAF: la REST API no hace falta y el WAF (~6 €/mes) rompe SC-003. |
| `data "aws_route53_zone" "base"` | Lee `tekhos.com`. Sustituye al módulo `dns` de Fenora: no se crea zona ni certificados (Amplify gestiona los suyos; Cognito usa prefijo). |

### No se porta

`advisor-api`, `analytics-api`, `bank-api`, `bank-sync-consumer`, `billing-api`, `billing-consumer`, `documents-api`, `gamification-api`, `goals-api`, `motor-fiscal`, `notification-service`, `push-dispatcher`, `scoring-api`, `stt-api`, `tenant-api`, `tx-api`, `tx-sync-consumer`, `auth-triggers`, `waitlist` (lo cubre `contact`), `landing` (lo cubre `amplify-site`), `cdn`, `security`, `observability`, `cost-guard`, `deploy-notify`, `dns` (sustituido por data source). Se aplazan con su spec: `lambda` y `lambda-warmer` (spec 002, primer servicio). Workflows y scripts de agentes, bitácora, métricas, colas y rescate de ramas tampoco.

## Riesgos y cómo se cubren

- **El pipeline de Fenora tiene hoy `Allow *` en la cuenta** hasta 2027-01-31: podría tocar recursos de Cardea. No se puede impedir desde Cardea sin tocar Fenora; se declara en `infra/README.md` y en ADR-004.
- **El proveedor OIDC lo gestiona el estado de Fenora.** Si Fenora lo destruyera, los roles de Cardea dejarían de funcionar. Su política de arranque ya lo protege (`NoDejarseSinAcceso`).
- **`tekhos.com` tiene otra app de Amplify** (`andres.tekhos.com`). Las asociaciones de Cardea solo declaran sus prefijos; se verifica en el plan que no aparece ningún cambio sobre `andres`.
- **Coste**: t4g.nano (~3 €) + t3.nano (~3,5 €) + 1 IPv4 pública (~3,4 €) + EBS (~1,5 €) + secreto de Aurora (0,40 €) ≈ 12 € antes de Aurora en pausa. Margen estrecho contra SC-003; si se pasa, el bastión se para cuando no se usa (`aws ec2 stop-instances`, documentado).
- **Primer apply**: los roles de CI no existen hasta que se aplica; el primer apply es local con `--profile fintrack-dev` y parada de plan, resumen y OK.

## Project Structure

### Documentation (this feature)

```text
specs/001-infra-base/
├── spec.md
├── plan.md                         # este fichero
├── research.md                     # decisiones y alternativas
├── data-model.md                   # recursos, nombres y relaciones
├── quickstart.md                   # validación de extremo a extremo
├── contracts/terraform-outputs.md  # salidas que consumen las demás specs
└── tasks.md                        # /speckit-tasks
```

### Source Code (repository root)

```text
infra/
├── README.md                     # orden de arranque (FR-007), pasos manuales declarados
├── AGENTS.md                     # actualizado: estado y orden de módulos
├── bootstrap.sh
├── bootstrap/
│   ├── README.md
│   └── politica-arranque-ci.json
├── environments/dev/
│   ├── backend.tf  provider.tf   # existentes
│   ├── main.tf                   # amplify-site x2 + contact
│   ├── data.tf                   # zona tekhos.com, cuenta
│   ├── network.tf                # vpc, nat-instance, bastion, SG lambdas, aurora
│   ├── identity.tf               # cognito, api-gateway
│   ├── platform.tf               # ecr, messaging, reports, email
│   ├── ci.tf                     # github-oidc
│   ├── variables.tf  outputs.tf
│   └── terraform.tfvars.example
└── modules/
    ├── amplify-site/  contact/   # existentes, ajustados
    ├── github-oidc/  vpc/  nat-instance/  bastion/  aurora/
    ├── cognito/  ecr/  messaging/  reports/  email/  api-gateway/
.github/
├── scripts/guardia_plan.py  test_guardia_plan.py
└── workflows/infra-formato.yml  infra-plan.yml  infra-apply.yml  (+ scripts-tests.yml para pytest)
docs/ADR/ADR-004-red-privada-para-el-control-plane.md
AGENTS.md  .specify/memory/constitution.md       # enmienda §4
```

**Structure Decision**: Terraform plano en `infra/environments/dev` con un fichero por dominio para que el plan se lea por partes; un módulo por pieza reutilizable; los workflows y la guardia en `.github/`, como en Fenora.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Lambdas en VPC + NAT instance + bastión (contra `AGENTS.md` §4 vigente) | Aurora privada sin 5432 abierto a internet; JDBC idéntico en Lambda y en Helm | Aurora pública con IAM auth: Fenora la revirtió por seguridad en su primer apply. Data API: obliga a un segundo adaptador de persistencia solo para AWS. |
| Dos roles de CI (apply y plan) | El plan en PR necesita credenciales y un token de PR no puede asumir un rol de `main` | Plan solo en `main`: el PR se revisaría sin plan. |
