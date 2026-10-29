---

description: "Tareas de la spec 001-infra-base"
---

# Tasks: Infraestructura base en AWS (dev)

**Input**: `specs/001-infra-base/` — [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/terraform-outputs.md](contracts/terraform-outputs.md), [quickstart.md](quickstart.md)

**Tests**: la spec pide tests de la guardia (US2, FR-003); el resto se valida con `fmt`, `validate`, `plan` y la quickstart.

**Origen de Fenora**: `~/py/fintrack/src/fintrack`, rama `origin/main` (@ `95484504`). Leer con `git -C ~/py/fintrack/src/fintrack show origin/main:<ruta>`; el árbol de trabajo está desfasado. Al portar: prefijo `cardea-`, sin `Project = "fenora"` en `tags` (lo ponen los `default_tags`), sin historial de issues de Fenora en los comentarios.

**Paradas obligatorias** (AGENTS.md §6 y §8): antes de cualquier recurso creado en AWS (bootstrap, apply), antes de cada push y antes del PR. Se muestra plan o rama, ficheros, mensaje y validaciones, y se espera el OK.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 0: Inventario (solo lectura)

- [X] T001 Inventario de la cuenta con `--profile fintrack-dev` (identidad, proveedor OIDC, zonas, identidades y rule sets SES, apps y dominios de Amplify, buckets, tablas, roles, Cognito, ECR, SQS, RDS, VPC, recursos con `Project=cardea`) y volcado en `specs/001-infra-base/inventario.md`
- [X] T002 Inventario de Fenora `origin/main`: módulos, workflows y guardia que se portan, con su ruta de origen, en la sección «Origen» de `specs/001-infra-base/inventario.md`

**Checkpoint**: parada — enseñar plan, tareas e inventario a Andrés antes de implementar.

---

## Phase 1: Setup

