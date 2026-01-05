use tauri::State;
use crate::db::{self, AppState, Equipment, OfflineLog, TaskResolution, EquipmentStats};
use crate::auth::{Session, UserRole};

// ==========================================
// Authentication Commands
// ==========================================

/// Login with username and password
#[tauri::command]
pub fn login(state: State<AppState>, username: String, password: String) -> Result<Session, String> {
    // Get user from database
    let user = db::get_user_by_username(&state, &username)?
        .ok_or_else(|| "Invalid username or password".to_string())?;

    // Verify password
    let is_valid = crate::auth::verify_password(&password, &user.password_hash)?;
    if !is_valid {
        return Err("Invalid username or password".to_string());
    }

    // Create session
    let session = state.auth.create_session(&user);

    Ok(session)
}

/// Logout - invalidate session
#[tauri::command]
pub fn logout(state: State<AppState>, token: String) -> Result<String, String> {
    state.auth.logout(&token);
    Ok("Logged out successfully".to_string())
}

/// Validate session token
#[tauri::command]
pub fn validate_session(state: State<AppState>, token: String) -> Result<Session, String> {
    state
        .auth
        .validate_session(&token)
        .ok_or_else(|| "Invalid or expired session".to_string())
}

/// Create a new user (Admin only)
#[tauri::command]
pub fn create_user(
    state: State<AppState>,
    token: String,
    username: String,
    password: String,
    role: String,
) -> Result<String, String> {
    // Verify admin permission
    if !state.auth.has_role(&token, UserRole::Admin) {
        return Err("Permission denied: Admin role required".to_string());
    }

    let user_role = match role.as_str() {
        "Admin" => UserRole::Admin,
        "Worker" => UserRole::Worker,
        _ => return Err("Invalid role".to_string()),
    };

    db::create_user(&state, username, password, user_role)
}

// ==========================================
// Authentication Middleware Helper
// ==========================================

/// Verify that the user has the required role
fn require_role(state: &State<AppState>, token: &str, role: UserRole) -> Result<(), String> {
    if !state.auth.has_role(token, role) {
        return Err("Permission denied".to_string());
    }
    Ok(())
}

// ==========================================
// Database Commands (with authentication)
// ==========================================

// ==========================================
// Equipment Commands (Async)
// ==========================================

#[tauri::command]
pub async fn get_equipment_stats(state: State<'_, AppState>) -> Result<EquipmentStats, String> {
    db::get_stats(&state).await
}

#[tauri::command]
pub async fn get_equipment_list(state: State<'_, AppState>) -> Result<Vec<Equipment>, String> {
    db::get_all_equipment(&state).await
}

#[tauri::command]
pub async fn add_equipment(state: State<'_, AppState>, name: String, status: String, health: f32) -> Result<String, String> {
    db::create_equipment(&state, name, status, health).await
}

#[tauri::command]
pub async fn update_equipment_status(state: State<'_, AppState>, id: i32, status: String) -> Result<String, String> {
    db::update_equipment_status(&state, id, status).await
}

#[tauri::command]
pub async fn delete_equipment(state: State<'_, AppState>, id: i32) -> Result<String, String> {
    db::delete_equipment(&state, id).await
}

// ==========================================
// Task Commands (Async)
// ==========================================

#[tauri::command]
pub async fn get_tasks(state: State<'_, AppState>) -> Result<Vec<db::Task>, String> {
    db::get_tasks(&state).await
}

#[tauri::command]
pub async fn add_task(state: State<'_, AppState>, description: String, priority: i32, category: String) -> Result<String, String> {
    db::create_task(&state, description, priority, category).await
}

#[tauri::command]
pub async fn toggle_task(state: State<'_, AppState>, id: i32) -> Result<String, String> {
    db::toggle_task_status(&state, id).await
}

#[tauri::command]
pub async fn delete_task(state: State<'_, AppState>, id: i32) -> Result<String, String> {
    db::delete_task(&state, id).await
}

// ==========================================
// Logs Commands (Async)
// ==========================================

#[tauri::command]
pub async fn save_offline_log(state: State<'_, AppState>, equipment_id: String, action: String) -> Result<String, String> {
    db::save_log(&state, equipment_id, action).await
}

#[tauri::command]
pub async fn get_offline_logs(state: State<'_, AppState>) -> Result<Vec<OfflineLog>, String> {
    db::get_logs(&state).await
}

// ==========================================
// Knowledge Loop Commands (Async)
// ==========================================

#[tauri::command]
pub async fn save_task_resolution(state: State<'_, AppState>, description: String, category: String, solution: String) -> Result<String, String> {
    db::save_resolution(&state, description, category, solution).await
}

