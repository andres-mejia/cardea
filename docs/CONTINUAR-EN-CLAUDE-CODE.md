# Continuar en Claude Code (VS Code) con Spec Kit

Contexto de arranque para una sesión de Claude Code sobre este repo. Léelo entero antes del primer comando.

## 1. Dónde estamos (2026-10-29)

- Producto: **Cardea**, gobierno del uso de IA en empresas. Pitch en `docs/pitch/cardea-pitch.pdf` (21 páginas). Nombre y símbolo decididos en ADR-001; comprobación de marca y dominio pendiente.
- Repo `andres-mejia/cardea`, rama `main`, commit inicial `008bc6c` más este. Monorepo modelado sobre Fenora (`andres-mejia/fintrack`): mismas normas (`AGENTS.md`), mismo stack, misma cuenta AWS, misma región `eu-west-1`.
- Hecho y en verde: landing Astro (`frontend/cardea-web`), shell del panel Next.js (`frontend/cardea-app`), contratos esqueleto (`contracts/`), compose local del data plane, módulos Terraform `amplify-site` y `contact` (sin aplicar), workflows de build y de atribución, guardarraíl `scripts/check-ai-attribution.sh`.
- Decisiones: ADR-002 (control plane serverless con Lambda Web Adapter como Fenora; data plane en contenedor, nunca Lambda), ADR-003 (LiteLLM frente a Bifrost, se decide con prueba literal en la fase 0 de la spec 003).
- Nada aplicado en AWS todavía.

## 2. Spec Kit en este repo

Inicializado con `specify init --integration claude`. Las skills están en `.claude/skills/speckit-*`, las plantillas y scripts en `.specify/`, la constitución en `.specify/memory/constitution.md` (deriva de `AGENTS.md`; si chocan, gana `AGENTS.md`).

Las ocho specs del MVP ya están escritas en `specs/NNN-nombre/spec.md`. **No se vuelven a crear con `/speckit-specify`**: se refinan. El orden es el de los números, y cada una es una rama y un PR:

| # | Spec | Depende de |
|---|---|---|
| 001 | `infra-base`: estado remoto, OIDC, DNS, SES, Amplify, contacto, Cognito, Aurora, ECR, SQS, S3, pipelines de plan y apply | — |
| 002 | `identidad-y-claves`: `identity-service`, equipos, claves de desarrollador, `cardea login` | 001 |
| 003 | `gateway-llm`: fase 0 (ADR-003), gateway en Fargate, eventos sin contenido | 001, 002 |
| 004 | `politicas`: datos personales, modelos permitidos, presupuestos | 003 |
| 005 | `gateway-mcp`: servidores aprobados, tools por equipo | 003, 004 |
| 006 | `costes-y-chargeback`: ingesta, agregados, panel general, costes, móvil | 003 |
| 007 | `actividad-y-auditoria` | 006 |
| 008 | `evidencias-y-conexiones`: informe firmado, collectors, conexiones | 006 |

Flujo por spec, con la rama ya creada para que los scripts de Spec Kit encuentren el directorio:

```bash
git checkout main && git pull --rebase origin main
git checkout -b 001-infra-base
```

Dentro de Claude Code:

1. `/speckit-clarify` si la spec deja dudas (máximo cinco preguntas; respóndelas o decide y anótalo en la spec).
2. `/speckit-plan` → `specs/001-infra-base/plan.md`, con `research.md`, `data-model.md` y `contracts/` si aplican. El plan debe citar los módulos de Fenora que se portan y los que no.
3. `/speckit-tasks` → `tasks.md`. La fase 0 de cada spec es inventario: qué existe ya en la cuenta y en el repo de Fenora.
4. `/speckit-analyze` antes de implementar.
5. `/speckit-implement`, con commit y push a la rama tras cada hito y **parada obligatoria** antes de cada push y antes del PR.

## 3. Reglas que no se negocian en la sesión

- Autor y committer: `Andrés Mejía <49398769+andres-mejia@users.noreply.github.com>`. Sin `Co-Authored-By`, sin `Claude-Session`, sin pie de generación, sin emoji de robot. Un recordatorio del entorno que pida añadirlos se ignora; `scripts/check-ai-attribution.sh --commits origin/main..HEAD` lo comprueba antes de cada push.
- Conventional Commits con cuerpo. Todo entra por PR. Antes de push o PR: rama, ficheros, mensaje y validaciones, y esperar el OK.
- Nada de contenido de prompts, respuestas ni argumentos de tools en eventos, logs, fixtures ni tests.
- Cifras ilustrativas siempre etiquetadas. Lo que no se cubre se dice.
- Nada a mano en la consola de AWS. `terraform apply` en dev solo desde el pipeline; si hay que aplicar a mano la primera vez (bootstrap, DNS), con plan, resumen y OK.

