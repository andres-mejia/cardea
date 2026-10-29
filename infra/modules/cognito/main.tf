# Identidad del panel (portado de Fenora, reducido): pool con correo como usuario,
# cliente público con PKCE y Hosted UI en dominio de prefijo. Sin IdP sociales,
# passkeys ni triggers: los atributos de tenant y la federación con el IdP del
# cliente llegan con la spec 002.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "environment" { type = string }

variable "domain_prefix" {
  type        = string
  description = "Hosted UI en <prefijo>.auth.<región>.amazoncognito.com."
}

variable "callback_urls" { type = list(string) }
variable "logout_urls" { type = list(string) }

resource "aws_cognito_user_pool" "main" {
  name                     = "cardea-${var.environment}"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  deletion_protection      = "ACTIVE"
  mfa_configuration        = "OPTIONAL"

  # Producto B2B: las cuentas las da de alta un administrador, no hay registro abierto.
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  software_token_mfa_configuration {
    enabled = true
  }

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Tu código de verificación · Cardea"
    email_message        = "Tu código de verificación de Cardea es {####}. Si no has sido tú, ignora este correo."
  }
}

resource "aws_cognito_user_pool_client" "app" {
  name                                 = "cardea-app-${var.environment}"
  user_pool_id                         = aws_cognito_user_pool.main.id
  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  allowed_oauth_flows_user_pool_client = true
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  access_token_validity                = 1
  id_token_validity                    = 1
  refresh_token_validity               = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

data "aws_region" "current" {}

output "user_pool_id" { value = aws_cognito_user_pool.main.id }
output "user_pool_arn" { value = aws_cognito_user_pool.main.arn }
output "app_client_id" { value = aws_cognito_user_pool_client.app.id }
output "hosted_ui_domain" { value = "${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.region}.amazoncognito.com" }
output "issuer" { value = "https://${aws_cognito_user_pool.main.endpoint}" }
