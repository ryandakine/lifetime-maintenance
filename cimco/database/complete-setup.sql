-- CIMCO Equipment Tracker - Complete Database Setup
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. MAIN SCHEMA (Equipment & Maintenance Logs)
-- ============================================

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  serial_number VARCHAR(255),
  qr_code VARCHAR(255) UNIQUE,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  purchase_date DATE,
  last_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  log_id SERIAL PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(equipment_id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  worker_name VARCHAR(255),
  work_type VARCHAR(100),
  work_description TEXT,
  cost DECIMAL(10, 2),
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. GAMIFICATION SCHEMA
-- ============================================

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  location_id VARCHAR(50) DEFAULT 'sterling',
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  total_logs INT DEFAULT 0,
  total_scans INT DEFAULT 0,
  total_photos INT DEFAULT 0,
  total_voice_entries INT DEFAULT 0,
  theme_unlocked VARCHAR(20) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  achievement_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  points INT DEFAULT 0,
  requirement_type VARCHAR(50),
  requirement_value INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Achievements Junction
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievements(achievement_id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  activity_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  points_earned INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  user_id,
  username,
  display_name,
  location_id,
  points,
  level,
  current_streak,
  total_logs,
  RANK() OVER (PARTITION BY location_id ORDER BY points DESC) as location_rank,
  RANK() OVER (ORDER BY points DESC) as global_rank
FROM user_profiles
ORDER BY points DESC;

-- ============================================
-- 3. SEED DATA
-- ============================================

-- Insert Demo Equipment
INSERT INTO equipment (equipment_name, equipment_type, manufacturer, model, serial_number, qr_code, location, status) VALUES
  ('Industrial Shredder', 'Shredder', 'American Shredder Co.', 'AS-5000', 'SN-2023-001', 'QR-SHR-001', 'Main Yard', 'active'),
  ('Overhead Crane', 'Crane', 'Konecranes', 'CXT-2000', 'SN-2023-002', 'QR-CRN-001', 'Building A', 'active'),
  ('Conveyor Belt System', 'Conveyor', 'ConveyAll', 'CB-1500', 'SN-2023-003', 'QR-CNV-001', 'Processing Area', 'active'),
  ('Metal Baler', 'Baler', 'Harris Equipment', 'HB-800', 'SN-2023-004', 'QR-BAL-001', 'Main Yard', 'maintenance'),
  ('Forklift', 'Forklift', 'Toyota', 'Model 8FG25', 'SN-2023-005', 'QR-FRK-001', 'Warehouse', 'active')
ON CONFLICT (qr_code) DO NOTHING;

-- Insert Sample Maintenance Logs
INSERT INTO maintenance_logs (equipment_id, work_date, worker_name, work_type, work_description, cost)
SELECT 
  equipment_id,
  CURRENT_DATE - (random() * 30)::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Mike Johnson'
    WHEN 1 THEN 'Sarah Chen'
    WHEN 2 THEN 'Alex Rodriguez'
    ELSE 'Maria Garcia'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Inspection'
    WHEN 1 THEN 'Repair'
    WHEN 2 THEN 'Preventive Maintenance'
    ELSE 'Replacement'
  END,
  'Routine maintenance and inspection completed',
  (random() * 500 + 50)::numeric(10,2)
FROM equipment
LIMIT 14;

-- Insert Achievements
INSERT INTO achievements (code, name, description, icon, points, requirement_type, requirement_value) VALUES
  ('first_steps', 'First Steps', 'Log your first maintenance entry', '🎯', 10, 'logs', 1),
  ('scanner', 'Scanner', 'Scan 5 QR codes', '📱', 25, 'scans', 5),
  ('photographer', 'Photographer', 'Upload 10 photos', '📸', 30, 'photos', 10),
  ('voice_master', 'Voice Master', 'Use voice entry 5 times', '🎤', 50, 'voice_entries', 5),
  ('hot_streak', 'Hot Streak', 'Maintain a 7-day streak', '🔥', 50, 'streak', 7),
  ('on_fire', 'On Fire', 'Maintain a 14-day streak', '🔥🔥', 100, 'streak', 14),
  ('unstoppable', 'Unstoppable', 'Maintain a 30-day streak', '🔥🔥🔥', 200, 'streak', 30),
  ('documenter', 'Documenter', 'Log 10 maintenance entries', '📝', 100, 'logs', 10),
  ('maintenance_pro', 'Maintenance Pro', 'Log 50 maintenance entries', '🏆', 250, 'logs', 50),
  ('legend', 'Legend', 'Log 100 maintenance entries', '👑', 500, 'logs', 100),
  ('rising_star', 'Rising Star', 'Reach Level 3', '⭐', 100, 'level', 3),
  ('veteran', 'Veteran', 'Reach Level 5', '⭐⭐', 200, 'level', 5),
  ('master', 'Master', 'Reach Level 10', '⭐⭐⭐', 500, 'level', 10)
ON CONFLICT (code) DO NOTHING;

-- Insert Demo User
INSERT INTO user_profiles (username, display_name, location_id, points, level, current_streak, total_logs)
VALUES ('demo_user', 'Ryan (Demo)', 'sterling', 150, 2, 3, 8)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_equipment_qr ON equipment(qr_code);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment ON maintenance_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);

-- ============================================
-- DONE! Your database is ready.
-- ============================================
