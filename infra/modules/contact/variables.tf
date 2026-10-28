variable "environment" { type = string }
variable "domain_name" { type = string }
variable "ses_from_address" { type = string }
variable "notify_address" {
  type    = string
  default = "hola@cardea.ai"
}
variable "log_retention_days" {
  type    = number
  default = 14
}
