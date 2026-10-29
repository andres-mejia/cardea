# Salida a internet de las subredes privadas con fck-nat (portado de Fenora).
# ~3 €/mes frente a ~32 € de un NAT Gateway; punto único de fallo aceptado en dev (ADR-004).

terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.1" }
  }
}

variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "stg"], var.environment)
    error_message = "NAT instance solo para dev/stg; en producción, NAT Gateway."
  }
}

variable "vpc_id" { type = string }
variable "vpc_cidr" { type = string }
variable "public_subnet_id" { type = string }
variable "private_route_table_id" { type = string }

variable "instance_type" {
  type    = string
  default = "t4g.nano"
}

locals {
  prefix = "cardea-${var.environment}"
}

data "aws_ami" "fck_nat" {
  most_recent = true
  owners      = ["568608671756"] # cuenta oficial de fck-nat

  filter {
    name   = "name"
    values = ["fck-nat-al2023-*-arm64-ebs"]
  }
}

resource "aws_security_group" "nat" {
  name        = "${local.prefix}-nat-sg"
  description = "fck-nat: trafico interno de la VPC, salida total"
  vpc_id      = var.vpc_id

  ingress {
    description = "Todo el trafico de la VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.prefix}-nat-sg", Component = "nat-instance" }
}

resource "aws_iam_role" "nat" {
  name = "${local.prefix}-nat-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "ec2.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "nat_ssm" {
  role       = aws_iam_role.nat.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "nat" {
  name = "${local.prefix}-nat-profile"
  role = aws_iam_role.nat.name
}

resource "aws_instance" "nat" {
  ami                         = data.aws_ami.fck_nat.id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [aws_security_group.nat.id]
  associate_public_ip_address = true
  source_dest_check           = false
  iam_instance_profile        = aws_iam_instance_profile.nat.name

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    encrypted   = true
    volume_size = 8
    volume_type = "gp3"
  }

  tags = { Name = "${local.prefix}-nat", Component = "nat-instance" }

  lifecycle {
    # `most_recent = true` cambia de AMI cada vez que fck-nat publica una; sin esto,
    # cada plan pediría reemplazar la instancia (y cortar la salida de las Lambdas).
    ignore_changes = [ami]
  }
}

resource "aws_route" "private_default_via_nat" {
  route_table_id         = var.private_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  network_interface_id   = aws_instance.nat.primary_network_interface_id
}

resource "aws_cloudwatch_metric_alarm" "nat_status" {
  alarm_name          = "${local.prefix}-nat-instance-down"
  alarm_description   = "La NAT instance falla su status check: las Lambdas en VPC se quedan sin internet"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  treat_missing_data  = "notBreaching"
  dimensions          = { InstanceId = aws_instance.nat.id }
}

output "instance_id" { value = aws_instance.nat.id }
output "public_ip" { value = aws_instance.nat.public_ip }
output "route_id" { value = aws_route.private_default_via_nat.id }
