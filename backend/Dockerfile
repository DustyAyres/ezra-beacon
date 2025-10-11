FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["EzraBeacon.Api/EzraBeacon.Api.csproj", "EzraBeacon.Api/"]
COPY ["EzraBeacon.Core/EzraBeacon.Core.csproj", "EzraBeacon.Core/"]
COPY ["EzraBeacon.Infrastructure/EzraBeacon.Infrastructure.csproj", "EzraBeacon.Infrastructure/"]
COPY ["EzraBeacon.Tests/EzraBeacon.Tests.csproj", "EzraBeacon.Tests/"]

# Restore dependencies
RUN dotnet restore "EzraBeacon.Api/EzraBeacon.Api.csproj"

# Copy all files
COPY . .

# Build
WORKDIR "/src/EzraBeacon.Api"
RUN dotnet build "EzraBeacon.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "EzraBeacon.Api.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5000

# Create data directory for SQLite
RUN mkdir -p /app/data

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EzraBeacon.Api.dll"]
