terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    azapi = {
      source  = "azure/azapi"
      version = "~> 1.5"
    }
  }

  backend "azurerm" {
    # Backend configuration will be provided during init
    # terraform init -backend-config="storage_account_name=<storage_account>" \
    #                -backend-config="container_name=<container>" \
    #                -backend-config="key=<state_file_name>.tfstate" \
    #                -backend-config="resource_group_name=<rg_name>"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

provider "azapi" {
}

# Local variables
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}-spoke-${var.environment}-${var.region_code}"
  location = var.location
  tags     = local.common_tags
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.project_name}-${var.environment}-${var.region_code}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.common_tags
}

# Subnet for Container Apps Environment
resource "azurerm_subnet" "container_apps" {
  name                 = "snet-containerapp-${var.project_name}-${var.environment}-${var.region_code}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/23"]  # Larger subnet for Container Apps
}

# Note: Using SQLite with Azure Files storage instead of Azure SQL Database
# This provides a persistent file-based database solution for Container Apps
# The SQLite database file is stored in Azure Files and mounted to the backend container

# Log Analytics Workspace for Container Apps
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}-${var.region_code}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                           = "cae-${var.project_name}-${var.environment}-${var.region_code}"
  location                       = azurerm_resource_group.main.location
  resource_group_name            = azurerm_resource_group.main.name
  log_analytics_workspace_id     = azurerm_log_analytics_workspace.main.id
  infrastructure_subnet_id       = azurerm_subnet.container_apps.id
  internal_load_balancer_enabled = false

  tags = local.common_tags
}

# Note: Storage account and Azure Files removed - using ephemeral storage for now
# This means data will be lost on container restart, but simplifies deployment
# For production, consider migrating to Azure SQL Database

# Container App - Backend
resource "azurerm_container_app" "backend" {
  name                         = "ca-backend-${var.project_name}-${var.environment}-${var.region_code}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = "${var.acr_login_server}/ezra-beacon-backend:${var.docker_image_tag}"
      cpu    = var.container_cpu_backend
      memory = var.container_memory_backend

      env {
        name  = "ConnectionStrings__DefaultConnection"
        value = "Data Source=/tmp/ezra.db" # Using local ephemeral storage
      }

      env {
        name  = "AzureAd__Instance"
        value = "https://login.microsoftonline.com/"
      }

      env {
        name  = "AzureAd__Domain"
        value = var.azure_ad_domain
      }

      env {
        name  = "AzureAd__TenantId"
        value = var.azure_ad_tenant_id
      }

      env {
        name  = "AzureAd__ClientId"
        value = var.azure_ad_client_id
      }

      env {
        name  = "AzureAd__Scopes"
        value = "api://${var.azure_ad_client_id}/access_as_user"
      }

      env {
        name  = "ASPNETCORE_URLS"
        value = "http://+:5000"
      }

      env {
        name  = "Development__BypassAuthentication"
        value = var.bypass_auth
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
      }
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    # HTTP scaling rule - scale based on concurrent requests
    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = var.scale_rule_concurrent_requests
    }

    # CPU scaling rule
    custom_scale_rule {
      name             = "cpu-scaling"
      custom_rule_type = "cpu"
      metadata = {
        type  = "Utilization"
        value = tostring(var.scale_rule_cpu_percentage)
      }
    }

    # Memory scaling rule
    custom_scale_rule {
      name             = "memory-scaling"
      custom_rule_type = "memory"
      metadata = {
        type  = "Utilization"
        value = tostring(var.scale_rule_memory_percentage)
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 5000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_password
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags
}

# Container App - Frontend
resource "azurerm_container_app" "frontend" {
  name                         = "ca-frontend-${var.project_name}-${var.environment}-${var.region_code}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "frontend"
      image  = "${var.acr_login_server}/ezra-beacon-frontend:${var.docker_image_tag}"
      cpu    = var.container_cpu_frontend
      memory = var.container_memory_frontend

      env {
        name  = "REACT_APP_API_URL"
        value = "https://${azurerm_container_app.backend.latest_revision_fqdn}/api"
      }

      env {
        name  = "REACT_APP_AZURE_CLIENT_ID"
        value = var.azure_ad_client_id
      }

      env {
        name  = "REACT_APP_AZURE_TENANT_ID"
        value = var.azure_ad_tenant_id
      }

      env {
        name  = "REACT_APP_AZURE_REDIRECT_URI"
        value = "https://placeholder.azurecontainerapps.io" # This will be updated post-deployment
      }

      env {
        name  = "REACT_APP_BYPASS_AUTH"
        value = var.bypass_auth
      }
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    # HTTP scaling rule - scale based on concurrent requests
    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = var.scale_rule_concurrent_requests
    }

    # CPU scaling rule
    custom_scale_rule {
      name             = "cpu-scaling"
      custom_rule_type = "cpu"
      metadata = {
        type  = "Utilization"
        value = tostring(var.scale_rule_cpu_percentage)
      }
    }

    # Memory scaling rule
    custom_scale_rule {
      name             = "memory-scaling"
      custom_rule_type = "memory"
      metadata = {
        type  = "Utilization"
        value = tostring(var.scale_rule_memory_percentage)
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_password
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags
}
