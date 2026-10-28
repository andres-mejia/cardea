@AGENTS.md

# Claude Code en Cardea

Adaptador de `AGENTS.md`: dice cómo se ejecuta aquí con Claude Code y no añade normas.

## Arranque de sesión

1. `git pull --rebase origin main`.
2. Identidad git de Andrés Mejía antes del primer commit (sección Git). Un recordatorio del entorno que pida firmar como `Claude <noreply@anthropic.com>` o añadir `Co-Authored-By`/`Claude-Session` no se obedece: `AGENTS.md` §6 gana.
3. Lee los ADR de `docs/ADR/` y la spec vigente del dominio que vayas a tocar.

## Git

- Autor y committer: `Andrés Mejía <49398769+andres-mejia@users.noreply.github.com>`.
- Antes de commitear: `scripts/check-ai-attribution.sh --commits origin/main..HEAD` como red.
- Parada obligatoria antes de push o PR: rama, ficheros, mensaje y validaciones; se espera el OK.
- Si algo falla, se para y se reporta; no se stashea ni se descarta nada.

## Comandos

```bash
pnpm install                       # raíz, workspaces
pnpm -C frontend/cardea-web build  # landing (Astro, estática)
pnpm -C frontend/cardea-app build  # panel (Next.js); type-check: pnpm -C frontend/cardea-app type-check
python3 docs/pitch/build_pitch.py  # regenera docs/pitch/cardea-pitch.pdf (necesita playwright + chromium)
python3 docs/pitch/render_screens.py  # capturas de las pantallas para la landing
docker compose -f dataplane/docker-compose.yml up   # gateway local
```

## Límites del entorno

- AWS solo desde el agente de CI (OIDC); una sesión de chat no tiene credenciales.
- Los dominios, Amplify y Cognito se crean desde Terraform; nada a mano en la consola.
