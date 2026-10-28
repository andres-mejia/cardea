# Cardea

Gobierno del uso de IA en empresas: quién usa qué modelo, qué tools ejecutan los agentes, qué datos salen y cuánto cuesta por equipo. Se instala en la infraestructura del cliente.

- Normas del repo: `AGENTS.md`. Decisiones: `docs/ADR/`. Pitch: `docs/pitch/cardea-pitch.pdf` (se regenera con `python3 docs/pitch/build_pitch.py`).
- Landing: `frontend/cardea-web` (Astro, cardea.ai). Panel: `frontend/cardea-app` (Next.js, app.cardea.ai).
- Control plane: `backend/` (Quarkus; Lambda en nuestra cuenta, contenedor en el chart). Data plane: `dataplane/` (contenedor; Fargate o Helm). Ver ADR-002.
- Infra: `infra/` (Terraform, eu-west-1). Chart: `deploy/helm/cardea`.

```bash
pnpm install
pnpm -C frontend/cardea-web dev      # http://localhost:4321
pnpm -C frontend/cardea-app dev      # http://localhost:3000
docker compose -f dataplane/docker-compose.yml up
```

Las pantallas y cifras de la landing, el panel y el pitch son ilustrativas hasta que exista tráfico real.
