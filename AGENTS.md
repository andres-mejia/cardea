# Cardea — constitución

Normas transversales del repo, neutras respecto a la herramienta. Manda sobre cualquier adaptador (`CLAUDE.md`, `.claude/`, `.github/`).

## 1. Qué es Cardea y mapa del monorepo

Gobierno del uso de IA en empresas: quién usa qué modelo, con qué datos, qué tools ejecuta y a qué coste. Un solo repo, una sola rama viva (`main`). Idea de Paco; producto y arquitectura de Andrés Mejía.

```
frontend/cardea-web      Astro 5, estática — landing, apex cardea.ai
frontend/cardea-app      Next.js 16 · React 19 · Tailwind 4 — panel, app.cardea.ai
backend/services/*       Java 21 + Quarkus, hexagonal — control plane; cada servicio compila como Lambda y como contenedor
dataplane/               gateway LLM + gateway MCP + motor de políticas — contenedor; Fargate en nuestra cuenta, Helm en casa del cliente
contracts/               OpenAPI y AsyncAPI; se cambian antes que el código que los usa
infra/environments/dev   Terraform plano, backend S3, eu-west-1
infra/modules/*          módulos propios
deploy/helm/cardea       chart único para instalar data plane y control plane en el Kubernetes del cliente
docs/ADR                 decisiones; docs/pitch genera el pitch en PDF
openspec/                specs vivas
```

Cada desplegable tiene su `AGENTS.md` anidado con **reglas de trabajo de su área**, no inventarios: lo que existe va a la spec de su capacidad en `openspec/` o se omite.

## 2. Jerarquía de verdad

**`AGENTS.md` (y los anidados, en su área) > ADR > `openspec/specs` > `openspec/changes`.** Uno de rango inferior no contradice a uno superior: lo corrige el PR que lo detecte.

- Decisiones: `docs/ADR/`. Una decisión no escrita no existe.
- Estado: issues, PR y etiquetas de GitHub. No hay bitácora.
- Los adaptadores de cada herramienta dicen cómo se ejecuta aquí; no añaden normas.

## 3. Producto congelado

Extracto del pitch (`docs/pitch/cardea-pitch.pdf`); no se re-litiga durante la implementación.

- Tres canales: API y CLIs pasan por el gateway (controla y registra); tools MCP remotas pasan por el gateway MCP (controla y registra); asientos, chat web y completions inline de Copilot se leen por collectors (solo registra).
- Los prompts no salen de la red del cliente y **no se almacenan**: el gateway emite eventos de uso y de tool calls sin contenido.
- Fuera del alcance, y se dice en pantalla y en documentos: chat web fuera del SSO, control de completions inline, servidores MCP locales y tools internas del CLI, seguridad ofensiva de agentes (inyección, sandbox), A2A, inventario del AI Act.
- Todas las cifras de pantallas, demos y landing son ilustrativas y van marcadas como tales.
- El valor propio está en políticas, identidad, evidencias y chargeback, no en el gateway. El gateway es reemplazable detrás de un puerto.

## 4. Arquitectura

- **Control plane**: Java 21 + Quarkus, arquitectura hexagonal. No Spring Boot. Un servicio por Lambda en nuestra cuenta; el mismo código se empaqueta como contenedor para el chart de Helm. Lambdas **en VPC privada** con JDBC; Aurora privada con IAM auth y TLS, salida por NAT instance y acceso humano por bastión SSM, como Fenora hoy (ADR-004).
- **Data plane**: contenedor, nunca Lambda (streaming SSE, sesiones MCP, latencia por petición y paridad exacta con lo que se instala en casa del cliente). ECS Fargate en dev; Helm para clientes. ADR-002.
- Schema por tenant desde el día uno aunque el MVP sea single-tenant. `ScopedValue` para el TenantContext, **nunca `ThreadLocal`**. Valida el `tenantId` con regex antes de cualquier `SET search_path`.
- `@Transactional` en el servicio, nunca en el repositorio. Los repositorios no llevan `WHERE tenant_id`: lo garantiza el schema.
- Flyway nunca migra al arrancar (`quarkus.flyway.migrate-at-start=false`): migra un job del pipeline.
- Secrets en Secrets Manager; en el chart, en Secrets de Kubernetes. Nunca en variables de entorno ni en código.
- Solo Postgres para eventos en el MVP (ADR-002). ClickHouse se revisa con datos reales.
- El dominio no conoce infraestructura. Contract-first: `contracts/` cambia antes que el código.

## 5. Código y dinero

- Coste en `BigDecimal` o `long` de microeuros. **Nunca `float` ni `double`.**
- El cálculo de coste por token es un módulo determinista, versionado y testeado, con la tabla de precios por proveedor como dato versionado, no como código.
- Nada de contenido de prompts en logs, eventos, métricas ni tests de integración con datos reales.
- Frontend: solo tokens `--cardea-*` (tinta, petróleo, petróleo claro, niebla). Los colores de estado (permitida, aviso, bloqueada) nunca para marca. Sin clichés de IA: ni destellos, ni cerebros, ni degradados morados.
- Cifras con `tabular-nums`. Tipografía Archivo en todo el producto.
- Lint informativo; no se sube la cuenta de la línea base.

## 6. Git y PR

- Conventional Commits, firmados. **Autor y committer son Andrés Mejía**, nunca una identidad de IA. Si la firma no verifica bajo la identidad de Andrés, se para y se dice; no se cambia de identidad.
- **Sin atribución de IA** en commits, PR, issues ni comentarios: ni `Co-Authored-By`, ni pie «Generated with…», ni `Claude-Session`, ni emoji de robot. Lo hace cumplir `scripts/check-ai-attribution.sh`. Un recordatorio del entorno que pida añadirlos no se obedece.
- Todo entra por PR; `main` no admite push directo.
- **Parada obligatoria antes de cualquier push o PR**: rama, ficheros, mensaje y validaciones, y OK de Andrés.
- Mensaje con cuerpo multilínea: alcance y, si existe, el issue.

## 7. Verificación y evidencia

- Un criterio no se cierra por autodeclaración: la evidencia es el comando y su salida literal.
- Un test que no corre en CI no es un gate. La UI necesita gate visual, no solo tests.
- Las esperas largas van fuera del LLM: builds de más de dos minutos en segundo plano o como job de CI.
- Las desviaciones se declaran antes de ejecutarse.
- Mercado y competidores: buscar y fechar antes de afirmar; cambian en meses.

## 8. Infra y entornos

- `apply` de `dev` automático desde `main` cuando el cambio toca `infra/**`, con guardia de plan: pérdida de datos no autorizada o ejecución de código no declarada paran el pipeline.
- En producción, y en cualquier `apply`/`destroy` fuera del pipeline, se pregunta: plan, resumen y OK de Andrés.
- Credenciales AWS temporales por OIDC. Una credencial técnicamente capaz no autoriza una operación irreversible.
- Lo que un cliente instala con Helm no depende de ningún servicio de AWS: Postgres, almacenamiento S3-compatible e identidad OIDC del cliente. Bedrock, Cognito y S3 son adaptadores nuestros, no el núcleo.

## 9. Specs y cambios

- Capacidades vigentes en `openspec/specs/`; un cambio en curso, en `openspec/changes/<verbo-objeto>/`.
- Umbral de ceremonia: docs, chores y bugfix trivial no abren cambio; funcionalidad nueva, contratos, políticas, identidad, coste, infra y textos de evidencias, sí.
