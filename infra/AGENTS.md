# Infra

Terraform plano en `environments/dev` (backend S3, `eu-west-1`), módulos propios en `modules/`. Patrón heredado de Fenora: Lambdas sin VPC, Aurora Serverless v2 con auto-pause, Amplify para los frontends, OIDC para CI.

- Nada se crea a mano en la consola. Lo que exista fuera de Terraform es deuda y se importa o se borra.
- Un `apply` en dev lo lanza el pipeline desde `main`; a mano, solo con plan, resumen y OK de Andrés.
- Variables sensibles por `-var` o `terraform.tfvars` (ignorado); nunca en el repo.
- Estado del scaffold: **ningún módulo se ha aplicado todavía**. Antes del primer `apply` hacen falta `infra/bootstrap.sh` (bucket de estado y tabla de locks), la zona de Route 53 de `cardea.ai` y la identidad verificada de SES para `hola@cardea.ai`.
- Módulos previstos y su orden: `amplify-site` (landing y panel), `contact` (formulario), `cognito`, `aurora`, `lambda` + `api-gateway` (control plane), `dataplane` (Fargate + ALB), `github-oidc`.
