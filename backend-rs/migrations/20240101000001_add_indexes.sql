-- Add indexes to frequently filtered columns in maintenance_tasks
CREATE INDEX idx_maintenance_tasks_priority ON maintenance_tasks(priority);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_equipment_id ON maintenance_tasks(equipment_id);

-- Add indexes to equipment table
CREATE INDEX idx_equipment_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_created_at ON equipment(created_at);
