# Red privada del control plane (ADR-004).

module "vpc" {
  source      = "../../modules/vpc"
  environment = var.environment
}

module "nat_instance" {
  source                 = "../../modules/nat-instance"
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  vpc_cidr               = module.vpc.vpc_cidr
  public_subnet_id       = module.vpc.public_subnet_ids[0]
  private_route_table_id = module.vpc.private_route_table_id
}

# SG compartido por las Lambdas del control plane (lo consume el módulo `lambda`, spec 002).
resource "aws_security_group" "lambdas_vpc" {
  name        = "cardea-${var.environment}-lambdas-vpc-sg"
  description = "Lambdas del control plane en VPC privada"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Salida total por la NAT instance"
  }

  tags = { Name = "cardea-${var.environment}-lambdas-vpc-sg" }
}

# En subred privada: necesita la ruta de la NAT antes de arrancar para registrarse en SSM.
module "bastion" {
  source      = "../../modules/bastion"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_id   = module.vpc.private_subnet_ids[0]
  depends_on  = [module.nat_instance]
}

module "aurora" {
  source                     = "../../modules/aurora"
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  ingress_security_group_ids = { lambdas = aws_security_group.lambdas_vpc.id, bastion = module.bastion.security_group_id }
  min_acu                    = var.min_acu
  max_acu                    = var.max_acu
}
