# Ezra Beacon - Task Management PWA

Ezra Beacon is a Progressive Web App (PWA) for task management, similar to Microsoft To-Do, built with React and .NET Core.

## Features

- **Task Management**: Create, update, delete, and organize tasks
- **Multiple Views**: My Day, Important, Planned, and All Tasks views
- **Categories**: Custom categories with color coding
- **Task Steps**: Add up to 100 sub-steps to any task
- **Recurrence**: Daily, Weekdays, Weekly, Monthly, Yearly, or Custom patterns
- **Sorting & Grouping**: Sort by importance, due date, alphabetically, or creation date
- **Responsive Design**: Seamless experience on both mobile and desktop
- **Progressive Web App**: Install as a native app on supported devices
- **Secure Authentication**: Microsoft Entra ID (Azure AD) integration

## Technology Stack

- **Frontend**: React, TypeScript, PWA
- **Backend**: .NET Core 8.0 Web API
- **Database**: SQLite
- **Authentication**: Microsoft Entra ID (Azure AD)
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker Desktop
- Azure AD App Registration
- Node.js 20+ (for local development)
- .NET SDK 8.0 (for local development)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ezra-beacon
   ```

2. **Configure Azure AD**
   - Create an App Registration in Azure Portal
   - Note the Client ID and Tenant ID
   - Configure redirect URI: `http://localhost:3000`
   - Expose an API scope: `access_as_user`

3. **Create environment file**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your Azure AD configuration:
   ```
   AZURE_CLIENT_ID=your-client-id
   AZURE_TENANT_ID=your-tenant-id
   AZURE_DOMAIN=your-domain.onmicrosoft.com
   AZURE_REDIRECT_URI=http://localhost:3000
   ```

4. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api (proxied through frontend)

## Development

### Backend Development
```bash
cd backend
dotnet restore
dotnet run --project EzraBeacon.Api
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Running Tests
```bash
cd backend
dotnet test
```

## Project Structure

```
ezra-beacon/
├── frontend/               # React PWA application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS files
│   └── Dockerfile
├── backend/               # .NET Core Web API
│   ├── EzraBeacon.Api/    # API project
│   ├── EzraBeacon.Core/   # Domain models
│   ├── EzraBeacon.Infrastructure/  # Data access
│   ├── EzraBeacon.Tests/  # Unit tests
│   └── Dockerfile
├── assets/                # Shared assets (fonts, icons, etc.)
├── references/            # UI reference images
└── docker-compose.yml     # Docker orchestration
```

## Security

- Frontend authentication via Microsoft Entra ID
- Backend API secured with JWT tokens
- API only accessible through Docker network
- CORS configured for frontend origin only

## License

This project is proprietary software.
