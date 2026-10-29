module "cognito" {
  source        = "../../modules/cognito"
  environment   = var.environment
  domain_prefix = "cardea-${var.environment}"
  callback_urls = ["${local.panel_url}/", "http://localhost:3000/"]
  logout_urls   = ["${local.panel_url}/", "http://localhost:3000/"]
}

module "api_gateway" {
  source            = "../../modules/api-gateway"
  environment       = var.environment
  allowed_origins   = [local.panel_url, "http://localhost:3000"]
  cognito_issuer    = module.cognito.issuer
  cognito_client_id = module.cognito.app_client_id
}
