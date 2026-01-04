use crate::db::AppState;

pub fn seed_demo_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    // 1. Clear existing data
    conn.execute("DELETE FROM equipment", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM logs", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM parts", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM incoming_orders", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM task_resolutions", []).map_err(|e| e.to_string())?;

    // 2. Seed Equipment
    let equipment_sql = "INSERT INTO equipment (name, status, health_score) VALUES (?1, ?2, ?3)";
    let equipment = vec![
        ("Metso 98x104 Shredder", "active", 94.5),
        ("Infeed Conveyor Main", "active", 88.0),
        ("Downstream Eddy Current", "maintenance", 65.0),
        ("Z-Box Separator", "active", 91.2),
        ("Hydraulic Power Unit A", "active", 98.0),
        ("Hydraulic Power Unit B", "down", 15.0),
        ("Radial Stacker East", "active", 82.5),
        ("Truck Scale Inbound", "active", 100.0),
        ("Truck Scale Outbound", "active", 99.0),
        ("Overhead Crane 5T", "maintenance", 45.0),
    ];
    for (name, status, score) in equipment {
        conn.execute(equipment_sql, rusqlite::params![name, status, score]).map_err(|e| e.to_string())?;
    }

    // 3. Seed Inventory Parts
    // 1. Reset everything
    clear_all_data(state)?;
    
    // 2. Load Production Parts first (so Demo has real parts too)
    let _ = seed_production_data(state)?;

    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    // 3. Add Fake Equipment
    conn.execute(
        "INSERT INTO equipment (name, status, health_score, last_maintenance, next_maintenance, description) VALUES 
        ('Metso Shredder 80/104', 'active', 92.5, '2024-01-15', '2024-02-15', 'Main output shredder, critical asset.'),
        ('Lindemann Shear', 'maintenance', 45.0, '2023-12-20', '2024-01-20', 'Hydraulic shear for heavy steel.'),
        ('Cat 950 Loader', 'active', 88.0, '2024-01-10', '2024-03-10', 'Yard loader #3'),
        ('Conveyor Belt 4A', 'down', 12.0, '2023-11-05', '2024-01-05', 'Main feed conveyor - torn belt.')",
        (),
    ).map_err(|e| e.to_string())?;

    // 4. Add Fake Tasks
    conn.execute(
        "INSERT INTO tasks (description, priority, category, status, created_at) VALUES 
        ('Inspect Main Rotor Bearings', 3, 'Maintenance', 'pending', datetime('now')),
        ('Replace Hydraulic Filter on Shear', 2, 'Repair', 'pending', datetime('now', '-1 day')),
        ('Weekly Safety Walkthrough', 1, 'Safety', 'completed', datetime('now', '-2 days'))",
        (),
    ).map_err(|e| e.to_string())?;

    // 5. Add Fake Logs
    conn.execute(
        "INSERT INTO offline_logs (equipment_id, action, timestamp, synced) VALUES 
        ('1', 'Routine vibration check - passed', datetime('now', '-5 hours'), 1),
        ('2', 'Oil change completed - 50 gallons', datetime('now', '-2 days'), 1),
        ('4', 'Emergency Stop activated - Belt jam', datetime('now', '-1 day'), 0)",
        (),
    ).map_err(|e| e.to_string())?;

    Ok("✅ Demo Data Loaded! System is now live with sample activity.".to_string())
}

pub fn clear_all_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;
    
}
