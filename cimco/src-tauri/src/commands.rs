use tauri::State;
use crate::db::{self, AppState, Equipment, Task, OfflineLog, TaskResolution, EquipmentStats};

#[tauri::command]
pub fn get_equipment_stats(state: State<AppState>) -> Result<EquipmentStats, String> {
    db::get_stats(&state)
}

#[tauri::command]
pub fn get_equipment_list(state: State<AppState>) -> Result<Vec<Equipment>, String> {
    db::get_all_equipment(&state)
}

#[tauri::command]
pub fn add_equipment(state: State<AppState>, name: String, status: String, health: f32) -> Result<String, String> {
    db::create_equipment(&state, name, status, health)
}

#[tauri::command]
pub fn update_equipment_status(state: State<AppState>, id: i32, status: String) -> Result<String, String> {
    db::update_equipment_status(&state, id, status)
}

#[tauri::command]
pub fn delete_equipment(state: State<AppState>, id: i32) -> Result<String, String> {
    db::delete_equipment(&state, id)
}

// Task Commands
#[tauri::command]
pub fn get_tasks(state: State<AppState>) -> Result<Vec<db::Task>, String> {
    db::get_tasks(&state)
}

#[tauri::command]
pub fn add_task(state: State<AppState>, description: String, priority: i32, category: String) -> Result<String, String> {
    db::create_task(&state, description, priority, category)
}

#[tauri::command]
pub fn toggle_task(state: State<AppState>, id: i32) -> Result<String, String> {
    db::toggle_task_status(&state, id)
}

#[tauri::command]
pub fn delete_task(state: State<AppState>, id: i32) -> Result<String, String> {
    db::delete_task(&state, id)
}

// Database commands using the new db module
#[tauri::command]
pub fn save_offline_log(state: State<AppState>, equipment_id: String, action: String) -> Result<String, String> {
    db::save_log(&state, equipment_id, action)
}

#[tauri::command]
pub fn get_offline_logs(state: State<AppState>) -> Result<Vec<OfflineLog>, String> {
    db::get_logs(&state)
}

// Knowledge Loop Commands
#[tauri::command]
pub fn save_task_resolution(state: State<AppState>, description: String, category: String, solution: String) -> Result<String, String> {
    db::save_resolution(&state, description, category, solution)
}

#[tauri::command]
pub fn find_similar_fixes(state: State<AppState>, query: String) -> Result<Vec<TaskResolution>, String> {
    db::find_similar_resolutions(&state, query)
}
