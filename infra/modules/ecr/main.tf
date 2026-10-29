# Un repositorio por servicio del control plane (portado de Fenora; lista de backend/AGENTS.md).

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "service_names" {
  type = list(string)
  default = [
    "identity-service",
    "policy-service",
    "usage-ingest",
    "insights-api",
    "evidence-service",
  ]
}

variable "images_to_keep" {
  type    = number
  default = 10
}

resource "aws_ecr_repository" "services" {
  for_each             = toset(var.service_names)
  name                 = "cardea/${each.key}"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = { Service = each.key }
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = aws_ecr_repository.services
  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Conservar las ultimas ${var.images_to_keep} imagenes"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = var.images_to_keep }
      action       = { type = "expire" }
    }]
  })
}

output "repository_urls" {
  value = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}
