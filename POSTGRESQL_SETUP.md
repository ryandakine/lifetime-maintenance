# PostgreSQL Setup Guide for CIMCO Inventory

## Prerequisites

- PostgreSQL 12+ installed
- Rust/Cargo installed
- Tauri dependencies installed

## 1. Install PostgreSQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## 2. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE cimco_inventory;
CREATE USER cimco WITH ENCRYPTED PASSWORD 'cimco';
GRANT ALL PRIVILEGES ON DATABASE cimco_inventory TO cimco;

# Exit psql
\q
```

## 3. Initialize Schema

```bash
# Connect to database
psql -U cimco -d cimco_inventory

# Run schema file
\i /path/to/lifetime-maintenance/cimco/database/schema.sql

# Verify tables
\dt

# You should see: equipment, tasks, parts, incoming_orders, logs, task_resolutions

# Exit
\q
```

## 4. Set Environment Variable

Add to your shell profile (.bashrc, .zshrc, etc.):

```bash
export DATABASE_URL="postgres://cimco:cimco@localhost/cimco_inventory"
```

Or create a `.env` file in the project root:

```
DATABASE_URL=postgres://cimco:cimco@localhost/cimco_inventory
```

## 5. Build and Run

```bash
cd lifetime-maintenance/cimco
cargo tauri build

# Or for development
cargo tauri dev
```

## 6. Verify Connection

When you start the app, you should see:

```
🐘 Connecting to PostgreSQL: postgres://cimco:****@localhost/cimco_inventory
✅ PostgreSQL connection successful!
✅ Database schema initialized
🚀 Starting Tauri application with PostgreSQL backend...
```

## Troubleshooting

### Connection Refused
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql
```

### Authentication Failed
```bash
# Reset password
sudo -u postgres psql
ALTER USER cimco WITH PASSWORD 'new_password';
\q

# Update DATABASE_URL with new password
```

### Permission Denied
```bash
# Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE cimco_inventory TO cimco;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cimco;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cimco;
\q
```

### Port Already in Use
```bash
# Check what's using port 5432
sudo lsof -i :5432

# Change PostgreSQL port (if needed)
# Edit /etc/postgresql/*/main/postgresql.conf
# Change: port = 5433
# Update DATABASE_URL accordingly
```

## Performance Tuning

For 100+ concurrent users, update PostgreSQL settings:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Recommended settings:
```
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2MB
min_wal_size = 1GB
max_wal_size = 4GB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Migrating from SQLite

If you have existing SQLite data:

1. Export from SQLite:
```bash
sqlite3 cimco_offline.db .dump > sqlite_dump.sql
```

2. Convert SQLite dump to PostgreSQL format (manual cleanup needed):
   - Replace `INTEGER PRIMARY KEY` with `SERIAL PRIMARY KEY`
   - Replace `AUTOINCREMENT` with `SERIAL`
   - Replace `?1, ?2` with `$1, $2` in queries
   - Remove SQLite-specific pragmas

3. Import to PostgreSQL:
```bash
psql -U cimco -d cimco_inventory < sqlite_dump.sql
```

## Production Deployment

### Using Docker

```dockerfile
FROM postgres:15

ENV POSTGRES_DB=cimco_inventory
ENV POSTGRES_USER=cimco
ENV POSTGRES_PASSWORD=cimco

COPY database/schema.sql /docker-entrypoint-initdb.d/
```

Build and run:
```bash
docker build -t cimco-postgres .
docker run -d -p 5432:5432 --name cimco-db cimco-postgres
```

### Using Cloud Providers

#### AWS RDS
1. Create PostgreSQL RDS instance
2. Note endpoint: `cimco-db.xxxxx.us-east-1.rds.amazonaws.com`
3. Set DATABASE_URL: `postgres://cimco:password@cimco-db.xxxxx.us-east-1.rds.amazonaws.com/cimco_inventory`

#### Heroku Postgres
```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku config:get DATABASE_URL
```

#### Digital Ocean Managed Database
1. Create managed PostgreSQL cluster
2. Download CA certificate
3. Update DATABASE_URL with SSL parameters

## Monitoring

### Check Active Connections
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'cimco_inventory';
```

### Check Slow Queries
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Check Table Sizes
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Backup and Restore

### Backup
```bash
pg_dump -U cimco cimco_inventory > backup.sql
```

### Restore
```bash
psql -U cimco cimco_inventory < backup.sql
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * pg_dump -U cimco cimco_inventory > /backups/cimco_$(date +\%Y\%m\%d).sql
```

## Next Steps

- [ ] Test with 100+ concurrent connections
- [ ] Set up connection pooling (already done with deadpool-postgres)
- [ ] Configure SSL/TLS for production
- [ ] Set up read replicas for scaling reads
- [ ] Configure automated backups
- [ ] Set up monitoring (Prometheus + Grafana)

---

**Migration Complete**: You're now running on PostgreSQL! 🐘🚀
