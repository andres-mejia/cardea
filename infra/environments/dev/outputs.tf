# Contrato: specs/001-infra-base/contracts/terraform-outputs.md. Cambiar un nombre aquí
# es un cambio de contrato para las specs que lo consumen.

output "landing_url" { value = local.landing_url }
output "panel_url" { value = local.panel_url }
output "contact_endpoint" { value = module.contact.endpoint_url }

output "cognito_user_pool_id" { value = module.cognito.user_pool_id }
output "cognito_user_pool_arn" { value = module.cognito.user_pool_arn }
output "cognito_app_client_id" { value = module.cognito.app_client_id }
output "cognito_hosted_ui_domain" { value = module.cognito.hosted_ui_domain }
output "cognito_issuer" { value = module.cognito.issuer }

output "api_id" { value = module.api_gateway.api_id }
output "api_endpoint" { value = module.api_gateway.api_endpoint }
output "api_authorizer_id" { value = module.api_gateway.authorizer_id }

output "vpc_id" { value = module.vpc.vpc_id }
output "public_subnet_ids" { value = module.vpc.public_subnet_ids }
output "private_subnet_ids" { value = module.vpc.private_subnet_ids }
output "lambda_security_group_id" { value = aws_security_group.lambdas_vpc.id }

output "aurora_connection_endpoint" { value = module.aurora.connection_endpoint }
output "aurora_cluster_resource_id" { value = module.aurora.cluster_resource_id }
output "aurora_master_secret_arn" { value = module.aurora.master_user_secret_arn }
output "aurora_database_name" { value = module.aurora.database_name }
output "bastion_ssm_command" { value = module.bastion.ssm_session_command }

output "ecr_repository_urls" { value = module.ecr.repository_urls }
output "usage_queue_url" { value = module.messaging.usage_queue_url }
output "usage_queue_arn" { value = module.messaging.usage_queue_arn }
output "usage_dlq_url" { value = module.messaging.usage_dlq_url }
output "reports_bucket" { value = module.reports.bucket }
output "ses_configuration_set" { value = module.email.configuration_set_name }
output "mail_address" { value = var.mail_address }

output "github_actions_role_arn" { value = module.github_oidc.role_arn }
output "github_actions_plan_role_arn" { value = module.github_oidc.plan_role_arn }
