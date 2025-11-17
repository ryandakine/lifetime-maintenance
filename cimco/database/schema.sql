-- Cimco Equipment Tracker Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  qr_code_id TEXT PRIMARY KEY, -- "CIMCO001", "CIMCO002", etc.
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'retired')),
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_assigned TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  qr_code_id TEXT UNIQUE REFERENCES qr_codes(qr_code_id) ON DELETE SET NULL,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT, -- "Shredder", "Crane", "Conveyor", "Baler", etc.
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT,
  year_manufactured INTEGER,
  date_installed DATE,
  location_zone TEXT, -- "North Yard", "Main Building", etc.
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'down', 'retired')),
  purchase_price DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  log_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  worker_name TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('preventive', 'repair', 'inspection', 'emergency')),
  work_description TEXT NOT NULL,
  parts_used TEXT,
  hours_spent DECIMAL(5,2),
  cost DECIMAL(10,2),
  photo_urls TEXT[], -- array of Supabase storage URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts inventory table (for future use)
CREATE TABLE IF NOT EXISTS parts_inventory (
  part_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_number TEXT,
  part_name TEXT NOT NULL,
  manufacturer TEXT,
  equipment_compatibility TEXT[], -- array of equipment types
  supplier_name TEXT,
  unit_cost DECIMAL(10,2),
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  storage_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_equipment_qr_code ON equipment(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location_zone);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_equipment ON maintenance_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_date ON maintenance_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_type ON maintenance_logs(work_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_inventory_updated_at BEFORE UPDATE ON parts_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maintenance-photos',
  'maintenance-photos',
  true, -- Public for demo purposes, set to false in production
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Insert demo QR codes
INSERT INTO qr_codes (qr_code_id, status, notes) VALUES
('CIMCO001', 'assigned', 'Main shredder QR code'),
('CIMCO002', 'assigned', 'Crane #2 QR code'),
('CIMCO003', 'assigned', 'Conveyor Belt A QR code'),
('CIMCO004', 'assigned', 'Baler QR code'),
('CIMCO005', 'assigned', 'Forklift #1 QR code'),
('CIMCO006', 'available', 'Reserved for future equipment'),
('CIMCO007', 'available', 'Reserved for future equipment'),
('CIMCO008', 'available', 'Reserved for future equipment'),
('CIMCO009', 'available', 'Reserved for future equipment'),
('CIMCO010', 'available', 'Reserved for future equipment')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert demo equipment
INSERT INTO equipment (qr_code_id, equipment_name, equipment_type, manufacturer, model_number, serial_number, year_manufactured, location_zone, status, notes) VALUES
('CIMCO001', 'Main Shredder', 'Shredder', 'American Pulverizer', 'AP-5000', 'SHR-2019-001', 2019, 'North Yard', 'active', 'Primary shredder for metal processing'),
('CIMCO002', 'Crane #2', 'Crane', 'Manitowoc', 'MLC650', 'CRN-2015-002', 2015, 'Main Building', 'active', 'Heavy-duty overhead crane'),
('CIMCO003', 'Conveyor Belt A', 'Conveyor', 'Flexco', 'FB-2000', 'CNV-2020-003', 2020, 'Processing Line', 'active', 'Main material transport conveyor'),
('CIMCO004', 'Baler', 'Baler', 'Harris', 'HRB-500', 'BAL-2018-004', 2018, 'South Yard', 'active', 'Hydraulic baling press'),
('CIMCO005', 'Forklift #1', 'Forklift', 'Toyota', '8FGU32', 'FRK-2021-005', 2021, 'Warehouse', 'active', 'Primary yard forklift')
ON CONFLICT (equipment_id) DO NOTHING;

-- Insert demo maintenance logs
DO $$
DECLARE
  shredder_id UUID;
  crane_id UUID;
  conveyor_id UUID;
  baler_id UUID;
  forklift_id UUID;
BEGIN
  -- Get equipment IDs
  SELECT equipment_id INTO shredder_id FROM equipment WHERE qr_code_id = 'CIMCO001';
  SELECT equipment_id INTO crane_id FROM equipment WHERE qr_code_id = 'CIMCO002';
  SELECT equipment_id INTO conveyor_id FROM equipment WHERE qr_code_id = 'CIMCO003';
  SELECT equipment_id INTO baler_id FROM equipment WHERE qr_code_id = 'CIMCO004';
  SELECT equipment_id INTO forklift_id FROM equipment WHERE qr_code_id = 'CIMCO005';

  -- Main Shredder maintenance logs
  INSERT INTO maintenance_logs (equipment_id, work_date, worker_name, work_type, work_description, parts_used, hours_spent, cost) VALUES
  (shredder_id, CURRENT_DATE - INTERVAL '5 days', 'Mike Johnson', 'preventive', 'Replaced shredder blades and lubricated bearings. All systems operational.', 'Shredder blades (set of 4), Industrial lubricant', 4.5, 850.00),
  (shredder_id, CURRENT_DATE - INTERVAL '20 days', 'Sarah Williams', 'inspection', 'Monthly safety inspection. Checked all safety guards and emergency stops.', NULL, 1.5, 0.00),
  (shredder_id, CURRENT_DATE - INTERVAL '45 days', 'Mike Johnson', 'repair', 'Fixed hydraulic leak in main cylinder. Replaced damaged seal.', 'Hydraulic seal kit, Hydraulic fluid (5 gal)', 3.0, 425.00);

  -- Crane maintenance logs
  INSERT INTO maintenance_logs (equipment_id, work_date, worker_name, work_type, work_description, parts_used, hours_spent, cost) VALUES
  (crane_id, CURRENT_DATE - INTERVAL '3 days', 'Tom Rodriguez', 'emergency', 'Replaced failed hydraulic pump. Crane was down for 2 hours.', 'Hydraulic pump assembly, Hydraulic hoses', 6.0, 2400.00),
  (crane_id, CURRENT_DATE - INTERVAL '15 days', 'Sarah Williams', 'preventive', 'Quarterly maintenance: greased all pivot points, checked wire rope condition.', 'Wire rope lubricant, Grease', 2.5, 125.00);

  -- Conveyor maintenance logs
  INSERT INTO maintenance_logs (equipment_id, work_date, worker_name, work_type, work_description, parts_used, hours_spent, cost) VALUES
  (conveyor_id, CURRENT_DATE - INTERVAL '7 days', 'James Chen', 'repair', 'Replaced damaged belt section. Belt had 3 tears from sharp metal.', 'Conveyor belt section (20ft), Belt fasteners', 5.0, 680.00),
  (conveyor_id, CURRENT_DATE - INTERVAL '30 days', 'James Chen', 'preventive', 'Cleaned rollers and adjusted belt tension. Checked motor alignment.', 'Roller bearings (4)', 2.0, 180.00);

  -- Baler maintenance logs
  INSERT INTO maintenance_logs (equipment_id, work_date, worker_name, work_type, work_description, parts_used, hours_spent, cost) VALUES
  (baler_id, CURRENT_DATE - INTERVAL '10 days', 'Mike Johnson', 'inspection', 'Safety inspection and pressure test on hydraulic system. All systems OK.', NULL, 1.0, 0.00),
  (baler_id, CURRENT_DATE - INTERVAL '35 days', 'Tom Rodriguez', 'preventive', 'Changed hydraulic oil and filters. Inspected ram cylinders.', 'Hydraulic oil (15 gal), Oil filters (2)', 3.5, 320.00);

  -- Forklift maintenance logs
  INSERT INTO maintenance_logs (equipment_id, work_date, worker_name, work_type, work_description, parts_used, hours_spent, cost) VALUES
  (forklift_id, CURRENT_DATE - INTERVAL '2 days', 'Sarah Williams', 'preventive', 'Regular service: oil change, tire pressure check, brake inspection.', 'Engine oil (5 qt), Oil filter, Air filter', 1.5, 95.00),
  (forklift_id, CURRENT_DATE - INTERVAL '18 days', 'James Chen', 'repair', 'Replaced worn brake pads and resurfaced rotors.', 'Brake pad set, Brake rotors', 2.5, 285.00),
  (forklift_id, CURRENT_DATE - INTERVAL '40 days', 'Sarah Williams', 'inspection', 'Monthly safety inspection. Checked lights, horn, seatbelt, fire extinguisher.', NULL, 0.5, 0.00);
END $$;

-- Create RLS policies (disabled for MVP demo - enable for production)
-- ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE parts_inventory ENABLE ROW LEVEL SECURITY;

-- For production, add appropriate RLS policies based on user roles
