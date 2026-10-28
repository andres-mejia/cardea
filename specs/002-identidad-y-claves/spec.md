# Feature Specification: Identidad, equipos y claves de desarrollador

**Feature Branch**: `002-identidad-y-claves`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Pantalla «Desarrolladores y claves» del pitch. Una clave por persona, emitida tras identificarse con el SSO, válida para todos sus CLIs, con caducidad, revocación y detección de claves sin uso. Equipos con centro de coste. Es el primer servicio del control plane y la base de todo lo demás (políticas, presupuestos, chargeback).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un desarrollador obtiene su clave con el SSO (Priority: P1)

Como desarrolladora, ejecuto `cardea login` en mi portátil, me identifico en el navegador con el SSO de mi empresa y obtengo una clave de Cardea que configuro una vez en Claude Code, Codex y Copilot CLI. No necesito claves de Anthropic ni de OpenAI.

**Why this priority**: Es la propuesta central para el canal CLI: sin clave propia no hay atribución ni control por persona.

**Independent Test**: `cardea login` contra el entorno dev termina con una clave en `~/.config/cardea/credentials`; una llamada `curl` al gateway con esa clave (spec 004) o al endpoint `GET /v1/me` del control plane devuelve el usuario y el equipo.

**Acceptance Scenarios**:

1. **Given** un usuario del IdP que pertenece al grupo `Plataforma`, **When** completa el flujo PKCE desde el CLI, **Then** el control plane emite una clave ligada a su usuario y a su equipo, con caducidad de 90 días, y la muestra una sola vez.
2. **Given** una clave vigente, **When** el usuario vuelve a ejecutar `cardea login`, **Then** se emite una clave nueva y la anterior pasa a `revoked` en 24 horas (ventana de solape).
3. **Given** un usuario que no pertenece a ningún grupo mapeado a equipo, **When** intenta obtener clave, **Then** se deniega con un mensaje que nombra al responsable de plataforma.

---

### User Story 2 - Un responsable ve quién tiene clave y revoca (Priority: P1)

Como responsable de plataforma, veo en el panel a cada desarrollador con su equipo, sus herramientas, su gasto del mes y el estado de su clave (activa, caduca en N días, sin uso en N días, revocada), y puedo revocar o renovar.

**Why this priority**: Es la pregunta de Seguridad («¿puedo revocar el acceso de una persona?») y la de Dirección técnica («¿quién usa qué herramienta?»).

**Independent Test**: Revocar una clave desde el panel hace que la siguiente llamada al gateway con esa clave reciba 401 en menos de 60 segundos.

**Acceptance Scenarios**:

1. **Given** la pantalla de desarrolladores, **When** se filtra por equipo `Datos`, **Then** solo aparecen sus miembros, con la tarjeta de cada uno igual a la maqueta del pitch.
2. **Given** una clave sin uso desde hace 30 días, **When** se abre el panel, **Then** aparece como candidata a revocar en el panel general y en la tarjeta del desarrollador.

---

### User Story 3 - Equipos con centro de coste (Priority: P2)

Como Finanzas, cada equipo tiene un código de centro de coste del ERP y los grupos del IdP se mapean a equipos, de modo que todo gasto queda imputable desde la primera petición.

**Why this priority**: Sin centro de coste no hay chargeback (spec 006); va después porque el mapeo puede empezar manual.

**Independent Test**: Crear el equipo `Siniestros` con `CC-2210` y mapearlo al grupo `grp-siniestros` del IdP hace que un usuario nuevo de ese grupo aparezca en `Siniestros` al primer login.

**Acceptance Scenarios**:

1. **Given** un grupo del IdP mapeado a dos equipos, **When** se guarda, **Then** se rechaza: un grupo mapea a un único equipo.

---

### Edge Cases

- Un usuario en dos grupos mapeados a equipos distintos: se elige el equipo por prioridad explícita del mapeo; si no hay, se deniega y se registra.
- IdP caído durante el login: el CLI muestra el error del IdP, no emite clave y no cae a ningún modo degradado.
- Clave filtrada: la revocación es inmediata en el control plane y el gateway la refresca en menos de 60 segundos; el evento de revocación queda en auditoría.
- El auxiliar del puesto es un binario único (`cardea`) para macOS, Linux y Windows; en el MVP solo hace `login`, `status` y `logout`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `identity-service` (Quarkus, hexagonal) expone `POST /v1/keys` (emisión tras OIDC), `GET /v1/me`, `GET /v1/developers`, `POST /v1/keys/{id}/revoke`, `GET/POST /v1/teams`, `PUT /v1/teams/{id}/idp-groups`, según `contracts/openapi/identity-service.yaml`.
- **FR-002**: Las claves se guardan solo como hash (Argon2id); el valor en claro se devuelve una vez. Prefijo `cardea_` y 32 bytes de entropía.
- **FR-003**: El gateway valida claves contra un adaptador `KeyResolver` con caché local de 60 s y revocación por push o polling.
- **FR-004**: Identidad humana vía OIDC: Cognito en dev (federable a Entra ID u Okta) y OIDC genérico en el chart. El `tenantId` sale del token y se valida con regex antes de cualquier `SET search_path`.
- **FR-005**: `cardea login` implementa Authorization Code + PKCE con callback en `localhost`; `cardea status` muestra usuario, equipo y caducidad; `cardea logout` borra la credencial local.
- **FR-006**: Cada emisión, renovación, revocación y uso-por-primera-vez genera un evento de auditoría (sin contenido).
- **FR-007**: El panel implementa la pantalla «Desarrolladores y claves» del pitch con datos reales del servicio y filtro por equipo.

### Key Entities

- **Team**: id, nombre, centro de coste, grupos del IdP mapeados.
- **Developer**: usuario del IdP, equipo, herramientas vistas (derivadas de los eventos), gasto del mes (derivado).
- **DeveloperKey**: hash, prefijo visible, usuario, equipo, emitida, caduca, último uso, estado.

## Success Criteria *(mandatory)*

- **SC-001**: Un desarrollador nuevo pasa de cero a una petición permitida en Claude Code en menos de 5 minutos siguiendo la guía, sin tocar claves de proveedor.
- **SC-002**: La revocación es efectiva en el gateway en menos de 60 segundos (medido con el test de integración).
- **SC-003**: Cobertura de tests del dominio de `identity-service` del 90 % sin mocks del dominio; test de contrato contra el OpenAPI en CI.

## Out of Scope

- SCIM y aprovisionamiento automático de usuarios.
- Claves de servicio para aplicaciones (se tratan como un principal de tipo `app` en la spec 004 con el mismo modelo de clave).
- Gestión de licencias (asientos) de los proveedores: spec 008.
