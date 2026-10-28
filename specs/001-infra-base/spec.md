# Feature Specification: Infraestructura base en AWS (dev)

**Feature Branch**: `001-infra-base`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Levantar en la cuenta AWS compartida con Fenora, con Terraform y el mismo stack, lo mínimo para que la landing, el panel y el control plane puedan desplegarse por pipeline: estado remoto, OIDC, DNS, correo, hosting, identidad, base de datos, registro de imágenes y los workflows de plan/apply.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La landing se publica sola en cardea.ai (Priority: P1)

Como responsable del producto, al fusionar en `main` un cambio en `frontend/cardea-web`, quiero que cardea.ai y www.cardea.ai se actualicen sin tocar la consola, y que el formulario «Pedir una demo» guarde la solicitud y me avise por correo.

**Why this priority**: Es lo que Paco y los tres clientes van a ver primero; sin esto no hay nada que enseñar.

**Independent Test**: Un push a `main` que cambie un texto de la landing aparece en https://cardea.ai en menos de diez minutos; un envío del formulario crea un ítem en DynamoDB y llega un correo a hola@cardea.ai.

**Acceptance Scenarios**:

1. **Given** la zona de Route 53 de `cardea.ai` delegada, **When** se aplica `infra/environments/dev`, **Then** Amplify sirve la landing en el apex y en `www`, con certificado válido.
2. **Given** la landing publicada, **When** un visitante envía el formulario con nombre y correo válidos, **Then** recibe «Recibido» y existe un ítem con ese correo en `cardea-contact-dev`.
3. **Given** un correo inválido o sin nombre, **When** se envía, **Then** la API responde 400 y no se guarda nada.

---

### User Story 2 - Un pipeline aplica Terraform con guardia (Priority: P1)

Como mantenedor, quiero que cada push a `main` que toque `infra/**` ejecute `fmt`, `validate`, `plan` y `apply` en dev con credenciales OIDC temporales, y que un plan que destruya datos o ejecute código no declarado detenga el pipeline, como en Fenora.

**Why this priority**: Sin pipeline, la infraestructura se hace a mano y deja de ser reproducible desde el primer día.

**Independent Test**: Un PR que añade un recurso inocuo pasa `infra · formato` y `infra · plan`; al fusionarse, `infra · aplicar` lo crea. Un plan sintético con `destroy` de una tabla hace fallar la guardia en sus tests y en el job.

**Acceptance Scenarios**:

1. **Given** el proveedor OIDC de GitHub ya existente en la cuenta, **When** se aplica el módulo `github-oidc`, **Then** se crea un rol `cardea-dev-github-actions` acotado a `repo:andres-mejia/cardea:ref:refs/heads/main` sin crear un segundo proveedor.
2. **Given** un plan con `aws_dynamodb_table.contact` marcada para destruir, **When** corre `guardia_plan.py`, **Then** sale con código distinto de 0 y el apply no se ejecuta.

---

### User Story 3 - El panel y el control plane tienen dónde vivir (Priority: P2)

Como desarrollador, quiero Cognito, Aurora Serverless v2, ECR, SQS y un bucket de informes creados y con sus salidas disponibles para los módulos de Lambda y API Gateway, con el mismo patrón que Fenora (Lambdas sin VPC, Aurora pública con IAM auth y TLS, auto-pause).

**Why this priority**: Los servicios de identidad y políticas (specs 003 y 005) no pueden empezar sin esto; va después de la landing porque no es visible para el cliente.

**Independent Test**: `terraform output` muestra `cognito_user_pool_id`, `aurora_connection_endpoint`, `ecr_repository_urls`, `usage_queue_url` y `reports_bucket`; `psql` con token IAM conecta al clúster; el panel en app.cardea.ai muestra la Hosted UI de Cognito al pulsar «Entrar».

**Acceptance Scenarios**:

