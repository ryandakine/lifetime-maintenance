-- Add performance indexes for photo tables
-- These indexes will significantly improve query performance as photo count grows

-- Equipment Photos Indexes
CREATE INDEX IF NOT EXISTS idx_equipment_photos_equipment_id ON equipment_photos(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_photos_uploaded_at ON equipment_photos(uploaded_at);

-- Task Photos Indexes  
CREATE INDEX IF NOT EXISTS idx_task_photos_task_id ON task_photos(task_id);
CREATE INDEX IF NOT EXISTS idx_task_photos_uploaded_at ON task_photos(uploaded_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_equipment_photos_equipment_uploaded ON equipment_photos(equipment_id, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_photos_task_uploaded ON task_photos(task_id, uploaded_at DESC);
