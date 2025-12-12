#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;

mod db;
mod hardware;
mod commands;

use hardware::{ScaleState, ScaleData};

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
            // Equipment
            commands::get_equipment_stats, 
            commands::get_equipment_list,
            commands::add_equipment,
            commands::update_equipment_status,
            commands::delete_equipment,
            // Tasks
            commands::get_tasks,
            commands::add_task,
            commands::toggle_task,
            commands::delete_task,
            // Logs
            commands::save_offline_log,
            commands::get_offline_logs,
            // Knowledge Loop
            commands::save_task_resolution,
            commands::find_similar_fixes,
            // Parts Inventory
            commands::get_parts,
            commands::add_part,
            commands::update_part_quantity,
            commands::delete_part,
            commands::get_incoming_orders,
            commands::get_low_stock_parts,
            // Hardware
            hardware::get_connected_cameras,
            hardware::read_scale_weight
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
