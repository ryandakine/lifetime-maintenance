use serde::{Serialize, Deserialize};
use nokhwa::utils::{ApiBackend, CameraIndex};
use nokhwa::query;

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
fn get_equipment_stats() -> EquipmentStats {
    // This logic now lives in RUST, not JavaScript! 🦀
    // In the future, this will query a real local SQLite DB.
    EquipmentStats {
        total_equipment: 12,
        active_count: 8,
        maintenance_count: 2,
        down_count: 2, // The Crane and Conveyor!
        average_health: 84.5,
    }
}

#[tauri::command]
fn get_connected_cameras() -> Vec<CameraInfo> {
    // Query the hardware directly using Rust 🦀
    // We use the 'Auto' backend (V4L2 on Linux)
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

use rusqlite::{params, Connection};

#[derive(Serialize, Deserialize)]
struct OfflineLog {
    id: Option<i32>,
    equipment_id: String,
    action: String,
    timestamp: String,
}

#[tauri::command]
fn save_offline_log(equipment_id: String, action: String) -> String {
    let conn = Connection::open("cimco_offline.db").unwrap();
    conn.execute(
        "CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY,
            equipment_id TEXT NOT NULL,
            action TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).unwrap(); // In production, handle errors gracefully!

    conn.execute(
        "INSERT INTO logs (equipment_id, action) VALUES (?1, ?2)",
        params![equipment_id, action],
    ).unwrap();
    
    format!("Saved to Offline Rust DB 🦀: {} - {}", equipment_id, action)
}

#[tauri::command]
fn get_offline_logs() -> Vec<OfflineLog> {
    let conn = Connection::open("cimco_offline.db");
    if conn.is_err() { return vec![]; }
    let conn = conn.unwrap();

    // Ensure table exists 
    let _ = conn.execute(
        "CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY,
            equipment_id TEXT NOT NULL,
            action TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    );
    
    let mut stmt = conn.prepare("SELECT id, equipment_id, action, timestamp FROM logs ORDER BY id DESC LIMIT 50").unwrap();
    let log_iter = stmt.query_map([], |row| {
        Ok(OfflineLog {
            id: row.get(0)?,
            equipment_id: row.get(1)?,
            action: row.get(2)?,
            timestamp: row.get(3)?,
        })
    }).unwrap();

    let mut logs = Vec::new();
    for log in log_iter {
        if let Ok(l) = log {
            logs.push(l);
        }
    }
    logs
}

// Simulate a truck scale
use std::sync::Mutex;
use tauri::State;

struct ScaleState(Mutex<ScaleData>);

struct ScaleData {
    current_weight: i32,
    target_weight: i32,
    is_stable: bool,
}

#[tauri::command]
fn read_scale_weight(state: State<ScaleState>) -> serde_json::Value {
    // This simulates a real hardware driver reading RS-232 bytes
    let mut data = state.0.lock().unwrap();
    
    // Ramp weight towards target (simulating truck settling)
    if data.current_weight < data.target_weight {
        data.current_weight += 500; // Truck driving on
    } else if data.current_weight > data.target_weight {
        data.current_weight -= 500;
    }
    
    // Jitter simulation (scales never sit perfectly still until stable)
    let jitter = if data.current_weight == data.target_weight { 0 } else { rand::random::<i32>() % 40 - 20 };
    let display_weight = data.current_weight + jitter;
    
    // Randomly change target to simulate trucks coming/going
    if rand::random::<f32>() > 0.98 {
        if data.target_weight == 0 {
            data.target_weight = 45000 + (rand::random::<i32>() % 10000); // New truck
        } else {
            data.target_weight = 0; // Truck leaves
        }
    }

    serde_json::json!({
        "weight": display_weight,
        "unit": "lbs",
        "status": if (data.current_weight - data.target_weight).abs() < 100 { "STABLE" } else { "MOTION" }
    })
}

fn main() {
    tauri::Builder::default()
        .manage(ScaleState(Mutex::new(ScaleData { 
            current_weight: 0, 
            target_weight: 45200, // Start with a truck on scale
            is_stable: false 
        })))
        .invoke_handler(tauri::generate_handler![
            get_equipment_stats, 
            get_connected_cameras,
            save_offline_log,
            get_offline_logs,
            read_scale_weight
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
