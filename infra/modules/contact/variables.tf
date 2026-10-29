variable "environment" { type = string }
variable "allowed_origins" {
  type        = list(string)
  description = "Orígenes CORS: la landing."
}
variable "configuration_set_name" { type = string }
variable "ses_from_address" { type = string }
variable "notify_address" {
  type        = string
  description = "Destino del aviso de cada solicitud."
}
variable "log_retention_days" {
  type    = number
  default = 14
}
