module "github_oidc" {
  source      = "../../modules/github-oidc"
  environment = var.environment
  github_repo = var.github_repo

  # La landing se publica por despliegue manual desde `landing-deploy.yml`: Amplify no
  # acepta el token de `gh` para conectar el repo (infra/README.md).
  amplify_manual_deploy_app_arns = [module.landing.app_arn]
  state_bucket                   = "cardea-terraform-state-${data.aws_caller_identity.current.account_id}"
  lock_table                     = "cardea-terraform-locks"
}
