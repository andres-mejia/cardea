# Feature Specification: Costes, chargeback y panel general

**Feature Branch**: `006-costes-y-chargeback`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Pantallas «Panel general» y «Costes y chargeback» del pitch, en escritorio y en móvil. Ingesta de los eventos de uso, cálculo de coste, agregación por equipo, centro de coste, canal, modelo y herramienta, presupuesto frente a consumo, y exportación de chargeback para el ERP.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Finanzas sabe cuánto gasta cada equipo (Priority: P1)

Como Finanzas, abro Costes y veo el gasto del mes por equipo con su centro de coste, el porcentaje del presupuesto, el reparto semanal y por familia de modelo, y exporto el chargeback en CSV con una fila por centro de coste y mes.

**Why this priority**: Es la primera pregunta del pitch y la que justifica el presupuesto de compra.

**Independent Test**: Con 10.000 eventos sintéticos de tres equipos cargados por la ingesta, la pantalla muestra totales que cuadran al céntimo con una suma independiente en SQL, y el CSV exportado tiene una fila por centro de coste con el mismo total.

**Acceptance Scenarios**:

1. **Given** eventos de API, CLIs y collectors de asientos, **When** se abre Costes, **Then** el donut por canal suma el total del mes y cada tarjeta de equipo muestra «gastado de presupuesto» con el anillo en aviso a partir del 90 %.
2. **Given** el filtro «Modelo», **When** se selecciona, **Then** el gasto se reparte por familia (Claude, GPT, Gemini, otros) con los mismos totales.
3. **Given** un mes cerrado, **When** se exporta, **Then** el CSV incluye `cost_center, team, period, channel, model_family, cost_eur` con dos decimales y el total coincide con el panel.

---

### User Story 2 - El panel general señala lo que necesita decisión (Priority: P1)

Como responsable de plataforma, al entrar veo el gasto del mes con su tendencia diaria, usuarios activos, peticiones, bloqueadas, y la lista «Requiere atención» (equipos al 90 %, redacciones del día, collectors en error, claves sin uso) con una acción por fila.

**Independent Test**: Cada fila de «Requiere atención» se dispara con un fixture propio y desaparece al resolverse (ampliar presupuesto, reconectar, revocar).

**Acceptance Scenarios**:

1. **Given** un equipo al 92 %, **When** se pulsa «Ampliar», **Then** se abre la ampliación de presupuesto (spec 004) y, tras confirmarla, la fila desaparece.

---

### User Story 3 - El móvil consulta y reacciona (Priority: P2)

Como responsable, desde el móvil veo el gasto y los avisos, y apruebo o rechazo una ampliación o renuevo una clave; no configuro reglas ni conexiones.

**Independent Test**: Las tres pantallas móviles del pitch (Panel, Avisos, Costes) renderizan a 390 px con los mismos datos que el escritorio; el gate visual compara con la maqueta.

---

### Edge Cases

- Eventos duplicados por reintento de la cola: idempotencia por `id` del evento.
- Eventos que llegan tarde (buffer local del gateway tras una caída): se imputan al mes de `occurredAt`, no al de ingesta; un mes exportado puede recibir correcciones y se marca «revisado».
- Coste nulo por precio desconocido: se muestra en una fila «Sin precio» y en Conexiones; nunca se oculta.
- Cambio de centro de coste de un equipo a mitad de mes: el chargeback usa el centro vigente en `occurredAt`.
- Primer mes sin presupuesto definido: las tarjetas muestran el gasto sin anillo y un aviso para definirlo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `usage-ingest` consume `cardea-usage-dev` (SQS, Lambda) o `POST /v1/usage` (chart), valida contra el contrato, deduplica por `id` y persiste en `usage_event` particionada por mes dentro del schema del tenant.
- **FR-002**: Agregados materializados por día, equipo, canal, proveedor, familia de modelo y herramienta, recalculados por job tras la ingesta; consultas del panel solo sobre agregados.
- **FR-003**: `insights-api` expone los endpoints del panel general, costes (con filtros equipo, proyecto, modelo, herramienta y periodo) y la exportación CSV (`contracts/openapi/insights-api.yaml`).
- **FR-004**: Presupuesto frente a consumo calculado del mismo agregado que usa el bloqueo de la spec 004; no hay dos fuentes de verdad.
- **FR-005**: Panel: «Panel general» y «Costes y chargeback» del pitch; móvil: «Panel», «Avisos» y «Costes», con acciones de aprobar, rechazar, renovar y revocar.
- **FR-006**: Toda cifra en microeuros en el backend y formateada en el frontend con `tabular-nums` y locale `es-ES`.

### Key Entities

- **UsageEvent**: hecho inmutable (spec 003).
- **DailyAggregate**: día × equipo × canal × proveedor × familia × herramienta → tokens, coste, peticiones, decisiones.
- **ChargebackExport**: periodo, centro de coste, coste; con marca de revisado.

## Success Criteria *(mandatory)*

- **SC-001**: Totales del panel iguales a la suma SQL independiente al microeuro sobre 1 M de eventos sintéticos.
- **SC-002**: Panel general carga en < 1,5 s p95 con 1 M de eventos (agregados, no eventos).
- **SC-003**: Finanzas de un cliente piloto reconcilia el CSV con la factura del proveedor con una diferencia explicada < 2 %.

## Out of Scope

- Métricas de valor y ROI por caso de uso (después del MVP).
- Previsión de gasto y recomendaciones de ahorro.
- Facturación de Cardea al cliente.
