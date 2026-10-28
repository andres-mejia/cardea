# Backend — control plane

Reglas de trabajo del área. Lo que existe va a `openspec/specs/`.

- Java 21 + Quarkus, hexagonal: `domain/` sin dependencias de framework, `application/` con los casos de uso y los puertos, `adapter/in/{rest,lambda,sqs}` y `adapter/out/{postgres,s3,cognito,oidc,http}`.
- Cada servicio compila de dos formas desde el mismo módulo: `-Plambda` (quarkus-amazon-lambda-http, para `infra/modules/lambda`) y `-Pcontainer` (imagen JVM, para `deploy/helm`). Un PR que rompa una de las dos no se fusiona.
- Un servicio por capacidad, no por tabla. Previstos para el MVP:
  - `policy-service`: reglas (datos personales, modelos, tools MCP, presupuestos) y su evaluación; publica la configuración que lee el data plane.
  - `identity-service`: equipos, usuarios, claves de desarrollador (emisión tras SSO, revocación, caducidad), servidores MCP aprobados.
  - `usage-ingest`: consume eventos de uso y de tool calls (SQS en AWS, HTTP en Helm) y los persiste; calcula el coste con la tabla de precios versionada.
  - `insights-api`: costes, chargeback, actividad y lo que alimenta el panel y el móvil.
  - `evidence-service`: informe de evidencias por periodo (PDF firmado y CSV) con la cobertura declarada; collectors de Copilot y facturación.
- Contratos primero: `contracts/openapi/<servicio>.yaml` cambia en el mismo PR o en uno anterior; el código se genera o se valida contra él.
- Tests: unitarios sobre el dominio sin mocks del dominio; de integración con Testcontainers (Postgres). Un test que no corre en CI no es un gate.
- Nunca contenido de prompts, ni en eventos, ni en logs, ni en fixtures.
