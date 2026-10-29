# Recursos que Cardea usa y no gestiona.

data "aws_caller_identity" "current" {}

# tekhos.com: zona ajena a Cardea; Amplify escribe en ella los registros de sus dominios.
data "aws_route53_zone" "base" {
  name         = var.base_domain
  private_zone = false
}

locals {
  landing_url = "https://${var.landing_prefix}.${var.base_domain}"
  panel_url   = "https://${var.panel_prefix}.${var.base_domain}"
}
