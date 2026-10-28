# El bucket se pasa con -backend-config="bucket=cardea-terraform-state-<account>"; lo crea infra/bootstrap.sh.
terraform {
  backend "s3" {
    key            = "dev/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "cardea-terraform-locks"
  }
}
