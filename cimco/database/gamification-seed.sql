-- Seed Achievements Data
-- Run this after gamification-schema.sql

INSERT INTO achievements (code, name, description, icon, points, requirement_type, requirement_value) VALUES
  -- Starter Achievements
  ('first_steps', 'First Steps', 'Log your first maintenance entry', '🎯', 10, 'logs', 1),
  ('scanner', 'Scanner', 'Scan 5 QR codes', '📱', 25, 'scans', 5),
  ('photographer', 'Photographer', 'Upload 10 photos', '📸', 30, 'photos', 10),
  ('voice_master', 'Voice Master', 'Use voice entry 5 times', '🎤', 50, 'voice_entries', 5),
  
  -- Streak Achievements
  ('hot_streak', 'Hot Streak', 'Maintain a 7-day streak', '🔥', 50, 'streak', 7),
  ('on_fire', 'On Fire', 'Maintain a 14-day streak', '🔥🔥', 100, 'streak', 14),
  ('unstoppable', 'Unstoppable', 'Maintain a 30-day streak', '🔥🔥🔥', 200, 'streak', 30),
  
  -- Log Count Achievements
  ('documenter', 'Documenter', 'Log 10 maintenance entries', '📝', 100, 'logs', 10),
  ('maintenance_pro', 'Maintenance Pro', 'Log 50 maintenance entries', '🏆', 250, 'logs', 50),
  ('legend', 'Legend', 'Log 100 maintenance entries', '👑', 500, 'logs', 100),
  
  -- Level Achievements
  ('rising_star', 'Rising Star', 'Reach Level 3', '⭐', 100, 'level', 3),
  ('veteran', 'Veteran', 'Reach Level 5', '⭐⭐', 200, 'level', 5),
  ('master', 'Master', 'Reach Level 10', '⭐⭐⭐', 500, 'level', 10),
  
  -- Special Achievements
  ('early_bird', 'Early Bird', 'Log maintenance before 8 AM', '🌅', 25, 'special', 1),
  ('night_owl', 'Night Owl', 'Log maintenance after 8 PM', '🦉', 25, 'special', 1);

-- Seed Default User (for demo)
INSERT INTO user_profiles (username, display_name, location_id, points, level, current_streak, total_logs)
VALUES 
  ('demo_user', 'Ryan (Demo)', 'sterling', 150, 2, 3, 8)
ON CONFLICT (username) DO NOTHING;
