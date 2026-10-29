# HTTP API del control plane, sin rutas: cada servicio (spec 002 en adelante) añade
# las suyas con su integración Lambda y este autorizador. HTTP API y no la REST API
# + WAF de Fenora: más barata y la que ya exige la política de cuenta (sin Function URL).

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "environment" { type = string }
variable "allowed_origins" { type = list(string) }
variable "cognito_issuer" { type = string }
variable "cognito_client_id" { type = string }

variable "log_retention_days" {
  type    = number
  default = 14
}

locals {
  name = "cardea-${var.environment}-api"
}

resource "aws_apigatewayv2_api" "main" {
  name          = local.name
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  name             = "cognito"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    issuer   = var.cognito_issuer
    audience = [var.cognito_client_id]
  }
}

resource "aws_cloudwatch_log_group" "access" {
  name              = "/aws/apigateway/${local.name}"
  retention_in_days = var.log_retention_days
}

# Registro de acceso solo con metadatos de la petición: nunca cuerpos (sin contenido de prompts).
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 20
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.access.arn
    format = jsonencode({
      requestId = "$context.requestId"
      routeKey  = "$context.routeKey"
      status    = "$context.status"
      latencyMs = "$context.responseLatency"
      sub       = "$context.authorizer.claims.sub"
    })
  }
}

output "api_id" { value = aws_apigatewayv2_api.main.id }
output "api_endpoint" { value = aws_apigatewayv2_api.main.api_endpoint }
output "execution_arn" { value = aws_apigatewayv2_api.main.execution_arn }
output "authorizer_id" { value = aws_apigatewayv2_authorizer.cognito.id }
