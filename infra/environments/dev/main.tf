# Cardea — entorno dev
#
# Primera pasada: solo lo que necesita la landing y el panel vacío (ADR-002).
#   - Amplify estático para cardea.ai (Astro)
#   - Amplify WEB_COMPUTE para app.cardea.ai (Next.js)
#   - Formulario de contacto: HTTP API + Lambda + DynamoDB + SES
# Cognito, Aurora, el control plane y el data plane (Fargate) entran en pasadas siguientes,
# cada una con su módulo y su ADR si cambia algo.

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 6.1" }
    archive = { source = "hashicorp/archive", version = "~> 2.0" }
  }
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "domain_name" {
  type    = string
  default = "cardea.ai"
}

variable "github_repository" {
  type        = string
  default     = "https://github.com/andres-mejia/cardea"
  description = "Repo que construye Amplify."
}

variable "github_access_token" {
  type        = string
  default     = ""
  sensitive   = true
  description = "PAT con repo y admin:repo_hook. Vacío: cablear la conexión a GitHub tras el primer apply."
}

variable "ses_from_address" {
  type    = string
  default = "hola@cardea.ai"
}

module "contact" {
  source           = "../../modules/contact"
  environment      = var.environment
  domain_name      = var.domain_name
  ses_from_address = var.ses_from_address
}

module "landing" {
  source              = "../../modules/amplify-site"
  environment         = var.environment
  name                = "cardea-landing"
  platform            = "WEB"
  app_root            = "frontend/cardea-web"
  artifacts_dir       = "dist"
  domain_name         = var.domain_name
  subdomains          = ["", "www"]
  github_repository   = var.github_repository
  github_access_token = var.github_access_token
  environment_variables = {
    PUBLIC_WAITLIST_ENDPOINT = module.contact.endpoint_url
    PUBLIC_APP_URL           = "https://app.${var.domain_name}"
  }
}

module "panel" {
  source              = "../../modules/amplify-site"
  environment         = var.environment
  name                = "cardea-app"
  platform            = "WEB_COMPUTE"
  app_root            = "frontend/cardea-app"
  artifacts_dir       = ".next"
  domain_name         = var.domain_name
  subdomains          = ["app"]
  github_repository   = var.github_repository
  github_access_token = var.github_access_token
  environment_variables = {}
}

output "landing_url" { value = "https://${var.domain_name}" }
output "panel_url" { value = "https://app.${var.domain_name}" }
output "contact_endpoint" { value = module.contact.endpoint_url }
