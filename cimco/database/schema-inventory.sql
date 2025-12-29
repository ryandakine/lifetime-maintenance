-- CIMCO Parts Inventory Schema
-- Track spare parts for shredders, hydraulics, etc.

-- Parts inventory
CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,           -- 'Shredder', 'Hydraulics', 'Electrical', 'General'
    part_type TEXT,          -- 'Upper', 'Lower', 'Wear Part', 'Spider Cap', 'Hammer'
    manufacturer TEXT,       -- 'Metzo', 'Linden', etc.
    part_number TEXT,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 1,  -- Reorder level
    location TEXT,           -- 'Bin A-3', 'Shelf B-2'
    qr_code TEXT UNIQUE,
    unit_cost REAL,
    supplier TEXT,
    last_ordered DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incoming orders from email agent
CREATE TABLE IF NOT EXISTS incoming_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER,
    part_name TEXT,          -- In case part not in system yet
    order_number TEXT,
    tracking_number TEXT,
    supplier TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'ordered',  -- ordered, shipped, out_for_delivery, delivered
    order_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    email_subject TEXT,
    email_from TEXT,
    email_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- Inventory transactions (audit log)
CREATE TABLE IF NOT EXISTS inventory_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    action TEXT NOT NULL,    -- 'add', 'remove', 'adjust', 'received', 'reorder'
    quantity_change INTEGER,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    notes TEXT,
    user_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_location ON parts(location);
CREATE INDEX IF NOT EXISTS idx_parts_low_stock ON parts(quantity, min_quantity);
CREATE INDEX IF NOT EXISTS idx_orders_status ON incoming_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON incoming_orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_log_part ON inventory_log(part_id, created_at DESC);

-- Sample data for shredder parts
INSERT OR IGNORE INTO parts (name, category, part_number, quantity, min_quantity, location, unit_cost, supplier) VALUES
    ('Shredder Hammer - Heavy Duty', 'Shredder', 'SH-HD-001', 12, 5, 'Bin A-1', 89.99, 'SSI Shredding'),
    ('Shredder Hammer - Standard', 'Shredder', 'SH-STD-002', 8, 4, 'Bin A-2', 65.00, 'SSI Shredding'),
    ('Hydraulic Pump - Main', 'Hydraulics', 'HP-MAIN-001', 2, 1, 'Shelf B-1', 450.00, 'Grainger'),
    ('Hydraulic Cylinder Seal Kit', 'Hydraulics', 'HC-SEAL-003', 6, 3, 'Bin B-3', 35.00, 'Amazon'),
    ('Conveyor Belt - 24 inch', 'General', 'CB-24-001', 3, 1, 'Rack C-1', 280.00, 'MSC Direct'),
    ('Motor Bearing 6205', 'Electrical', 'MB-6205', 10, 4, 'Bin D-2', 18.50, 'Amazon'),
    ('Hydraulic Filter Element', 'Hydraulics', 'HF-EL-001', 4, 2, 'Bin B-4', 42.00, 'Grainger'),
    ('Shredder Grate - 3 inch', 'Shredder', 'SG-3IN-001', 2, 1, 'Rack A-5', 325.00, 'SSI Shredding');

-- Sample incoming order
INSERT OR IGNORE INTO incoming_orders (part_name, order_number, tracking_number, supplier, quantity, status, order_date, expected_delivery, email_subject)
VALUES ('Shredder Hammer - Heavy Duty', 'ORD-2024-1234', '1Z999AA10123456784', 'SSI Shredding', 6, 'shipped', '2024-12-10', '2024-12-15', 'Your order has shipped!');
