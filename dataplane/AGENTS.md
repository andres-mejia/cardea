# Data plane

Gateway LLM, gateway MCP y motor de políticas. Un solo contenedor por pieza, el mismo en Fargate y en el chart (ADR-002). La base (LiteLLM o Bifrost) se decide en la fase 0 con la prueba de ADR-003.

- `litellm/`: configuración del candidato LiteLLM para la prueba y para el entorno local. No se usan funciones enterprise.
- `policy-hooks/`: extensión propia que se engancha al gateway: evalúa reglas (Presidio para datos personales, lista de modelos, presupuestos, tools) y emite `UsageEvent` sin contenido. Es código de Cardea.
- Los prompts no se registran en ningún nivel de log. `LITELLM_LOG=ERROR` y sin callbacks de logging de contenido.
- El gateway recibe la configuración del control plane (reglas, claves, servidores MCP) por polling o push; si el control plane cae, sigue con la última configuración.