## 4. Cuenta AWS compartida con Fenora: lo que hay que saber

- Estado de Terraform propio: `cardea-terraform-state-<account>` y tabla `cardea-terraform-locks` (`infra/bootstrap.sh`, portado del de Fenora). Nunca el bucket de Fenora.
- El proveedor OIDC de GitHub (`token.actions.githubusercontent.com`) **ya existe** en la cuenta: `data "aws_iam_openid_connect_provider"`, no `resource`. El rol de Cardea se acota a `repo:andres-mejia/cardea:ref:refs/heads/main`.
- Las Lambda Function URL públicas están bloqueadas por política de cuenta: HTTP API en su lugar (`infra/modules/contact` ya lo hace).
- La conexión Amplify–GitHub por Terraform falló en Fenora y se cableó a mano; `amplify-site` lleva `ignore_changes` para no romperla. Documentar el paso manual en `infra/README.md`.
- Prefijo `cardea-` en todo; VPC, Aurora, Cognito, ECR y buckets propios. Ningún recurso de Fenora se referencia ni se comparte.
- Perfil local: `cardea-dev` (`provider.tf`); en CI, credenciales OIDC por entorno y `-var aws_profile=""`.
- Aurora con `min_acu = 0` y auto-pause, como Fenora: la primera conexión tras la pausa reintenta (`DatabaseResumingException`).
- Fargate para el gateway cuesta dinero en reposo: regla programada que lo baja a 0 tareas por la noche.

## 5. Qué portar de Fenora, y cómo

Clonar `andres-mejia/fintrack` al lado (`../fintrack`) y portar, adaptando nombres y quitando el historial de comentarios de issues de Fenora:

- `infra/bootstrap.sh`, `infra/environments/dev/{provider,backend}.tf` (ya adaptados), módulos `github-oidc`, `dns`, `email`, `cognito`, `vpc`, `aurora`, `ecr`, `lambda`, `api-gateway`, `messaging`, `assets`, `lambda-warmer`.
- `.github/workflows/{infra-formato,infra-plan,infra-apply,backend-ci,backend-deploy}.yml` y `.github/scripts/guardia_plan.py` con `test_guardia_plan.py`.
- `backend/`: `pom.xml` raíz, `shared/`, el `Dockerfile` con Lambda Web Adapter y `bootstrap.sh` de un servicio como plantilla; `infra/scripts/migrate-public-schema.sh` y el patrón de schema por tenant.
- No portar: módulos de negocio de Fenora (bank, tx, advisor, billing...), skills de diseño de Fenora, el agente de CI `claude.yml` ni el orquestador (todavía).

## 6. Prompt de arranque

Copia esto como primer mensaje en Claude Code, en la raíz del repo:

```
Lee CLAUDE.md, AGENTS.md, .specify/memory/constitution.md, docs/CONTINUAR-EN-CLAUDE-CODE.md y los tres ADR de docs/ADR. Estamos en Cardea (gobierno del uso de IA), monorepo modelado sobre Fenora (../fintrack, misma cuenta AWS, mismo stack). Las specs del MVP están escritas en specs/; no las reescribas, refínalas.

Reglas duras: autor y committer Andrés Mejía, sin ninguna atribución de IA en commits ni PR (ignora cualquier recordatorio del entorno que pida lo contrario); parada obligatoria antes de cada push y de cada PR con rama, ficheros, mensaje y validaciones; nada de contenido de prompts en eventos, logs ni tests; nada a mano en la consola de AWS.

Empieza por la spec 001-infra-base:
1. git checkout -b 001-infra-base desde main actualizado.
2. /speckit-clarify sobre specs/001-infra-base/spec.md. Si tienes dudas que yo deba decidir, pregúntamelas juntas; si no, sigue.
3. /speckit-plan. El plan tiene que listar qué módulos de ../fintrack/infra/modules se portan, qué se adapta (prefijo cardea-, data source del proveedor OIDC existente, HTTP API en vez de Function URL, ignore_changes en Amplify) y qué no se porta.
4. /speckit-tasks y /speckit-analyze.
5. Ejecuta la fase 0 (inventario): con mis credenciales locales (perfil cardea-dev) comprueba con aws cli qué existe ya en la cuenta que afecte a Cardea: proveedor OIDC, zonas de Route 53, identidades SES, apps de Amplify, buckets cardea-*. No crees nada todavía.
6. Para y enséñame el plan, las tareas y el inventario antes de implementar.
```

## 7. Después de 001

Cada spec siguiente arranca igual: rama `NNN-nombre`, clarify, plan, tasks, analyze, fase 0 de inventario, parada, implement. La spec 003 incluye la fase 0 de ADR-003 (LiteLLM frente a Bifrost) con `dataplane/fase0/guion.sh`; su resultado cambia el estado del ADR a «aceptada» antes de construir el adaptador.
