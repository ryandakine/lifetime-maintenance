use crate::db::AppState;

/// Load Demo Data: Populated inventory with quantities (looks used for 6 months)
pub async fn seed_demo_data(state: &AppState) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    // Clear existing parts
    client.execute("DELETE FROM parts", &[]).await.map_err(|e| e.to_string())?;

    // Demo data: Populated with realistic quantities from seed_full.sql
    let demo_parts_sql = include_str!("../../../database/seed_full.sql");

    // Extract only INSERT statements (skip CREATE TABLE, etc.)
    let insert_statements: String = demo_parts_sql
        .lines()
        .filter(|line| line.trim().starts_with("INSERT INTO parts"))
        .map(|line| {
            // PostgreSQL uses $1, $2 instead of ?1, ?2 - but for VALUES we can keep as-is
            line.to_string()
        })
        .collect::<Vec<String>>()
        .join(";\n");

    // Execute all INSERT statements as a batch
    client.batch_execute(&insert_statements).await
        .map_err(|e| format!("Failed to load demo data: {}", e))?;

    Ok("✅ DEMO MODE: Loaded populated inventory (looks like 6 months of use)".to_string())
}

/// Load Production Data: Blank inventory ready for initial audit
pub async fn seed_production_database(state: &AppState) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    // Clear existing parts
    client.execute("DELETE FROM parts", &[]).await.map_err(|e| e.to_string())?;

    // Production data: All quantities = 0, ready for initial count
    let live_parts_sql = include_str!("../../../database/seed_live_parts.sql");

    // Execute all INSERT statements as a batch
    client.batch_execute(live_parts_sql).await
        .map_err(|e| format!("Failed to load production data: {}", e))?;

    Ok("✅ LIVE MODE: Loaded blank inventory ready for initial audit".to_string())
}

/// Clear all data from the database
pub async fn clear_all_data(state: &AppState) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client.execute("DELETE FROM parts", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM incoming_orders", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM equipment", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM tasks", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM logs", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM task_resolutions", &[]).await.map_err(|e| e.to_string())?;

    Ok("✅ All data cleared from database".to_string())
}

/// Switch between demo (populated) and live (blank) modes
pub async fn switch_demo_mode(state: &AppState, enable: bool) -> Result<String, String> {
    if enable {
        seed_demo_data(state).await
    } else {
        seed_production_database(state).await
    }
}
