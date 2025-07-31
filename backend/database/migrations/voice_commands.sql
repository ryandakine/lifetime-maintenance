-- Voice Commands Table Migration
-- Stores voice command interactions, training data, and analytics

CREATE TABLE IF NOT EXISTS voice_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_text TEXT NOT NULL,
    action_type TEXT,
    parameters TEXT,
    confidence REAL DEFAULT 0.0,
    success BOOLEAN DEFAULT 1,
    processing_time_ms INTEGER,
    user_id TEXT,
    session_id TEXT,
    device_info TEXT,
    browser_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Training Data Table
-- Stores training data for improving voice recognition

CREATE TABLE IF NOT EXISTS voice_training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_text TEXT NOT NULL,
    expected_action TEXT NOT NULL,
    expected_parameters TEXT,
    user_feedback TEXT,
    training_session_id TEXT,
    accuracy_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Custom Commands Table
-- Stores user-defined custom voice commands

CREATE TABLE IF NOT EXISTS voice_custom_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    command_phrase TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_parameters TEXT,
    is_active BOOLEAN DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Analytics Table
-- Stores aggregated voice usage analytics

CREATE TABLE IF NOT EXISTS voice_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    total_commands INTEGER DEFAULT 0,
    successful_commands INTEGER DEFAULT 0,
    failed_commands INTEGER DEFAULT 0,
    average_confidence REAL DEFAULT 0.0,
    average_processing_time_ms INTEGER DEFAULT 0,
    most_used_actions TEXT,
    unique_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_commands_user_id ON voice_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_created_at ON voice_commands(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_commands_action_type ON voice_commands(action_type);
CREATE INDEX IF NOT EXISTS idx_voice_commands_success ON voice_commands(success);

CREATE INDEX IF NOT EXISTS idx_voice_training_session_id ON voice_training_data(training_session_id);
CREATE INDEX IF NOT EXISTS idx_voice_training_created_at ON voice_training_data(created_at);

CREATE INDEX IF NOT EXISTS idx_voice_custom_user_id ON voice_custom_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_custom_active ON voice_custom_commands(is_active);

CREATE INDEX IF NOT EXISTS idx_voice_analytics_date ON voice_analytics(date);

-- Insert sample data for testing
INSERT OR IGNORE INTO voice_commands (command_text, action_type, parameters, confidence, success, user_id) VALUES
('create task fix treadmill', 'create_task', '{"description": "fix treadmill"}', 0.95, 1, 'test_user'),
('go to tasks', 'navigate', '{"section": "tasks"}', 0.98, 1, 'test_user'),
('add oil filter to shopping', 'add_shopping_item', '{"item": "oil filter"}', 0.92, 1, 'test_user'),
('take photo', 'take_photo', '{}', 0.89, 1, 'test_user');

INSERT OR IGNORE INTO voice_custom_commands (user_id, command_phrase, action_type, action_parameters) VALUES
('test_user', 'emergency stop', 'emergency_stop', '{"priority": "high"}'),
('test_user', 'quick maintenance check', 'maintenance_check', '{"type": "quick"}'),
('test_user', 'report broken equipment', 'report_issue', '{"category": "broken_equipment"}');

-- Create triggers for analytics updates
CREATE TRIGGER IF NOT EXISTS update_voice_analytics_insert
AFTER INSERT ON voice_commands
BEGIN
    INSERT OR REPLACE INTO voice_analytics (
        date,
        total_commands,
        successful_commands,
        failed_commands,
        average_confidence,
        average_processing_time_ms,
        updated_at
    )
    SELECT 
        DATE(NEW.created_at),
        COUNT(*) + 1,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) + CASE WHEN NEW.success = 1 THEN 1 ELSE 0 END,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) + CASE WHEN NEW.success = 0 THEN 1 ELSE 0 END,
        (AVG(confidence) + NEW.confidence) / 2,
        (AVG(processing_time_ms) + COALESCE(NEW.processing_time_ms, 0)) / 2,
        CURRENT_TIMESTAMP
    FROM voice_commands 
    WHERE DATE(created_at) = DATE(NEW.created_at);
END; 