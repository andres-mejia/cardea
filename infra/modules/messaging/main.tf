# Cola de eventos de uso y de tool calls (contracts/asyncapi/usage-events.yaml): el gateway
# publica, `usage-ingest` consume. Los mensajes no llevan contenido de prompts ni respuestas.

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "environment" { type = string }

locals {
  name = "cardea-usage-${var.environment}"
}

resource "aws_sqs_queue" "usage_dlq" {
  name                      = "${local.name}-dlq"
  message_retention_seconds = 1209600
  sqs_managed_sse_enabled   = true
}

resource "aws_sqs_queue" "usage" {
  name                       = local.name
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400
  sqs_managed_sse_enabled    = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.usage_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue_redrive_allow_policy" "usage_dlq" {
  queue_url = aws_sqs_queue.usage_dlq.id
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [aws_sqs_queue.usage.arn]
  })
}

output "usage_queue_url" { value = aws_sqs_queue.usage.url }
output "usage_queue_arn" { value = aws_sqs_queue.usage.arn }
output "usage_dlq_url" { value = aws_sqs_queue.usage_dlq.url }
