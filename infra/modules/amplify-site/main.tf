# Amplify Hosting para un paquete del monorepo (landing estática o panel Next.js).

variable "environment" { type = string }
variable "name" { type = string }
variable "platform" {
  type        = string
  description = "WEB (estático) o WEB_COMPUTE (Next.js SSR)."
}
variable "app_root" { type = string }
variable "artifacts_dir" { type = string }
variable "domain_name" { type = string }
variable "subdomains" {
  type        = list(string)
  description = "Prefijos; \"\" es el apex."
}
variable "branch_name" {
  type    = string
  default = "main"
}
variable "github_repository" { type = string }
variable "github_access_token" {
  type      = string
  default   = ""
  sensitive = true
}
variable "environment_variables" {
  type    = map(string)
  default = {}
}

resource "aws_iam_role" "amplify" {
  name = "${var.name}-${var.environment}-amplify"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "amplify.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "amplify" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
}

resource "aws_amplify_app" "this" {
  name                 = "${var.name}-${var.environment}"
  repository           = var.github_access_token != "" ? var.github_repository : null
  access_token         = var.github_access_token != "" ? var.github_access_token : null
  iam_service_role_arn = aws_iam_role.amplify.arn
  platform             = var.platform

  build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: ${var.app_root}
        frontend:
          phases:
            preBuild:
              commands:
                - corepack enable
                - corepack prepare pnpm@10.4.0 --activate
                - pnpm install --frozen-lockfile
            build:
              commands:
                - pnpm run build
          artifacts:
            baseDirectory: ${var.artifacts_dir}
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
  EOT

  environment_variables = merge(var.environment_variables, {
    AMPLIFY_MONOREPO_APP_ROOT = var.app_root
    AMPLIFY_DIFF_DEPLOY       = "false"
  })

  lifecycle {
    # La conexión con GitHub puede haberse autorizado desde la consola; un apply no debe borrarla.
    ignore_changes = [repository, access_token]
  }
}

resource "aws_amplify_branch" "main" {
  app_id            = aws_amplify_app.this.id
  branch_name       = var.branch_name
  framework         = var.platform == "WEB_COMPUTE" ? "Next.js - SSR" : "Astro"
  stage             = "PRODUCTION"
  enable_auto_build = true
}

resource "aws_amplify_domain_association" "this" {
  app_id                = aws_amplify_app.this.id
  domain_name           = var.domain_name
  wait_for_verification = false

  dynamic "sub_domain" {
    for_each = toset(var.subdomains)
    content {
      branch_name = aws_amplify_branch.main.branch_name
      prefix      = sub_domain.value
    }
  }
}

output "app_id" { value = aws_amplify_app.this.id }
output "default_domain" { value = aws_amplify_app.this.default_domain }
