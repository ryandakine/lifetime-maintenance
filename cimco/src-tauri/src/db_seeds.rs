use crate::db::AppState;
use rusqlite::params;

/// Load Demo Data: Populated inventory with quantities (looks used for 6 months)
pub fn seed_demo_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    // Clear existing parts
    conn.execute("DELETE FROM parts", []).map_err(|e| e.to_string())?;

    // Demo data: Populated with realistic quantities from seed_full.sql
    let demo_parts = include_str!("../../../database/seed_full.sql");

    // Execute the SQL seed file
    conn.execute_batch(demo_parts)
        .map_err(|e| format!("Failed to load demo data: {}", e))?;

    Ok("✅ DEMO MODE: Loaded populated inventory (looks like 6 months of use)".to_string())
}

/// Load Production Data: Blank inventory ready for initial audit
pub fn seed_production_data(state: &AppState) -> Result<String, String> {
    let conn = state.db.get().map_err(|e| format!("Database pool error: {}", e))?;

    // Clear existing parts
    conn.execute("DELETE FROM parts", []).map_err(|e| e.to_string())?;

    // Production data: All quantities = 0, ready for initial count
    // This uses the same parts structure but with blank quantities
    let parts_sql = "INSERT INTO parts (id, name, description, category, part_type, manufacturer, part_number, quantity, min_quantity, location, wear_rating, unit_cost, supplier, lead_time_days) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)";

    // Read from seed_full.sql and modify quantities to 0
    let seed_content = include_str!("../../../database/seed_full.sql");

    for line in seed_content.lines() {
        if line.trim().starts_with("INSERT INTO parts VALUES") {
            // Parse the INSERT statement
            if let Some(values_start) = line.find('(') {
                if let Some(values_end) = line.rfind(')') {
                    let values_str = &line[values_start + 1..values_end];
                    let values: Vec<&str> = values_str.split(',').collect();

                    if values.len() >= 14 {
                        // Extract values and set quantity to 0
                        let id: i32 = values[0].trim().parse().unwrap_or(0);
                        let name = values[1].trim().trim_matches('\'');
                        let description = if values[2].trim() == "NULL" { None } else { Some(values[2].trim().trim_matches('\'').to_string()) };
                        let category = values[3].trim().trim_matches('\'');
                        let part_type = if values[4].trim() == "NULL" { None } else { Some(values[4].trim().trim_matches('\'').to_string()) };
                        let manufacturer = if values[5].trim() == "NULL" { None } else { Some(values[5].trim().trim_matches('\'').to_string()) };
                        let part_number = if values[6].trim() == "NULL" { None } else { Some(values[6].trim().trim_matches('\'').to_string()) };
                        let min_quantity: i32 = values[8].trim().parse().unwrap_or(1);
                        let location = if values[9].trim() == "NULL" { None } else { Some(values[9].trim().trim_matches('\'').to_string()) };
                        let wear_rating = if values[10].trim() == "NULL" { None::<i32> } else { values[10].trim().parse().ok() };
                        let unit_cost = if values[11].trim() == "NULL" { None::<f64> } else { values[11].trim().parse().ok() };
                        let supplier = if values[12].trim() == "NULL" { None } else { Some(values[12].trim().trim_matches('\'').to_string()) };
                        let lead_time_days: i32 = 7; // Default

                        conn.execute(
                            parts_sql,
                            params![
                                id,
                                name,
                                description,
                                category,
                                part_type,
                                manufacturer,
                                part_number,
                                0, // quantity = 0 for production
                                min_quantity,
                                location,
                                wear_rating,
                                unit_cost,
                                supplier,
                                lead_time_days
                            ],
                        ).map_err(|e| format!("Failed to insert part: {}", e))?;
                    }
                }
            }
        }
    }

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
