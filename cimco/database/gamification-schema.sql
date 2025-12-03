-- Gamification System Schema
-- Add this to your Supabase SQL Editor after running the main schema.sql

-- User Profiles Table
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

-- Achievements Table
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

-- User Achievements Junction Table
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievements(achievement_id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Activity Log for Points Tracking
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

-- Function to Update User Stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET updated_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Activity Log
CREATE TRIGGER update_stats_trigger
AFTER INSERT ON activity_log
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);
