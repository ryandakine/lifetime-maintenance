use crate::db::AppState;

/// Load Demo Data: Populated inventory with quantities (looks used for 6 months)
pub fn seed_demo_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    // Clear existing parts
    conn.execute("DELETE FROM parts", []).map_err(|e| e.to_string())?;

    // Demo data: Populated with realistic quantities from seed_full.sql
    let demo_parts_sql = include_str!("../../../database/seed_full.sql");

    // Extract only INSERT statements (skip CREATE TABLE, etc.)
    let insert_statements: String = demo_parts_sql
        .lines()
        .filter(|line| line.trim().starts_with("INSERT INTO parts"))
        .collect::<Vec<&str>>()
        .join("\n");

    // Execute all INSERT statements as a batch
    conn.execute_batch(&insert_statements)
        .map_err(|e| format!("Failed to load demo data: {}", e))?;

    Ok("✅ DEMO MODE: Loaded populated inventory (looks like 6 months of use)".to_string())
}

/// Load Production Data: Blank inventory ready for initial audit
pub fn seed_production_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    // Clear existing parts
    conn.execute("DELETE FROM parts", []).map_err(|e| e.to_string())?;

    // Production data: All quantities = 0, ready for initial count
    let live_parts_sql = include_str!("../../../database/seed_live_parts.sql");

    // Execute all INSERT statements as a batch
    conn.execute_batch(live_parts_sql)
        .map_err(|e| format!("Failed to load production data: {}", e))?;

    Ok("✅ LIVE MODE: Loaded blank inventory ready for initial audit".to_string())
}

/// Clear all data from the database
pub fn clear_all_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    conn.execute("DELETE FROM parts", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM incoming_orders", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM equipment", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM logs", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM task_resolutions", []).map_err(|e| e.to_string())?;

    Ok("✅ All data cleared from database".to_string())
}

/// Switch between demo (populated) and live (blank) modes
pub fn switch_demo_mode(state: &AppState, enable: bool) -> Result<String, String> {
    if enable {
        seed_demo_data(state)
    } else {
        seed_production_data(state)
    }
}
