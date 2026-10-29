module "cognito" {
  source        = "../../modules/cognito"
  environment   = var.environment
  domain_prefix = "cardea-${var.environment}"
  callback_urls = ["${local.panel_url}/", "http://localhost:3000/"]
  logout_urls   = ["${local.panel_url}/", "http://localhost:3000/"]

  # Creado por CLI desde el JSON del proyecto GCP cardea-513108 (infra/README.md).
  google_oauth_secret_name = "cardea/${var.environment}/google-oauth"
}

module "api_gateway" {
  source            = "../../modules/api-gateway"
  environment       = var.environment
  allowed_origins   = [local.panel_url, "http://localhost:3000"]
  cognito_issuer    = module.cognito.issuer
  cognito_client_id = module.cognito.app_client_id
}
