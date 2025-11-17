-- ENHANCED Cimco Equipment Tracker Database Schema
-- Supports multiple equipment types with telematics and predictive maintenance

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE TABLES
-- ========================================

-- QR Codes table (unchanged)
CREATE TABLE IF NOT EXISTS qr_codes (
  qr_code_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'retired')),
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_assigned TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Equipment table (enhanced with equipment type specifics)
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  qr_code_id TEXT UNIQUE REFERENCES qr_codes(qr_code_id) ON DELETE SET NULL,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL, -- "Loader", "Shredder", "Semi", "SkidSteer"
  equipment_category TEXT, -- "Mobile", "Stationary", "Vehicle"
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT,
  vin_number TEXT, -- For vehicles (semis)
  year_manufactured INTEGER,
  date_installed DATE,
  location_zone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'down', 'retired')),
  purchase_price DECIMAL(12,2),
  current_hours DECIMAL(10,1), -- Operating hours (loaders, skid steer)
  current_miles DECIMAL(10,1), -- Odometer reading (semis)
  notes TEXT,

  -- Telematics integration
  telematics_device_id TEXT, -- GPS/telematics device identifier
  telematics_enabled BOOLEAN DEFAULT false,
  last_telematics_sync TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TELEMATICS TABLES
-- ========================================

