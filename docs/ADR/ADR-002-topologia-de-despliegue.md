# ADR-002 · Topología de despliegue: control plane serverless, data plane en contenedor

Fecha: 2026-10-29 · Estado: aceptada

## Contexto

El pitch compromete dos cosas a la vez: que Cardea se instala en la infraestructura del cliente (los prompts no salen de su red) y que el MVP se construye rápido, con dos personas y la infraestructura que ya operamos en Fenora (Amplify, Cognito, Aurora Serverless v2, Lambda, API Gateway, S3, SES, Bedrock, Terraform en `eu-west-1`).

La primera versión del pitch descartaba serverless en bloque por el streaming SSE y el requisito on-prem. Esa regla era demasiado ancha: aplica al data plane, no a todo.

## Decisión

Separar por plano:

| Plano | Qué contiene | Nuestra cuenta (dev, demo, piloto gestionado) | Casa del cliente |
|---|---|---|---|
| Landing | `frontend/cardea-web`, lista de espera | Amplify estático + Lambda + DynamoDB + SES | No aplica |
| Panel | `frontend/cardea-app` | Amplify WEB_COMPUTE + Cognito | Contenedor Node en el chart, OIDC del cliente |
| Control plane | políticas, identidad, claves, presupuestos, ingesta, evidencias | Un Quarkus por Lambda tras API Gateway, Aurora, S3, SQS | Los mismos Quarkus como contenedores, Postgres y almacenamiento S3-compatible del cliente |
| Data plane | gateway LLM, gateway MCP, motor de políticas | **ECS Fargate**, 2 tareas tras un ALB | Deployment en el chart de Helm |

La doble vida del control plane se consigue como en Fenora: cada servicio Quarkus es un servidor HTTP normal empaquetado en una imagen OCI con AWS Lambda Web Adapter (`public.ecr.aws/awsguru/aws-lambda-adapter`), publicada en ECR. Lambda la ejecuta a través del adaptador; Kubernetes la ejecuta tal cual. Una sola imagen, ningún módulo específico de Lambda en el código. El dominio y los puertos no cambian; cambian los adaptadores (`SQS` o `HTTP` para la ingesta, `S3` o `MinIO` para informes, `Cognito` o `OIDC genérico` para identidad).

El data plane no va a Lambda en ningún caso:

1. Las respuestas de los modelos se sirven en streaming SSE durante decenas de segundos; API Gateway no lo transmite y el streaming de Lambda exige Function URL y runtime Node o adaptador, con un arranque en frío de varios segundos para una imagen Python como LiteLLM.
2. Las sesiones MCP (Streamable HTTP) mantienen estado de conexión que no encaja con invocaciones efímeras.
3. Cada petición de un CLI pasa por ahí: la latencia añadida se nota en cada tecla.
4. La imagen que corre en Fargate debe ser bit a bit la que se entrega en el chart. Lo que se probó en la demo es lo que se instala.

Bedrock es un proveedor de modelos detrás del gateway, uno más junto a Anthropic, OpenAI y Azure. El tenant de demostración enruta a Bedrock en `eu-west-1` para que la demo funcione sin claves externas y sin que ningún dato salga de AWS. Bedrock no se usa para nada propio del producto.

Cognito autentica a las personas en el panel y al auxiliar del puesto que pide la clave de desarrollador (PKCE). En casa del cliente, ese papel lo hace su Entra ID u Okta por OIDC; Cognito también federa a ellos si un cliente prefiere que lo gestionemos.

Eventos: el gateway emite eventos de uso y de tool calls sin contenido. En AWS van a SQS y los consume una Lambda que escribe en Aurora. En el chart van por HTTP al servicio de ingesta. Un solo puerto, `UsageEventSink`, dos adaptadores.

Almacenamiento de eventos: solo Postgres (Aurora Serverless v2) en el MVP, con particionado mensual. ClickHouse se decide con datos reales de un piloto, no antes.

## Alternativas

- **Todo serverless, incluido el gateway con Lambda Web Adapter y Function URL.** Funciona para una demo, pero no es lo que se vende, y el arranque en frío de LiteLLM mata la experiencia del CLI. Rechazada.
- **Todo en contenedores desde el principio (EKS o Fargate para el control plane).** Más coherente con el chart, pero más caro de operar para dos personas y sin reutilizar nada de Fenora. Rechazada para el MVP; el chart cubre ese caso cuando haga falta.
- **Solo SaaS.** Contradice el compromiso central del pitch y nos pone donde está nexos.ai. Rechazada.

## Consecuencias

- Una sola imagen por servicio; el pipeline la publica en ECR y `docker compose` la arranca sin el adaptador para probar el modo contenedor aunque no se despliegue en Kubernetes todavía.
- Fargate cuesta dinero aunque nadie lo use: dos tareas pequeñas rondan los 30–40 € al mes. El entorno dev escala a cero por la noche con una regla programada.
- La infraestructura de la landing y del panel se copia del patrón de Fenora y se adapta; la del data plane es nueva (`infra/modules/dataplane`).
- Los adaptadores "AWS" y "Kubernetes" tienen que seguir siendo intercambiables: una dependencia nueva de un servicio de AWS en el dominio o en la aplicación es una regresión.
