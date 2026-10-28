# Feature Specification: Gateway LLM (data plane) con eventos sin contenido

**Feature Branch**: `003-gateway-llm`

**Created**: 2026-10-29

**Status**: Draft

**Input**: El punto de control para aplicaciones por API y CLIs de código: un endpoint compatible con las APIs de OpenAI y Anthropic al que apuntan las aplicaciones y los CLIs con su clave de Cardea; enruta a los proveedores (Anthropic, OpenAI, Bedrock, Azure), mantiene el streaming, y emite un evento por petición con usuario, equipo, modelo, tokens, coste, latencia y decisión, nunca el contenido. Incluye la fase 0 de ADR-003 (LiteLLM frente a Bifrost) y el despliegue en ECS Fargate.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Claude Code y Codex funcionan a través de Cardea (Priority: P1)

Como desarrollador con clave de Cardea, configuro `ANTHROPIC_BASE_URL` (o el equivalente de OpenAI) hacia el gateway y trabajo con normalidad, con streaming, sin notar la diferencia salvo el dominio.

**Why this priority**: Es el canal que más usan los tres clientes; si el CLI se degrada, no hay producto.

**Independent Test**: Una sesión de Claude Code contra el gateway dev completa una tarea de código con streaming visible; la latencia añadida por el gateway en p95 es inferior a 50 ms sobre la del proveedor.

**Acceptance Scenarios**:

1. **Given** una clave vigente, **When** Claude Code llama a `/v1/messages` con `stream: true`, **Then** la respuesta llega en SSE sin esperar al final y el evento de uso se registra al cerrar el stream con los tokens reales.
2. **Given** una clave revocada, **When** se llama, **Then** el gateway responde 401 con un cuerpo que explica cómo renovar (`cardea login`).
3. **Given** una aplicación con clave de tipo `app`, **When** llama con el SDK de OpenAI apuntando al gateway, **Then** funciona sin cambios de código salvo `base_url` y `api_key`.

---

### User Story 2 - Cada petición deja un evento sin contenido (Priority: P1)

Como Seguridad y Finanzas, cada petición produce un evento con principal, equipo, canal, proveedor, modelo, tokens de entrada y salida, coste en microeuros, latencia y decisión, y en ningún sitio aparece el prompt ni la respuesta.

**Why this priority**: Es la materia prima de costes, actividad y evidencias, y la promesa de privacidad del pitch.

**Independent Test**: Un test de integración envía un prompt con un marcador único (`CARDEA-CANARY-<uuid>`) y comprueba que el marcador no aparece en la cola SQS, en Postgres, en los logs del gateway ni en los del consumidor.

**Acceptance Scenarios**:

1. **Given** una petición completada, **When** se consulta la cola, **Then** hay exactamente un `UsageEvent` conforme a `contracts/asyncapi/usage-events.yaml`, con `costMicroEur` calculado con la tabla de precios versionada.
2. **Given** el control plane caído, **When** llegan peticiones, **Then** el gateway sigue sirviendo con la última configuración y encola los eventos en un buffer local que se vacía al recuperarse.

---

### User Story 3 - Elegir la base del gateway con evidencia (Priority: P1, fase 0)

Como arquitecto, ejecuto el mismo guion contra LiteLLM y contra Bifrost y decido con la salida literal: streaming, clave bloqueada por presupuesto, redacción, tool MCP permitida y denegada, y eventos sin contenido.

**Why this priority**: Decide la forma de las specs 004 y 005; dos o tres días acotados.

**Independent Test**: `docs/ADR/ADR-003-base-del-gateway.md` pasa a estado «aceptada» con la tabla de resultados y los comandos ejecutados.

**Acceptance Scenarios**:

1. **Given** los dos candidatos levantados con `docker compose`, **When** corre `dataplane/fase0/guion.sh`, **Then** produce una tabla con los seis casos por candidato y un juicio por criterio (gobierno de MCP en el núcleo abierto, eventos sin contenido, coste del adaptador, salud del proyecto).

---

### User Story 4 - Desplegado en Fargate, igual que se entregará en Helm (Priority: P2)

Como mantenedor, el gateway corre en ECS Fargate en dev (dos tareas tras un ALB con TLS en `gateway.cardea.ai`), construido desde la misma imagen que irá en el chart, y escala a cero por la noche con una regla programada.

**Independent Test**: `curl https://gateway.cardea.ai/health` responde 200; `aws ecs describe-services` muestra 2 tareas de día y 0 entre 22:00 y 06:00 UTC.

---

### Edge Cases

- Proveedor caído o con 429: el gateway devuelve el error del proveedor sin reintentar en silencio ni cambiar de modelo (la selección de modelo es una política, no un fallback automático en el MVP).
- Petición que supera el tamaño máximo: 413 antes de llegar al proveedor; se registra el evento con decisión `blocked`.
- Tokens no informados por el proveedor en streaming: se estiman con el tokenizador del modelo y el evento lo marca como `estimated`.
- Modelos con precio desconocido: el evento lleva `costMicroEur` nulo y una alerta en Conexiones; nunca un cero silencioso.
- Reloj: todos los eventos con `occurredAt` en UTC del gateway; el panel traduce.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Endpoints compatibles con OpenAI Chat Completions y Responses y con Anthropic Messages, con streaming, detrás de un puerto `LlmGateway` y un adaptador por producto (`dataplane/adapters/<producto>`).
- **FR-002**: Autenticación de cada petición con clave de Cardea (spec 002) vía `KeyResolver` con caché de 60 s; el principal y el equipo se adjuntan al evento.
- **FR-003**: Proveedores del MVP: Anthropic, OpenAI, AWS Bedrock (eu-west-1) y Azure OpenAI; credenciales de proveedor en Secrets Manager (dev) o Secrets de Kubernetes (chart), nunca en el portátil del desarrollador.
- **FR-004**: `UsageEvent` por petición según el contrato; publicación por `UsageEventSink` con adaptadores SQS y HTTP, buffer local persistente ante fallo.
- **FR-005**: Cálculo de coste con `dataplane/pricing/<fecha>.json` versionado; `long` en microeuros.
- **FR-006**: Logs del gateway en nivel `ERROR` por defecto y sin callbacks que registren contenido; un test de canario en CI lo vigila.
- **FR-007**: Infra: módulo `infra/modules/dataplane` (ECS Fargate, ALB, certificado, Secrets, cola SQS, escalado programado) y `Dockerfile` en `dataplane/`.
- **FR-008**: El tenant de demo enruta `claude-sonnet` a Bedrock para que la demo funcione sin claves externas.

### Key Entities

- **Principal**: usuario o aplicación identificado por su clave.
- **Route**: nombre lógico de modelo → proveedor y modelo real.
- **UsageEvent**: ver contrato; nunca contenido.

## Success Criteria *(mandatory)*

- **SC-001**: Claude Code, Codex y Copilot CLI (modo BYOK) completan una tarea real a través del gateway dev con streaming.
- **SC-002**: Latencia añadida p95 < 50 ms; p99 < 120 ms, medidos con 200 peticiones de 500 tokens.
- **SC-003**: El test de canario demuestra ausencia de contenido en los cuatro sumideros (cola, base de datos, logs del gateway, logs del consumidor).
- **SC-004**: ADR-003 aceptada con evidencia literal.

## Out of Scope

- Políticas (datos personales, modelos, presupuestos): spec 004. El gateway de esta spec solo autentica, enruta y mide.
- Gateway MCP: spec 005.
- Caché semántica, fallback automático entre proveedores, enrutado por coste.
