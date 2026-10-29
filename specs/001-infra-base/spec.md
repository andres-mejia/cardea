# Feature Specification: Infraestructura base en AWS (dev)

**Feature Branch**: `001-infra-base`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Levantar en la cuenta AWS compartida con Fenora, con Terraform y el mismo stack, lo mínimo para que la landing, el panel y el control plane puedan desplegarse por pipeline: estado remoto, OIDC, DNS, correo, hosting, identidad, base de datos, registro de imágenes y los workflows de plan/apply.

## Clarifications

### Session 2026-10-29

- Q: `cardea.ai` está registrado por un tercero y servido desde Cloudflare, y `cardea.eu` también tiene dueño; ¿qué dominio usa la spec 001? → A: Provisionalmente, subdominios de `tekhos.com` (zona ya existente en Route 53 de la cuenta): landing en `cardea.tekhos.com` y panel en `cardea-app.tekhos.com`, mientras se decide si se cambia de nombre o se compra un dominio similar. El dominio es una variable; cambiarlo no cambia la estructura.
- Q: En `eu-west-1` el único conjunto de reglas de recepción SES activo es el de Fenora; ¿cómo recibe correo Cardea? → A: Se reutiliza lo que ya tiene `tekhos.com` (identidad SES verificada en `eu-west-1` y regla catch-all en `us-east-1` que reenvía a ramejiafernandez@gmail.com). Cardea envía y recibe como `cardea@tekhos.com`; no crea identidad, conjunto de reglas ni reenviador propios.
- Q: ¿Con qué modelo de permisos aplica Terraform el rol de CI? → A: Patrón Fenora: política permanente gestionada por Terraform (ECR, Lambda, lectura de costes) más una política de arranque con `Allow *` que caduca en fecha y `Deny` de guarda, adjuntada una vez por CLI por Andrés (nunca desde la consola).
- Q: El plan en PR no puede usar un rol acotado a `main`; ¿cómo obtiene credenciales? → A: Rol aparte `cardea-dev-github-actions-plan`, de solo lectura más lectura del estado y escritura del lock, acotado a `repo:andres-mejia/cardea:pull_request`. El rol de apply sigue acotado a `main`.
- Q: `AGENTS.md` pide Lambdas sin VPC y Aurora con IAM auth «como Fenora», pero Fenora pasó en mayo de 2026 a Aurora privada (commit `18e7e2cd`) y Lambdas en VPC con JDBC (#34); ¿qué patrón sigue Cardea? → A: El de Fenora actual: Aurora en subredes privadas con SG que solo admite el SG de las Lambdas y el del bastión; Lambdas del control plane en VPC con JDBC (igual que en Helm); NAT instance (fck-nat, t4g.nano) para la salida y bastión SSM (t3.nano) para el acceso humano. Se enmiendan `AGENTS.md` §4 y la constitución con un ADR-004 en el PR de esta spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La landing se publica sola en cardea.tekhos.com (Priority: P1)

Como responsable del producto, al fusionar en `main` un cambio en `frontend/cardea-web`, quiero que cardea.tekhos.com se actualice sin tocar la consola, y que el formulario «Pedir una demo» guarde la solicitud y me avise por correo.

**Why this priority**: Es lo que Paco y los tres clientes van a ver primero; sin esto no hay nada que enseñar.

**Independent Test**: Un push a `main` que cambie un texto de la landing aparece en https://cardea.tekhos.com en menos de diez minutos; un envío del formulario crea un ítem en DynamoDB y llega un correo a cardea@tekhos.com (reenviado a ramejiafernandez@gmail.com).

**Acceptance Scenarios**:

1. **Given** la zona de Route 53 de `tekhos.com` existente en la cuenta, **When** se aplica `infra/environments/dev`, **Then** Amplify sirve la landing en `cardea.tekhos.com` y el panel en `cardea-app.tekhos.com`, con certificado válido, sin modificar los registros que ya existen en la zona.
2. **Given** la landing publicada, **When** un visitante envía el formulario con nombre y correo válidos, **Then** recibe «Recibido» y existe un ítem con ese correo en `cardea-contact-dev`.
3. **Given** un correo inválido o sin nombre, **When** se envía, **Then** la API responde 400 y no se guarda nada.

---

### User Story 2 - Un pipeline aplica Terraform con guardia (Priority: P1)

Como mantenedor, quiero que cada push a `main` que toque `infra/**` ejecute `fmt`, `validate`, `plan` y `apply` en dev con credenciales OIDC temporales, y que un plan que destruya datos o ejecute código no declarado detenga el pipeline, como en Fenora.

**Why this priority**: Sin pipeline, la infraestructura se hace a mano y deja de ser reproducible desde el primer día.

**Independent Test**: Un PR que añade un recurso inocuo pasa `infra · formato` y `infra · plan`; al fusionarse, `infra · aplicar` lo crea. Un plan sintético con `destroy` de una tabla hace fallar la guardia en sus tests y en el job.

**Acceptance Scenarios**:

1. **Given** el proveedor OIDC de GitHub ya existente en la cuenta, **When** se aplica el módulo `github-oidc`, **Then** se crean los roles `cardea-dev-github-actions` (acotado a `repo:andres-mejia/cardea:ref:refs/heads/main`) y `cardea-dev-github-actions-plan` (acotado a `repo:andres-mejia/cardea:pull_request`) sin crear un segundo proveedor.
2. **Given** un plan con `aws_dynamodb_table.contact` marcada para destruir, **When** corre `guardia_plan.py`, **Then** sale con código distinto de 0 y el apply no se ejecuta.
3. **Given** un PR que toca `infra/**`, **When** corre `infra · plan` con el rol de plan, **Then** el plan se genera y cualquier intento de escritura fuera del lock del estado falla por permisos.

---

### User Story 3 - El panel y el control plane tienen dónde vivir (Priority: P2)

Como desarrollador, quiero Cognito, Aurora Serverless v2, ECR, SQS, un bucket de informes y una HTTP API base creados y con sus salidas disponibles para los módulos de Lambda, con el mismo patrón que Fenora (Aurora privada con IAM auth, TLS y auto-pause; Lambdas en VPC con salida por NAT instance; bastión SSM para el acceso humano).

**Why this priority**: Los servicios de identidad y políticas (specs 002 y 004) no pueden empezar sin esto; va después de la landing porque no es visible para el cliente.

**Independent Test**: `terraform output` muestra `cognito_user_pool_id`, `aurora_connection_endpoint`, `ecr_repository_urls`, `usage_queue_url`, `reports_bucket` y `api_endpoint`; `psql` con token IAM conecta al clúster a través del bastión (`aws ssm start-session` con port forwarding); desde internet el puerto 5432 no responde; el panel en cardea-app.tekhos.com muestra la Hosted UI de Cognito al pulsar «Entrar».

**Acceptance Scenarios**:

1. **Given** el módulo `aurora` aplicado con `min_acu = 0`, **When** no hay tráfico durante 5 minutos, **Then** el clúster se pausa y la primera conexión posterior reanuda sin error tras los reintentos del script de migración.
2. **Given** Cognito con el dominio de prefijo `cardea-dev.auth.eu-west-1.amazoncognito.com` y callback `https://cardea-app.tekhos.com/`, **When** un usuario de prueba inicia sesión desde «Entrar», **Then** vuelve al panel con un `code`, y el canje de ese `code` (PKCE, a mano con `curl` hasta que la spec 002 implemente la sesión) devuelve un ID token cuyo `iss` es el pool de Cardea.

---

### Edge Cases

- La cuenta ya tiene el proveedor OIDC de GitHub (lo gestiona el estado de Fenora): el módulo lo lee con `data "aws_iam_openid_connect_provider"`; crearlo de nuevo falla con `EntityAlreadyExists`.
- Las Lambda Function URL públicas están bloqueadas por política de cuenta: cualquier endpoint público va por API Gateway HTTP API.
- La conexión de Amplify con GitHub puede fallar al cablearla por Terraform; se documenta el paso manual y `ignore_changes` protege la conexión existente.
- Dos estados de Terraform en la misma cuenta (Fenora y Cardea): buckets y tablas de lock distintos, prefijo `cardea-` en todos los nombres, ningún recurso de Fenora referenciado.
- `tekhos.com` no es de Cardea: su zona, su identidad SES (stack `tekhos-email-sending`) y su recepción (stack `tekhos-email-receiving`, `us-east-1`) se leen con data sources o se usan por nombre, nunca se gestionan ni se importan en el estado de Cardea. `tekhos.com` ya está asociado en Amplify a otra app (`andres.tekhos.com`): cada app de Cardea asocia solo su prefijo y no toca los demás.
- La zona `tekhos.com` no tiene registro A en el apex, requisito de Cognito para un dominio propio: Cognito usa el dominio de prefijo de AWS hasta que exista un dominio definitivo.
- La cuenta ya está fuera del sandbox de SES en `eu-west-1`; los destinatarios no necesitan verificación.
- La política de arranque de CI de Fenora concede hoy `Allow *` sobre toda la cuenta: el pipeline de Fenora puede, técnicamente, modificar recursos de Cardea. La de Cardea lleva además un `Deny` explícito sobre recursos `fenora-*`/`fintrack-*` y sobre el estado de Fenora.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `infra/bootstrap.sh` crea de forma idempotente `cardea-terraform-state-<account>` (versionado, cifrado, acceso público bloqueado) y `cardea-terraform-locks`.
- **FR-002**: `infra/environments/dev` compone: lectura de la zona `tekhos.com` (data source; los registros de Amplify los crea Amplify en ella), `email` (solo el conjunto de configuración `cardea-dev` y alarmas de rebote y queja; usa la identidad existente de `tekhos.com`), `amplify-site` x2, `contact`, `cognito`, `vpc` (subredes públicas y privadas en 3 AZ, CIDR distinto del de Fenora), `nat-instance`, `bastion`, `aurora` (privada, sin RDS Proxy en dev), SG compartido de las Lambdas del control plane, `ecr` (un repositorio por servicio del control plane), `messaging` (cola SQS `cardea-usage-dev` con DLQ), `reports` (bucket de informes cifrado), `api-gateway` (HTTP API con autorizador JWT de Cognito, sin rutas) y `github-oidc`.
- **FR-003**: Workflows `infra-formato.yml`, `infra-plan.yml` (en PR) e `infra-apply.yml` (en `main`), con `.github/scripts/guardia_plan.py` y sus tests, portados de Fenora y con nombres de check `infra · formato`, `infra · plan`, `infra · aplicar`.
- **FR-004**: El rol de apply tiene una política permanente gestionada por Terraform (push a ECR, actualización de Lambdas) y una política de arranque con caducidad en fecha y `Deny` de guarda: no puede crear usuarios ni credenciales de larga vida, adjuntar políticas de administrador, borrar su propio rol ni el proveedor OIDC, borrar el bucket de estado de Cardea ni tocar recursos `fenora-*`/`fintrack-*`. La política de arranque la adjunta Andrés por CLI una vez, con el procedimiento en `infra/bootstrap/README.md`. El rol de plan es de solo lectura más el estado de Cardea.
- **FR-005**: Todos los recursos llevan `default_tags` `Project=cardea`, `Environment=dev`, `ManagedBy=terraform`.
- **FR-006**: Las variables sensibles (`github_access_token`, credenciales de IdP) entran por `-var` desde secretos de GitHub o por `terraform.tfvars` ignorado; nunca en el repo.
- **FR-007**: Un `README` en `infra/` con el orden de arranque: bootstrap, primer apply local con plan, resumen y OK, adjuntar la política de arranque de CI, secretos de GitHub con los ARN de los roles, cablear Amplify con GitHub, segundo apply desde el pipeline.
- **FR-008**: El dominio base (`tekhos.com`) y los prefijos de la landing (`cardea`) y del panel (`cardea-app`) son variables del entorno; las direcciones `cardea@tekhos.com` (remitente y aviso del formulario) también. Pasar a un dominio propio cambia variables, no módulos.

### Key Entities

- **Entorno dev**: una cuenta, una región, un estado remoto; produce las salidas que consumen las demás specs.
- **Rol de CI de apply**: identidad OIDC acotada al repo y a `main`.
- **Rol de CI de plan**: identidad OIDC de solo lectura acotada al repo y a `pull_request`.

## Success Criteria *(mandatory)*

- **SC-001**: `terraform plan` sin cambios tras el apply inicial (idempotencia) y `infra · aplicar` en verde en `main`.
- **SC-002**: https://cardea.tekhos.com responde 200 con el HTML de la landing y el formulario funciona de extremo a extremo (el correo llega a ramejiafernandez@gmail.com vía cardea@tekhos.com).
- **SC-003**: Coste mensual del entorno dev en reposo por debajo de 15 € sin contar Fargate (Aurora pausada, Amplify y DynamoDB en capa gratuita; NAT instance y bastión suman unos 6,5 €); se mide con Cost Explorer a los 30 días.
- **SC-004**: Ningún recurso de Cardea creado fuera de Terraform (comprobación con `terraform state list` contra un inventario por etiqueta). Excepciones declaradas: los registros que Amplify crea en la zona `tekhos.com` para sus dominios y la política de arranque de CI adjuntada por CLI.

## Out of Scope

- Producción y cualquier segundo entorno.
- El dominio definitivo de Cardea (`cardea.ai` no está disponible; ADR-001) y el dominio propio de Cognito.
- Cualquier cambio en los recursos de `tekhos.com` (zona, identidad SES, recepción) más allá de los registros que añade Amplify.
- El data plane en Fargate (spec 003) y las Lambdas de servicios (specs 002 en adelante): esta spec deja listos ECR, Aurora, SQS y la HTTP API, no despliega código.
- Multi-tenant SaaS.
