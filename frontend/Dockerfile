# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_AZURE_CLIENT_ID
ARG REACT_APP_AZURE_TENANT_ID
ARG REACT_APP_AZURE_REDIRECT_URI
ARG REACT_APP_BYPASS_AUTH

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app with environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_AZURE_CLIENT_ID=$REACT_APP_AZURE_CLIENT_ID
ENV REACT_APP_AZURE_TENANT_ID=$REACT_APP_AZURE_TENANT_ID
ENV REACT_APP_AZURE_REDIRECT_URI=$REACT_APP_AZURE_REDIRECT_URI
ENV REACT_APP_BYPASS_AUTH=$REACT_APP_BYPASS_AUTH

RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/build .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
