# Contrato: salidas de `infra/environments/dev`

Lo que las specs 002 en adelante leen con `terraform output -json` o con `data "terraform_remote_state"` (bucket `cardea-terraform-state-966378755474`, clave `dev/terraform.tfstate`). Cambiar un nombre o un tipo aquí es un cambio de contrato: se hace antes que el código que lo consume.

| Salida | Tipo | Ejemplo | Consumidor |
|---|---|---|---|
| `landing_url` | string | `https://cardea.tekhos.com` | landing, SC-002 |
| `panel_url` | string | `https://cardea-app.tekhos.com` | panel, Cognito |
| `contact_endpoint` | string | `https://<id>.execute-api.eu-west-1.amazonaws.com/contact` | landing (`PUBLIC_WAITLIST_ENDPOINT`) |
| `cognito_user_pool_id` | string | `eu-west-1_XXXX` | 002, panel |
| `cognito_user_pool_arn` | string | `arn:aws:cognito-idp:...` | 002 |
| `cognito_app_client_id` | string | — | panel, 002 |
| `cognito_hosted_ui_domain` | string | `cardea-dev.auth.eu-west-1.amazoncognito.com` | panel |
| `cognito_issuer` | string | `https://cognito-idp.eu-west-1.amazonaws.com/<pool>` | api-gateway, data plane (003) |
| `api_id` | string | — | módulo `lambda` (002+) para añadir rutas |
| `api_endpoint` | string | `https://<id>.execute-api.eu-west-1.amazonaws.com` | panel, CLI |
| `api_authorizer_id` | string | — | rutas protegidas (002+) |
| `vpc_id` | string | — | 002+, 003 (Fargate) |
| `public_subnet_ids` | list(string) | 3 ids | 003 (ALB) |
| `private_subnet_ids` | list(string) | 3 ids | Lambdas, 003 (tareas) |
| `lambda_security_group_id` | string | — | módulo `lambda` |
| `aurora_connection_endpoint` | string | `cardea-dev.cluster-xxx.eu-west-1.rds.amazonaws.com` | servicios Quarkus, job de Flyway |
| `aurora_cluster_resource_id` | string | `cluster-XXXX` | políticas `rds-db:connect` |
| `aurora_master_secret_arn` | string | — | job de migración |
| `aurora_database_name` | string | `cardea_dev` | servicios |
| `bastion_ssm_command` | string | `aws ssm start-session --target i-... --profile fintrack-dev` | acceso humano |
| `ecr_repository_urls` | map(string) | `{ identity-service = "966378755474.dkr.ecr.eu-west-1.amazonaws.com/cardea/identity-service", ... }` | `backend-deploy.yml` |
| `usage_queue_url` / `usage_queue_arn` | string | — | 003 (emisor), 006 (`usage-ingest`) |
| `usage_dlq_url` | string | — | 006 |
| `reports_bucket` | string | `cardea-dev-reports-966378755474` | 008 |
| `ses_configuration_set` | string | `cardea-dev` | servicios que envían correo |
| `mail_address` | string | `cardea@tekhos.com` | servicios que envían correo |
| `github_actions_role_arn` | string | `arn:aws:iam::966378755474:role/cardea-dev-github-actions` | secreto `AWS_GITHUB_OIDC_ROLE_ARN` |
| `github_actions_plan_role_arn` | string | `arn:aws:iam::966378755474:role/cardea-dev-github-actions-plan` | secreto `AWS_GITHUB_OIDC_PLAN_ROLE_ARN` |

Ninguna salida es `sensitive` porque ninguna contiene secretos: el secreto de Aurora se publica por ARN, nunca por valor.
