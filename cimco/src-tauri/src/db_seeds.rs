use crate::db::AppState;

/// Load Demo Data: Populated inventory with quantities
pub async fn seed_demo_data(state: &AppState) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    // Clear existing data first
    clear_all_data(state).await?;
    
    println!("🌱 Seeding DEMO data...");

    // Load seeds from SQL files
    let demo_parts_sql = include_str!("../../database/seed_full.sql");

    // Execute all INSERT statements as a batch
    client.batch_execute(demo_parts_sql).await
        .map_err(|e| format!("Failed to load demo data: {}", e))?;
    
    println!("✅ Database seeded with DEMO data");
    Ok("Database seeded with DEMO data".to_string())
}

/// Load Production Data: Blank inventory ready for initial audit
pub async fn seed_production_data(state: &AppState) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| e.to_string())?;

    // Clear existing data first
    clear_all_data(state).await?;

    println!("🌱 Seeding PRODUCTION data...");
    
    // Load seeds from SQL files
    let live_parts_sql = include_str!("../../database/seed_live_parts.sql");

    // Execute all INSERT statements as a batch
    client.batch_execute(live_parts_sql).await
        .map_err(|e| format!("Failed to load production data: {}", e))?;

    println!("✅ Database seeded with PRODUCTION data");
    Ok("Database seeded with PRODUCTION data".to_string())
}

/// Clear all data from the database (EXCEPT users)
pub async fn clear_all_data(state: &AppState) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    // Order matters for foreign keys if they exist
    client.execute("DELETE FROM task_resolutions", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM logs", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM tasks", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM equipment", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM incoming_orders", &[]).await.map_err(|e| e.to_string())?;
    client.execute("DELETE FROM parts", &[]).await.map_err(|e| e.to_string())?;
    // NOTE: We do NOT delete users or audit_logs to preserve access/history

    Ok("✅ All operational data cleared from database".to_string())
}

/// Switch between demo (populated) and live (blank) modes
pub async fn switch_demo_mode(state: &AppState, enable: bool) -> Result<String, String> {
    if enable {
        seed_demo_data(state).await
    } else {
        seed_production_data(state).await
    }
}
