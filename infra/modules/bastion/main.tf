# Bastión para el acceso humano a Aurora (portado de Fenora): SSM Session Manager,
# sin SSH ni claves. En subred privada (Fenora lo tiene en la pública): SSM sale por
# la NAT instance y no se paga otra IPv4 pública.
#
#   aws ssm start-session --target <id> --profile fintrack-dev \
#     --document-name AWS-StartPortForwardingSessionToRemoteHost \
#     --parameters host=<aurora>,portNumber=5432,localPortNumber=15432

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "environment" { type = string }
variable "vpc_id" { type = string }

variable "subnet_id" {
  type        = string
  description = "Subred privada con salida por la NAT instance."
}

variable "instance_type" {
  type    = string
  default = "t3.nano"
}

variable "aws_profile_hint" {
  type        = string
  default     = "fintrack-dev"
  description = "Perfil que se imprime en el comando de sesión."
}

locals {
  prefix = "cardea-${var.environment}"
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

resource "aws_security_group" "bastion" {
  name_prefix = "${local.prefix}-bastion-"
  vpc_id      = var.vpc_id
  description = "Bastion solo SSM, sin entrada"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Salida a SSM y Aurora"
  }

  tags = { Name = "${local.prefix}-bastion-sg" }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role" "bastion" {
  name = "${local.prefix}-bastion-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "ec2.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "bastion" {
  name = "${local.prefix}-bastion-profile"
  role = aws_iam_role.bastion.name
}

resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.bastion.id]
  iam_instance_profile   = aws_iam_instance_profile.bastion.name

  user_data = <<-EOT
    #!/bin/bash
    dnf install -y postgresql16
  EOT

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    encrypted   = true
    volume_type = "gp3"
  }

  tags = { Name = "${local.prefix}-bastion" }

  lifecycle {
    ignore_changes = [ami, user_data]
  }
}

output "instance_id" { value = aws_instance.bastion.id }
output "security_group_id" { value = aws_security_group.bastion.id }

output "ssm_session_command" {
  value = "aws ssm start-session --target ${aws_instance.bastion.id} --profile ${var.aws_profile_hint}"
}
