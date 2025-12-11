-- Equipment: Ammonia Compressors & System
INSERT INTO equipment (name, status, health_score) VALUES 
('Vilter Compressor A-1 (VSS-1501)', 'active', 98.5),
('Vilter Compressor A-2 (VSS-1501)', 'maintenance', 65.0),
('Mycom Compressor B-1 (320VSD)', 'active', 92.0),
('BAC Condenser C-1 (XC-50)', 'active', 88.5),
('BAC Condenser C-2 (XC-51)', 'down', 45.0),
('Docal Receiver V-1 (HPR-5000)', 'active', 99.0),
('Armstrong Purger P-1', 'active', 96.0),
('CIMCO Oil Pot OP-3', 'active', 94.5);

-- Maintenance Tasks (Schema: description, priority, category, status)
INSERT INTO tasks (description, priority, category, status) VALUES
('Oil Analysis - Compressor A-1', 2, 'Preventative', 'pending'),
('Vibration Check - Drive End Bearing', 3, 'Inspection', 'pending'),
('Shaft Seal Inspection - Comp A-2', 4, 'Critical', 'pending'),
('Filter Replacement - Suction Side', 2, 'Maintenance', 'complete'),
('Slide Valve Calibration 0-100%', 1, 'Calibration', 'pending'),
('Spray Nozzle Cleaning - Condenser C-1', 2, 'Cleaning', 'pending'),
('Check Fan Belt Tension - C-2', 3, 'Inspection', 'pending');
