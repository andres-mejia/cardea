# Cardea — entorno dev (spec 001-infra-base)
#
#   main.tf      landing, panel y formulario de contacto
#   network.tf   VPC, NAT instance, bastión, Aurora (ADR-004)
#   identity.tf  Cognito y HTTP API del control plane
#   platform.tf  ECR, cola de uso, informes, correo
#   ci.tf        roles OIDC de GitHub Actions

terraform {
  required_version = ">= 1.9"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 6.1" }
    archive = { source = "hashicorp/archive", version = "~> 2.0" }
  }
}

module "contact" {
  source                 = "../../modules/contact"
  environment            = var.environment
  allowed_origins        = [local.landing_url]
  ses_from_address       = var.mail_address
  notify_address         = var.mail_address
  configuration_set_name = module.email.configuration_set_name
}

module "landing" {
  source              = "../../modules/amplify-site"
  environment         = var.environment
  name                = "cardea-landing"
  platform            = "WEB"
  app_root            = "frontend/cardea-web"
  artifacts_dir       = "dist"
  domain_name         = var.base_domain
  subdomains          = [var.landing_prefix]
  github_repository   = var.github_repository
  github_access_token = var.github_access_token
  pnpm_version        = var.pnpm_version
  node_version        = var.node_version
  environment_variables = {
    PUBLIC_WAITLIST_ENDPOINT = module.contact.endpoint_url
    PUBLIC_APP_URL           = local.panel_url
  }
}

module "panel" {
  source              = "../../modules/amplify-site"
  environment         = var.environment
  name                = "cardea-app"
  platform            = "WEB_COMPUTE"
  app_root            = "frontend/cardea-app"
  artifacts_dir       = ".next"
  domain_name         = var.base_domain
  subdomains          = [var.panel_prefix]
  github_repository   = var.github_repository
  github_access_token = var.github_access_token
  pnpm_version        = var.pnpm_version
  node_version        = var.node_version
  environment_variables = {
    NEXT_PUBLIC_COGNITO_DOMAIN       = module.cognito.hosted_ui_domain
    NEXT_PUBLIC_COGNITO_CLIENT_ID    = module.cognito.app_client_id
    NEXT_PUBLIC_COGNITO_USER_POOL_ID = module.cognito.user_pool_id
    NEXT_PUBLIC_API_URL              = module.api_gateway.api_endpoint
  }
}
