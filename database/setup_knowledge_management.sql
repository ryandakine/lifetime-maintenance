-- Enhanced Knowledge Management Database Setup
-- This script creates all the necessary tables for the knowledge management system

-- 1. Knowledge Categories Table
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES knowledge_categories(id),
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enhanced Knowledge Files Table
CREATE TABLE IF NOT EXISTS knowledge_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES knowledge_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  tags TEXT[] DEFAULT '{}',
  equipment_type TEXT,
  maintenance_type TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  estimated_time INTEGER, -- in minutes
  required_tools TEXT[] DEFAULT '{}',
  required_materials TEXT[] DEFAULT '{}',
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Search History Table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Favorite Resources Table
CREATE TABLE IF NOT EXISTS favorite_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  resource_id UUID NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('file', 'qa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id, resource_type)
);

-- 5. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  voice_settings JSONB DEFAULT '{"speed": 1.0, "pitch": 1.0, "volume": 1.0, "language": "en-US"}',
  ui_preferences JSONB DEFAULT '{"theme": "light", "compact_mode": false}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "sound": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Usage Analytics Table
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  resource_id UUID,
  resource_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_files_category ON knowledge_files(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_equipment ON knowledge_files(equipment_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_difficulty ON knowledge_files(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_tags ON knowledge_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_title ON knowledge_files USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_knowledge_files_description ON knowledge_files USING GIN(to_tsvector('english', description));

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at);

CREATE INDEX IF NOT EXISTS idx_favorite_resources_user ON favorite_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_resources_resource ON favorite_resources(resource_id, resource_type);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_user ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_action ON usage_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created ON usage_analytics(created_at);

-- Insert default categories
INSERT INTO knowledge_categories (name, description, icon, color, sort_order) VALUES
('Equipment Maintenance', 'Maintenance procedures for fitness equipment', 'wrench', '#3b82f6', 1),
('Safety Procedures', 'Safety guidelines and procedures', 'shield', '#ef4444', 2),
('Training Videos', 'Video tutorials and training materials', 'video', '#10b981', 3),
('Company Policies', 'HR policies and company procedures', 'building', '#8b5cf6', 4),
('Supplier Information', 'Vendor contacts and supplier details', 'truck', '#f59e0b', 5),
('Emergency Procedures', 'Emergency response and safety protocols', 'alert-triangle', '#dc2626', 6),
('Daily Operations', 'Daily maintenance and operational tasks', 'calendar', '#059669', 7),
('Technical Documentation', 'Technical manuals and specifications', 'file-text', '#6366f1', 8)
ON CONFLICT (name) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_knowledge_categories_updated_at 
    BEFORE UPDATE ON knowledge_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_files_updated_at 
    BEFORE UPDATE ON knowledge_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to search knowledge base with full-text search
CREATE OR REPLACE FUNCTION search_knowledge_base(search_query TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    description TEXT,
    relevance_score FLOAT,
    category_name TEXT,
    equipment_type TEXT,
    difficulty_level TEXT,
    file_type TEXT,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kf.id,
        'file'::TEXT as type,
        kf.title,
        kf.description,
        ts_rank(to_tsvector('english', COALESCE(kf.title, '') || ' ' || COALESCE(kf.description, '')), plainto_tsquery('english', search_query)) as relevance_score,
        kc.name as category_name,
        kf.equipment_type,
        kf.difficulty_level,
        kf.file_type,
        kf.tags
    FROM knowledge_files kf
    LEFT JOIN knowledge_categories kc ON kf.category_id = kc.id
    WHERE to_tsvector('english', COALESCE(kf.title, '') || ' ' || COALESCE(kf.description, '')) @@ plainto_tsquery('english', search_query)
    
    UNION ALL
    
    SELECT 
        k.id,
        'qa'::TEXT as type,
        k.question as title,
        k.response as description,
        ts_rank(to_tsvector('english', COALESCE(k.question, '') || ' ' || COALESCE(k.response, '')), plainto_tsquery('english', search_query)) as relevance_score,
        NULL as category_name,
        NULL as equipment_type,
        NULL as difficulty_level,
        NULL as file_type,
        NULL as tags
    FROM knowledge k
    WHERE to_tsvector('english', COALESCE(k.question, '') || ' ' || COALESCE(k.response, '')) @@ plainto_tsquery('english', search_query)
    
    ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get popular searches
CREATE OR REPLACE FUNCTION get_popular_searches(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    query TEXT,
    search_count BIGINT,
    avg_results FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.query,
        COUNT(*) as search_count,
        AVG(sh.result_count) as avg_results
    FROM search_history sh
    WHERE sh.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY sh.query
    ORDER BY search_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id_param TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_searches BIGINT,
    total_favorites BIGINT,
    most_searched_category TEXT,
    favorite_file_types TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM search_history WHERE user_id = user_id_param AND created_at >= NOW() - INTERVAL '1 day' * days_back) as total_searches,
        (SELECT COUNT(*) FROM favorite_resources WHERE user_id = user_id_param AND created_at >= NOW() - INTERVAL '1 day' * days_back) as total_favorites,
        (SELECT kc.name 
         FROM search_history sh
         JOIN knowledge_files kf ON kf.title ILIKE '%' || sh.query || '%'
         JOIN knowledge_categories kc ON kf.category_id = kc.id
         WHERE sh.user_id = user_id_param 
         AND sh.created_at >= NOW() - INTERVAL '1 day' * days_back
         GROUP BY kc.name
         ORDER BY COUNT(*) DESC
         LIMIT 1) as most_searched_category,
        (SELECT ARRAY_AGG(DISTINCT kf.file_type)
         FROM favorite_resources fr
         JOIN knowledge_files kf ON fr.resource_id = kf.id
         WHERE fr.user_id = user_id_param 
         AND fr.resource_type = 'file'
         AND fr.created_at >= NOW() - INTERVAL '1 day' * days_back) as favorite_file_types;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust based on your Supabase setup)
-- These are typically handled by Supabase automatically, but you can add them if needed
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your needs)
CREATE POLICY "Allow public read access to knowledge categories" ON knowledge_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to knowledge files" ON knowledge_files
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage their search history" ON search_history
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to manage their favorites" ON favorite_resources
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to manage their preferences" ON user_preferences
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to log their usage" ON usage_analytics
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow authenticated users to view their usage" ON usage_analytics
    FOR SELECT USING (auth.uid()::text = user_id);

-- Insert some sample data for testing
INSERT INTO knowledge_files (title, description, file_path, file_type, file_size, equipment_type, difficulty_level, estimated_time, tags) VALUES
('Treadmill Belt Replacement', 'Step-by-step guide for replacing treadmill belts', 'knowledge/treadmill-belt-replacement.mp4', 'video/mp4', 52428800, 'Treadmill', 'intermediate', 45, ARRAY['treadmill', 'belt', 'replacement', 'maintenance']),
('Elliptical Maintenance Guide', 'Complete maintenance guide for elliptical machines', 'knowledge/elliptical-maintenance.pdf', 'application/pdf', 2097152, 'Elliptical', 'beginner', 30, ARRAY['elliptical', 'maintenance', 'cleaning', 'lubrication']),
('Weight Machine Safety Checklist', 'Safety procedures for weight training equipment', 'knowledge/weight-machine-safety.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1048576, 'Weight Machines', 'beginner', 15, ARRAY['safety', 'weights', 'checklist', 'inspection']),
('Pool Chemical Balance Guide', 'How to maintain proper chemical balance in swimming pools', 'knowledge/pool-chemical-guide.pdf', 'application/pdf', 1572864, 'Pool Equipment', 'advanced', 60, ARRAY['pool', 'chemicals', 'balance', 'water quality'])
ON CONFLICT (file_path) DO NOTHING;

-- Create a view for easy access to categorized knowledge
CREATE OR REPLACE VIEW knowledge_overview AS
SELECT 
    kf.id,
    kf.title,
    kf.description,
    kf.file_type,
    kf.equipment_type,
    kf.difficulty_level,
    kf.estimated_time,
    kf.tags,
    kc.name as category_name,
    kc.color as category_color,
    kf.created_at
FROM knowledge_files kf
LEFT JOIN knowledge_categories kc ON kf.category_id = kc.id
ORDER BY kf.created_at DESC;

-- Create a view for search statistics
CREATE OR REPLACE VIEW search_statistics AS
SELECT 
    DATE_TRUNC('day', created_at) as search_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(result_count) as avg_results
FROM search_history
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY search_date DESC;

COMMENT ON TABLE knowledge_categories IS 'Categories for organizing knowledge resources';
COMMENT ON TABLE knowledge_files IS 'Files and resources in the knowledge base';
COMMENT ON TABLE search_history IS 'User search history for analytics';
COMMENT ON TABLE favorite_resources IS 'User favorite resources';
COMMENT ON TABLE user_preferences IS 'User preferences and settings';
COMMENT ON TABLE usage_analytics IS 'User activity analytics';

COMMENT ON FUNCTION search_knowledge_base(TEXT) IS 'Search knowledge base with full-text search capabilities';
COMMENT ON FUNCTION get_popular_searches(INTEGER) IS 'Get most popular searches in the last N days';
COMMENT ON FUNCTION get_user_activity_summary(TEXT, INTEGER) IS 'Get user activity summary for the last N days';