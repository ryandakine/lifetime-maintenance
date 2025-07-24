-- Lifetime Fitness Maintenance PWA Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_list TEXT NOT NULL,
  project_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  items_json JSONB NOT NULL DEFAULT '[]',
  supplier_priority_json JSONB DEFAULT '{"primary": "Grainger", "quickPickup": "Home Depot", "alternatives": ["Lowe\'s", "Ace Hardware"]}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  notes TEXT,
  store_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (optional, for better organization)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table for photo analysis
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  response TEXT NOT NULL,
  purpose TEXT DEFAULT 'clarification' CHECK (purpose IN ('clarification', 'next_steps', 'verify_done')),
  upload_type TEXT DEFAULT 'file' CHECK (upload_type IN ('camera', 'file')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_task_id ON shopping_lists(task_id);

CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

CREATE INDEX IF NOT EXISTS idx_knowledge_user_id ON knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_task_id ON photos(task_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for work files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-files',
  'work-files',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for shopping_lists
CREATE POLICY "Users can view their own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own shopping lists" ON shopping_lists
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own shopping lists" ON shopping_lists
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for photos
CREATE POLICY "Users can view their own photos" ON photos
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for emails
CREATE POLICY "Users can view their own emails" ON emails
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own emails" ON emails
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own emails" ON emails
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own emails" ON emails
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for knowledge
CREATE POLICY "Users can view their own knowledge entries" ON knowledge
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own knowledge entries" ON knowledge
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own knowledge entries" ON knowledge
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own knowledge entries" ON knowledge
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'work-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'work-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'work-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'work-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for photos storage bucket
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample data for testing
INSERT INTO tasks (user_id, task_list, project_id, status, due_date, notes) VALUES
('current-user', 'Replace light bulbs in gym area', 'electrical', 'pending', CURRENT_DATE + INTERVAL '3 days', 'Need LED bulbs for energy efficiency'),
('current-user', 'Fix concrete crack in parking lot', 'concrete', 'in_progress', CURRENT_DATE + INTERVAL '1 week', 'Order concrete mix from Home Depot'),
('current-user', 'HVAC filter replacement', 'hvac', 'completed', CURRENT_DATE - INTERVAL '2 days', 'Filters replaced successfully');

INSERT INTO shopping_lists (user_id, items_json) VALUES
('current-user', '[
  {"name": "LED Light Bulbs", "grainger_part": "GR-LED123", "home_depot_aisle": "Aisle 15", "alternatives": ["CFL Bulbs", "Halogen Bulbs"], "store_address": "123 Main St, Denver, CO 80202"},
  {"name": "Concrete Mix", "grainger_part": "GR-CON456", "home_depot_aisle": "Aisle 8", "alternatives": ["Quick Setting Concrete", "High Strength Mix"], "store_address": "123 Main St, Denver, CO 80202"}
]');

INSERT INTO emails (user_id, to_email, subject, body, sent) VALUES
('current-user', 'manager@lifetime.com', 'Weekly Maintenance Report', 'Completed HVAC filter replacement and scheduled light bulb replacement.', true);

INSERT INTO knowledge (user_id, question, response) VALUES
('current-user', 'How to change a light bulb', '1. Turn off power\n2. Remove old bulb\n3. Install new bulb\n4. Test functionality\n\nTools needed: Screwdriver, ladder\nSupplies: New light bulb'); 