# Feature Specification: Actividad y auditoría

**Feature Branch**: `007-actividad-y-auditoria`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Pantalla «Actividad y auditoría» del pitch. Cada petición y cada tool call con su origen, coste, decisión y recorrido (recibida, regla evaluada, datos sustituidos, enviada al proveedor, respuesta entregada), un histograma de la última hora y un feed en directo con filtro «Con incidencia». El texto original no se almacena ni se muestra; lo que sí se muestra es el texto con marcadores cuando hubo redacción, solo si se guardó el texto redactado de forma explícita por política (desactivado por defecto).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguridad reconstruye qué pasó con una petición (Priority: P1)

Como Seguridad, busco una petición por identificador, usuario o aplicación y veo su línea de tiempo: recibida a tal hora, regla evaluada en N ms, N datos sustituidos, enviada a tal proveedor, respuesta en N segundos y coste; y la decisión con su `policyId`.

**Why this priority**: Es la pregunta «¿qué pasó con esta petición y por qué?» y la base de cualquier respuesta a un auditor o a un incidente.

**Independent Test**: Para un evento conocido, el detalle muestra las cinco etapas con tiempos coherentes con el evento y enlaza con la regla aplicada.

**Acceptance Scenarios**:

1. **Given** una petición redactada, **When** se abre su detalle, **Then** aparecen las entidades sustituidas por tipo (`DNI`, `IBAN`) y la nota «El texto original no se almacena».
2. **Given** una tool call bloqueada, **When** se abre, **Then** aparece el servidor y la tool, la decisión y la regla, y ningún argumento.

---

### User Story 2 - Un feed en directo con incidencias a la vista (Priority: P2)

Como responsable de plataforma, veo las últimas peticiones y tool calls en tiempo casi real, con chips por decisión, y filtro «Con incidencia» para ver solo redactadas, avisadas y bloqueadas.

**Independent Test**: Con el gateway recibiendo 10 peticiones por segundo, el feed muestra las nuevas en < 5 s y el histograma de la última hora suma lo mismo que el agregado.

---

### User Story 3 - Protección de datos responde si salió algo sin redactar (Priority: P2)

Como Protección de datos, filtro por «redactadas» y por «datos personales» en un periodo y obtengo cuántas peticiones llevaban datos, cuántas se redactaron y cuántas pasaron en modo «En pruebas» sin redactar.

**Independent Test**: Una consulta por periodo devuelve el recuento por decisión y por tipo de entidad; cuadra con el agregado diario.

---

### Edge Cases

- Volumen: el feed muestra como máximo las últimas 200 filas y pagina hacia atrás por cursor; nunca carga el mes entero.
- Reloj del gateway desincronizado: se muestra la hora del evento y se avisa si difiere más de 60 s de la ingesta.
- Eventos sin principal (clave desconocida rechazada): se muestran como «sin identificar» con la IP de origen truncada, y cuentan como bloqueados.
- Retención: eventos en detalle 13 meses; agregados sin límite; configurable por tenant en el chart.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `insights-api` expone búsqueda de eventos por id, principal, equipo, canal, decisión, servidor/tool y periodo, con paginación por cursor, y el detalle de un evento con su línea de tiempo derivada de los campos del evento (sin información adicional almacenada).
- **FR-002**: Histograma por minuto de la última hora y recuentos por decisión, servidos desde agregados por minuto con retención de 48 horas.
- **FR-003**: Feed en directo por polling cada 5 s (SSE en una fase posterior).
- **FR-004**: Panel: pantalla «Actividad y auditoría» del pitch, con filas de petición y de tool call, chips de decisión, selección y detalle lateral.
- **FR-005**: Ningún endpoint devuelve contenido de prompts, respuestas ni argumentos; la API no tiene campo para ello.

### Key Entities

- **UsageEvent**: hecho inmutable.
- **MinuteAggregate**: minuto × decisión × canal.

## Success Criteria *(mandatory)*

- **SC-001**: Búsqueda por id responde < 300 ms p95 sobre 1 M de eventos.
- **SC-002**: La pantalla coincide con la maqueta del pitch en el gate visual.
- **SC-003**: Prueba de ausencia de contenido sobre todos los endpoints de esta spec en CI.

## Out of Scope

- Registro de prompts y comparación entre modelos (fase posterior, con consentimiento explícito).
- Alertas en tiempo real por canal externo (Slack, Teams) más allá del correo.
