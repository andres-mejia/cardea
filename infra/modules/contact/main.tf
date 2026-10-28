# Formulario «Pedir una demo» de la landing: HTTP API + Lambda Node 20 + DynamoDB + aviso por SES.
# HTTP API y no Function URL: las Function URL públicas están bloqueadas por política de cuenta (heredado de Fenora).

terraform {
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 6.1" }
    archive = { source = "hashicorp/archive", version = "~> 2.0" }
  }
}

locals {
  table_name    = "cardea-contact-${var.environment}"
  function_name = "cardea-${var.environment}-contact"
  cors_origins  = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
}

resource "aws_dynamodb_table" "contact" {
  name         = local.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  server_side_encryption { enabled = true }
  tags = { Component = "contact" }
}

resource "aws_iam_role" "contact" {
  name = "${local.function_name}-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy" "contact" {
  name = "${local.function_name}-policy"
  role = aws_iam_role.contact.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"]
        Resource = aws_dynamodb_table.contact.arn
      },
      {
        Effect    = "Allow"
        Action    = ["ses:SendEmail"]
        Resource  = "*"
        Condition = { StringEquals = { "ses:FromAddress" = var.ses_from_address } }
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      },
    ]
  })
}

data "archive_file" "contact" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/.build/contact.zip"
}

resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "contact" {
  function_name    = local.function_name
  role             = aws_iam_role.contact.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256
  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256

  environment {
    variables = {
      TABLE_NAME     = aws_dynamodb_table.contact.name
      FROM_ADDRESS   = var.ses_from_address
      NOTIFY_ADDRESS = var.notify_address
    }
  }

  depends_on = [aws_cloudwatch_log_group.contact]
}

resource "aws_apigatewayv2_api" "contact" {
  name          = "${local.function_name}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = local.cors_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_apigatewayv2_stage" "contact" {
  api_id      = aws_apigatewayv2_api.contact.id
  name        = "$default"
  auto_deploy = true
  default_route_settings {
    throttling_burst_limit = 10
    throttling_rate_limit  = 5
  }
}

resource "aws_lambda_permission" "contact" {
  statement_id  = "AllowHttpApi"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}

output "endpoint_url" { value = "${aws_apigatewayv2_api.contact.api_endpoint}/contact" }
