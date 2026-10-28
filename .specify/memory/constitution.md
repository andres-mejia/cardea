# Cardea Constitution

Versión operativa de `AGENTS.md` para el flujo Spec-Driven Development (Spec Kit). Si algo aquí contradice `AGENTS.md`, gana `AGENTS.md` y se corrige esto en el mismo PR.

## Core Principles

### I. El producto gobierna el uso, no los modelos
Cardea responde tres preguntas: quién usa qué modelo y qué tools, qué datos salen y cuánto cuesta por equipo. Toda funcionalidad se justifica contra una de las tres y contra una de las pantallas del pitch (`docs/pitch/cardea-pitch.pdf`). Lo que el producto no cubre se declara en pantalla y en documentos; nunca se oculta.

### II. Los prompts no salen de la red del cliente y no se almacenan (NON-NEGOTIABLE)
El data plane corre en la infraestructura del cliente (o en nuestra cuenta para dev, demo y pilotos gestionados). Ningún evento, log, métrica, fixture ni test contiene contenido de prompts, respuestas ni argumentos de tools. Un PR que lo haga se rechaza sin discusión.

### III. Contract-first y hexagonal
`contracts/openapi` y `contracts/asyncapi` cambian antes que el código. El dominio no conoce infraestructura: puertos para gateway (`LlmGateway`, `McpGateway`), para eventos (`UsageEventSink`), para identidad y para almacenamiento; adaptadores AWS y Kubernetes intercambiables. Una dependencia nueva de AWS en el dominio es una regresión.

### IV. Mismo artefacto en nuestra cuenta y en casa del cliente
Cada servicio del control plane es una imagen OCI que corre en Lambda con Lambda Web Adapter (patrón de Fenora) y en Kubernetes sin cambios. El data plane es un contenedor en ECS Fargate (dev) y en el chart de Helm (cliente). Nunca Lambda para el data plane (streaming SSE, sesiones MCP, latencia por petición). ADR-002.

### V. Evidencia, no autodeclaración
Un criterio de aceptación se cierra con el comando y su salida literal en el PR. Un test que no corre en CI no es un gate. La UI se compara con su maqueta del pitch (gate visual). Builds largos fuera del LLM.

## Stack y restricciones

- Mismo stack y misma cuenta AWS que Fenora (`andres-mejia/fintrack`), región `eu-west-1`: Terraform plano por entorno con backend S3 propio (`cardea-terraform-state-<account>`, tabla `cardea-terraform-locks`), módulos propios en `infra/modules`, GitHub Actions con OIDC, Amplify, Cognito, Aurora Serverless v2 (Lambdas sin VPC, IAM auth y TLS), ECR, API Gateway, SQS, S3, SES, Bedrock como proveedor de modelos.
- Compartir cuenta con Fenora obliga a: prefijo `cardea-` en todo recurso; **reutilizar** el proveedor OIDC de GitHub que ya existe en la cuenta (data source o import, nunca crearlo de nuevo); VPC, Aurora, Cognito y buckets propios, nunca los de Fenora; recordar que las Lambda Function URL públicas están bloqueadas por política de cuenta (HTTP API en su lugar) y que la conexión Amplify–GitHub puede requerir autorización manual.
- Control plane: Java 21 + Quarkus, hexagonal, un servicio por Lambda, schema por tenant con `ScopedValue`, Flyway nunca al arrancar, secretos en Secrets Manager. Coste en microeuros (`long`), nunca coma flotante.
- Frontend: Astro 5 (landing) y Next.js 16 + React 19 + Tailwind 4 (panel), tokens `cardea-*`, Archivo, tarjetas redondeadas sin borde, sin clichés de IA. Datos ilustrativos siempre etiquetados.
- Data plane: base LiteLLM o Bifrost decidida en la fase 0 con prueba literal (ADR-003); motor de políticas propio (Presidio para datos personales); sin funciones enterprise ni forks.
- Nada se crea a mano en la consola de AWS. `apply` de dev desde `main` con guardia de plan; producción y cualquier `apply`/`destroy` manual, con plan, resumen y OK de Andrés.

## Flujo de trabajo

- Spec Kit: `/speckit-specify` → `/speckit-clarify` si hay dudas → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`, una funcionalidad por rama `NNN-nombre` y por PR. Las specs iniciales del MVP están en `specs/`; se refinan, no se reescriben desde cero.
- Conventional Commits, firmados; autor y committer Andrés Mejía; sin atribución de IA de ningún tipo (`scripts/check-ai-attribution.sh`). Parada obligatoria antes de push o PR.
- Riesgo y revisión: docs y chores sin revisor; identidad, políticas, coste, datos personales e infra con revisión de Andrés antes de fusionar.
- Mercado y competidores se buscan y fechan antes de afirmar.

## Governance

Esta constitución deriva de `AGENTS.md` y de los ADR de `docs/ADR/`. Una enmienda aquí exige el cambio equivalente en `AGENTS.md` o un ADR nuevo en el mismo PR. Todo plan y toda tarea de Spec Kit se contrastan con los principios I a V antes de implementarse; la desviación se declara antes de ejecutarse.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
