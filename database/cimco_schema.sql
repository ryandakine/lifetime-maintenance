-- CIMCO Inventory Database Schema
-- Matches structs in src-tauri/src/db.rs

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'maintenance', 'down'
    health_score REAL DEFAULT 100.0
);

-- Parts Table
CREATE TABLE IF NOT EXISTS parts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    part_type TEXT,
    manufacturer TEXT,
    part_number TEXT,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    lead_time_days INTEGER DEFAULT 0,
    wear_rating INTEGER,
    location TEXT,
    unit_cost DOUBLE PRECISION,
    supplier TEXT
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    priority INTEGER DEFAULT 2,
    category TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incoming Orders Table
CREATE TABLE IF NOT EXISTS incoming_orders (
    id SERIAL PRIMARY KEY,
    part_name TEXT,
    order_number TEXT,
    tracking_number TEXT,
    supplier TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    order_date TIMESTAMP,
    expected_delivery TIMESTAMP
);

-- Logs / Audit (Optional if used)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    user_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
