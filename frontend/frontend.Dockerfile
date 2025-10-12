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
FROM node:20-alpine
WORKDIR /app

# Install serve to serve the static files
RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/build ./build

# Copy assets directory
COPY --from=build /app/public/assets ./build/assets

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]