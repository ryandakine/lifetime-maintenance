use rusqlite::{params, Connection};
use std::sync::Mutex;
use serde::{Serialize, Deserialize};

pub struct AppState {
    pub db: Mutex<Connection>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OfflineLog {
    pub id: Option<i32>,
    pub equipment_id: String,
    pub action: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EquipmentStats {
    pub total_equipment: i32,
    pub active_count: i32,
    pub maintenance_count: i32,
    pub down_count: i32,
    pub average_health: f32,
}

pub fn init() -> Result<AppState, Box<dyn std::error::Error>> {
    let conn = Connection::open("cimco_offline.db")?;
    
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
    pub id: i32,
    pub description: String,
    pub priority: i32, // 1=Low, 2=Medium, 3=High, 4=Critical
    pub category: String,
    pub status: String, // "pending", "complete"
    pub created_at: String,
}

pub fn init() -> Result<AppState, Box<dyn std::error::Error>> {
    let conn = Connection::open("cimco_offline.db")?;
    
    // Create logs table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY,
            equipment_id TEXT NOT NULL,
            action TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create equipment table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            health_score REAL
        )",
        [],
    )?;

    // Create tasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            priority INTEGER NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Seed Data (if empty)
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM equipment", [], |row| row.get(0))?;
    if count == 0 {
        // Seed some sample data
        let seed_sql = "INSERT INTO equipment (name, status, health_score) VALUES (?1, ?2, ?3)";
        let samples = vec![
            ("Conveyor Belt A", "active", 95.5),
            ("Hydraulic Press 1", "active", 88.0),
            ("Forklift 3", "maintenance", 60.0),
            ("Main Crane", "down", 12.5),
            ("Sorting Arm", "active", 92.0),
            ("Generator Backup", "active", 100.0),
            ("Scale 2", "down", 0.0),
            ("Pump Station", "active", 78.5),
        ];

        for (name, status, score) in samples {
            conn.execute(seed_sql, params![name, status, score])?;
        }
        println!("🌱 Seeded equipment table with initial data");
    }

    Ok(AppState {
        db: Mutex::new(conn),
    })
}

// ... existing equipment functions ...

// Task CRUD
pub fn get_tasks(state: &AppState) -> Result<Vec<Task>, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    
    let mut stmt = conn.prepare("SELECT id, description, priority, category, status, created_at FROM tasks ORDER BY status ASC, priority DESC, created_at DESC")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;
        
    let iter = stmt.query_map([], |row| {
        Ok(Task {
            id: row.get(0)?,
            description: row.get(1)?,
            priority: row.get(2)?,
            category: row.get(3)?,
            status: row.get(4)?,
            created_at: row.get(5)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut items = Vec::new();
    for i in iter {
        if let Ok(item) = i {
            items.push(item);
        }
    }
    Ok(items)
}

pub fn create_task(state: &AppState, description: String, priority: i32, category: String) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    conn.execute(
        "INSERT INTO tasks (description, priority, category, status) VALUES (?1, ?2, ?3, 'pending')",
        params![description, priority, category],
    ).map_err(|e| format!("Failed to insert task: {}", e))?;
    Ok("Success".to_string())
}

pub fn toggle_task_status(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    // First get current status
    let status: String = conn.query_row("SELECT status FROM tasks WHERE id = ?1", params![id], |row| row.get(0))
        .map_err(|e| format!("Task not found: {}", e))?;
        
    let new_status = if status == "pending" { "complete" } else { "pending" };
    
    conn.execute(
        "UPDATE tasks SET status = ?1 WHERE id = ?2",
        params![new_status, id],
    ).map_err(|e| format!("Failed to update task: {}", e))?;
    Ok("Success".to_string())
}

pub fn delete_task(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    conn.execute(
        "DELETE FROM tasks WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Failed to delete task: {}", e))?;
    Ok("Success".to_string())
}

pub fn save_log(state: &AppState, equipment_id: String, action: String) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    
    conn.execute(
        "INSERT INTO logs (equipment_id, action) VALUES (?1, ?2)",
        params![equipment_id, action],
    ).map_err(|e| format!("Failed to insert log: {}", e))?;
    
    Ok(format!("Saved to Offline Rust DB 🦀: {} - {}", equipment_id, action))
}

pub fn get_logs(state: &AppState) -> Result<Vec<OfflineLog>, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    
    let mut stmt = conn.prepare("SELECT id, equipment_id, action, timestamp FROM logs ORDER BY id DESC LIMIT 50")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;
        
    let log_iter = stmt.query_map([], |row| {
        Ok(OfflineLog {
            id: row.get(0)?,
            equipment_id: row.get(1)?,
            action: row.get(2)?,
            timestamp: row.get(3)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut logs = Vec::new();
    for log in log_iter {
        if let Ok(l) = log {
            logs.push(l);
        }
    }
    Ok(logs)
}

pub fn get_stats(state: &AppState) -> Result<EquipmentStats, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    
    // Calculate stats using SQL aggregation
    let total: i32 = conn.query_row("SELECT COUNT(*) FROM equipment", [], |row| row.get(0)).unwrap_or(0);
    let active: i32 = conn.query_row("SELECT COUNT(*) FROM equipment WHERE status = 'active'", [], |row| row.get(0)).unwrap_or(0);
    let maintenance: i32 = conn.query_row("SELECT COUNT(*) FROM equipment WHERE status = 'maintenance'", [], |row| row.get(0)).unwrap_or(0);
    let down: i32 = conn.query_row("SELECT COUNT(*) FROM equipment WHERE status = 'down'", [], |row| row.get(0)).unwrap_or(0);
    let avg_health: f32 = conn.query_row("SELECT AVG(health_score) FROM equipment", [], |row| row.get(0)).unwrap_or(0.0);

    Ok(EquipmentStats {
        total_equipment: total,
        active_count: active,
        maintenance_count: maintenance,
        down_count: down,
        average_health: avg_health,
    })
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Equipment {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub health_score: f32,
}

pub fn get_all_equipment(state: &AppState) -> Result<Vec<Equipment>, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    
    let mut stmt = conn.prepare("SELECT id, name, status, health_score FROM equipment ORDER BY id DESC")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;
        
    let iter = stmt.query_map([], |row| {
        Ok(Equipment {
            id: row.get(0)?,
            name: row.get(1)?,
            status: row.get(2)?,
            health_score: row.get(3)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut items = Vec::new();
    for i in iter {
        if let Ok(item) = i {
            items.push(item);
        }
    }
    Ok(items)
}

pub fn create_equipment(state: &AppState, name: String, status: String, health: f32) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    conn.execute(
        "INSERT INTO equipment (name, status, health_score) VALUES (?1, ?2, ?3)",
        params![name, status, health],
    ).map_err(|e| format!("Failed to insert equipment: {}", e))?;
    Ok("Success".to_string())
}

pub fn update_equipment_status(state: &AppState, id: i32, status: String) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    conn.execute(
        "UPDATE equipment SET status = ?1 WHERE id = ?2",
        params![status, id],
    ).map_err(|e| format!("Failed to update equipment: {}", e))?;
    Ok("Success".to_string())
}

pub fn delete_equipment(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    conn.execute(
        "DELETE FROM equipment WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Failed to delete equipment: {}", e))?;
    Ok("Success".to_string())
}
