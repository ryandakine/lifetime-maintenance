use serde::{Serialize, Deserialize};
use nokhwa::utils::{ApiBackend, CameraIndex};
use nokhwa::query;
use tauri::State;
use std::sync::Mutex;

mod db;
#[cfg(test)]
mod tests;
use db::AppState;

#[derive(Serialize, Deserialize)]
struct EquipmentStats {
    total_equipment: i32,
    active_count: i32,
    maintenance_count: i32,
    down_count: i32,
    average_health: f32,
}

#[derive(Serialize)]
struct CameraInfo {
    index: u32,
    name: String,
    description: String,
}

#[tauri::command]
fn get_equipment_stats(state: State<AppState>) -> Result<db::EquipmentStats, String> {
    db::get_stats(&state)
}

#[tauri::command]
fn get_equipment_list(state: State<AppState>) -> Result<Vec<db::Equipment>, String> {
    db::get_all_equipment(&state)
}

#[tauri::command]
fn add_equipment(state: State<AppState>, name: String, status: String, health: f32) -> Result<String, String> {
    db::create_equipment(&state, name, status, health)
}

#[tauri::command]
fn update_equipment_status(state: State<AppState>, id: i32, status: String) -> Result<String, String> {
    db::update_equipment_status(&state, id, status)
}

#[tauri::command]
fn delete_equipment(state: State<AppState>, id: i32) -> Result<String, String> {
    db::delete_equipment(&state, id)
}

// Task Commands
#[tauri::command]
fn get_tasks(state: State<AppState>) -> Result<Vec<db::Task>, String> {
    db::get_tasks(&state)
}

#[tauri::command]
fn add_task(state: State<AppState>, description: String, priority: i32, category: String) -> Result<String, String> {
    db::create_task(&state, description, priority, category)
}

#[tauri::command]
fn toggle_task(state: State<AppState>, id: i32) -> Result<String, String> {
    db::toggle_task_status(&state, id)
}

#[tauri::command]
fn delete_task(state: State<AppState>, id: i32) -> Result<String, String> {
    db::delete_task(&state, id)
}

#[tauri::command]
fn get_connected_cameras() -> Vec<CameraInfo> {
    match query(ApiBackend::Auto) {
        Ok(cameras) => {
            cameras.into_iter().map(|cam| {
                let idx = match cam.index() {
                    CameraIndex::Index(i) => *i,
                    _ => 0,
                };
                CameraInfo {
                    index: idx,
                    name: cam.human_name(),
                    description: cam.description().to_string(),
                }
            }).collect()
        },
        Err(_) => vec![],
    }
}

// Database commands using the new db module
#[tauri::command]
fn save_offline_log(state: State<AppState>, equipment_id: String, action: String) -> Result<String, String> {
    db::save_log(&state, equipment_id, action)
}

#[tauri::command]
fn get_offline_logs(state: State<AppState>) -> Result<Vec<db::OfflineLog>, String> {
    db::get_logs(&state)
}

// Knowledge Loop Commands
#[tauri::command]
fn save_task_resolution(state: State<AppState>, description: String, category: String, solution: String) -> Result<String, String> {
    db::save_resolution(&state, description, category, solution)
}

#[tauri::command]
fn find_similar_fixes(state: State<AppState>, query: String) -> Result<Vec<db::TaskResolution>, String> {
    db::find_similar_resolutions(&state, query)
}

// Scale Logic
struct ScaleState(Mutex<ScaleData>);

struct ScaleData {
    current_weight: i32,
    target_weight: i32,
    #[allow(dead_code)]
    is_stable: bool,
}

impl ScaleData {
    fn update(&mut self) -> i32 {
        // Ramp weight towards target (simulating truck settling)
        if self.current_weight < self.target_weight {
            self.current_weight += 500;
        } else if self.current_weight > self.target_weight {
            self.current_weight -= 500;
        }
        
        // Jitter simulation
        // Use u32 to ensure positive modulus, then shift to range [-20, 20]
        let jitter = if self.current_weight == self.target_weight { 
            0 
        } else { 
            (rand::random::<u32>() % 41) as i32 - 20 
        };
        self.current_weight + jitter
    }
}

#[tauri::command]
fn read_scale_weight(state: State<ScaleState>) -> Result<serde_json::Value, String> {
    let mut data = state.0.lock().map_err(|_| "Failed to lock scale data state")?;
    
    let display_weight = data.update();
    
    // Randomly change target
    if rand::random::<f32>() > 0.98 {
        if data.target_weight == 0 {
            data.target_weight = 45000 + (rand::random::<i32>() % 10000);
        } else {
            data.target_weight = 0;
        }
    }

    Ok(serde_json::json!({
        "weight": display_weight,
        "unit": "lbs",
        "status": if (data.current_weight - data.target_weight).abs() < 100 { "STABLE" } else { "MOTION" }
    }))
}

fn main() {
    // Initialize Database
    let app_state = match db::init() {
        Ok(state) => state,
        Err(e) => {
            eprintln!("Failed to initialize database: {}", e);
            // Panic here is acceptable as the app cannot function without DB
            panic!("Database initialization failed");
        }
    };

    tauri::Builder::default()
        .manage(app_state)
        .manage(ScaleState(Mutex::new(ScaleData { 
            current_weight: 0, 
            target_weight: 45200, 
            is_stable: false 
        })))
        .invoke_handler(tauri::generate_handler![
            get_equipment_stats, 
            get_equipment_list,
            add_equipment,
            update_equipment_status,
            delete_equipment,
            get_tasks,
            add_task,
            toggle_task,
            delete_task,
            get_connected_cameras,
            save_offline_log,
            get_offline_logs,
            read_scale_weight,
            save_task_resolution,
            find_similar_fixes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
