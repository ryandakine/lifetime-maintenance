#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use tracing::{info, error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod auth;
mod db;
mod db_seeds;
mod hardware;
mod commands;

use hardware::{ScaleState, ScaleData};

#[tokio::main]
async fn main() {
    // Initialize structured logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("🚀 Starting Cimco Equipment Tracker");

    // Initialize PostgreSQL Database
    let app_state = match db::init().await {
        Ok(state) => {
            info!("✅ PostgreSQL database initialized successfully");
            state
        },
        Err(e) => {
            error!("❌ Failed to initialize PostgreSQL database: {}", e);
            eprintln!("💡 Make sure PostgreSQL is running and DATABASE_URL is set");
            eprintln!("   Example: DATABASE_URL=postgres://cimco:cimco@localhost/cimco_inventory");
            panic!("Database initialization failed");
        }
    };

    info!("🚀 Starting Tauri application with PostgreSQL backend...");

    tauri::Builder::default()
        .manage(app_state)
        .manage(ScaleState(Mutex::new(ScaleData { 
            current_weight: 0, 
            target_weight: 45200, 
            is_stable: false 
        })))
        .invoke_handler(tauri::generate_handler![
            // Authentication
            commands::login,
            commands::logout,
            commands::validate_session,
            commands::create_user,
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
            commands::get_parts_paginated,
            commands::add_part,
            commands::update_part_quantity,
            commands::update_part_location,
            commands::delete_part,
            commands::get_incoming_orders,
            commands::get_low_stock_parts,
            commands::receive_order,
            commands::export_inventory_csv,
            // Hardware
            hardware::get_connected_cameras,
            hardware::read_scale_weight,
            // Demo Tools (Admin Only)
            commands::seed_database,
            commands::seed_production_database,
            commands::reset_database,
            commands::switch_demo_mode,
            // Audit
            commands::get_audit_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
