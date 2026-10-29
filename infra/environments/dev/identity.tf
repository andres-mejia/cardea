# Client OAuth de Google del proyecto GCP cardea-513108, cargado por CLI en un secreto
# (openspec/changes/anadir-login-google). Sin `try()`: si el secreto falta o viene vacío,
# el plan falla en vez de proponer borrar el IdP de Google.
data "aws_secretsmanager_secret_version" "google_oauth" {
  secret_id = "cardea/${var.environment}/google-oauth"

  lifecycle {
    postcondition {
      condition     = jsondecode(self.secret_string).client_id != "" && jsondecode(self.secret_string).client_secret != ""
      error_message = "cardea/${var.environment}/google-oauth existe pero client_id o client_secret vienen vacíos (o faltan)."
    }
  }
}

locals {
  google_oauth = jsondecode(data.aws_secretsmanager_secret_version.google_oauth.secret_string)
}

module "cognito" {
  source               = "../../modules/cognito"
  environment          = var.environment
  domain_prefix        = "cardea-${var.environment}"
  callback_urls        = ["${local.panel_url}/", "http://localhost:3000/"]
  logout_urls          = ["${local.panel_url}/", "http://localhost:3000/"]
  google_client_id     = local.google_oauth.client_id
  google_client_secret = local.google_oauth.client_secret
}

module "api_gateway" {
  source            = "../../modules/api-gateway"
  environment       = var.environment
  allowed_origins   = [local.panel_url, "http://localhost:3000"]
  cognito_issuer    = module.cognito.issuer
  cognito_client_id = module.cognito.app_client_id
}
