module "ecr" {
  source = "../../modules/ecr"
}

module "messaging" {
  source      = "../../modules/messaging"
  environment = var.environment
}

module "reports" {
  source      = "../../modules/reports"
  environment = var.environment
}

module "email" {
  source      = "../../modules/email"
  environment = var.environment
  alert_email = var.mail_address
}
