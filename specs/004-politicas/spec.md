# Feature Specification: Políticas: datos personales, modelos permitidos y presupuestos

**Feature Branch**: `004-politicas`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Pantalla «Políticas» del pitch. Reglas que se evalúan en el data plane antes de que una petición salga: redacción de datos personales (DNI/NIE, IBAN, correo, teléfono, nombre), lista de modelos permitidos por equipo, límite mensual por equipo con aviso y bloqueo, y código marcado como confidencial (aviso). Se crean, prueban con un texto y activan desde el panel; el motor es código propio con Presidio para los datos personales.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Los datos de clientes no salen sin redactar (Priority: P1)

Como Protección de datos, activo la regla «Datos de clientes no salen sin redactar» para todos los equipos y canales; cualquier DNI, IBAN, correo, teléfono o nombre de persona se sustituye por un marcador antes de llegar al proveedor, y el evento registra qué entidades se redactaron, no su valor.

**Why this priority**: Es la pregunta de Seguridad y la base del informe de evidencias; es también lo que ningún proveedor hace por el cliente.

**Independent Test**: Un prompt con un DNI y un IBAN válidos llega al proveedor (simulado) como `<DNI>` y `<IBAN>`; el evento lleva `decision: redacted` y `redactedEntities: [dni, iban]`; el test de canario de la spec 003 sigue pasando.

**Acceptance Scenarios**:

1. **Given** la regla activa, **When** una petición contiene «12345678Z» y «ES91 2100 0418 4502 0005 1332», **Then** el texto reenviado contiene los marcadores y no los valores, y la respuesta vuelve con los marcadores sin resolver (el MVP no re-identifica).
2. **Given** la regla en modo «En pruebas», **When** llega una petición con datos, **Then** se registra lo que se habría redactado y el texto sale sin cambios.
3. **Given** la pantalla de la regla, **When** el responsable pega un texto en «Prueba con un ejemplo», **Then** ve el resultado redactado sin que la prueba salga del control plane ni genere evento de uso.

---

### User Story 2 - Modelos permitidos por equipo (Priority: P1)

Como responsable de plataforma, defino que `Siniestros` solo puede usar `claude-sonnet` y `gpt`; una petición a `gemini` desde ese equipo se bloquea con un mensaje claro.

**Independent Test**: Petición con clave de `Siniestros` a `gemini` recibe 403 con `policyId` y el evento lleva `decision: blocked`.

**Acceptance Scenarios**:

1. **Given** la lista permitida, **When** se añade un modelo, **Then** el gateway lo aplica en menos de 60 segundos sin reinicio.

---

### User Story 3 - Presupuesto mensual por equipo con aviso y bloqueo (Priority: P1)

Como Finanzas, fijo 4.000 € al mes para `Siniestros` con aviso al 80 % y bloqueo al 100 %; el responsable del equipo recibe el aviso y puede pedir ampliación desde el móvil.

**Independent Test**: Con eventos sintéticos que suman el 101 % del presupuesto, la siguiente petición del equipo recibe 429 con `policyId` y el panel general muestra «Siniestros va al 100 % de su presupuesto».

**Acceptance Scenarios**:

1. **Given** el 80 % consumido, **When** se cruza el umbral, **Then** se emite un aviso (correo por SES y entrada en «Requiere atención») una sola vez por mes.
2. **Given** el bloqueo activo, **When** se amplía el presupuesto en 500 €, **Then** las peticiones vuelven a pasar y queda un evento de auditoría con quién amplió y cuánto.

---

### User Story 4 - Código confidencial, solo aviso (Priority: P3)

Como Seguridad, marco rutas o repositorios como confidenciales; si un CLI envía contexto de esas rutas, se registra un aviso al desarrollador sin bloquear.

**Independent Test**: Un prompt cuyo contexto incluye una ruta marcada genera `decision: warned` y un aviso en el feed de actividad.

---

### Edge Cases

- Falsos positivos de Presidio en nombres: la regla permite excluir términos (diccionario por tenant) y el modo «En pruebas» sirve para calibrar antes de activar.
- Streaming y redacción de la respuesta: el MVP no inspecciona respuestas; se declara en Evidencias como no cubierto.
- Presupuesto en el límite exacto con varias peticiones concurrentes: el contador del gateway es local y se reconcilia con el control plane; se admite un desvío máximo del 2 % y se documenta.
- Regla sin alcance (ningún equipo ni canal): no se puede activar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `policy-service` expone CRUD de reglas (`contracts/openapi/policy-service.yaml`), con estados `draft`, `testing`, `active`, y publica la configuración consolidada por tenant que el gateway lee (polling cada 30 s o push).
- **FR-002**: Motor de evaluación en el data plane (`dataplane/policy-hooks`), engranado al gateway elegido en ADR-003, con orden fijo: autenticación → presupuesto → modelo permitido → datos personales → confidencial.
- **FR-003**: Reconocedores de datos personales con Presidio: DNI/NIE (con letra de control), IBAN (con dígitos de control), correo, teléfono español e internacional, nombres de persona (modelo `es`); sustitución por marcadores `<DNI>`, `<IBAN>`, `<EMAIL>`, `<PHONE>`, `<NAME>`.
- **FR-004**: Presupuestos en microeuros por equipo y mes natural, con `warnAtPercent` y acción `warn` o `block`; el aviso usa SES en dev y SMTP en el chart.
- **FR-005**: «Prueba con un ejemplo» ejecuta el motor en el control plane sobre el texto pegado; no persiste el texto ni emite evento.
- **FR-006**: Cada decisión distinta de `allowed` lleva `policyId` en el evento y en la respuesta de error.
- **FR-007**: Panel: pantalla «Políticas» del pitch (lista de reglas con alcance, acción, aciertos del mes, estado, interruptor; panel «Cómo actúa la regla»; prueba con ejemplo).

### Key Entities

- **Policy**: kind, scope (equipos, canales), action, status, parámetros (lista de modelos, entidades, umbrales, rutas).
- **Budget**: equipo, periodo, límite, umbral de aviso, acción, consumo (derivado).
- **PolicyDecision**: parte del `UsageEvent`.

## Success Criteria *(mandatory)*

- **SC-001**: Redacción con precisión ≥ 0,98 y exhaustividad ≥ 0,95 sobre un corpus de prueba propio de 500 textos en castellano con DNI, IBAN, correos, teléfonos y nombres (sin datos reales).
- **SC-002**: Evaluación de políticas añade < 15 ms p95 por petición sin datos personales y < 80 ms con ellos.
- **SC-003**: Un cambio de regla desde el panel está en vigor en el gateway en < 60 s.

## Out of Scope

- Inspección y redacción de respuestas.
- Clasificación semántica de confidencialidad; solo rutas y marcadores explícitos.
- Políticas sobre tools MCP: spec 005.