#[tauri::command]
pub async fn find_similar_fixes(state: State<'_, AppState>, query: String) -> Result<Vec<TaskResolution>, String> {
    db::find_similar_resolutions(&state, query).await
}

// ==========================================
// Parts Inventory Commands (Async)
// ==========================================

#[tauri::command]
pub async fn get_parts(state: State<'_, AppState>) -> Result<Vec<db::Part>, String> {
    db::get_all_parts(&state).await
}

#[tauri::command]
pub async fn get_parts_paginated(
    state: State<'_, AppState>,
    page: i32,
    page_size: i32,
    category_filter: Option<String>,
    search_query: Option<String>,
) -> Result<db::PaginatedResult<db::Part>, String> {
    db::get_parts_paginated(&state, page, page_size, category_filter, search_query).await
}

#[tauri::command]
pub async fn add_part(
    state: State<'_, AppState>,
    name: String,
    category: String,
    part_type: Option<String>,
    manufacturer: Option<String>,
    part_number: Option<String>,
    quantity: i32,
    min_quantity: i32,
    lead_time_days: i32,
    location: String,
) -> Result<String, String> {
    db::create_part(&state, name, category, part_type, manufacturer, part_number, quantity, min_quantity, lead_time_days, location).await
}

#[tauri::command]
pub async fn update_part_quantity(state: State<'_, AppState>, id: i32, quantity_change: i32) -> Result<String, String> {
    println!("📦 Updating part {} quantity by {}", id, quantity_change);
    db::update_part_quantity(&state, id, quantity_change).await
}

#[tauri::command]
pub async fn update_part_location(state: State<'_, AppState>, id: i32, location: String) -> Result<String, String> {
    db::update_part_location(&state, id, location).await
}

#[tauri::command]
pub async fn delete_part(state: State<'_, AppState>, id: i32) -> Result<String, String> {
    db::delete_part(&state, id).await
}

#[tauri::command]
pub async fn get_incoming_orders(state: State<'_, AppState>) -> Result<Vec<db::IncomingOrder>, String> {
    db::get_incoming_orders(&state).await
}

#[tauri::command]
pub async fn get_low_stock_parts(state: State<'_, AppState>) -> Result<Vec<db::Part>, String> {
    db::get_low_stock_parts(&state).await
}

#[tauri::command]
pub async fn receive_order(state: State<'_, AppState>, id: i32) -> Result<String, String> {
    db::receive_order(&state, id).await
}

#[tauri::command]
pub async fn export_inventory_csv(state: State<'_, AppState>) -> Result<String, String> {
    let parts = db::get_all_parts(&state).await?;

    let mut wtr = csv::Writer::from_writer(vec![]);

    // Header
    wtr.write_record(&["ID", "Name", "Part Number", "Category", "Location", "Quantity", "Min Stock", "Manufacturer", "Cost", "Supplier"])
        .map_err(|e| e.to_string())?;

    for p in parts {
        wtr.write_record(&[
            p.id.to_string(),
            p.name,
            p.part_number.unwrap_or_default(),
            p.category,
            p.location.unwrap_or_default(),
            p.quantity.to_string(),
            p.min_quantity.to_string(),
            p.manufacturer.unwrap_or_default(),
            p.unit_cost.map(|c| c.to_string()).unwrap_or_default(),
            p.supplier.unwrap_or_default(),
        ])
        .map_err(|e| e.to_string())?;
    }

    let data = String::from_utf8(wtr.into_inner().map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    Ok(data)
}

// ==========================================
// Demo/Admin Tools (Async)
// ==========================================

#[tauri::command]
pub async fn seed_database(state: State<'_, AppState>) -> Result<String, String> {
    crate::db_seeds::seed_demo_data(&state).await
}

#[tauri::command]
pub async fn seed_production_database(state: State<'_, AppState>) -> Result<String, String> {
    crate::db_seeds::seed_production_data(&state).await
}

#[tauri::command]
pub async fn reset_database(state: State<'_, AppState>) -> Result<String, String> {
    crate::db_seeds::clear_all_data(&state).await
}

#[tauri::command]
pub async fn switch_demo_mode(state: State<'_, AppState>, enable: bool) -> Result<String, String> {
    crate::db_seeds::switch_demo_mode(&state, enable).await
}

// ==========================================
// Audit Logging
// ==========================================

#[tauri::command]
pub fn get_audit_logs(state: State<AppState>, token: String) -> Result<Vec<String>, String> {
    // Verify admin permission
    if !state.auth.has_role(&token, UserRole::Admin) {
        return Err("Permission denied: Admin role required".to_string());
    }
    
    // Return recent audit log entries
    // In a full implementation, this would query the database
    Ok(vec![
        "System initialized".to_string(),
        "Database connection established".to_string(),
    ])
}

