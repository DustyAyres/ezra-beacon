variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ezrabeacon"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "region_code" {
  description = "Short region code for resource naming (e.g., ue2 for East US 2, uw2 for West US 2)"
  type        = string
  default     = "ue2"
  validation {
    condition     = can(regex("^[a-z0-9]{2,5}$", var.region_code))
    error_message = "Region code must be 2-5 lowercase alphanumeric characters"
  }
}

variable "azure_ad_tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
}

variable "azure_ad_client_id" {
  description = "Azure AD Application Client ID"
  type        = string
}

variable "azure_ad_domain" {
  description = "Azure AD Domain"
  type        = string
}

variable "acr_login_server" {
  description = "Azure Container Registry login server"
  type        = string
}

variable "acr_username" {
  description = "Azure Container Registry username"
  type        = string
}

variable "acr_password" {
  description = "Azure Container Registry password"
  type        = string
  sensitive   = true
}

variable "docker_image_tag" {
  description = "Tag of the Docker images"
  type        = string
  default     = "latest"
}

variable "bypass_auth" {
  description = "Bypass authentication for development"
  type        = string
  default     = "false"
}

variable "enable_multitenancy" {
  description = "Enable multi-tenant authentication (uses 'common' endpoint)"
  type        = bool
  default     = false
}

# Container Apps specific variables
variable "container_cpu_backend" {
  description = "CPU allocation for backend container"
  type        = string
  default     = "0.5"
}

variable "container_memory_backend" {
  description = "Memory allocation for backend container"
  type        = string
  default     = "1Gi"
}

variable "container_cpu_frontend" {
  description = "CPU allocation for frontend container"
  type        = string
  default     = "0.25"
}

variable "container_memory_frontend" {
  description = "Memory allocation for frontend container"
  type        = string
  default     = "0.5Gi"
}

variable "min_replicas" {
  description = "Minimum number of replicas"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of replicas"
  type        = number
  default     = 10
}

variable "scale_rule_concurrent_requests" {
  description = "Number of concurrent requests to trigger scaling"
  type        = number
  default     = 100
}

variable "scale_rule_cpu_percentage" {
  description = "CPU percentage to trigger scaling"
  type        = number
  default     = 70
}

variable "scale_rule_memory_percentage" {
  description = "Memory percentage to trigger scaling"
  type        = number
  default     = 80
}