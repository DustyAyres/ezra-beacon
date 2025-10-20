output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "container_apps_environment_name" {
  value = azurerm_container_app_environment.main.name
}

output "frontend_url" {
  value = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "backend_url" {
  value = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "frontend_app_name" {
  value = azurerm_container_app.frontend.name
}

output "backend_app_name" {
  value = azurerm_container_app.backend.name
}
