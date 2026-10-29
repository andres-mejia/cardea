# Aurora Serverless v2 privada (portado de Fenora, ADR-004): subredes privadas, IAM auth,
# TLS, auto-pause en dev. Solo entran los SG que se pasen (Lambdas y bastión).

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "environment" { type = string }
variable "vpc_id" { type = string }

variable "subnet_ids" {
  type        = list(string)
  description = "Subredes privadas."
}

variable "ingress_security_group_ids" {
  type        = map(string)
  description = "SG que pueden conectar a 5432, por nombre fijo (las claves deben conocerse en el plan)."
}

variable "engine_version" {
  type    = string
  default = "17.9"
}

variable "min_acu" {
  type        = number
  default     = 0
  description = "0 = auto-pause (dev)."
}

variable "max_acu" {
  type    = number
  default = 8
}

variable "seconds_until_auto_pause" {
  type    = number
  default = 300
}

locals {
  prefix = "cardea-${var.environment}"
}

resource "aws_security_group" "aurora" {
  name_prefix = "${local.prefix}-aurora-"
  description = "Aurora: 5432 solo desde los SG autorizados"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.prefix}-aurora-sg" }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "aurora" {
  for_each                     = var.ingress_security_group_ids
  security_group_id            = aws_security_group.aurora.id
  referenced_security_group_id = each.value
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "PostgreSQL desde ${each.key}"
}

resource "aws_db_subnet_group" "aurora" {
  name       = "${local.prefix}-aurora"
  subnet_ids = var.subnet_ids
}

resource "aws_rds_cluster_parameter_group" "aurora" {
  name   = "${local.prefix}-aurora-pg17"
  family = "aurora-postgresql17"

  # Estático en Aurora PostgreSQL: AWS lo devuelve como `pending-reboot`; declararlo así
  # evita un cambio fantasma en cada plan. Desde PostgreSQL 15 ya vale 1 por defecto.
  parameter {
    name         = "rds.force_ssl"
    value        = "1"
    apply_method = "pending-reboot"
  }
}

resource "aws_rds_cluster" "main" {
  cluster_identifier                  = local.prefix
  engine                              = "aurora-postgresql"
  engine_mode                         = "provisioned"
  engine_version                      = var.engine_version
  database_name                       = "cardea_${var.environment}"
  master_username                     = "cardea_admin"
  manage_master_user_password         = true
  db_subnet_group_name                = aws_db_subnet_group.aurora.name
  db_cluster_parameter_group_name     = aws_rds_cluster_parameter_group.aurora.name
  vpc_security_group_ids              = [aws_security_group.aurora.id]
  iam_database_authentication_enabled = true
  storage_encrypted                   = true
  enable_http_endpoint                = false
  deletion_protection                 = var.environment == "prod"
  skip_final_snapshot                 = var.environment != "prod"
  final_snapshot_identifier           = var.environment == "prod" ? "${local.prefix}-final" : null
  apply_immediately                   = var.environment != "prod"
  backup_retention_period             = 1
  copy_tags_to_snapshot               = true

  serverlessv2_scaling_configuration {
    min_capacity             = var.min_acu
    max_capacity             = var.max_acu
    seconds_until_auto_pause = var.min_acu == 0 ? var.seconds_until_auto_pause : null
  }
}

resource "aws_rds_cluster_instance" "main" {
  identifier          = "${local.prefix}-1"
  cluster_identifier  = aws_rds_cluster.main.id
  instance_class      = "db.serverless"
  engine              = aws_rds_cluster.main.engine
  engine_version      = aws_rds_cluster.main.engine_version
  publicly_accessible = false
}

output "connection_endpoint" { value = aws_rds_cluster.main.endpoint }
output "cluster_resource_id" { value = aws_rds_cluster.main.cluster_resource_id }
output "master_user_secret_arn" { value = aws_rds_cluster.main.master_user_secret[0].secret_arn }
output "database_name" { value = aws_rds_cluster.main.database_name }
output "security_group_id" { value = aws_security_group.aurora.id }
