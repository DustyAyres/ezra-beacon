#!/bin/bash

# Script to build and push Docker images to Azure Container Registry for production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_TAG=${IMAGE_TAG:-latest}

# Function to print colored output
print_message() {
    echo -e "${2}${1}${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$ACR_NAME" ] && [ -z "$ACR_LOGIN_SERVER" ]; then
        missing_vars+=("ACR_NAME or ACR_LOGIN_SERVER")
    fi
    
    if [ -z "$AZURE_CLIENT_ID" ]; then
        missing_vars+=("AZURE_CLIENT_ID")
    fi
    
    if [ -z "$AZURE_TENANT_ID" ]; then
        missing_vars+=("AZURE_TENANT_ID")
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_message "Error: Missing required environment variables:" "$RED"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these variables:"
        echo "  export ACR_NAME=youracr"
        echo "  export AZURE_CLIENT_ID=your-client-id"
        echo "  export AZURE_TENANT_ID=your-tenant-id"
        exit 1
    fi
}

# Check required variables
check_env_vars

# Set ACR_LOGIN_SERVER if only ACR_NAME is provided
if [ -z "$ACR_LOGIN_SERVER" ]; then
    export ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
fi

# Set production environment variables
export BYPASS_AUTH=false
export AZURE_REDIRECT_URI="https://app-ezrabeacon-prod.azurecontainerapps.io"

print_message "Starting production deployment to Azure Container Registry" "$GREEN"
echo "ACR: $ACR_LOGIN_SERVER"
echo "Image Tag: $IMAGE_TAG"
echo "Environment: Production"
echo ""

# Login to ACR
print_message "Logging into Azure Container Registry..." "$YELLOW"
az acr login --name ${ACR_NAME:-${ACR_LOGIN_SERVER%.azurecr.io}}

# Build images using docker-compose
print_message "Building Docker images for production..." "$YELLOW"

# Build backend
docker-compose build backend

# Build frontend with production settings
docker-compose build frontend

# Tag images for ACR
print_message "Tagging images for ACR..." "$YELLOW"
docker tag ezra-beacon_backend:latest ${ACR_LOGIN_SERVER}/ezra-beacon-backend:${IMAGE_TAG}
docker tag ezra-beacon_frontend:latest ${ACR_LOGIN_SERVER}/ezra-beacon-frontend:${IMAGE_TAG}

# Push images to ACR
print_message "Pushing backend image..." "$YELLOW"
docker push ${ACR_LOGIN_SERVER}/ezra-beacon-backend:${IMAGE_TAG}

print_message "Pushing frontend image..." "$YELLOW"
docker push ${ACR_LOGIN_SERVER}/ezra-beacon-frontend:${IMAGE_TAG}

print_message "✅ Successfully deployed production images to ACR!" "$GREEN"
echo ""
echo "Images pushed:"
echo "  - ${ACR_LOGIN_SERVER}/ezra-beacon-backend:${IMAGE_TAG}"
echo "  - ${ACR_LOGIN_SERVER}/ezra-beacon-frontend:${IMAGE_TAG}"
echo ""
echo "Next steps:"
echo "  1. Update your Terraform variables with docker_image_tag=${IMAGE_TAG}"
echo "  2. Run 'terraform apply -var-file=environments/prod.tfvars' to deploy"
echo ""
echo "Note: The frontend will be rebuilt with the correct API URL after Terraform deployment"