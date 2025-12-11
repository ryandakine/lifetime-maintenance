use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(catch, js_namespace = ["window", "__TAURI__", "core"])]
    async fn invoke(cmd: &str, args: JsValue) -> Result<JsValue, JsValue>;
}

pub async fn invoke_command<T: Serialize, R: for<'de> Deserialize<'de>>(command: &str, args: &T) -> Result<R, String> {
    let args = to_value(args).map_err(|e| format!("Args ser error: {}", e))?;
    
    // invoke returns a Result<JsValue, JsValue> (Promise resolution/rejection)
    match invoke(command, args).await {
        Ok(val) => serde_wasm_bindgen::from_value(val).map_err(|e| format!("Result deser error: {}", e)),
        Err(err) => Err(format!("Tauri invoke error: {:?}", err)),
    }
}

// Stats Type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentStats {
    pub total_equipment: i32,
    pub active_count: i32,
    pub maintenance_count: i32,
    pub down_count: i32,
    pub average_health: f32,
}

pub async fn get_stats() -> Result<EquipmentStats, String> {
    invoke_command("get_equipment_stats", &()).await
}

// Camera Helper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraInfo {
    pub index: u32,
    pub name: String,
    pub description: String,
}

pub async fn get_cameras() -> Result<Vec<CameraInfo>, String> {
    invoke_command("get_connected_cameras", &()).await
}

// Offline Logs Helper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfflineLog {
    pub id: Option<i32>,
    pub equipment_id: String,
    pub action: String,
    pub timestamp: String,
}

#[derive(Serialize)]
struct SaveLogArgs {
    equipment_id: String,
    action: String,
}

pub async fn save_log(equipment_id: String, action: String) -> Result<String, String> {
    invoke_command("save_offline_log", &SaveLogArgs { equipment_id, action }).await
}

pub async fn get_logs() -> Result<Vec<OfflineLog>, String> {
    invoke_command("get_offline_logs", &()).await
}

// Scale Helper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScaleData {
    pub weight: i32,
    pub unit: String,
    pub status: String,
}

pub async fn read_scale() -> Result<ScaleData, String> {
    invoke_command("read_scale_weight", &()).await
}

// Equipment CRUD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Equipment {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub health_score: f32,
}

#[derive(Serialize)]
struct AddEquipmentArgs {
    name: String,
    status: String,
    health: f32,
}

#[derive(Serialize)]
struct UpdateStatusArgs {
    id: i32,
    status: String,
}

#[derive(Serialize)]
struct DeleteArgs {
    id: i32,
}

pub async fn get_equipment_list() -> Result<Vec<Equipment>, String> {
    invoke_command("get_equipment_list", &()).await
}

pub async fn add_equipment(name: String, status: String, health: f32) -> Result<String, String> {
    invoke_command("add_equipment", &AddEquipmentArgs { name, status, health }).await
}

pub async fn update_status(id: i32, status: String) -> Result<String, String> {
    invoke_command("update_equipment_status", &UpdateStatusArgs { id, status }).await
}

pub async fn delete_equipment(id: i32) -> Result<String, String> {
    invoke_command("delete_equipment", &DeleteArgs { id }).await
}

// Tasks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: i32,
    pub description: String,
    pub priority: i32,
    pub category: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Serialize)]
struct AddTaskArgs {
    description: String,
    priority: i32,
    category: String,
}

#[derive(Serialize)]
struct TaskIdArgs {
    id: i32,
}

pub async fn get_tasks() -> Result<Vec<Task>, String> {
    invoke_command("get_tasks", &()).await
}

pub async fn add_task(description: String, priority: i32, category: String) -> Result<String, String> {
    invoke_command("add_task", &AddTaskArgs { description, priority, category }).await
}

pub async fn toggle_task(id: i32) -> Result<String, String> {
    invoke_command("toggle_task", &TaskIdArgs { id }).await
}

pub async fn delete_task(id: i32) -> Result<String, String> {
    invoke_command("delete_task", &TaskIdArgs { id }).await
}

// ==========================================
// AI Knowledge Loop
// ==========================================
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResolution {
    pub id: i32,
    pub original_description: String,
    pub category: String,
    pub solution_steps: String,
    pub created_at: String,
}

#[derive(Serialize)]
struct SaveResolutionArgs {
    description: String,
    category: String,
    solution: String,
}

#[derive(Serialize)]
struct FindSimilarArgs {
    query: String,
}

/// Save a resolution when completing a task
pub async fn save_resolution(description: String, category: String, solution: String) -> Result<String, String> {
    invoke_command("save_task_resolution", &SaveResolutionArgs { description, category, solution }).await
}

/// Find similar past resolutions based on a search query
pub async fn find_similar_resolutions(query: String) -> Result<Vec<TaskResolution>, String> {
    invoke_command("find_similar_fixes", &FindSimilarArgs { query }).await
}
