use rusqlite::{params, Connection};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use serde::{Serialize, Deserialize};

pub struct AppState {
    pub db: Pool<SqliteConnectionManager>,
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
    pub id: i32,
    pub description: String,
    pub priority: i32, // 1=Low, 2=Medium, 3=High, 4=Critical
    pub category: String,
    pub status: String, // "pending", "complete"
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Equipment {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub health_score: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TaskResolution {
    pub id: i32,
    pub original_description: String,
    pub category: String,
    pub solution_steps: String,
    pub created_at: String,
}

pub fn init() -> Result<AppState, Box<dyn std::error::Error>> {
    let mut path = std::path::PathBuf::from("cimco_offline.db");
    
    // Dev mode fallback: if we can't find it here, check src-tauri (where it might be in git)
    if !path.exists() {
        let dev_path = std::path::Path::new("src-tauri/cimco_offline.db");
        if dev_path.exists() {
            println!("Database: Found database in src-tauri/");
            path = dev_path.to_path_buf();
        } else {
            // Also check parent (if running from src-tauri/target/debug)
            let parent_path = std::path::Path::new("../src-tauri/cimco_offline.db");
            if parent_path.exists() {
                 println!("Database: Found database in ../src-tauri/");
                 path = parent_path.to_path_buf();
            }
        }
    }

    println!("Database: Opening {:?}", path);
    // Connection Pool Setup
    let manager = SqliteConnectionManager::file(&path);
    let pool = Pool::new(manager)?;
    
    let conn = pool.get()?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;", [])?;
    
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

    // Create task_resolutions table (AI Knowledge Loop)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS task_resolutions (
            id INTEGER PRIMARY KEY,
            original_description TEXT NOT NULL,
            category TEXT NOT NULL,
            solution_steps TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create parts inventory tables
    init_parts_table(&conn)?;

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
        db: pool,
    })
}

// Equipment CRUD
pub fn get_stats(state: &AppState) -> Result<EquipmentStats, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
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

pub fn get_all_equipment(state: &AppState) -> Result<Vec<Equipment>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
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
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "INSERT INTO equipment (name, status, health_score) VALUES (?1, ?2, ?3)",
        params![name, status, health],
    ).map_err(|e| format!("Failed to insert equipment: {}", e))?;
    Ok("Success".to_string())
}

pub fn update_equipment_status(state: &AppState, id: i32, status: String) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "UPDATE equipment SET status = ?1 WHERE id = ?2",
        params![status, id],
    ).map_err(|e| format!("Failed to update equipment: {}", e))?;
    Ok("Success".to_string())
}

pub fn delete_equipment(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "DELETE FROM equipment WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Failed to delete equipment: {}", e))?;
    Ok("Success".to_string())
}

// Task CRUD
pub fn get_tasks(state: &AppState) -> Result<Vec<Task>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
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
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "INSERT INTO tasks (description, priority, category, status) VALUES (?1, ?2, ?3, 'pending')",
        params![description, priority, category],
    ).map_err(|e| format!("Failed to insert task: {}", e))?;
    Ok("Success".to_string())
}

pub fn toggle_task_status(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
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
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "DELETE FROM tasks WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Failed to delete task: {}", e))?;
    Ok("Success".to_string())
}

// Log CRUD
pub fn save_log(state: &AppState, equipment_id: String, action: String) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
    conn.execute(
        "INSERT INTO logs (equipment_id, action) VALUES (?1, ?2)",
        params![equipment_id, action],
    ).map_err(|e| format!("Failed to insert log: {}", e))?;
    
    Ok(format!("Saved to Offline Rust DB 🦀: {} - {}", equipment_id, action))
}

pub fn get_logs(state: &AppState) -> Result<Vec<OfflineLog>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
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

// ==========================================
// AI Knowledge Loop CRUD
// ==========================================

/// Save a resolution when a task is completed
pub fn save_resolution(state: &AppState, description: String, category: String, solution: String) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "INSERT INTO task_resolutions (original_description, category, solution_steps) VALUES (?1, ?2, ?3)",
        params![description, category, solution],
    ).map_err(|e| format!("Failed to save resolution: {}", e))?;
    Ok("Resolution saved to knowledge base 🧠".to_string())
}

