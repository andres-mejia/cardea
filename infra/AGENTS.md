# Infra

Terraform plano en `environments/dev` (backend S3, `eu-west-1`), módulos propios en `modules/`. Patrón de Fenora: Lambdas en VPC privada, Aurora Serverless v2 privada con auto-pause (ADR-004), Amplify para los frontends, OIDC para CI.

- Nada se crea a mano en la consola. Lo que exista fuera de Terraform es deuda y se importa o se borra.
- Un `apply` en dev lo lanza el pipeline desde `main`; a mano, solo con plan, resumen y OK de Andrés.
- Variables sensibles por `-var` o `terraform.tfvars` (ignorado); nunca en el repo.
- Estado: `environments/dev` aplicado (spec 001-infra-base). Orden de arranque, pasos manuales declarados y operación en `infra/README.md`.
- `tekhos.com` (zona, identidad SES, recepción) y el proveedor OIDC de GitHub no son de Cardea: se leen, nunca se gestionan ni se importan.
- Un módulo nuevo que destruya datos al reemplazarse se clasifica en `.github/scripts/guardia_plan.py` en el mismo PR.
