variable "aws_profile" {
  description = "Perfil AWS local (SSO de la cuenta compartida con Fenora: `aws sso login --profile fintrack-dev`). Vacío en CI (credenciales OIDC por entorno)."
  type        = string
  default     = "fintrack-dev"
}

locals {
  aws_profile = var.aws_profile != "" ? var.aws_profile : null
  tags        = { Project = "cardea", Environment = "dev", ManagedBy = "terraform" }
}

provider "aws" {
  region  = "eu-west-1"
  profile = local.aws_profile
  default_tags { tags = local.tags }
}

provider "aws" {
  alias   = "us_east_1"
  region  = "us-east-1"
  profile = local.aws_profile
  default_tags { tags = local.tags }
}
