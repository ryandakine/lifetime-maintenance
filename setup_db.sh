#!/bin/bash
set -e
echo "🐘 Setting up PostgreSQL..."

# Create User
sudo -u postgres psql -c "CREATE USER cimco WITH ENCRYPTED PASSWORD 'cimco';" || echo "User already exists (ignoring)"

# Create Database
sudo -u postgres psql -c "CREATE DATABASE cimco_inventory;" || echo "Database already exists (ignoring)"

# Grant Privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cimco_inventory TO cimco;"

echo "✅ Database Setup Complete"
