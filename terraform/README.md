# Ezra Beacon Infrastructure

This directory contains Terraform configuration for deploying the Ezra Beacon application to Azure using Container Apps.

## Architecture

The infrastructure includes:
- **Resource Group**: Container for all resources
- **Virtual Network (VNet)**: Private network for secure communication
  - Container Apps Subnet: For the Container Apps Environment
- **Container Apps Environment**: Managed Kubernetes environment
  - VNet integrated for secure access
  - Built-in load balancing and auto-scaling
- **Container Apps**: Separate apps for frontend and backend
  - Frontend: Public-facing React application
  - Backend: Internal API service with SQLite database
- **Log Analytics Workspace**: For monitoring and logs
- **Azure Storage Account with File Share**: Persistent storage for SQLite database
  - SQLite database file is stored in Azure Files
  - Mounted as a volume to the backend container
  - Provides data persistence across container restarts

## Prerequisites

1. Azure CLI installed and logged in
2. Terraform >= 1.0
3. Azure Container Registry (ACR) with Docker images pushed
4. Azure AD App Registration configured

## Setup

1. **Initialize Terraform Backend** (first time only):
   ```bash
   # Create storage account for Terraform state
   az group create --name rg-terraform-state --location eastus
   
   az storage account create \
     --name stterraformstate$RANDOM \
     --resource-group rg-terraform-state \
     --location eastus \
     --sku Standard_LRS
   
   az storage container create \
     --name tfstate \
     --account-name <storage_account_name>
   ```

2. **Create a `terraform.tfvars` file** with your sensitive values:
   ```hcl
   azure_ad_tenant_id = "your-tenant-id"
   azure_ad_client_id = "your-client-id"
   azure_ad_domain    = "yourdomain.onmicrosoft.com"
   acr_login_server   = "youracr.azurecr.io"
   acr_username       = "youracr"
   acr_password       = "your-acr-password"
   ```

3. **Initialize Terraform**:
   ```bash
   terraform init \
     -backend-config="storage_account_name=<storage_account>" \
     -backend-config="container_name=tfstate" \
     -backend-config="key=ezrabeacon.tfstate" \
     -backend-config="resource_group_name=rg-terraform-state"
   ```

## Deployment

### Development Environment
```bash
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"
```

### Production Environment
```bash
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

## Docker Image Deployment

Before deploying infrastructure, push your Docker images to ACR:

```bash
# Build images using docker-compose
docker-compose build

# Tag images for ACR
docker tag ezra-beacon_frontend:latest youracr.azurecr.io/ezra-beacon-frontend:latest
docker tag ezra-beacon_backend:latest youracr.azurecr.io/ezra-beacon-backend:latest

# Login to ACR
az acr login --name youracr

# Push images
docker push youracr.azurecr.io/ezra-beacon-frontend:latest
docker push youracr.azurecr.io/ezra-beacon-backend:latest
```

## Updating the Application

To deploy new versions:
1. Build and push new Docker images with appropriate tags
2. Update `docker_image_tag` variable
3. Run `terraform apply`

Alternatively, use the GitHub Actions workflow for automated deployments.

## Container Apps Benefits

- **Auto-scaling**: Automatically scales based on load
- **Managed certificates**: HTTPS enabled by default
- **Built-in monitoring**: Integrated with Log Analytics
- **Revision management**: Easy rollback to previous versions
- **Microservices ready**: Separate frontend and backend containers
- **Cost effective**: Scale to zero when not in use (dev environment)

## Outputs

After deployment, Terraform will output:
- `resource_group_name`: Name of the created resource group
- `frontend_url`: URL to access the frontend application
- `backend_url`: URL for the backend API (internal)
- `container_apps_environment_name`: Name of the Container Apps Environment
- `storage_account_name`: Name of the Storage Account
- `storage_share_name`: Name of the Azure Files share for SQLite

## Security Considerations

- SQLite database file is stored securely in Azure Files
- Backend Container App has internal ingress only
- Frontend communicates with backend through internal networking
- All sensitive values should be stored in Azure Key Vault (future enhancement)
- Container Apps use managed identities for enhanced security

## Cost Optimization

- Dev environment uses minimal resources with scale-to-zero
- Production uses higher resources with minimum replicas for availability
- Consider using consumption plan for Container Apps
- Enable auto-scaling rules based on actual usage

## Monitoring

Container Apps provide built-in monitoring:
- View logs in Log Analytics Workspace
- Monitor CPU and memory usage
- Set up alerts for errors or performance issues
- Use Application Insights for detailed telemetry (future enhancement)

## Cleanup

To destroy all resources:
```bash
terraform destroy -var-file="environments/<env>.tfvars"
```

## Troubleshooting

1. **Container Apps can't pull images**
   - Verify ACR credentials in Terraform variables
   - Check image exists in ACR with correct tag
   - Ensure Container Apps have network access to ACR

2. **Frontend can't connect to backend**
   - Verify backend Container App URL in frontend environment variables
   - Check that backend ingress is configured correctly
   - Ensure both apps are in the same Container Apps Environment

3. **SQLite database issues**
   - Verify Azure Files share is mounted correctly
   - Check that the backend container has write permissions
   - Ensure the database file path matches the mounted volume path
   - View container logs to debug any SQLite access errors

4. **Authentication issues**
   - Verify Azure AD configuration
   - Check redirect URIs match frontend URL
   - Ensure app registration has correct API permissions