-- PostgreSQL Schema for CIMCO Inventory System
-- Run this to initialize the database

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    equipment_id TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    health_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_health ON equipment(health_score);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    priority INTEGER NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- Task resolutions table
CREATE TABLE IF NOT EXISTS task_resolutions (
    id SERIAL PRIMARY KEY,
    original_description TEXT NOT NULL,
    category TEXT NOT NULL,
    solution_steps TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parts inventory table
CREATE TABLE IF NOT EXISTS parts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    part_type TEXT,
    manufacturer TEXT,
    part_number TEXT,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,
    lead_time_days INTEGER DEFAULT 7,
    location TEXT,
    unit_cost REAL,
    supplier TEXT,
    wear_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parts indexes
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_manufacturer ON parts(manufacturer);
CREATE INDEX IF NOT EXISTS idx_parts_low_stock ON parts(quantity, min_quantity);
CREATE INDEX IF NOT EXISTS idx_parts_part_type ON parts(part_type);
CREATE INDEX IF NOT EXISTS idx_parts_location ON parts(location);

-- Incoming orders table
CREATE TABLE IF NOT EXISTS incoming_orders (
    id SERIAL PRIMARY KEY,
    part_id INTEGER,
    part_name TEXT,
    order_number TEXT,
    tracking_number TEXT,
    supplier TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'ordered',
    order_date DATE,
    expected_delivery DATE,
    email_subject TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incoming orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON incoming_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expected_delivery ON incoming_orders(expected_delivery);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
