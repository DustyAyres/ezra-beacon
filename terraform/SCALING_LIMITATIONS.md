# Scaling Limitations with SQLite

## Current Limitation

The backend container app is currently limited to a single instance due to SQLite's file locking constraints when used with network storage (Azure Files). 

When multiple container instances try to access the same SQLite database file over Azure Files, you'll encounter "database is locked" errors because:
1. SQLite uses file-based locking which doesn't work well over network file systems
2. Azure Files (SMB) doesn't provide the fine-grained locking that SQLite expects
3. Concurrent write operations from multiple instances cause conflicts

## Current Workaround

The backend is configured to run as a single instance:
- `min_replicas = 1`
- `max_replicas = 1`
- Autoscaling rules are disabled for the backend

The frontend can still scale independently since it doesn't directly access the database.

## Future Solutions

To enable backend scaling, consider migrating to one of these options:

### 1. Azure SQL Database (Recommended for Production)
- Fully managed, scalable relational database
- Supports concurrent connections from multiple instances
- Built-in high availability and backups
- Minimal code changes required (just connection string)

### 2. PostgreSQL on Azure
- Azure Database for PostgreSQL
- Container Apps with PostgreSQL container
- Better suited for containerized environments than SQL Server

### 3. In-Memory Caching with Persistent Store
- Use Redis/Memory cache for active data
- Periodic sync to persistent storage
- Reduces database load

### 4. API-Level Solutions
- Implement database connection pooling
- Add retry logic for transient failures
- Use read replicas for read-heavy workloads

## Migration Path

When ready to scale the backend:

1. Choose a database solution that supports concurrent access
2. Update the connection string in Terraform
3. Run database migrations
4. Remove the single-instance limitation
5. Re-enable autoscaling rules

## Development vs Production

- **Development**: Single instance SQLite is fine for testing
- **Production**: Strongly recommend migrating to Azure SQL or PostgreSQL before launch
