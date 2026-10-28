# ADR-003 · Base del gateway: LiteLLM o Bifrost, detrás de un puerto propio

Fecha: 2026-10-29 · Estado: propuesta (decisión en la fase 0 del MVP)

## Contexto

El data plane necesita un gateway LLM con claves virtuales, presupuestos y enrutado multiproveedor, y desde octubre también un gateway MCP (servidores aprobados, permiso por equipo y por tool, credenciales guardadas en el gateway). No lo construimos: el valor de Cardea está en políticas, identidad, evidencias y chargeback.

Candidatos:

- **LiteLLM** (Python, MIT). El más extendido y el que mejor cubre proveedores. Trae gateway MCP con control por clave y equipo. En contra: incidente de cadena de suministro en su paquete de PyPI en marzo de 2026, y las funciones de identidad (SSO, RBAC, auditoría) son de pago.
- **Bifrost** (Go, Apache 2.0, de Maxim). Más rápido, con claves virtuales, presupuestos jerárquicos y gateway MCP con filtrado de tools por clave en el núcleo abierto, más un componente de puesto (Edge). En contra: más joven y menos cobertura de proveedores.

## Decisión

1. El dominio no conoce al gateway. Dos puertos: `LlmGateway` (enrutado, claves, presupuestos) y `McpGateway` (servidores, tools, permisos). Los adaptadores viven en `dataplane/adapters/<producto>`.
2. Fase 0 del MVP: dos o tres días de prueba con los dos candidatos contra el mismo guion: una llamada permitida con streaming, una bloqueada por presupuesto, una redactada, una tool MCP remota permitida y otra denegada, y la lectura de eventos sin contenido. Se decide con la salida literal de esa prueba, no con blogs de los fabricantes.
3. Criterios por orden: gobierno de MCP en el núcleo abierto, eventos sin contenido, coste de mantener el adaptador, salud del proyecto.
4. Lo que no se usa del producto elegido, no se usa: ni funciones enterprise ni forks.

## Consecuencias

- El chart de Helm y el servicio de Fargate empaquetan el gateway elegido más las extensiones propias (hooks de políticas y de eventos).
- Cambiar de gateway después cuesta un adaptador nuevo, no una reescritura. Es la razón de los puertos.
- El motor de políticas es código propio (datos personales con Presidio, lista de modelos, presupuestos, tools). OPA se descarta para el MVP: tres tipos de regla no justifican Rego.
