# Output values for the Ezra Beacon infrastructure

output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "frontend_url" {
  description = "The URL of the frontend application"
  value       = "https://${azurerm_container_app.frontend.latest_revision_fqdn}"
}

output "backend_url" {
  description = "The URL of the backend API"
  value       = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
}

output "container_apps_environment_name" {
  description = "The name of the Container Apps Environment"
  value       = azurerm_container_app_environment.main.name
}

# Additional useful outputs
output "frontend_fqdn" {
  description = "The fully qualified domain name of the frontend"
  value       = azurerm_container_app.frontend.latest_revision_fqdn
}

output "backend_fqdn" {
  description = "The fully qualified domain name of the backend"
  value       = azurerm_container_app.backend.latest_revision_fqdn
}

output "vnet_id" {
  description = "The ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "subnet_id" {
  description = "The ID of the Container Apps subnet"
  value       = azurerm_subnet.container_apps.id
}

output "log_analytics_workspace_id" {
  description = "The ID of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.main.id
}