1. **Given** el módulo `aurora` aplicado con `min_acu = 0`, **When** no hay tráfico durante 5 minutos, **Then** el clúster se pausa y la primera conexión posterior reanuda sin error tras los reintentos del script de migración.
2. **Given** Cognito con dominio `auth.cardea.ai` y callback `https://app.cardea.ai/`, **When** un usuario de prueba inicia sesión, **Then** vuelve al panel con un ID token cuyo `iss` es el pool de Cardea.

---

### Edge Cases

- La cuenta ya tiene el proveedor OIDC de GitHub (lo creó Fenora): el módulo lo lee con `data "aws_iam_openid_connect_provider"`; crearlo de nuevo falla con `EntityAlreadyExists`.
- Las Lambda Function URL públicas están bloqueadas por política de cuenta: cualquier endpoint público va por API Gateway HTTP API.
- La conexión de Amplify con GitHub puede fallar al cablearla por Terraform; se documenta el paso manual y `ignore_changes` protege la conexión existente.
- Dos estados de Terraform en la misma cuenta (Fenora y Cardea): buckets y tablas de lock distintos, prefijo `cardea-` en todos los nombres, ningún recurso de Fenora referenciado.
- SES sigue en sandbox hasta pedir la salida: la verificación de `hola@cardea.ai` y del dominio son requisito previo y se comprueban en el plan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `infra/bootstrap.sh` crea de forma idempotente `cardea-terraform-state-<account>` (versionado, cifrado, acceso público bloqueado) y `cardea-terraform-locks`.
- **FR-002**: `infra/environments/dev` compone: `dns` (zona `cardea.ai` y registros de Amplify, Cognito y SES), `email` (identidad SES del dominio con DKIM), `amplify-site` x2, `contact`, `cognito`, `vpc` (solo subredes públicas), `aurora`, `ecr` (un repositorio por servicio del control plane), `messaging` (cola SQS `cardea-usage-dev` con DLQ), `assets` (bucket de informes cifrado) y `github-oidc`.
- **FR-003**: Workflows `infra-formato.yml`, `infra-plan.yml` (en PR) e `infra-apply.yml` (en `main`), con `.github/scripts/guardia_plan.py` y sus tests, portados de Fenora y con nombres de check `infra · formato`, `infra · plan`, `infra · aplicar`.
- **FR-004**: El rol OIDC de CI permite plan y apply en dev, push a ECR y actualización de Lambdas; no permite `iam:*` sobre usuarios ni borrado de buckets con datos.
- **FR-005**: Todos los recursos llevan `default_tags` `Project=cardea`, `Environment=dev`, `ManagedBy=terraform`.
- **FR-006**: Las variables sensibles (`github_access_token`, credenciales de IdP) entran por `-var` desde secretos de GitHub o por `terraform.tfvars` ignorado; nunca en el repo.
- **FR-007**: Un `README` en `infra/` con el orden de arranque: bootstrap, delegar DNS, verificar SES, primer apply, cablear Amplify, segundo apply.

### Key Entities

- **Entorno dev**: una cuenta, una región, un estado remoto; produce las salidas que consumen las demás specs.
- **Rol de CI**: identidad OIDC acotada al repo y a `main`.

## Success Criteria *(mandatory)*

- **SC-001**: `terraform plan` sin cambios tras el apply inicial (idempotencia) y `infra · aplicar` en verde en `main`.
- **SC-002**: https://cardea.ai responde 200 con el HTML de la landing y el formulario funciona de extremo a extremo.
- **SC-003**: Coste mensual del entorno dev en reposo por debajo de 15 € sin contar Fargate (Aurora pausada, Amplify y DynamoDB en capa gratuita); se mide con Cost Explorer a los 30 días.
- **SC-004**: Ningún recurso de Cardea creado fuera de Terraform (comprobación con `terraform state list` contra un inventario por etiqueta).

## Out of Scope

- Producción y cualquier segundo entorno.
- El data plane en Fargate (spec 004) y las Lambdas de servicios (specs 003 en adelante): esta spec deja listos ECR, Aurora, SQS y API Gateway, no despliega código.
- Multi-tenant SaaS.
