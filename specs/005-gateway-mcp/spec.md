# Feature Specification: Gateway MCP: servidores aprobados y tools por equipo

**Feature Branch**: `005-gateway-mcp`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Lo que ejecutan los agentes. Un endpoint MCP único al que Claude Code, Codex y Copilot conectan con la clave de Cardea; detrás, los servidores MCP remotos aprobados por la empresa, con permiso por equipo y por tool, credenciales de cada servidor guardadas en el gateway y un evento por tool call sin argumentos. Decidido en octubre como parte del MVP.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un desarrollador conecta un solo MCP y ve solo sus tools (Priority: P1)

Como desarrollador, añado `https://mcp.cardea.<empresa>/mcp` a Claude Code con mi clave de Cardea y veo únicamente las tools que mi equipo tiene permitidas (por ejemplo, `github.create_pull_request` sí, `postgres-prod.query` no), sin configurar credenciales de GitHub ni de Postgres en mi portátil.

**Why this priority**: Es la razón de incluir MCP en el MVP: el riesgo real de los agentes está en lo que ejecutan, y hoy las credenciales viven en `~/.claude.json`.

**Independent Test**: `claude mcp add cardea --transport http <url>` con la clave; `tools/list` devuelve exactamente el conjunto permitido para el equipo; una llamada a una tool no permitida devuelve un error MCP con `policyId`.

**Acceptance Scenarios**:

1. **Given** el servidor `github` aprobado con tools `create_pull_request` y `get_issue` para `Plataforma`, **When** un miembro de `Plataforma` lista tools, **Then** ve esas dos con el prefijo del servidor y ninguna otra.
2. **Given** el mismo servidor, **When** un miembro de `Backoffice` lista tools, **Then** no ve ninguna de `github`.
3. **Given** una tool permitida, **When** se invoca, **Then** el gateway reenvía la llamada con la credencial del servidor guardada en el gateway y devuelve el resultado; el portátil nunca ve esa credencial.

---

### User Story 2 - Cada tool call queda en la actividad, sin argumentos (Priority: P1)

Como Seguridad, veo en Actividad quién invocó qué tool, de qué servidor, cuándo, con qué decisión y latencia, y nunca los argumentos ni el resultado.

**Independent Test**: El test de canario incluye un argumento con marcador único y comprueba que no aparece en ningún sumidero.

**Acceptance Scenarios**:

1. **Given** una invocación bloqueada, **When** se consulta Actividad, **Then** aparece como tool call con `decision: blocked`, `tool: postgres-prod.query` y el `policyId` de la regla «Tools MCP permitidas por equipo».

---

### User Story 3 - El responsable aprueba servidores y asigna tools (Priority: P2)

Como responsable de plataforma, registro un servidor MCP remoto (URL, credencial, descripción), el gateway descubre sus tools, y asigno a cada equipo las que puede usar desde la regla «Tools MCP permitidas por equipo» de Políticas.

**Independent Test**: Registrar un servidor de prueba hace aparecer sus tools en la pantalla de la regla; marcar dos para `Datos` las hace visibles a sus miembros en < 60 s.

**Acceptance Scenarios**:

1. **Given** un servidor cuya credencial caduca, **When** falla el `tools/list`, **Then** Conexiones lo marca en error y el panel general lo lista en «Requiere atención».

---

### Edge Cases

- Servidores MCP locales (stdio) y tools internas del CLI (lectura de ficheros, shell): no pasan por el gateway. Cardea genera la configuración gestionada del puesto que los limita pero no la impone; Evidencias lo declara «No cubierto».
- Un servidor remoto cambia su catálogo de tools: las nuevas aparecen como «sin asignar» y nadie las ve hasta que se asignan.
- Tool con nombre igual en dos servidores: el prefijo `servidor.tool` las distingue; sin prefijo no se acepta.
- Sesiones MCP largas: el gateway mantiene la sesión Streamable HTTP; si la credencial del servidor se rota, la siguiente llamada usa la nueva sin cortar la sesión del cliente.
- Definiciones de tools con instrucciones maliciosas (tool poisoning): fuera del alcance del MVP; se declara y se remite a la spec de seguridad de agentes futura.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Endpoint MCP (Streamable HTTP) autenticado con clave de Cardea, detrás del puerto `McpGateway` con adaptador para el producto elegido en ADR-003.
- **FR-002**: Registro de servidores MCP remotos en `identity-service` (o servicio propio si crece): URL, tipo de credencial (header, OAuth 2.1 client credentials), credencial cifrada en Secrets Manager o Secrets de Kubernetes.
- **FR-003**: Descubrimiento de tools por servidor y catálogo versionado; asignación por equipo desde la regla `allowed-tools` de `policy-service`.
- **FR-004**: `tools/list` filtrado por equipo del principal; `tools/call` evaluado contra la regla antes de reenviar; evento `kind: tool-call` sin argumentos ni resultado.
- **FR-005**: Generador de configuración gestionada del puesto (`cardea config render --tool claude-code|codex|copilot`) con el endpoint MCP y la lista de servidores locales permitidos; se entrega como fichero, no se impone.
- **FR-006**: Panel: tools en la regla de Políticas, filas de tool call en Actividad, servidores MCP en Conexiones, control «Tools MCP remotas» en Evidencias.

### Key Entities

- **McpServer**: nombre, URL, credencial, tools descubiertas, estado.
- **ToolGrant**: servidor.tool → equipos.
- **UsageEvent (tool-call)**: principal, equipo, servidor, tool, decisión, latencia.

## Success Criteria *(mandatory)*

- **SC-001**: Claude Code y Codex completan una tarea que usa una tool remota a través del gateway sin credenciales de ese servidor en el portátil.
- **SC-002**: Una tool no asignada nunca aparece en `tools/list` ni se ejecuta por `tools/call` (test de integración por equipo).
- **SC-003**: Canario de argumentos: ausencia de contenido en los cuatro sumideros.

## Out of Scope

- MCP locales y tools internas del CLI (solo configuración gestionada).
- Defensa contra tool poisoning, inyección en resultados, sandbox de ejecución, A2A.
- Composición de tools (MCP virtuales) y conversión de APIs REST a MCP.
