const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'maintenance.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create Equipment table
    const createEquipmentTable = `
      CREATE TABLE IF NOT EXISTS Equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        location TEXT,
        photo_url TEXT,
        last_maintenance DATETIME,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Tasks table
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'normal',
        category TEXT,
        equipment_id INTEGER,
        assigned_to TEXT,
        assignment_date DATETIME,
        estimated_time TEXT,
        location TEXT,
        creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completion_date DATETIME,
        FOREIGN KEY (equipment_id) REFERENCES Equipment(id)
      )
    `;

    // Create Analyses table
    const createAnalysesTable = `
      CREATE TABLE IF NOT EXISTS Analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER,
        photo_url TEXT,
        analysis_text TEXT,
        confidence REAL,
        ai_model TEXT,
        recommendations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES Equipment(id)
      )
    `;

    // Create Agent Memory table
    const createAgentMemoryTable = `
      CREATE TABLE IF NOT EXISTS AgentMemory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_type TEXT NOT NULL,
        memory_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Photos table
    const createPhotosTable = `
      CREATE TABLE IF NOT EXISTS Photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER,
        filename TEXT NOT NULL,
        original_name TEXT,
        file_size INTEGER,
        mime_type TEXT,
        file_path TEXT,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ai_analysis TEXT,
        task_id INTEGER,
        description TEXT,
        FOREIGN KEY (equipment_id) REFERENCES Equipment(id),
        FOREIGN KEY (task_id) REFERENCES Tasks(id)
      )
    `;

    // Voice Commands tables
    const createVoiceCommandsTable = `
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
      )
    `;

    const createVoiceTrainingDataTable = `
      CREATE TABLE IF NOT EXISTS voice_training_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command_text TEXT NOT NULL,
        expected_action TEXT NOT NULL,
        expected_parameters TEXT,
        user_feedback TEXT,
        training_session_id TEXT,
        accuracy_score REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createVoiceCustomCommandsTable = `
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
      )
    `;

    const createVoiceAnalyticsTable = `
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
      )
    `;

    // Execute all table creation statements
    const tables = [
      { name: 'Equipment', sql: createEquipmentTable },
      { name: 'Tasks', sql: createTasksTable },
      { name: 'Analyses', sql: createAnalysesTable },
      { name: 'AgentMemory', sql: createAgentMemoryTable },
      { name: 'Photos', sql: createPhotosTable },
      { name: 'voice_commands', sql: createVoiceCommandsTable },
      { name: 'voice_training_data', sql: createVoiceTrainingDataTable },
      { name: 'voice_custom_commands', sql: createVoiceCustomCommandsTable },
      { name: 'voice_analytics', sql: createVoiceAnalyticsTable }
    ];

    // Migration function to add missing columns
    function migrateTables() {
      return new Promise((resolve, reject) => {
        const migrations = [
          // Add missing columns to Photos table
          "ALTER TABLE Photos ADD COLUMN file_path TEXT",
          "ALTER TABLE Photos ADD COLUMN upload_date DATETIME DEFAULT CURRENT_TIMESTAMP",
          "ALTER TABLE Photos ADD COLUMN ai_analysis TEXT",
          "ALTER TABLE Photos ADD COLUMN task_id INTEGER",
          "ALTER TABLE Photos ADD COLUMN description TEXT",
          
          // Add missing columns to Tasks table
          "ALTER TABLE Tasks ADD COLUMN category TEXT",
          "ALTER TABLE Tasks ADD COLUMN assignment_date DATETIME",
          "ALTER TABLE Tasks ADD COLUMN estimated_time TEXT",
          "ALTER TABLE Tasks ADD COLUMN location TEXT",
          "ALTER TABLE Tasks ADD COLUMN creation_date DATETIME DEFAULT CURRENT_TIMESTAMP"
        ];

        let completed = 0;
        migrations.forEach((migration, index) => {
          db.run(migration, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              console.log(`⚠️ Migration ${index + 1} failed (may already exist): ${err.message}`);
            }
            completed++;
            if (completed === migrations.length) {
              resolve();
            }
          });
        });
      });
    }

    let completed = 0;
    const total = tables.length;

    tables.forEach(table => {
      db.run(table.sql, (err) => {
        if (err) {
          console.error(`❌ Error creating ${table.name} table:`, err.message);
          reject(err);
        } else {
          console.log(`✅ ${table.name} table ready`);
          completed++;
          
          if (completed === total) {
            console.log('🎉 All database tables initialized successfully');
            
            // Run migrations
            migrateTables().then(() => {
              console.log('✅ Database migrations completed');
              resolve();
            }).catch((err) => {
              console.error('❌ Migration error:', err);
              resolve(); // Continue anyway
            });
          }
        }
      });
    });
  });
}

// Helper function to run queries
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run single queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Close database connection
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Database connection closed');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  query,
  run,
  closeDatabase
}; 