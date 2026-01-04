use serde::Serialize;
use nokhwa::utils::{ApiBackend, CameraIndex};
use nokhwa::query;
use tauri::State;
use std::sync::Mutex;
use rand; // Ensure rand is available (added in Cargo.toml)

#[derive(Serialize)]
pub struct CameraInfo {
    index: u32,
    name: String,
    description: String,
}

// Scale Logic
pub struct ScaleState(pub Mutex<ScaleData>);

pub struct ScaleData {
    pub current_weight: i32,
    pub target_weight: i32,
    #[allow(dead_code)]
    pub is_stable: bool,
}

impl ScaleData {
    pub fn update(&mut self) -> i32 {
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
pub fn get_connected_cameras() -> Vec<CameraInfo> {
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

#[tauri::command]
pub fn read_scale_weight(state: State<ScaleState>) -> Result<serde_json::Value, String> {
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