- [X] T003 Configurar identidad git del repo: `git config user.name "Andrés Mejía"` y `git config user.email 49398769+andres-mejia@users.noreply.github.com` en `/home/andres/py/cardea/.git/config`
- [X] T004 [P] Escribir ADR-004 «Red privada para el control plane» (contexto: Fenora `18e7e2cd` y #34; decisión: Aurora privada, Lambdas en VPC con JDBC, NAT instance, bastión SSM; riesgo del `Allow *` de Fenora en la cuenta) en `docs/ADR/ADR-004-red-privada-para-el-control-plane.md`
- [X] T005 Enmendar `AGENTS.md` §4 («Sin VPC para las Lambdas» → Lambdas en VPC privada, Aurora privada con IAM auth y TLS, salida por NAT instance, ADR-004) y la constitución (principio IV y «Stack y restricciones»; versión 1.1.0, `Last Amended` 2026-10-29) en `AGENTS.md` y `.specify/memory/constitution.md`
- [X] T006 [P] Corregir en `docs/CONTINUAR-EN-CLAUDE-CODE.md` §4–5: dominio provisional `tekhos.com`, correo `cardea@tekhos.com`, Aurora privada, ruta real de Fenora `~/py/fintrack/src/fintrack`
- [X] T007 [P] Portar `infra/bootstrap.sh` de Fenora: `BUCKET=cardea-terraform-state-${ACCOUNT_ID}`, `TABLE=cardea-terraform-locks`, perfil por `AWS_PROFILE` (defecto `fintrack-dev`), región `eu-west-1`, versionado, SSE, bloqueo de acceso público, tabla `LockID` PAY_PER_REQUEST con etiquetas `Project=cardea`; abortar si `BUCKET` o `TABLE` contienen `fenora` o `fintrack`
- [X] T008 [P] Crear `infra/environments/dev/variables.tf` moviendo las variables de `main.tf` y añadiendo `base_domain` (defecto `tekhos.com`), `landing_prefix` (`cardea`), `panel_prefix` (`cardea-app`), `mail_address` (`cardea@tekhos.com`), `github_repo` (`andres-mejia/cardea`), `min_acu` (0), `max_acu` (8); quitar `domain_name` y `ses_from_address`
- [X] T009 [P] Crear `infra/environments/dev/data.tf` con `data "aws_caller_identity" "current"` y `data "aws_route53_zone" "base"` (`name = var.base_domain`, `private_zone = false`)
- [X] T010 [P] Actualizar `infra/environments/dev/terraform.tfvars.example` con todas las variables nuevas y sus valores por defecto comentados

---

## Phase 2: Foundational

**Purpose**: estado remoto y arranque, sin los cuales no hay apply ni pipeline.

- [X] T011 Parada: enseñar a Andrés qué crea `infra/bootstrap.sh` y esperar OK; ejecutar `AWS_PROFILE=fintrack-dev infra/bootstrap.sh` dos veces (idempotencia) y pegar la salida en `specs/001-infra-base/inventario.md` (sección «Bootstrap»)
- [X] T012 `terraform init -backend-config="bucket=cardea-terraform-state-966378755474"` en `infra/environments/dev` y comprobar que `terraform state list` está vacío

**Checkpoint**: backend listo; las historias pueden empezar.

---

## Phase 3: User Story 1 — La landing se publica sola en cardea.tekhos.com (P1) 🎯 MVP

**Goal**: landing en `https://cardea.tekhos.com`, panel en `https://cardea-app.tekhos.com`, formulario que guarda en `cardea-contact-dev` y avisa a `cardea@tekhos.com`.

**Independent Test**: quickstart §5.

- [X] T013 [P] [US1] Crear `infra/modules/email/main.tf`: `aws_sesv2_configuration_set` `cardea-${var.environment}`, destino de eventos CloudWatch (`SEND`, `BOUNCE`, `COMPLAINT`, `REJECT`), topic SNS `cardea-${var.environment}-ses-alerts` suscrito a `var.alert_email`, alarmas de rebote (> 0.05) y queja (> 0.001) portadas de Fenora `infra/modules/email/main.tf`; salidas `configuration_set_name`. Sin identidad, DKIM, MAIL FROM, DMARC ni recepción
- [X] T014 [US1] Ajustar `infra/modules/contact/main.tf` y `variables.tf`: variables `allowed_origins` (list) y `configuration_set_name`; `cors_origins = var.allowed_origins`; condición IAM `ses:FromAddress = var.ses_from_address` y `Resource` = ARN de la identidad `arn:aws:ses:eu-west-1:<account>:identity/${split("@", var.ses_from_address)[1]}`; variable de entorno `CONFIGURATION_SET`; quitar el valor por defecto `hola@cardea.ai` de `notify_address`
- [X] T015 [US1] Pasar `ConfigurationSetName: process.env.CONFIGURATION_SET` al `SendEmailCommand` en `infra/modules/contact/lambda/index.mjs`, sin registrar en logs nada del contenido del formulario (solo `err?.name`, como ahora)
- [X] T016 [P] [US1] Ajustar `infra/modules/amplify-site/main.tf`: `corepack prepare` con la versión de `packageManager` de `package.json` (variable `pnpm_version`, defecto `10.4.0`); `wait_for_verification = false` se mantiene; `ignore_changes = [repository, access_token]` se mantiene
- [X] T017 [US1] Reescribir `infra/environments/dev/main.tf`: `module "email"`, `module "contact"` (`allowed_origins = ["https://${var.landing_prefix}.${var.base_domain}"]`, `ses_from_address = notify_address = var.mail_address`), `module "landing"` (`name = "cardea-landing"`, `domain_name = var.base_domain`, `subdomains = [var.landing_prefix]`, `PUBLIC_APP_URL = "https://${var.panel_prefix}.${var.base_domain}"`) y `module "panel"` (`name = "cardea-app"`, `subdomains = [var.panel_prefix]`); quitar el comentario de «primera pasada»
- [X] T018 [P] [US1] Cambiar el valor por defecto de `appUrl` en `frontend/cardea-web/src/components/Header.astro` a `https://cardea-app.tekhos.com`
- [X] T019 [US1] Crear `infra/environments/dev/outputs.tf` con `landing_url`, `panel_url`, `contact_endpoint`, `ses_configuration_set`, `mail_address` según `specs/001-infra-base/contracts/terraform-outputs.md`
- [X] T020 [US1] `terraform fmt -check -recursive` en `infra/` y `terraform validate` en `infra/environments/dev`; pegar salida en el PR

**Checkpoint**: US1 lista para el primer apply (se aplica junto con US2 y US3 en T040).

---

## Phase 4: User Story 2 — Un pipeline aplica Terraform con guardia (P1)

**Goal**: `infra · formato`, `infra · plan` (PR) e `infra · aplicar` (main) con roles OIDC propios y guardia con tests.

**Independent Test**: tests de la guardia en verde; PR con cambio inocuo pasa formato y plan; tras merge, `infra · aplicar` en verde.

### Tests

- [X] T021 [P] [US2] Portar `.github/scripts/test_guardia_plan.py` de Fenora: casos de Fenora sin referencias a recursos de negocio; añadir caso «`aws_dynamodb_table.contact` en `delete` → exit ≠ 0» (escenario 2 de US2) y «`aws_sesv2_configuration_set` reemplazado → exit 0»
- [X] T022 [P] [US2] Crear `.github/workflows/scripts-tests.yml` (check `scripts · tests`) que ejecuta `python3 -m pytest .github/scripts -q` con Python 3.11 en todo PR

### Implementación

- [X] T023 [US2] Portar `.github/scripts/guardia_plan.py` de Fenora: mismas clases `SEGUROS` y `PERDIDA_POR_TIPO`; añadir `aws_sesv2_configuration_set` y las piezas de red y RDS sin datos a `SEGUROS` (`aws_instance` queda en pérdida, como en Fenora); `aws_rds_cluster`, `aws_cognito_user_pool`, `aws_s3_bucket`, `aws_dynamodb_table`, `aws_ecr_repository` en `PERDIDA_POR_TIPO`; quitar menciones a issues de Fenora; `T021` en verde
- [X] T024 [P] [US2] Portar `infra/bootstrap/politica-arranque-ci.json`: Sid `AdministradorHastaEl31DeEneroDe2027` (`DateLessThan 2027-01-31T23:59:59Z`); `NoDejarseSinAcceso` sobre `arn:aws:iam::966378755474:role/cardea-dev-github-actions` y el proveedor OIDC; `NoEngancharPoliticasDeAdministradorANadie`, `NoRepintarPoliticasNiUsuariosNiGrupos`, `NoCrearCredencialesDeLargaVida`, `NoOrganizacionesNiCambiosDeFacturacion` como en Fenora; nuevos `NoTocarFenora` (Deny `*` sobre `arn:aws:*:*:*:*fenora*`, `arn:aws:*:*:*:*fintrack*`, `arn:aws:s3:::fenora-*`, `arn:aws:s3:::fintrack-*` y sus objetos, más un Deny `*` con `StringEquals aws:ResourceTag/Project = fenora` para los recursos cuyo ARN no lleva el nombre: EC2, VPC, SG) y `NoBorrarEstadoDeCardea` (Deny `s3:DeleteBucket`, `s3:DeleteObjectVersion`, `s3:PutBucketVersioning` sobre `cardea-terraform-state-966378755474` y `dynamodb:DeleteTable` sobre `cardea-terraform-locks`)
- [X] T025 [P] [US2] Escribir `infra/bootstrap/README.md`: adjuntar la política con `aws iam put-role-policy --role-name cardea-dev-github-actions --policy-name arranque-ci-caduca-2027-01-31 --policy-document file://politica-arranque-ci.json --profile fintrack-dev`, verificar con `list-role-policies`, renovar antes de caducar (poner la nueva, verificar, borrar la vieja); declarar que es un paso manual por CLI, nunca por consola
- [X] T026 [P] [US2] Añadir `.github/scripts/test_politica_arranque.py`: la política es JSON válido, caduca en fecha, contiene los Sid de guarda, `NoTocarFenora` cubre los dos buckets y las dos tablas de estado de Fenora/Fintrack, y no deniega `iam:PutRolePolicy`/`iam:CreateRole` (Terraform los necesita)
- [X] T027 [US2] Portar `infra/modules/github-oidc/main.tf` de Fenora: `data "aws_iam_openid_connect_provider" "github" { url = "https://token.actions.githubusercontent.com" }`; rol `cardea-${var.environment}-github-actions` con `aud = sts.amazonaws.com`, `sub = repo:${var.github_repo}:ref:refs/heads/main` y `job_workflow_ref` limitado a `var.deploy_workflows` (defecto `[".github/workflows/infra-apply.yml"]`); política permanente `cardea-${var.environment}-github-actions-deploy` (ECR auth, push a `arn:aws:ecr:eu-west-1:<account>:repository/cardea/*`, `lambda:UpdateFunctionCode`/`GetFunction` sobre `cardea-${var.environment}-*`); rol `cardea-${var.environment}-github-actions-plan` con `sub = repo:${var.github_repo}:pull_request`, `ReadOnlyAccess`, lectura del estado, escritura en `cardea-terraform-locks` y Deny de `secretsmanager:GetSecretValue`, `ssm:GetParameter*`, `rds-db:connect`, `s3:GetObject` con `NotResource` el bucket de estado y `dynamodb:GetItem/Query/Scan/BatchGetItem` con `NotResource` la tabla de locks; salidas `role_arn`, `plan_role_arn`. Sin `agente_lectura`, escenario, ECR público ni costes
- [X] T028 [US2] Crear `infra/environments/dev/ci.tf` con `module "github_oidc"` y añadir `github_actions_role_arn` y `github_actions_plan_role_arn` a `infra/environments/dev/outputs.tf`
- [X] T029 [P] [US2] Portar `.github/workflows/infra-formato.yml` (check `infra · formato`, Terraform 1.9.8, `terraform fmt -check -recursive` en `infra`)
- [X] T030 [US2] Portar `.github/workflows/infra-plan.yml`: en `pull_request` con `paths: [infra/**, .github/scripts/guardia_plan.py, .github/workflows/infra-*.yml]`; job `infra · plan`; `permissions: id-token: write, contents: read`; rol `secrets.AWS_GITHUB_OIDC_PLAN_ROLE_ARN`; `init -backend-config=bucket=cardea-terraform-state-966378755474 -lockfile=readonly`; `plan -var aws_profile=""`; guardia informativa; sin pasos de `billing-api` ni `push-dispatcher`
- [X] T031 [US2] Portar `.github/workflows/infra-apply.yml`: `push` a `main` con los mismos `paths` y `workflow_dispatch` con entrada `permitir_destruccion`; job `infra · aplicar`; `concurrency: { group: infra-dev, cancel-in-progress: false }`; rol `secrets.AWS_GITHUB_OIDC_ROLE_ARN`; plan → `show -json` → guardia (bloqueante) → `apply tfplan`; sin aviso ntfy
- [X] T032 [US2] Versionar el lock de proveedores como Fenora: quitar `.terraform.lock.hcl` de `.gitignore`, generar `infra/environments/dev/.terraform.lock.hcl` con `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64` y commitearlo, para que `-lockfile=readonly` de T030/T031 funcione

**Checkpoint**: tests de guardia y política en verde en local; los workflows se ejercitan tras T040–T042.

---

## Phase 5: User Story 3 — El panel y el control plane tienen dónde vivir (P2)

**Goal**: VPC, NAT, bastión, Aurora privada, Cognito, HTTP API, ECR, SQS y bucket de informes con las salidas del contrato.

**Independent Test**: quickstart §6.

- [X] T033 [P] [US3] Portar `infra/modules/vpc/main.tf`: nombres `cardea-${var.environment}-*`, `cidr_block` por defecto `10.20.0.0/16`, 3 AZ, subredes públicas `cidrsubnet(…, 8, i)` y privadas `cidrsubnet(…, 8, i + 10)`, endpoint gateway S3; salidas `vpc_id`, `vpc_cidr`, `public_subnet_ids`, `private_subnet_ids`, `private_route_table_id`
- [X] T034 [P] [US3] Portar `infra/modules/nat-instance/main.tf`: AMI fck-nat (`owners = ["568608671756"]`, `fck-nat-al2023-*-arm64-ebs`), `t4g.nano`, `source_dest_check = false`, ruta `0.0.0.0/0` en la tabla privada, `ignore_changes = [ami]`, nombres `cardea-${var.environment}-nat*`
- [X] T035 [P] [US3] Portar `infra/modules/bastion/main.tf`: AL2023 `t3.nano`, rol SSM, sin clave ni SSH, **en subred privada** (`subnet_id` de `private_subnet_ids[0]`), `ignore_changes = [ami]`; salidas `security_group_id`, `instance_id`, `ssm_session_command` con `--profile fintrack-dev`
- [X] T036 [P] [US3] Portar `infra/modules/aurora/main.tf`: `cluster_identifier = "cardea-${var.environment}"`, `database_name = "cardea_${var.environment}"`, `master_username = "cardea_admin"`, `engine_version = "17.9"`, `manage_master_user_password = true`, `iam_database_authentication_enabled = true`, `storage_encrypted = true`, `enable_http_endpoint = false`, `min_acu` 0 / `max_acu` 8 / `seconds_until_auto_pause` 300, `publicly_accessible = false`, SG con ingress 5432 solo desde `extra_ingress_security_group_ids`, `enable_rds_proxy` (defecto `false`); salidas `connection_endpoint`, `cluster_resource_id`, `master_user_secret_arn`, `database_name`
- [X] T037 [P] [US3] Portar `infra/modules/cognito/main.tf` reducido: pool `cardea-${var.environment}` (correo como usuario, verificación por correo, `email_sending_account = "COGNITO_DEFAULT"`, `deletion_protection = "ACTIVE"`), cliente `cardea-app-${var.environment}` (sin secreto, `code`, `openid email profile`, callbacks y logouts de `var.callback_urls`/`var.logout_urls`, tokens de 1 h), dominio de prefijo `var.domain_prefix`; salidas `user_pool_id`, `user_pool_arn`, `app_client_id`, `hosted_ui_domain`, `issuer`. Sin IdP sociales, passkeys, MFA por correo ni triggers
- [X] T038 [P] [US3] Crear `infra/modules/api-gateway/main.tf`: `aws_apigatewayv2_api` `cardea-${var.environment}-api` (HTTP, CORS desde `var.allowed_origins`), stage `$default` con `auto_deploy` y throttling, autorizador `JWT` (`issuer = var.cognito_issuer`, `audience = [var.cognito_client_id]`), sin rutas; salidas `api_id`, `api_endpoint`, `execution_arn`, `authorizer_id`
- [X] T039 [P] [US3] Portar `infra/modules/ecr/main.tf` (`cardea/<servicio>` para `identity-service`, `policy-service`, `usage-ingest`, `insights-api`, `evidence-service`; `IMMUTABLE`, escaneo, KMS, conservar 10), `infra/modules/messaging/main.tf` (`cardea-usage-${var.environment}` visibilidad 300 s, retención 86400 s, `sqs_managed_sse_enabled`, redrive a `cardea-usage-${var.environment}-dlq` con `maxReceiveCount = 3` y 1209600 s) y crear `infra/modules/reports/main.tf` (`cardea-${var.environment}-reports-<account>`, privado, versionado, SSE-S3, `lifecycle_expiration_days` defecto 400, `force_destroy = false`)
- [X] T040 [US3] Crear `infra/environments/dev/network.tf` (`module "vpc"`, `module "nat_instance"`, `aws_security_group "lambdas_vpc"` `cardea-dev-lambdas-vpc-sg`, `module "bastion"`, `module "aurora"` con `extra_ingress_security_group_ids = [bastion, lambdas_vpc]`), `identity.tf` (`module "cognito"` con `callback_urls = ["https://${var.panel_prefix}.${var.base_domain}/", "http://localhost:3000/"]`, `domain_prefix = "cardea-dev"`; `module "api_gateway"`) y `platform.tf` (`module "ecr"`, `module "messaging"`, `module "reports"`)
- [X] T041 [US3] Pasar al panel por `environment_variables` de `module "panel"` en `infra/environments/dev/main.tf`: `NEXT_PUBLIC_COGNITO_DOMAIN`, `NEXT_PUBLIC_COGNITO_CLIENT_ID`, `NEXT_PUBLIC_COGNITO_REDIRECT_URI`, `NEXT_PUBLIC_API_URL`
- [X] T042 [P] [US3] Añadir botón «Entrar» en `frontend/cardea-app/src/components/Cabecera.tsx` que enlaza a `https://${NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize` con `response_type=code`, `client_id`, `redirect_uri`, `scope=openid email profile` (el canje del código y la sesión llegan con la spec 002); tokens `--cardea-*`, sin colores de estado
- [X] T043 [US3] Completar `infra/environments/dev/outputs.tf` con todas las salidas de `specs/001-infra-base/contracts/terraform-outputs.md`
- [ ] T044 [US3] `terraform fmt -check -recursive`, `terraform validate`, `pnpm -C frontend/cardea-app type-check` y `pnpm -C frontend/cardea-web build`; pegar salidas

---

## Phase 6: Apply inicial y arranque de CI (US1 + US2 + US3)

- [X] T045 Parada: `terraform plan -out=tfplan` local con `--profile fintrack-dev`, `guardia_plan.py` sobre `tfplan.json`, y resumen para Andrés (recursos por módulo, 0 recursos con `fenora`/`fintrack`, ningún `aws_iam_openid_connect_provider` como resource, ningún cambio en la asociación `andres.tekhos.com`, coste estimado); esperar OK
- [X] T046 Con OK: `terraform apply tfplan`; después `terraform plan -detailed-exitcode` (exit 0, SC-001); pegar salidas en el PR
- [X] T047 Parada: Andrés adjunta la política de arranque según `infra/bootstrap/README.md`; con su OK, `gh secret set AWS_GITHUB_OIDC_ROLE_ARN` y `gh secret set AWS_GITHUB_OIDC_PLAN_ROLE_ARN` con las salidas de `terraform output`
- [ ] T048 Comprobar la conexión Amplify–GitHub de `cardea-landing-dev` y `cardea-app-dev`; si no hay token, documentar en `infra/README.md` la autorización manual (paso de Andrés) y lanzar el primer build
- [ ] T049 Validar quickstart §5 (landing 200, tiempo de publicación desde el merge < 10 min con las marcas de tiempo del build de Amplify, formulario 200/400, ítem en DynamoDB, correo recibido; borrar el ítem de prueba) y §6 (salidas, `psql` por el bastión, 5432 cerrado desde internet, pausa de Aurora, Hosted UI desde «Entrar» y canje PKCE con `scripts/cognito-pkce.sh`, zona `tekhos.com` comparada con `inventario.md`, `simulate-principal-policy` del rol de plan)

---

## Phase 7: Polish

- [X] T050 [P] Escribir `infra/README.md` (FR-007): orden de arranque (bootstrap → primer apply local con OK → política de arranque → secretos → Amplify–GitHub → pipeline), pasos manuales declarados, coste esperado, cómo parar el bastión, recursos ajenos usados (`tekhos.com`, proveedor OIDC) y riesgo del `Allow *` de Fenora
- [X] T051 [P] Actualizar `infra/AGENTS.md`: estado (módulos aplicados), orden de módulos y lo que no se gestiona aquí (`tekhos.com`)
- [X] T052 Inventario por etiqueta contra `terraform state list` (quickstart §7, SC-004) y anotarlo en `specs/001-infra-base/inventario.md`
- [ ] T053 `scripts/check-ai-attribution.sh --commits origin/main..HEAD`; parada con rama, ficheros, mensaje y validaciones antes del push y antes del PR
- [ ] T054 Tras 30 días: Cost Explorer filtrado por `Project=cardea` (SC-003) y anotarlo en el issue de la spec

---

## Dependencies & Execution Order

- **Phase 0 → parada → Phase 1 → Phase 2** (bootstrap con OK).
- **US1 (Phase 3), US2 (Phase 4), US3 (Phase 5)** son independientes en código y se pueden escribir en paralelo tras Phase 2; comparten `outputs.tf` y `main.tf` (no paralelizar T017/T019/T028/T041/T043 entre sí).
- **Phase 6** necesita las tres historias escritas: el primer apply crea a la vez sitios, roles de CI y base del control plane. US2 solo se demuestra de extremo a extremo tras T047.
- **Phase 7** al final; T054 es posterior al merge.

## Parallel Example

```text
# Tras Phase 2, en paralelo (ficheros distintos):
T013 email · T016 amplify-site · T018 Header.astro
T021 tests guardia · T024 política · T026 tests política · T029 infra-formato
T033 vpc · T034 nat · T035 bastión · T036 aurora · T037 cognito · T038 api-gateway · T039 ecr/messaging/reports
```

## Implementation Strategy

1. **MVP**: US1 es lo visible, pero el primer apply es uno solo con las tres historias (los roles de CI de US2 hacen falta para que el pipeline exista).
2. Commit por hito (setup y ADR; US1; US2; US3; apply y docs), con parada antes de cada push.
3. Un PR para toda la spec.