/// Find similar past resolutions using keyword matching
pub fn find_similar_resolutions(state: &AppState, query: String) -> Result<Vec<TaskResolution>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
    // Simple LIKE-based search (can be upgraded to FTS5 later)
    let search_term = format!("%{}%", query.to_lowercase());
    
    let mut stmt = conn.prepare(
        "SELECT id, original_description, category, solution_steps, created_at 
         FROM task_resolutions 
         WHERE LOWER(original_description) LIKE ?1 OR LOWER(category) LIKE ?1
         ORDER BY created_at DESC
         LIMIT 5"
    ).map_err(|e| format!("Failed to prepare query: {}", e))?;
    
    let iter = stmt.query_map(params![search_term], |row| {
        Ok(TaskResolution {
            id: row.get(0)?,
            original_description: row.get(1)?,
            category: row.get(2)?,
            solution_steps: row.get(3)?,
            created_at: row.get(4)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut results = Vec::new();
    for item in iter {
        if let Ok(r) = item {
            results.push(r);
        }
    }
    Ok(results)
}

// ==========================================
// Parts Inventory CRUD
// ==========================================

// ==========================================
// Parts Inventory CRUD
// ==========================================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Part {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub part_type: Option<String>,    // New: Upper, Lower, Wear Part
    pub manufacturer: Option<String>,  // New: Metzo, Linden
    pub part_number: Option<String>,
    pub quantity: i32,
    pub min_quantity: i32,
    pub lead_time_days: i32,          // New: For automated ordering triggers
    pub wear_rating: Option<i32>,     // New: 1-10 Scale
    pub location: Option<String>,
    pub unit_cost: Option<f64>,
    pub supplier: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct IncomingOrder {
    pub id: i32,
    pub part_name: Option<String>,
    pub order_number: Option<String>,
    pub tracking_number: Option<String>,
    pub supplier: Option<String>,
    pub quantity: i32,
    pub status: String,
    pub order_date: Option<String>,
    pub expected_delivery: Option<String>,
}

/// Initialize parts table (call from init())
pub fn init_parts_table(conn: &Connection) -> Result<(), rusqlite::Error> {
    // 1. Create table with FULL schema if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS parts (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            part_type TEXT,
            manufacturer TEXT,
            part_number TEXT,
            quantity INTEGER DEFAULT 0,
            min_quantity INTEGER DEFAULT 1,
            lead_time_days INTEGER DEFAULT 7,
            location TEXT,
            unit_cost REAL,
            supplier TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    
    // 2. Migration: Check for missing columns in existing table
    // We use PRAGMA table_info to get current columns
    let mut stmt = conn.prepare("PRAGMA table_info(parts)")?;
    let columns: Vec<String> = stmt.query_map([], |row| row.get(1))?
        .collect::<Result<Vec<String>, _>>()?;

    if !columns.contains(&"part_type".to_string()) {
        println!("Migrating DB: Adding part_type column to parts table 📦");
        conn.execute("ALTER TABLE parts ADD COLUMN part_type TEXT", [])?;
    }
    
    if !columns.contains(&"manufacturer".to_string()) {
        println!("Migrating DB: Adding manufacturer column to parts table 🏭");
        conn.execute("ALTER TABLE parts ADD COLUMN manufacturer TEXT", [])?;
    }
    
    if !columns.contains(&"lead_time_days".to_string()) {
        println!("Migrating DB: Adding lead_time_days column to parts table ⏳");
        conn.execute("ALTER TABLE parts ADD COLUMN lead_time_days INTEGER DEFAULT 7", [])?;
    }

    conn.execute(
        "CREATE TABLE IF NOT EXISTS incoming_orders (
            id INTEGER PRIMARY KEY,
            part_id INTEGER,
            part_name TEXT,
            order_number TEXT,
            tracking_number TEXT,
            supplier TEXT,
            quantity INTEGER DEFAULT 1,
            status TEXT DEFAULT 'ordered',
            order_date DATE,
            expected_delivery DATE,
            email_subject TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    
    // Seed some sample parts if table is empty
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM parts", [], |row| row.get(0))?;
    if count == 0 {
        let samples = vec![
            ("Shredder Hammer - Heavy Duty", "Shredder", "Hammer", "Metzo", 12, 5, "Bin A-1", 89.99, "SSI Shredding"),
            ("Shredder Hammer - Standard", "Shredder", "Hammer", "Linden", 8, 4, "Bin A-2", 65.00, "SSI Shredding"),
            ("Hydraulic Pump - Main", "Hydraulics", "Pump", "Metzo", 2, 1, "Shelf B-1", 450.00, "Grainger"),
            ("Hydraulic Cylinder Seal Kit", "Hydraulics", "Seal Kit", "Generic", 6, 3, "Bin B-3", 35.00, "Amazon"),
            ("Conveyor Belt - 24 inch", "General", "Wear Part", "Generic", 3, 1, "Rack C-1", 280.00, "MSC Direct"),
            ("Motor Bearing 6205", "Electrical", "Bearing", "SKF", 10, 4, "Bin D-2", 18.50, "Amazon"),
        ];
        
        for (name, cat, p_type, mfr, qty, min_qty, loc, cost, supplier) in samples {
            conn.execute(
                "INSERT INTO parts (name, category, part_type, manufacturer, quantity, min_quantity, location, unit_cost, supplier) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![name, cat, p_type, mfr, qty, min_qty, loc, cost, supplier],
            )?;
        }
        println!("🌱 Seeded parts table with sample inventory (New Schema)");
    }
    
    Ok(())
}

pub fn get_all_parts(state: &AppState) -> Result<Vec<Part>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, description, category, part_type, manufacturer, part_number, quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier 
         FROM parts ORDER BY category, name"
    ).map_err(|e| format!("Failed to prepare query: {}", e))?;
    
    let iter = stmt.query_map([], |row| {
        Ok(Part {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            category: row.get(3)?,
            part_type: row.get(4)?,
            manufacturer: row.get(5)?,
            part_number: row.get(6)?,
            quantity: row.get(7)?,
            min_quantity: row.get(8)?,
            lead_time_days: row.get(9)?,
            wear_rating: row.get(10)?,
            location: row.get(11)?,
            unit_cost: row.get(12)?,
            supplier: row.get(13)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut items = Vec::new();
    for item in iter {
        if let Ok(p) = item {
            items.push(p);
        }
    }
    Ok(items)
}

pub fn create_part(
    state: &AppState, 
    name: String, 
    category: String, 
    part_type: Option<String>,
    manufacturer: Option<String>,
    part_number: Option<String>,
    quantity: i32, 
    min_quantity: i32, 
    lead_time_days: i32,
    location: String
) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "INSERT INTO parts (name, category, part_type, manufacturer, part_number, quantity, min_quantity, lead_time_days, location) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![name, category, part_type, manufacturer, part_number, quantity, min_quantity, lead_time_days, location],
    ).map_err(|e| format!("Failed to insert part: {}", e))?;
    Ok("Part added ✅".to_string())
}

pub fn update_part_quantity(state: &AppState, id: i32, quantity_change: i32) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "UPDATE parts SET quantity = quantity + ?1 WHERE id = ?2",
        params![quantity_change, id],
    ).map_err(|e| format!("Failed to update quantity: {}", e))?;
    Ok("Quantity updated".to_string())
}

pub fn update_part_location(state: &AppState, id: i32, location: String) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute(
        "UPDATE parts SET location = ?1 WHERE id = ?2",
        params![location, id],
    ).map_err(|e| format!("Failed to update location: {}", e))?;
    Ok("Location updated".to_string())
}

pub fn delete_part(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    conn.execute("DELETE FROM parts WHERE id = ?1", params![id])
        .map_err(|e| format!("Failed to delete part: {}", e))?;
    Ok("Part deleted".to_string())
}

pub fn get_low_stock_parts(state: &AppState) -> Result<Vec<Part>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, description, category, part_type, manufacturer, part_number, quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier 
         FROM parts WHERE quantity <= min_quantity ORDER BY quantity ASC"
    ).map_err(|e| format!("Failed to prepare query: {}", e))?;
    
    let iter = stmt.query_map([], |row| {
        Ok(Part {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            category: row.get(3)?,
            part_type: row.get(4)?,
            manufacturer: row.get(5)?,
            part_number: row.get(6)?,
            quantity: row.get(7)?,
            min_quantity: row.get(8)?,
            lead_time_days: row.get(9)?,
            wear_rating: row.get(10)?,
            location: row.get(11)?,
            unit_cost: row.get(12)?,
            supplier: row.get(13)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut items = Vec::new();
    for item in iter {
        if let Ok(p) = item {
            items.push(p);
        }
    }
    Ok(items)
}

pub fn get_incoming_orders(state: &AppState) -> Result<Vec<IncomingOrder>, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
    let mut stmt = conn.prepare(
        "SELECT id, part_name, order_number, tracking_number, supplier, quantity, status, order_date, expected_delivery 
         FROM incoming_orders WHERE status != 'delivered' ORDER BY expected_delivery ASC"
    ).map_err(|e| format!("Failed to prepare query: {}", e))?;
    
    let iter = stmt.query_map([], |row| {
        Ok(IncomingOrder {
            id: row.get(0)?,
            part_name: row.get(1)?,
            order_number: row.get(2)?,
            tracking_number: row.get(3)?,
            supplier: row.get(4)?,
            quantity: row.get(5)?,
            status: row.get(6)?,
            order_date: row.get(7)?,
            expected_delivery: row.get(8)?,
        })
    }).map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut items = Vec::new();
    for item in iter {
        if let Ok(o) = item {
            items.push(o);
        }
    }
    Ok(items)
}

pub fn receive_order(state: &AppState, id: i32) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
    conn.execute(
        "UPDATE incoming_orders SET status = 'delivered' WHERE id = ?1",
        params![id],
    ).map_err(|e| format!("Failed to update order: {}", e))?;
    
    Ok("Order marked as delivered".to_string())
}
