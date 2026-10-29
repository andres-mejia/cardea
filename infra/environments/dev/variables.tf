variable "environment" {
  type    = string
  default = "dev"
}

# Dominio provisional (spec 001): cardea.ai no está disponible. Cambiar de dominio es cambiar
# estas variables; la zona debe existir en Route 53 de la cuenta.
variable "base_domain" {
  type    = string
  default = "tekhos.com"
}

variable "landing_prefix" {
  type    = string
  default = "cardea"
}

variable "panel_prefix" {
  type    = string
  default = "cardea-app"
}

variable "mail_address" {
  type        = string
  default     = "cardea@tekhos.com"
  description = "Remitente y destino del aviso del formulario; la recepción de tekhos.com lo reenvía a Andrés."
}

variable "github_repo" {
  type    = string
  default = "andres-mejia/cardea"
}

variable "github_repository" {
  type        = string
  default     = "https://github.com/andres-mejia/cardea"
  description = "Repo que construye Amplify."
}

variable "github_access_token" {
  type        = string
  default     = ""
  sensitive   = true
  description = "PAT con repo y admin:repo_hook. Vacío: la conexión se cablea tras el primer apply (infra/README.md)."
}

variable "node_version" {
  type        = string
  description = "Versión de Node del .nvmrc, la misma que usa Jano."
  default     = "22.23.4"
}

variable "pnpm_version" {
  type        = string
  default     = "10.4.0"
  description = "Igual que packageManager en package.json."
}

variable "min_acu" {
  type    = number
  default = 0
}

variable "max_acu" {
  type    = number
  default = 8
}
