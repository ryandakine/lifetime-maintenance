-- Tracker Data Schema for CIMCO
-- Stores GPS + accelerometer data from DIY trackers

CREATE TABLE IF NOT EXISTS trackers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE NOT NULL,
    equipment_id INTEGER,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, inactive, maintenance
    battery_percent INTEGER,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE IF NOT EXISTS tracker_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    vibration REAL NOT NULL, -- g-force magnitude
    is_running BOOLEAN NOT NULL,
    battery_percent INTEGER,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES trackers(device_id)
);

CREATE TABLE IF NOT EXISTS equipment_runtime (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    runtime_hours REAL,
    vibration_avg REAL,
    vibration_max REAL,
    shock_events INTEGER DEFAULT 0,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE IF NOT EXISTS shock_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    equipment_id INTEGER,
    latitude REAL,
    longitude REAL,
    vibration_magnitude REAL NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    severity TEXT, -- low, medium, high, critical
    investigated BOOLEAN DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (device_id) REFERENCES trackers(device_id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Indexes for performance
CREATE INDEX idx_tracker_logs_device_time ON tracker_logs(device_id, timestamp DESC);
CREATE INDEX idx_tracker_logs_running ON tracker_logs(is_running, timestamp DESC);
CREATE INDEX idx_shock_events_severity ON shock_events(severity, timestamp DESC);
CREATE INDEX idx_equipment_runtime_hours ON equipment_runtime(equipment_id, start_time DESC);

-- Sample data
INSERT INTO trackers (device_id, name, equipment_id) VALUES 
    ('CIMCO-001', 'Front Loader Tracker', 1),
    ('CIMCO-002', 'Semi Truck Tracker', 2),
    ('CIMCO-003', 'Shredder Tracker', 3);
