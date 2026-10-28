# Feature Specification: Evidencias, collectors y conexiones

**Feature Branch**: `008-evidencias-y-conexiones`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Pantallas «Evidencias» y «Conexiones» del pitch. Un informe por periodo para auditoría (PDF firmado y CSV) que dice qué controles acredita y cuáles no; collectors fuera de banda para asientos (métricas de GitHub Copilot, telemetría de Claude Code por OpenTelemetry, facturación de proveedores) que suman uso y coste a la misma vista sin pasar por el gateway; y la pantalla de instalación y diagnóstico con el mapa de conexiones y el estado de cada una.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cumplimiento entrega un informe al auditor (Priority: P1)

Como Cumplimiento, genero el informe del tercer trimestre para todos los equipos y obtengo un PDF firmado y un CSV que acreditan inventario de herramientas y modelos, accesos por usuario y equipo, tratamiento de datos personales, límites de gasto, tool calls MCP remotas, y declaran como parcial o no cubierto lo que no se puede acreditar (completions inline, chat web fuera del SSO, MCP locales).

**Why this priority**: Es la pregunta «¿qué le entrego al auditor?» y el elemento que ningún competidor vende tal cual.

**Independent Test**: El PDF generado contiene las ocho filas de cobertura con el mismo estado que muestra la pantalla, la firma verifica con la clave pública publicada y el CSV cuadra con los agregados del periodo.

**Acceptance Scenarios**:

1. **Given** el periodo Q3 2026 y alcance «Todos los equipos», **When** se pulsa «Generar informe», **Then** el informe aparece en «Informes anteriores» en menos de dos minutos con fecha y páginas, y se descarga desde S3 con URL prefirmada de 15 minutos.
2. **Given** un control «No cubierto», **When** se lee el informe, **Then** la sección correspondiente explica por qué y qué haría falta, con el mismo texto que la pantalla.

---

### User Story 2 - Los asientos y Copilot se suman a la vista (Priority: P1)

Como Finanzas, el coste de las licencias de Copilot y de los asientos de chat aparece en Costes como canal «Asientos», aunque ese tráfico no pase por el gateway, y Claude Code reporta su telemetría por OpenTelemetry al collector.

**Independent Test**: Con el collector de Copilot sincronizando contra una organización de prueba, el canal «Asientos» muestra usuarios activos y coste de licencias del mes; con un Claude Code configurado con el endpoint OTel del collector, sus sesiones aparecen como canal `cli` con origen `otel`.

**Acceptance Scenarios**:

1. **Given** la credencial del collector de facturación caducada, **When** falla la sincronización, **Then** Conexiones la marca «Reconectar» y «Requiere atención» la lista.

---

### User Story 3 - La pantalla de conexiones dice de dónde sale cada dato (Priority: P2)

Como responsable de plataforma, veo proveedores de modelos, collectors e identidad con su estado, última comprobación y credencial, y añado o reconecto una conexión sin tocar ficheros.

**Independent Test**: Añadir Azure OpenAI con una credencial inválida deja la conexión en «Sin configurar» con el motivo; con una válida pasa a «Conectado» y el modelo aparece enrutable.

---

### Edge Cases

- La API de métricas de Copilot devuelve agregados diarios con retraso de hasta 48 h: el collector reconcilia y el panel marca los dos últimos días como provisionales.
- Facturación de proveedores sin API (factura PDF): se admite carga manual del CSV de facturación con la plantilla del proveedor.
- Informe de un periodo con eventos corregidos después: se genera una versión nueva; las anteriores no se borran.
- Firma del informe: clave privada en Secrets Manager (dev) o en un Secret de Kubernetes; rotación anual; la pública se publica en el panel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `evidence-service` genera el informe (PDF con pdf-lib o equivalente en Java, y CSV) a partir de agregados e inventario, lo firma (Ed25519 o RSA-PSS), lo guarda en el bucket de informes y registra su metadato; endpoints en `contracts/openapi/evidence-service.yaml`.
- **FR-002**: Catálogo de controles con estado derivado: `covered`, `partial`, `not-covered`, con el texto explicativo versionado en el repo.
- **FR-003**: Collectors como jobs programados (EventBridge + Lambda en dev; CronJob en el chart): métricas de GitHub Copilot (API de uso y asientos), telemetría de Claude Code vía OpenTelemetry Collector con exportador propio, facturación de Anthropic, OpenAI y AWS (Cost Explorer con etiqueta); cada uno escribe `UsageEvent` con canal `seat` u origen `otel` y, si aplica, `estimated`.
- **FR-004**: Registro de conexiones (proveedores, collectors, identidad) con credencial en Secrets Manager o Secrets de Kubernetes, comprobación periódica y estado.
- **FR-005**: Panel: pantallas «Evidencias» (cobertura, controles, generar, anteriores) y «Conexiones» (mapa, estado, añadir, reconectar) del pitch.

### Key Entities

- **EvidenceReport**: periodo, alcance, controles con estado, ficheros, firma, versión.
- **Control**: id, nombre, estado derivado, explicación.
- **Connection**: tipo, nombre, credencial (referencia), estado, última comprobación.
- **Collector**: conexión, programación, última ejecución, eventos producidos.

## Success Criteria *(mandatory)*

- **SC-001**: Un auditor externo de prueba (o Paco en su papel) lee el informe y confirma que cada control está claro sin preguntar; se recoge por escrito.
- **SC-002**: La firma del PDF verifica con herramientas estándar fuera de Cardea.
- **SC-003**: El canal «Asientos» de un cliente piloto cuadra con las facturas de licencias con diferencia < 2 %.

## Out of Scope

- Extensión de navegador para el chat web (después del MVP).
- Inventario y clasificación de riesgo del AI Act.
- Collectors para herramientas sin API pública de uso.
