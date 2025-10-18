project_name = "ezrabeacon"
environment = "dev"
location    = "eastus2"
region_code = "ue2"  # East US 2

# Container Apps Configuration
container_cpu_backend     = "0.5"
container_memory_backend  = "1Gi"
container_cpu_frontend    = "0.25"
container_memory_frontend = "0.5Gi"
min_replicas             = 1
max_replicas             = 1  # SQLite limitation - single instance only

# Autoscaling Configuration
scale_rule_concurrent_requests = 50   # Lower threshold for dev
scale_rule_cpu_percentage      = 70   # Scale at 70% CPU
scale_rule_memory_percentage   = 80   # Scale at 80% memory

# Development specific settings
bypass_auth = "false"  # Enable auth bypass for development