-- Vehicle usage data from GPS/telematics
CREATE TABLE IF NOT EXISTS vehicle_usage_data (
  usage_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,

  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Mileage breakdown
  total_miles DECIMAL(10,2),
  highway_miles DECIMAL(10,2), -- Interstate/highway driving
  city_miles DECIMAL(10,2), -- Stop-and-go city driving
  offroad_miles DECIMAL(10,2), -- Unpaved/yard driving

  -- Terrain analysis
  flat_terrain_miles DECIMAL(10,2),
  hilly_terrain_miles DECIMAL(10,2),
  rough_terrain_miles DECIMAL(10,2),

  -- Driving behavior
  idle_hours DECIMAL(6,2),
  driving_hours DECIMAL(6,2),
  max_speed_mph INTEGER,
  avg_speed_mph DECIMAL(5,2),
  hard_braking_events INTEGER,
  rapid_acceleration_events INTEGER,

  -- Load data
  avg_load_weight_lbs DECIMAL(10,2),
  max_load_weight_lbs DECIMAL(10,2),
  trips_count INTEGER,

  -- Calculated wear factors
  brake_wear_score DECIMAL(5,2), -- 0-100, higher = more wear
  tire_wear_score DECIMAL(5,2),
  engine_wear_score DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment runtime data (for stationary equipment like shredders)
CREATE TABLE IF NOT EXISTS equipment_runtime_data (
  runtime_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,

  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Operating hours
  total_runtime_hours DECIMAL(10,2),
  idle_hours DECIMAL(6,2),
  under_load_hours DECIMAL(6,2),

  -- Performance metrics
  avg_motor_load_percent DECIMAL(5,2), -- Average motor load %
  max_motor_load_percent DECIMAL(5,2),
  cycles_count INTEGER, -- Number of on/off cycles

  -- Temperature data
  avg_operating_temp_f DECIMAL(5,2),
  max_operating_temp_f DECIMAL(5,2),
  overheat_events INTEGER,

  -- Calculated wear factors
  motor_wear_score DECIMAL(5,2),
  bearing_wear_score DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile equipment usage (loaders, skid steers)
CREATE TABLE IF NOT EXISTS mobile_equipment_usage (
  usage_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,

  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Operating hours
  total_hours DECIMAL(10,2),
  loaded_hours DECIMAL(10,2), -- Hours operating with load
  travel_hours DECIMAL(10,2),
  idle_hours DECIMAL(6,2),

  -- Hydraulic system
  hydraulic_cycles INTEGER, -- Bucket/arm cycles
  max_hydraulic_pressure_psi DECIMAL(7,2),
  avg_hydraulic_temp_f DECIMAL(5,2),

  -- Load data
  avg_load_weight_lbs DECIMAL(10,2),
  max_load_weight_lbs DECIMAL(10,2),
  total_loads_moved INTEGER,

  -- Terrain
  paved_surface_hours DECIMAL(6,2),
  gravel_surface_hours DECIMAL(6,2),
  dirt_surface_hours DECIMAL(6,2),

  -- Calculated wear factors
  hydraulic_wear_score DECIMAL(5,2),
  tire_wear_score DECIMAL(5,2),
  engine_wear_score DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MAINTENANCE TABLES
-- ========================================

-- Maintenance logs (enhanced with predictive fields)
CREATE TABLE IF NOT EXISTS maintenance_logs (
  log_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  worker_name TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('preventive', 'repair', 'inspection', 'emergency', 'predictive')),
  work_description TEXT NOT NULL,
  parts_used TEXT,
  hours_spent DECIMAL(5,2),
  cost DECIMAL(10,2),
  photo_urls TEXT[],

  -- Equipment state at time of maintenance
  equipment_hours_at_service DECIMAL(10,1),
  equipment_miles_at_service DECIMAL(10,1),

  -- Predictive maintenance fields
  was_predicted BOOLEAN DEFAULT false, -- Was this maintenance predicted by the system?
  predicted_date DATE, -- When system predicted this would be needed
  actual_vs_predicted_days INTEGER, -- Difference between prediction and actual

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts tracking with wear predictions
CREATE TABLE IF NOT EXISTS parts_inventory (
  part_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_number TEXT,
  part_name TEXT NOT NULL,
  part_category TEXT, -- "Brake", "Tire", "Filter", "Belt", "Hydraulic", etc.
  manufacturer TEXT,
  equipment_compatibility TEXT[], -- Array of equipment types
  supplier_name TEXT,
  unit_cost DECIMAL(10,2),
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  storage_location TEXT,

  -- Predictive maintenance data
  typical_lifespan_hours DECIMAL(10,2), -- Expected hours before replacement
  typical_lifespan_miles DECIMAL(10,2), -- Expected miles before replacement
  typical_lifespan_months INTEGER,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Part installations tracking
CREATE TABLE IF NOT EXISTS part_installations (
  installation_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts_inventory(part_id) ON DELETE SET NULL,
  maintenance_log_id UUID REFERENCES maintenance_logs(log_id) ON DELETE SET NULL,

  part_name TEXT NOT NULL, -- In case part_id is null
  installed_date DATE NOT NULL,
  installed_at_hours DECIMAL(10,1), -- Equipment hours when installed
  installed_at_miles DECIMAL(10,1), -- Equipment miles when installed

  expected_replacement_hours DECIMAL(10,1), -- When to replace based on hours
  expected_replacement_miles DECIMAL(10,1), -- When to replace based on miles
  expected_replacement_date DATE, -- When to replace based on calendar

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'replaced', 'failed')),
  replaced_date DATE,
  actual_lifespan_hours DECIMAL(10,1),
  actual_lifespan_miles DECIMAL(10,1),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive maintenance alerts
CREATE TABLE IF NOT EXISTS maintenance_predictions (
  prediction_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  part_installation_id UUID REFERENCES part_installations(installation_id) ON DELETE CASCADE,

  prediction_type TEXT NOT NULL, -- "part_replacement", "service_due", "wear_threshold"
  predicted_item TEXT NOT NULL, -- "Brake pads", "Oil change", etc.

  -- Prediction timing
  predicted_date DATE,
  predicted_at_hours DECIMAL(10,1),
  predicted_at_miles DECIMAL(10,1),
  confidence_score DECIMAL(5,2), -- 0-100, based on data quality

  -- Alert status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Prediction factors
  wear_score DECIMAL(5,2), -- Current wear level
  usage_pattern_factor DECIMAL(5,2), -- How usage affects prediction
  historical_data_factor DECIMAL(5,2), -- Based on similar equipment history

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  dismissed_reason TEXT
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(equipment_category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_telematics ON equipment(telematics_device_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_usage_equipment ON vehicle_usage_data(equipment_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_usage_period ON vehicle_usage_data(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_runtime_data_equipment ON equipment_runtime_data(equipment_id);
CREATE INDEX IF NOT EXISTS idx_runtime_data_period ON equipment_runtime_data(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_mobile_usage_equipment ON mobile_equipment_usage(equipment_id);
CREATE INDEX IF NOT EXISTS idx_mobile_usage_period ON mobile_equipment_usage(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON maintenance_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance_logs(work_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_predicted ON maintenance_logs(was_predicted);

CREATE INDEX IF NOT EXISTS idx_part_installations_equipment ON part_installations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_part_installations_status ON part_installations(status);

CREATE INDEX IF NOT EXISTS idx_predictions_equipment ON maintenance_predictions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON maintenance_predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_priority ON maintenance_predictions(priority);
CREATE INDEX IF NOT EXISTS idx_predictions_date ON maintenance_predictions(predicted_date);

-- ========================================
-- TRIGGERS
-- ========================================

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_inventory_updated_at BEFORE UPDATE ON parts_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS FOR ANALYSIS
-- ========================================

-- View: Equipment health dashboard
CREATE OR REPLACE VIEW equipment_health_summary AS
SELECT
  e.equipment_id,
  e.equipment_name,
  e.equipment_type,
  e.status,
  e.current_hours,
  e.current_miles,

  -- Maintenance stats
  COUNT(ml.log_id) as total_maintenance_logs,
  SUM(ml.cost) as total_maintenance_cost,
  MAX(ml.work_date) as last_maintenance_date,

  -- Active predictions
  COUNT(CASE WHEN mp.status = 'pending' THEN 1 END) as pending_predictions,
  COUNT(CASE WHEN mp.priority = 'high' OR mp.priority = 'critical' THEN 1 END) as high_priority_alerts,

  -- Parts due for replacement
  COUNT(CASE WHEN pi.status = 'active' AND
    (e.current_hours >= pi.expected_replacement_hours OR
     e.current_miles >= pi.expected_replacement_miles)
    THEN 1 END) as parts_due_for_replacement

FROM equipment e
LEFT JOIN maintenance_logs ml ON e.equipment_id = ml.equipment_id
LEFT JOIN maintenance_predictions mp ON e.equipment_id = mp.equipment_id
LEFT JOIN part_installations pi ON e.equipment_id = pi.equipment_id

GROUP BY e.equipment_id, e.equipment_name, e.equipment_type, e.status,
         e.current_hours, e.current_miles;

-- View: Vehicle wear analysis
CREATE OR REPLACE VIEW vehicle_wear_analysis AS
SELECT
  e.equipment_id,
  e.equipment_name,
  e.current_miles,

  -- Recent usage (last 30 days)
  SUM(vud.total_miles) as miles_last_30_days,
  AVG(vud.brake_wear_score) as avg_brake_wear_score,
  AVG(vud.tire_wear_score) as avg_tire_wear_score,
  AVG(vud.engine_wear_score) as avg_engine_wear_score,

  -- Driving pattern breakdown
  SUM(vud.highway_miles) as highway_miles_30d,
  SUM(vud.city_miles) as city_miles_30d,
  SUM(vud.offroad_miles) as offroad_miles_30d,

  -- Behavior metrics
  SUM(vud.hard_braking_events) as hard_braking_events_30d,
  AVG(vud.avg_speed_mph) as avg_speed_30d

FROM equipment e
LEFT JOIN vehicle_usage_data vud ON e.equipment_id = vud.equipment_id
WHERE vud.period_start >= CURRENT_DATE - INTERVAL '30 days'
  AND e.equipment_category = 'Vehicle'
GROUP BY e.equipment_id, e.equipment_name, e.current_miles;

-- ========================================
-- DEMO DATA
-- ========================================

-- Insert QR codes for different equipment types
INSERT INTO qr_codes (qr_code_id, status, notes) VALUES
('CIMCO-SEMI-001', 'assigned', 'Semi truck #1'),
('CIMCO-LOADER-001', 'assigned', 'Front-end loader'),
('CIMCO-SHREDDER-MTR-001', 'assigned', 'Main shredder motor'),
('CIMCO-SKID-001', 'assigned', 'Skid steer'),
('CIMCO-SEMI-002', 'assigned', 'Semi truck #2'),
('CIMCO-006', 'available', 'Reserved for future equipment'),
('CIMCO-007', 'available', 'Reserved for future equipment')
ON CONFLICT (qr_code_id) DO NOTHING;

-- Insert equipment with different types
INSERT INTO equipment (
  qr_code_id, equipment_name, equipment_type, equipment_category,
  manufacturer, model_number, serial_number, vin_number,
  year_manufactured, location_zone, status, current_hours, current_miles,
  telematics_enabled, notes
) VALUES
-- Semi Truck
(
  'CIMCO-SEMI-001',
  'Semi Truck #1 - Long Haul',
  'Semi',
  'Vehicle',
  'Kenworth',
  'T680',
  'SEM-2020-001',
  '1XKYDP9X0LJ123456',
  2020,
  'Truck Bay',
  'active',
  NULL, -- No hours for trucks
  156420.5, -- Current miles
  true,
  'Primary long-haul semi truck with GPS telematics'
),

-- Front-End Loader
(
  'CIMCO-LOADER-001',
  'CAT Front-End Loader',
  'Loader',
  'Mobile',
  'Caterpillar',
  '950M',
  'LOD-2018-001',
  NULL,
  2018,
  'North Yard',
  'active',
  4235.3, -- Current operating hours
  NULL, -- No miles
  false,
  'Main yard loader for material handling'
),

-- Shredder Motor
(
  'CIMCO-SHREDDER-MTR-001',
  'Main Shredder Motor A',
  'Shredder Motor',
  'Stationary',
  'Siemens',
  'SIMOTICS HV Series',
  'MTR-2019-001',
  NULL,
  2019,
  'Shredder Building',
  'active',
  12456.8, -- Operating hours
  NULL,
  false,
  'Primary 500HP motor for metal shredder'
),

-- Skid Steer
(
  'CIMCO-SKID-001',
  'Bobcat Skid Steer',
  'Skid Steer',
  'Mobile',
  'Bobcat',
  'S650',
  'SKD-2021-001',
  NULL,
  2021,
  'South Yard',
  'active',
  1842.7, -- Operating hours
  NULL,
  false,
  'Compact loader for tight spaces and cleanup'
),

-- Second Semi Truck
(
  'CIMCO-SEMI-002',
  'Semi Truck #2 - Regional',
  'Semi',
  'Vehicle',
  'Freightliner',
  'Cascadia',
  'SEM-2019-002',
  '1FUJGHDV8KLBC5678',
  2019,
  'Truck Bay',
  'active',
  NULL,
  98342.2, -- Current miles
  true,
  'Regional delivery semi truck with GPS telematics'
)
ON CONFLICT (equipment_id) DO NOTHING;

-- Get equipment IDs for demo data
DO $$
DECLARE
  semi1_id UUID;
  loader_id UUID;
  shredder_motor_id UUID;
  skid_id UUID;
  semi2_id UUID;
BEGIN
  SELECT equipment_id INTO semi1_id FROM equipment WHERE qr_code_id = 'CIMCO-SEMI-001';
  SELECT equipment_id INTO loader_id FROM equipment WHERE qr_code_id = 'CIMCO-LOADER-001';
  SELECT equipment_id INTO shredder_motor_id FROM equipment WHERE qr_code_id = 'CIMCO-SHREDDER-MTR-001';
  SELECT equipment_id INTO skid_id FROM equipment WHERE qr_code_id = 'CIMCO-SKID-001';
  SELECT equipment_id INTO semi2_id FROM equipment WHERE qr_code_id = 'CIMCO-SEMI-002';

  -- SEMI TRUCK #1 - GPS/Telematics data (last 30 days)
  INSERT INTO vehicle_usage_data (
    equipment_id, period_start, period_end,
    total_miles, highway_miles, city_miles, offroad_miles,
    flat_terrain_miles, hilly_terrain_miles, rough_terrain_miles,
    idle_hours, driving_hours, max_speed_mph, avg_speed_mph,
    hard_braking_events, rapid_acceleration_events,
    avg_load_weight_lbs, max_load_weight_lbs, trips_count,
    brake_wear_score, tire_wear_score, engine_wear_score
  ) VALUES
  -- Week 1
  (semi1_id, CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '21 days',
   1248.5, 1050.2, 180.3, 18.0,
   980.0, 240.5, 28.0,
   12.5, 24.8, 72, 58.3,
   8, 12,
   38500, 44000, 6,
   15.2, 12.8, 18.5),

  -- Week 2
  (semi1_id, CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '14 days',
   1189.3, 995.8, 175.5, 18.0,
   920.0, 250.3, 19.0,
   11.2, 23.5, 70, 57.8,
   12, 15,
   39200, 44000, 5,
   18.5, 14.2, 19.8),

  -- Week 3
  (semi1_id, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '7 days',
   1356.8, 1150.5, 185.3, 21.0,
   1050.0, 280.8, 26.0,
   13.8, 26.2, 73, 59.1,
   15, 18,
   40100, 44000, 7,
   22.3, 16.8, 21.2),

  -- Week 4 (current)
  (semi1_id, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE,
   1124.2, 950.3, 155.9, 18.0,
   890.0, 215.2, 19.0,
   10.5, 22.1, 71, 58.5,
   10, 14,
   37800, 42000, 5,
   25.8, 18.5, 22.8);

  -- SEMI TRUCK #1 - Maintenance history
  INSERT INTO maintenance_logs (
    equipment_id, work_date, worker_name, work_type, work_description,
    parts_used, hours_spent, cost, equipment_miles_at_service
  ) VALUES
  (semi1_id, CURRENT_DATE - INTERVAL '45 days', 'Tom Rodriguez', 'preventive',
   'Routine 150K mile service: oil change, filter replacements, brake inspection',
   'Engine oil (15qt), Oil filter, Air filter, Fuel filter', 2.5, 385.00, 150000.0),

  (semi1_id, CURRENT_DATE - INTERVAL '120 days', 'Mike Johnson', 'repair',
   'Replaced worn brake pads on all axles. Brakes were down to 15% remaining due to heavy city driving.',
   'Brake pad sets (3 axles), Brake cleaner', 4.5, 1250.00, 142000.0),

  (semi1_id, CURRENT_DATE - INTERVAL '180 days', 'Sarah Williams', 'inspection',
   'DOT annual inspection - all systems passed',
   NULL, 1.5, 125.00, 135000.0);

  -- FRONT-END LOADER - Mobile equipment usage data
  INSERT INTO mobile_equipment_usage (
    equipment_id, period_start, period_end,
    total_hours, loaded_hours, travel_hours, idle_hours,
    hydraulic_cycles, max_hydraulic_pressure_psi, avg_hydraulic_temp_f,
    avg_load_weight_lbs, max_load_weight_lbs, total_loads_moved,
    paved_surface_hours, gravel_surface_hours, dirt_surface_hours,
    hydraulic_wear_score, tire_wear_score, engine_wear_score
  ) VALUES
  -- Last month
  (loader_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE,
   158.5, 125.3, 22.2, 11.0,
   2850, 3200, 195.5,
   2500, 4200, 2850,
   15.5, 98.0, 45.0,
   28.5, 35.2, 22.8);

  -- LOADER - Maintenance history
  INSERT INTO maintenance_logs (
    equipment_id, work_date, worker_name, work_type, work_description,
    parts_used, hours_spent, cost, equipment_hours_at_service
  ) VALUES
  (loader_id, CURRENT_DATE - INTERVAL '15 days', 'James Chen', 'preventive',
   'Quarterly service: hydraulic fluid change, filter replacement, greased all pivot points',
   'Hydraulic fluid (10 gal), Hydraulic filter, Grease', 3.0, 425.00, 4180.0),

  (loader_id, CURRENT_DATE - INTERVAL '60 days', 'Mike Johnson', 'repair',
   'Replaced worn bucket teeth and cutting edge. Heavy wear from rocky material',
   'Bucket teeth (6), Cutting edge', 2.5, 680.00, 3950.0),

  (loader_id, CURRENT_DATE - INTERVAL '120 days', 'Tom Rodriguez', 'inspection',
   'Safety inspection - checked ROPS, seatbelt, lights, backup alarm',
   NULL, 1.0, 0.00, 3700.0);

  -- SHREDDER MOTOR - Runtime data
  INSERT INTO equipment_runtime_data (
    equipment_id, period_start, period_end,
    total_runtime_hours, idle_hours, under_load_hours,
    avg_motor_load_percent, max_motor_load_percent, cycles_count,
    avg_operating_temp_f, max_operating_temp_f, overheat_events,
    motor_wear_score, bearing_wear_score
  ) VALUES
  -- Last month
  (shredder_motor_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE,
   485.2, 12.5, 472.7,
   78.5, 96.2, 342,
   185.3, 205.8, 0,
   42.5, 38.2);

  -- SHREDDER MOTOR - Maintenance history
  INSERT INTO maintenance_logs (
    equipment_id, work_date, worker_name, work_type, work_description,
    parts_used, hours_spent, cost, equipment_hours_at_service
  ) VALUES
  (shredder_motor_id, CURRENT_DATE - INTERVAL '30 days', 'Sarah Williams', 'preventive',
   'Monthly motor inspection: checked bearings, cleaned cooling fans, tested insulation resistance',
   'Bearing grease, Contact cleaner', 2.0, 125.00, 12200.0),

  (shredder_motor_id, CURRENT_DATE - INTERVAL '90 days', 'Tom Rodriguez', 'repair',
   'Replaced worn motor bearings - detected vibration and noise during inspection',
   'Motor bearing set, Alignment shims', 6.5, 2850.00, 11800.0),

  (shredder_motor_id, CURRENT_DATE - INTERVAL '180 days', 'Mike Johnson', 'inspection',
   'Quarterly thermal imaging inspection - all temperatures normal',
   NULL, 1.0, 0.00, 11200.0);

  -- SKID STEER - Mobile equipment usage
  INSERT INTO mobile_equipment_usage (
    equipment_id, period_start, period_end,
    total_hours, loaded_hours, travel_hours, idle_hours,
    hydraulic_cycles, max_hydraulic_pressure_psi, avg_hydraulic_temp_f,
    avg_load_weight_lbs, max_load_weight_lbs, total_loads_moved,
    paved_surface_hours, gravel_surface_hours, dirt_surface_hours,
    hydraulic_wear_score, tire_wear_score, engine_wear_score
  ) VALUES
  (skid_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE,
   124.3, 95.2, 18.1, 11.0,
   4250, 2850, 175.2,
   850, 1500, 4250,
   25.0, 65.3, 34.0,
   22.5, 42.8, 18.5);

  -- SKID STEER - Maintenance history
  INSERT INTO maintenance_logs (
    equipment_id, work_date, worker_name, work_type, work_description,
    parts_used, hours_spent, cost, equipment_hours_at_service
  ) VALUES
  (skid_id, CURRENT_DATE - INTERVAL '20 days', 'James Chen', 'preventive',
   'Regular service: engine oil change, hydraulic filter, air filter replacement',
   'Engine oil (4 qt), Oil filter, Air filter, Hydraulic filter', 1.5, 185.00, 1800.0),

  (skid_id, CURRENT_DATE - INTERVAL '75 days', 'Sarah Williams', 'repair',
   'Replaced damaged drive chain - excessive wear from abrasive material',
   'Drive chain assembly, Chain tensioner', 3.5, 625.00, 1650.0);

  -- SEMI TRUCK #2 - GPS/Telematics data (different usage pattern - more city driving)
  INSERT INTO vehicle_usage_data (
    equipment_id, period_start, period_end,
    total_miles, highway_miles, city_miles, offroad_miles,
    flat_terrain_miles, hilly_terrain_miles, rough_terrain_miles,
    idle_hours, driving_hours, max_speed_mph, avg_speed_mph,
    hard_braking_events, rapid_acceleration_events,
    avg_load_weight_lbs, max_load_weight_lbs, trips_count,
    brake_wear_score, tire_wear_score, engine_wear_score
  ) VALUES
  (semi2_id, CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '21 days',
   685.3, 350.2, 315.1, 20.0,
   580.0, 95.3, 10.0,
   18.5, 28.3, 65, 42.5,
   45, 52,
   28500, 35000, 18,
   38.5, 28.2, 25.8),

  (semi2_id, CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '14 days',
   712.8, 385.5, 305.3, 22.0,
   605.0, 98.8, 9.0,
   17.2, 29.1, 68, 43.8,
   42, 48,
   29200, 36000, 16,
   42.8, 31.5, 27.5);

  -- SEMI TRUCK #2 - Maintenance history (more brake work due to city driving)
  INSERT INTO maintenance_logs (
    equipment_id, work_date, worker_name, work_type, work_description,
    parts_used, hours_spent, cost, equipment_miles_at_service
  ) VALUES
  (semi2_id, CURRENT_DATE - INTERVAL '15 days', 'Tom Rodriguez', 'repair',
   'Emergency brake repair - front brake pads completely worn due to heavy city use. Replaced pads and resurfaced rotors.',
   'Brake pad set (front), Brake rotors (2), Brake cleaner', 5.5, 1450.00, 97500.0),

  (semi2_id, CURRENT_DATE - INTERVAL '90 days', 'Mike Johnson', 'preventive',
   '100K service - oil change, all filters, brake inspection showed 40% wear',
   'Engine oil (15qt), Oil filter, Air filter, Fuel filter', 2.5, 395.00, 94000.0);

END $$;

-- ========================================
-- SAMPLE PARTS INVENTORY WITH LIFESPAN DATA
-- ========================================

INSERT INTO parts_inventory (
  part_number, part_name, part_category, manufacturer,
  equipment_compatibility, unit_cost, current_stock, minimum_stock,
  typical_lifespan_miles, typical_lifespan_hours, typical_lifespan_months
) VALUES
-- Semi truck parts
('BRK-001', 'Heavy Duty Brake Pad Set', 'Brake', 'Bendix',
 ARRAY['Semi'], 285.00, 4, 2,
 45000, NULL, NULL), -- Highway: 50K miles, City: 30K miles

('TRE-001', 'Commercial Truck Tire 11R22.5', 'Tire', 'Michelin',
 ARRAY['Semi'], 425.00, 8, 4,
 75000, NULL, NULL),

('ENG-OIL-001', 'Heavy Duty Engine Oil 15W40', 'Fluid', 'Shell Rotella',
 ARRAY['Semi', 'Loader', 'Skid Steer'], 85.00, 12, 6,
 15000, NULL, NULL),

-- Loader parts
('HYD-FLUID-001', 'Hydraulic Fluid AW-68', 'Fluid', 'Mobil',
 ARRAY['Loader', 'Skid Steer'], 125.00, 6, 3,
 NULL, 2000, NULL),

('BUCKET-TEETH-001', 'Loader Bucket Teeth', 'Wear Parts', 'Caterpillar',
 ARRAY['Loader'], 45.00, 24, 12,
 NULL, 800, NULL),

-- Shredder motor parts
('MOTOR-BEARING-001', 'Heavy Duty Motor Bearing Set', 'Bearing', 'SKF',
 ARRAY['Shredder Motor'], 1250.00, 1, 1,
 NULL, 15000, NULL),

-- Skid steer parts
('CHAIN-001', 'Drive Chain Assembly', 'Drive Train', 'Bobcat',
 ARRAY['Skid Steer'], 485.00, 1, 1,
 NULL, 2500, NULL);

-- ========================================
-- SAMPLE PREDICTIVE MAINTENANCE ALERTS
-- ========================================

DO $$
DECLARE
  semi1_id UUID;
  semi2_id UUID;
  loader_id UUID;
BEGIN
  SELECT equipment_id INTO semi1_id FROM equipment WHERE qr_code_id = 'CIMCO-SEMI-001';
  SELECT equipment_id INTO semi2_id FROM equipment WHERE qr_code_id = 'CIMCO-SEMI-002';
  SELECT equipment_id INTO loader_id FROM equipment WHERE qr_code_id = 'CIMCO-LOADER-001';

  INSERT INTO maintenance_predictions (
    equipment_id, prediction_type, predicted_item,
    predicted_date, predicted_at_miles,
    confidence_score, status, priority,
    wear_score, usage_pattern_factor, historical_data_factor,
    notes
  ) VALUES
  -- Semi #1 - Brake replacement due soon
  (semi1_id, 'part_replacement', 'Brake Pads (All Axles)',
   CURRENT_DATE + INTERVAL '18 days', 162000,
   85.5, 'pending', 'high',
   72.5, 88.2, 92.0,
   'Based on current wear rate (25.8 score) and typical 45K mile lifespan. Last replaced at 142K miles.'),

  -- Semi #2 - CRITICAL brake alert (just replaced, but showing rapid wear)
  (semi2_id, 'part_replacement', 'Brake Pads - Front Axle',
   CURRENT_DATE + INTERVAL '45 days', 105000,
   78.3, 'pending', 'high',
   42.8, 95.5, 75.0,
   'High city driving and frequent hard braking causing accelerated wear. Monitor closely.'),

  -- Loader - Hydraulic service due
  (loader_id, 'service_due', 'Hydraulic System Service',
   CURRENT_DATE + INTERVAL '120 days', NULL,
   92.0, 'pending', 'medium',
   28.5, 82.0, 95.0,
   'Based on 2000-hour hydraulic fluid service interval. Currently at 4235 hours.');

END $$;
