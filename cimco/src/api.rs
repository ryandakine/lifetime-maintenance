use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use std::sync::{Mutex, OnceLock};

// Global Mock Database for browser session persistence
static MOCK_DB: OnceLock<Mutex<Vec<Part>>> = OnceLock::new();

fn get_mock_db() -> &'static Mutex<Vec<Part>> {
    MOCK_DB.get_or_init(|| {
        Mutex::new(get_live_data())
    })
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(catch, js_namespace = ["window", "__TAURI__", "core"])]
    async fn invoke(cmd: &str, args: JsValue) -> Result<JsValue, JsValue>;
}

pub async fn invoke_command<T: Serialize, R: for<'de> Deserialize<'de>>(command: &str, args: &T) -> Result<R, String> {
    use wasm_bindgen::JsCast;
    use js_sys::Reflect;
    
    // Check if we are in a Tauri environment
    let window = web_sys::window().unwrap();
    let is_tauri = Reflect::has(&window, &"__TAURI__".into()).unwrap_or(false);

    if is_tauri {
        let args = to_value(args).map_err(|e| format!("Args ser error: {}", e))?;
        match invoke(command, args).await {
            Ok(val) => serde_wasm_bindgen::from_value(val).map_err(|e| format!("Result deser error: {}", e)),
            Err(err) => Err(format!("Tauri invoke error: {:?}", err)),
        }
    } else {
        // MOCK MODE for Browser Development
        leptos::logging::log!("⚠️ Mocking command: {}", command);
        
        // Parse args for mock updates
        let args_val = serde_json::to_value(args).unwrap_or(serde_json::Value::Null);

        match command {
            "get_parts" => {
                 let db = get_mock_db().lock().unwrap();
                 let json = serde_json::to_value(&*db).unwrap();
                 serde_json::from_value(json).map_err(|e| e.to_string())
            },
            "update_part_quantity" => {
                let id = args_val["id"].as_i64().unwrap_or(0) as i32;
                let change = args_val["quantity_change"].as_i64().unwrap_or(0) as i32;
                
                let mut db = get_mock_db().lock().unwrap();
                if let Some(part) = db.iter_mut().find(|p| p.id == id) {
                    part.quantity += change; // Modify the persisted quantity
                    if part.quantity < 0 { part.quantity = 0; }
                    leptos::logging::log!("MOCK: Updated part {} quantity by {}. New: {}", id, change, part.quantity);
                }
                
                let res = "Mock Success".to_string();
                let json = serde_json::to_value(res).unwrap();
                serde_json::from_value(json).map_err(|e| e.to_string())
            },
            "update_part_location" => {
                 let id = args_val["id"].as_i64().unwrap_or(0) as i32;
                 let location = args_val["location"].as_str().unwrap_or("").to_string();

                 let mut db = get_mock_db().lock().unwrap();
                 if let Some(part) = db.iter_mut().find(|p| p.id == id) {
                    part.location = Some(location.clone());
                    leptos::logging::log!("MOCK: Updated part {} location to '{}'", id, location);
                 }

                 let res = "Mock Success".to_string();
                 let json = serde_json::to_value(res).unwrap();
                 serde_json::from_value(json).map_err(|e| e.to_string())
            },
            "get_incoming_orders" => {
                let orders = vec![
                    IncomingOrder { id: 1, part_name: Some("Main Bearing".to_string()), order_number: Some("PO-999".to_string()), tracking_number: Some("1Z999".to_string()), supplier: Some("Metso".to_string()), quantity: 1, status: "shipped".to_string(), order_date: None, expected_delivery: None }
                ];
                let json = serde_json::to_value(orders).unwrap();
                 serde_json::from_value(json).map_err(|e| e.to_string())
            },
            "switch_demo_mode" => {
                 let enable = args_val["enable"].as_bool().unwrap_or(false);
                 let mut db = get_mock_db().lock().unwrap();
                 *db = if enable {
                     get_demo_data()
                 } else {
                     get_live_data()
                 };
                 let res = if enable { "Switched to DEMO mode" } else { "Switched to LIVE mode" }.to_string();
                 let json = serde_json::to_value(res).unwrap();
                 serde_json::from_value(json).map_err(|e| e.to_string())
            },
            "get_parts_paginated" => {
                 let page = args_val["page"].as_i64().unwrap_or(1) as i32;
                 let page_size = args_val["page_size"].as_i64().unwrap_or(50) as i32;
                 let category_filter = args_val["category_filter"].as_str();
                 let search_query = args_val["search_query"].as_str();
                 
                 let db = get_mock_db().lock().unwrap();
                 
                 // Filter
                 let filtered: Vec<Part> = db.iter().filter(|p| {
                     let matches_cat = category_filter.map_or(true, |c| c.is_empty() || p.category == c);
                     let matches_search = search_query.map_or(true, |q| q.is_empty() || 
                        p.name.to_lowercase().contains(&q.to_lowercase()) || 
                        p.part_number.as_ref().map_or(false, |pn| pn.to_lowercase().contains(&q.to_lowercase()))
                     );
                     matches_cat && matches_search
                 }).cloned().collect();

                 let total = filtered.len() as i64;
                 let total_pages = (total as f64 / page_size as f64).ceil() as i32;
                 
                 let start = ((page - 1) * page_size) as usize;
                 let items = filtered.into_iter().skip(start).take(page_size as usize).collect::<Vec<_>>();

                 let res = PaginatedResult {
                     items,
                     total,
                     page,
                     page_size,
                     total_pages,
                 };
                 let json = serde_json::to_value(res).unwrap();
                 serde_json::from_value(json).map_err(|e| e.to_string())
            },
            // Fallback for other commands (seed, reset, etc.) returns success
            _ => {
                 let res = "Mock Success".to_string();
                 let json = serde_json::to_value(res).unwrap();
                 serde_json::from_value(json).map_err(|e| e.to_string())
            }
        }
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

// ==========================================
// Parts Inventory API
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Part {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub category: String,
    pub part_type: Option<String>,
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub quantity: i32,
    pub min_quantity: i32,
    pub lead_time_days: i32,
    pub location: Option<String>,
    pub unit_cost: Option<f64>,
    pub supplier: Option<String>,
    pub wear_rating: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomingOrder {
    pub id: i32,
    pub part_name: Option<String>,
    pub order_number: Option<String>,
    pub tracking_number: Option<String>,
    pub supplier: Option<String>,
    pub quantity: i32,
    pub status: String,
    pub order_date: Option<String>,
    pub expected_delivery: Option<String>,
}

#[derive(Serialize)]
struct AddPartArgs {
    name: String,
    category: String,
    part_type: Option<String>,
    manufacturer: Option<String>,
    part_number: Option<String>,
    quantity: i32,
    min_quantity: i32,
    lead_time_days: i32,
    location: String,
}

#[derive(Serialize)]
struct UpdatePartQtyArgs {
    id: i32,
    quantity_change: i32,
}

#[derive(Serialize)]
struct UpdatePartLocArgs {
    id: i32,
    location: String,
}

#[derive(Serialize)]
struct PartIdArgs {
    id: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResult<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i32,
    pub page_size: i32,
    pub total_pages: i32,
}

#[derive(Serialize)]
struct GetPartsPaginatedArgs {
    page: i32,
    page_size: i32,
    category_filter: Option<String>,
    search_query: Option<String>,
}

pub async fn get_parts() -> Result<Vec<Part>, String> {
    invoke_command("get_parts", &()).await
}

pub async fn get_parts_paginated(
    page: i32,
    page_size: i32,
    category_filter: Option<String>,
    search_query: Option<String>,
) -> Result<PaginatedResult<Part>, String> {
    invoke_command("get_parts_paginated", &GetPartsPaginatedArgs {
        page,
        page_size,
        category_filter,
        search_query,
    }).await
}

pub async fn add_part(
    name: String, 
    category: String, 
    part_type: Option<String>,
    manufacturer: Option<String>,
    part_number: Option<String>,
    quantity: i32, 
    min_quantity: i32, 
    lead_time_days: i32,
    location: String
) -> Result<String, String> {
    invoke_command("add_part", &AddPartArgs { 
        name, 
        category, 
        part_type,
        manufacturer,
        part_number,
        quantity, 
        min_quantity, 
        lead_time_days,
        location 
    }).await
}

pub async fn update_part_quantity(id: i32, quantity_change: i32) -> Result<String, String> {
    invoke_command("update_part_quantity", &UpdatePartQtyArgs { id, quantity_change }).await
}

pub async fn update_part_location(id: i32, location: String) -> Result<String, String> {
    invoke_command("update_part_location", &UpdatePartLocArgs { id, location }).await
}

pub async fn delete_part(id: i32) -> Result<String, String> {
    invoke_command("delete_part", &PartIdArgs { id }).await
}

pub async fn get_incoming_orders() -> Result<Vec<IncomingOrder>, String> {
    invoke_command("get_incoming_orders", &()).await
}

#[allow(dead_code)]
pub async fn get_low_stock_parts() -> Result<Vec<Part>, String> {
    invoke_command("get_low_stock_parts", &()).await
}

#[derive(Serialize)]
struct OrderIdArgs {
    id: i32,
}

pub async fn receive_order(id: i32) -> Result<String, String> {
    invoke_command("receive_order", &OrderIdArgs { id }).await
}

pub async fn export_inventory_csv() -> Result<String, String> {
    invoke_command("export_inventory_csv", &()).await
}

// ==========================================
// Demo / Admin Tools
// ==========================================

pub async fn seed_database() -> Result<String, String> {
    invoke_command("seed_database", &()).await
}

pub async fn seed_production_database() -> Result<String, String> {
    invoke_command("seed_production_database", &()).await
}

pub async fn reset_database() -> Result<String, String> {
    invoke_command("reset_database", &()).await
}

#[derive(Serialize)]
struct DemoModeArgs {
    enable: bool,
}

pub async fn set_demo_mode(enable: bool) -> Result<String, String> {
    invoke_command("switch_demo_mode", &DemoModeArgs { enable }).await
}
pub fn get_live_data() -> Vec<Part> {
    vec![
        Part { id: 1, name: "Shredder Hammer - Heavy Duty".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 5, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("SH-HD-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 2, name: "Shredder Hammer - Standard".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 4, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("SH-STD-002".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 3, name: "Hydraulic Pump - Main".to_string(), category: "Hydraulics".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("HP-MAIN-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 4, name: "Hydraulic Cylinder Seal Kit".to_string(), category: "Hydraulics".to_string(), quantity: 0, min_quantity: 3, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("HC-SEAL-003".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 5, name: "Conveyor Belt - 24 inch".to_string(), category: "General".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("CB-24-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 6, name: "Motor Bearing 6205".to_string(), category: "Electrical".to_string(), quantity: 0, min_quantity: 4, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("MB-6205".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 7, name: "Hydraulic Filter Element".to_string(), category: "Hydraulics".to_string(), quantity: 0, min_quantity: 2, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("HF-EL-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 8, name: "Shredder Grate - 3 inch".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: None, manufacturer: None, part_number: Some("SG-3IN-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 9, name: "ANVIL INSERT CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73100-A8".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 10, name: "2 1/2'' OVAL HEAD X 20''LG".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A303".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 11, name: "2 1/2'' HEAVY DUTY WASHER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A357".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 12, name: "2 1/2'' ELASTIC STOP NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("49NU-4008".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 13, name: "REAR ROOF CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73100-A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 14, name: "FRONT ROOF CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A61".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 15, name: "SOLID GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A2".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 16, name: "FILLER GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A4".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 17, name: "REAR WALL CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 18, name: "KICK OUT DOOR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("78100-A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 19, name: "3 1/4'' OPEN GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A1".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 20, name: "4 1/4''OPEN MID GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A3".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 21, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 22, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 23, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-C66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 24, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-D66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 25, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-E66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 26, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-F66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 27, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-G66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 28, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-H66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 29, name: "UPPER SIDE LINER LEFT AND RIGHT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A11".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 30, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 31, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 32, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-C67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 33, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-D67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 34, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-E67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 35, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-F67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 36, name: "2'' OVAL HEAD BOLT X 13'' LG.".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A310".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 37, name: "2''HIGH STRNGTH WASHER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("A9-J70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 38, name: "2'' ELASTIC STOP NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("49NU-3208".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 39, name: "2'' OVAL HEAD BOLT X 9 3/4'' LG.".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A349".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 40, name: "2'' HEAVY HEX JAM NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("A540-P218".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 41, name: "LOCKPLATE FOR 2'' HEAVY HEX NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A235".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 42, name: "LOWER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-E63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 43, name: "LOWER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-F63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 44, name: "LOWER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-D63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 45, name: "LOWER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-C63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 46, name: "LOWER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 47, name: "LOWER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 48, name: "2'' OVAL HEAD BOLT X 14''".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A291".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 49, name: "2'' HIGH STRENGTH WASHER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("A9-L70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 50, name: "2'' ELASTIC STOP NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("49NJ-3208".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 51, name: "SPIDER CAP MANGANESE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Spider Cap".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A25".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 52, name: "SPIDER CAP ALLOY STEEL".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Spider Cap".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B25".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 53, name: "END DISC CAP".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Spider Cap".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A68".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 54, name: "RETAINER PIN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A326".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 55, name: "RETAINER PIN WELD COLLAR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A321".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 56, name: "HAMMER PIN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hammer".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A353".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 57, name: "ROTOR BEARING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("70 23260K".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 58, name: "BEARING HOUSING CAST STEEL".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7096-D20".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 59, name: "BEARING HOUSING (FLOAT SIDE)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 60, name: "BEARING HOUSING (FIXED SIDE)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 61, name: "INNER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 62, name: "OUTER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 63, name: "SEAL INSERT (OUTER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A110".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 64, name: "SEAL INSERT (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A111".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 65, name: "BEARING FLINGER (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A114".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 66, name: "BEARING FLINGER (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A115".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 67, name: "SPLIT TYPE OIL SEAL (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-E52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 68, name: "SPLIT TYPE OIL SEAL (OUTER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-R52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 69, name: "RTD BEARING PROBE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("4010".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 70, name: "HAMMER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hammer".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7980-A4".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 71, name: "Gwb 393.85 driveshaft or equivalent".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("393.85".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 72, name: "98'' (10) disc rotor Assembly".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: None, lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 73, name: "BASE ASSY, METSO 80 LT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 74, name: "MID SECTION ASSY, METSO 80 LT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688148".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 75, name: "CYLINDER, KICK-OUT DOOR, 5\" x 24\" x 3\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-0124".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 76, name: "CYLINDER, MILL TILT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID1252-A128".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 77, name: "CYLINDER, 6X28X3.5".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID1252-A129".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 78, name: "CYLINDER CLEVIS".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-L45".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 79, name: "CLEVIS PIN 3\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0010642-002".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 80, name: "HHCS, 1 1/2\"-6x7\" UNC (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-AC43".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 81, name: "FLAT WASHER, 1 1/2\" (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-J70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 82, name: "ESNA, 1 1/2\"-6 UNC".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0378681".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 83, name: "SPECIAL 2 1/2 - 8 UN X 10\" LG H".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-A325".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 84, name: "FLAT WASHER, 2 1/2\" (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-N70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 85, name: "METSO LOGO NAMEPLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0386882-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 86, name: "ROTOR, POWERSHRED 80 SPIDER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0010072-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 87, name: "ROTOR BEARING SHIM PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-99UB".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 88, name: "1 1/2\" -6UNC X 7\" STUD (SAE 4140)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH73080-G99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 89, name: "HOLDER BAR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH73080-E99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 90, name: "FLAT WASHER, 3\" (GR 5&8)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-V70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 91, name: "BEARING STUD - 3\" DIA FOR SHREDD".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-0354".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 92, name: "ESNA, 3\"-8 UN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0400727".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 93, name: "DEFLECTOR BOX ASSY, METSO 80 LT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1723220".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 94, name: "5 4 3 2".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("6".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 95, name: "BEARING HOUSING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH7096-D20".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 96, name: "BEARING COVER - FLOAT SIDE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 97, name: "SPHERICAL ROLLER BRG SKF 23260CACK-C3-W33".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID1251-0B69".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 98, name: "OUTER SEAL INSERT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A110".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 99, name: "INNER SEAL INSERT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A111".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 100, name: "INNER BEARING FLINGER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A114".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 101, name: "OUTER BEARING FLINGER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A115".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 102, name: "OUTER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 103, name: "INNER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 104, name: "OIL SEAL, SPLIT TYPE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("DH7700-R52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 105, name: "OIL SEAL, SPLIT TYPE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("DH7700-E52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 106, name: "SHCS, 1 1/2\"-6x5 1/2\" UNC".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A9-Y184".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 107, name: "SPIDER CAP".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A25".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 108, name: "HHCS, 3/8\"-16x1 3/4\" UNC (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-H32".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 109, name: "LOCKWASHER-3/8\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-C71".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 110, name: "HHCS, 3/4\"-10x2 3/4\" UNC (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A9-M37".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 111, name: "LOCKWASHER-3/4\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-J71".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 112, name: "FITTING, GREASE ZERK TYPE 1/8\" NPT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A13-A724".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 113, name: "PIN, RETAINER END DISK CAP".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-A326".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 114, name: "WELD BUSHING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A321".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 115, name: "1/2\" NPT HEX SOCKET PIPE PLUG".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("658592PS".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 116, name: "RETAINER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH73100-C17".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 117, name: "1 1/2-6 UNC x 3\" LG. HEX SOCKET FLAT HEAD SCREW".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-A358".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 118, name: "SPACER-PL AR 1 1/4\" x 5 3/16\" ID x 17 3/8\" OD".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 119, name: "HAMMER, ALLOY, 5 1/8\" PIN HOLE, 5 1/2\" THK.".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hammer".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0008657-00A".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 120, name: "BEARING COVER - FIX SIDE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 121, name: "BASE WELDMENT 85,503".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004931-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 122, name: "HINGE PIN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 123, name: "HINGE PIN RETAINER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-200".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 124, name: "HHCS,1\"-8 UNC x 2 3/4\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0439418".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 125, name: "100 LW LOCK WASHER, 1\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("40".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 126, name: "COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-300".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 127, name: "LOCK WASHER, 5/8\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-G71".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 128, name: "HHCS, 5/8\"-11 x 2\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0312847".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 129, name: "HOOD LOCK PIN WELDMENT WELD CHAIN TO BASE AT ASSEMBLY".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0005995-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 130, name: "5\" OD x 1/4\" WALL MECH. TUBING x 6\" PLAIN PART".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004931-043".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 131, name: "1/4\" NPT GREASE ZERK".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("13-B724".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 132, name: "MID-SECTION SIDE, LH 16,231".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688149-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 133, name: "MID-SECTION SIDE, RH 16,231".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688149-200".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 134, name: "MID-SECTION BACKWALL 11,926".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004972-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 135, name: "KICK-OUT DOOR LEVER ARM, RH".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0003417-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 136, name: "KICK-OUT DOOR LEVER ARM, LH".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0003417-200".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 137, name: "INFEED BAFFLE WELDMENT 2,703".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0005203-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 138, name: "HHSC, 1 1/2\"-6 UNC x 6 1/2\" GR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A9-AB43".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 139, name: "HHSC, 2\"-8 UNC 13 GR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("ZX11390266".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 140, name: "FLAT WASHER, 2\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-L70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 141, name: "ESNA, 2\"-8 UN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR49NU-3208".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 142, name: "DEFLECTOR BOX WELDMENT 19,804".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1723221".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 143, name: "HINGE PIN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688150-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 144, name: "COTTER PIN, 1/2\" x 5\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("ZX11397800".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 145, name: "HYDRAULIC CYLINDER, 8\"x54\"x4 1/2\" MID-SECTION TILT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-A128".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 146, name: "HYDRAULIC CYLINDER, 6\"x28\"x3 1/2\" TOP SECTION".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-A129".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 147, name: "HYDRAULIC CYLINDER, 5\"x24\"x3\" KICK-OUT DOOR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-A124".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 148, name: "ESNA, 2 1/2\"-8 UN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR49NU-4008".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 149, name: "ROTOR BEARING STUD 3\" x 26 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-354A".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 150, name: "BEARING WEDGE ROTOR BEARING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-E99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 151, name: "BEARING WEDGE STUD 1 1/2\" x 7\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-G99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 152, name: "1\" PIPE PLUG, SQ. HEAD TOP SECTION PIPE COUPLING PLUG".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01126-F119".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 153, name: "LINER ARRANGEMENT INCLUDES ITEMS 52-106 -".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1696474".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 154, name: "INTAKE SPREADER LINER, RH".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A107".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 155, name: "INTAKE SPREADER LINER, CENTER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B107".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 156, name: "INTAKE SPREADER LINER, LH".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-C107".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 157, name: "LOWER SIDE LINERS RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 158, name: "LOWER SIDE LINERS LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 159, name: "LOWER SIDE LINERS LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-C63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 160, name: "LOWER SIDE LINERS RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-D63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 161, name: "LOWER SIDE LINERS RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-E63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 162, name: "LOWER SIDE LINERS LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-F63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 163, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0A66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 164, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0B66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 165, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0C66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 166, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0D66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 167, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0E66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 168, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0F66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 169, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0G66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 170, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0H66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 171, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0A67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 172, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0B67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 173, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0C67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 174, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0D67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 175, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0E67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 176, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0F67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 177, name: "UPPER SIDE LINER RIGHT & LEFT SIDES".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-0A11".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 178, name: "REAR ROOF CASTING 7,682".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-00A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 179, name: "FRONT ROOF CASTING 8,399".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0A61".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 180, name: "REAR WALL 6,799".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0005035-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 181, name: "TOP GRATE 11,255".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A6".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 182, name: "KICK-OUT DOOR 8,129".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID78100-00A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 183, name: "ANVIL CASTINGS".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-00A8".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 184, name: "CASTING, MAIN LINER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("SAT021397-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 185, name: "SOLID GRATE 3,366".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A2".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 186, name: "FILLER GRATE 5,319".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A4".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 187, name: "OPEN GRATE 3 1/4\" OPENING 2,362".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A1".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 188, name: "OPEN GRATE 4 1/4\" OPENING 2,499".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A3".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 189, name: "SHIM PLATE 1/2\" x 6\" x 6\" USE W/ ROOF CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-A158".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 190, name: "SHIM PLATE 1/2\" x 2\" x 29\" USE W/ REAR WALL CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A103".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 191, name: "TIE ROD 3\" x 10'-4 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-C108".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 192, name: "OVAL HEAD BOLT, 1\"-14 UNF x 5\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("31_100-500".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 193, name: "FLATWASHER, 1\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-E70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 194, name: "OVAL HEAD BOLT, 1 1/2\"-6 UNC x 9 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-C300".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 195, name: "OVAL HEAD BOLT, 2\"-8 UN x 11 1/4\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0007096-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 196, name: "OVAL HEAD BOLT, 2\"-8 UN x 13\" WIS".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A338".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 197, name: "OVAL HEAD BOLT, 2\"-8 UN x 13\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A310".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 198, name: "2\" OVAL HEAD BOLT x 14\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A291".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 199, name: "OVAL HEAD BOLT, 2 1/2\"-8 UN x 20 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: None, description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A303".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
    ]
}

pub fn get_demo_data() -> Vec<Part> {
    vec![
        Part { id: 1, name: "Shredder Hammer - Heavy Duty".to_string(), category: "Shredder".to_string(), quantity: 12, min_quantity: 5, location: Some("Bin A-1".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("SH-HD-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 2, name: "Shredder Hammer - Standard".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 4, location: Some("Bin A-2".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("SH-STD-002".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 3, name: "Hydraulic Pump - Main".to_string(), category: "Hydraulics".to_string(), quantity: 2, min_quantity: 1, location: Some("Shelf B-1".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("HP-MAIN-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 4, name: "Hydraulic Cylinder Seal Kit".to_string(), category: "Hydraulics".to_string(), quantity: 6, min_quantity: 3, location: Some("Bin B-3".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("HC-SEAL-003".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 5, name: "Conveyor Belt - 24 inch".to_string(), category: "General".to_string(), quantity: 3, min_quantity: 1, location: Some("Rack C-1".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("CB-24-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 6, name: "Motor Bearing 6205".to_string(), category: "Electrical".to_string(), quantity: 10, min_quantity: 4, location: Some("Bin D-2".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("MB-6205".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 7, name: "Hydraulic Filter Element".to_string(), category: "Hydraulics".to_string(), quantity: 4, min_quantity: 2, location: Some("Bin B-4".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("HF-EL-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 8, name: "Shredder Grate - 3 inch".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Rack A-5".to_string()), description: None, part_type: None, manufacturer: None, part_number: Some("SG-3IN-001".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 9, name: "ANVIL INSERT CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73100-A8".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 10, name: "2 1/2'' OVAL HEAD X 20''LG".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A303".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 11, name: "2 1/2'' HEAVY DUTY WASHER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A357".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 12, name: "2 1/2'' ELASTIC STOP NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("49NU-4008".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 13, name: "REAR ROOF CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73100-A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 14, name: "FRONT ROOF CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A61".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 15, name: "SOLID GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A2".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 16, name: "FILLER GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A4".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 17, name: "REAR WALL CASTING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 18, name: "KICK OUT DOOR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("78100-A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 19, name: "3 1/4'' OPEN GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A1".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 20, name: "4 1/4''OPEN MID GRATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7880-A3".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 21, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 22, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 23, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-C66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 24, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-D66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 25, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-E66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 26, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-F66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 27, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-G66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 28, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-H66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 29, name: "UPPER SIDE LINER LEFT AND RIGHT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A11".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 30, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 31, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 32, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-C67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 33, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-D67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 34, name: "UPPER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-E67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 35, name: "UPPER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Upper".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-F67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 36, name: "2'' OVAL HEAD BOLT X 13'' LG.".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A310".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 37, name: "2''HIGH STRNGTH WASHER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("A9-J70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 38, name: "2'' ELASTIC STOP NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("49NU-3208".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 39, name: "2'' OVAL HEAD BOLT X 9 3/4'' LG.".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A349".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 40, name: "2'' HEAVY HEX JAM NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("A540-P218".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 41, name: "LOCKPLATE FOR 2'' HEAVY HEX NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A235".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 42, name: "LOWER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-E63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 43, name: "LOWER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-F63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 44, name: "LOWER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-D63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 45, name: "LOWER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-C63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 46, name: "LOWER SIDE LINER / RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 47, name: "LOWER SIDE LINER / LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Lower".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 48, name: "2'' OVAL HEAD BOLT X 14''".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A291".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 49, name: "2'' HIGH STRENGTH WASHER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("A9-L70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 50, name: "2'' ELASTIC STOP NUT".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("49NJ-3208".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 51, name: "SPIDER CAP MANGANESE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Spider Cap".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A25".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 52, name: "SPIDER CAP ALLOY STEEL".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Spider Cap".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B25".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 53, name: "END DISC CAP".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Spider Cap".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A68".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 54, name: "RETAINER PIN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A326".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 55, name: "RETAINER PIN WELD COLLAR".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A321".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 56, name: "HAMMER PIN".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hammer".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-A353".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 57, name: "ROTOR BEARING".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("70 23260K".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 58, name: "BEARING HOUSING CAST STEEL".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7096-D20".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 59, name: "BEARING HOUSING (FLOAT SIDE)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 60, name: "BEARING HOUSING (FIXED SIDE)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 61, name: "INNER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 62, name: "OUTER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-B109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 63, name: "SEAL INSERT (OUTER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A110".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 64, name: "SEAL INSERT (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A111".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 65, name: "BEARING FLINGER (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A114".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 66, name: "BEARING FLINGER (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("73080-A115".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 67, name: "SPLIT TYPE OIL SEAL (INNER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-E52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 68, name: "SPLIT TYPE OIL SEAL (OUTER)".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7700-R52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 69, name: "RTD BEARING PROBE".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("4010".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 70, name: "HAMMER".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hammer".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("7980-A4".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 71, name: "Gwb 393.85 driveshaft or equivalent".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: Some("393.85".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 72, name: "98'' (10) disc rotor Assembly".to_string(), category: "Shredder".to_string(), quantity: 0, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Metzo".to_string()), part_number: None, lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 73, name: "BASE ASSY, METSO 80 LT".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 74, name: "MID SECTION ASSY, METSO 80 LT".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688148".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 75, name: "CYLINDER, KICK-OUT DOOR, 5\" x 24\" x 3\"".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-0124".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 76, name: "CYLINDER, MILL TILT".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID1252-A128".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 77, name: "CYLINDER, 6X28X3.5".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID1252-A129".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 78, name: "CYLINDER CLEVIS".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-L45".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 79, name: "CLEVIS PIN 3\"".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0010642-002".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 80, name: "HHCS, 1 1/2\"-6x7\" UNC (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-AC43".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 81, name: "FLAT WASHER, 1 1/2\" (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 28, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-J70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 82, name: "ESNA, 1 1/2\"-6 UNC".to_string(), category: "Shredder".to_string(), quantity: 20, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0378681".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 83, name: "SPECIAL 2 1/2 - 8 UN X 10\" LG H".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-A325".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 84, name: "FLAT WASHER, 2 1/2\" (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-N70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 85, name: "METSO LOGO NAMEPLATE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0386882-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 86, name: "ROTOR, POWERSHRED 80 SPIDER".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0010072-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 87, name: "ROTOR BEARING SHIM PLATE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-99UB".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 88, name: "1 1/2\" -6UNC X 7\" STUD (SAE 4140)".to_string(), category: "Shredder".to_string(), quantity: 12, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH73080-G99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 89, name: "HOLDER BAR".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH73080-E99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 90, name: "FLAT WASHER, 3\" (GR 5&8)".to_string(), category: "Shredder".to_string(), quantity: 16, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-V70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 91, name: "BEARING STUD - 3\" DIA FOR SHREDD".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-0354".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 92, name: "ESNA, 3\"-8 UN".to_string(), category: "Shredder".to_string(), quantity: 16, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0400727".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 93, name: "DEFLECTOR BOX ASSY, METSO 80 LT".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1723220".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 94, name: "5 4 3 2".to_string(), category: "Shredder".to_string(), quantity: 7, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("6".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 95, name: "BEARING HOUSING".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH7096-D20".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 96, name: "BEARING COVER - FLOAT SIDE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 97, name: "SPHERICAL ROLLER BRG SKF 23260CACK-C3-W33".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID1251-0B69".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 98, name: "OUTER SEAL INSERT".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A110".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 99, name: "INNER SEAL INSERT".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A111".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 100, name: "INNER BEARING FLINGER".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A114".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 101, name: "OUTER BEARING FLINGER".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A115".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 102, name: "OUTER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 103, name: "INNER COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A109".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 104, name: "OIL SEAL, SPLIT TYPE".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("DH7700-R52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 105, name: "OIL SEAL, SPLIT TYPE".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("DH7700-E52".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 106, name: "SHCS, 1 1/2\"-6x5 1/2\" UNC".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A9-Y184".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 107, name: "SPIDER CAP".to_string(), category: "Shredder".to_string(), quantity: 26, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A25".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 108, name: "HHCS, 3/8\"-16x1 3/4\" UNC (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 40, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-H32".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 109, name: "LOCKWASHER-3/8\"".to_string(), category: "Shredder".to_string(), quantity: 40, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-C71".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 110, name: "HHCS, 3/4\"-10x2 3/4\" UNC (GR 5)".to_string(), category: "Shredder".to_string(), quantity: 48, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A9-M37".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 111, name: "LOCKWASHER-3/4\"".to_string(), category: "Shredder".to_string(), quantity: 48, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-J71".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 112, name: "FITTING, GREASE ZERK TYPE 1/8\" NPT".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A13-A724".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 113, name: "PIN, RETAINER END DISK CAP".to_string(), category: "Shredder".to_string(), quantity: 60, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-A326".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 114, name: "WELD BUSHING".to_string(), category: "Shredder".to_string(), quantity: 60, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A321".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 115, name: "1/2\" NPT HEX SOCKET PIPE PLUG".to_string(), category: "Shredder".to_string(), quantity: 6, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("658592PS".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 116, name: "RETAINER PLATE".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CH73100-C17".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 117, name: "1 1/2-6 UNC x 3\" LG. HEX SOCKET FLAT HEAD SCREW".to_string(), category: "Shredder".to_string(), quantity: 32, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID7700-A358".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 118, name: "SPACER-PL AR 1 1/4\" x 5 3/16\" ID x 17 3/8\" OD".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 119, name: "HAMMER, ALLOY, 5 1/8\" PIN HOLE, 5 1/2\" THK.".to_string(), category: "Shredder".to_string(), quantity: 26, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hammer".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0008657-00A".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 120, name: "BEARING COVER - FIX SIDE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B106".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 121, name: "BASE WELDMENT 85,503".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004931-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 122, name: "HINGE PIN".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 123, name: "HINGE PIN RETAINER PLATE".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-200".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 124, name: "HHCS,1\"-8 UNC x 2 3/4\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0439418".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 125, name: "100 LW LOCK WASHER, 1\"".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("40".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 126, name: "COVER PLATE".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004969-300".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 127, name: "LOCK WASHER, 5/8\"".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-G71".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 128, name: "HHCS, 5/8\"-11 x 2\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM0312847".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 129, name: "HOOD LOCK PIN WELDMENT WELD CHAIN TO BASE AT ASSEMBLY".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0005995-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 130, name: "5\" OD x 1/4\" WALL MECH. TUBING x 6\" PLAIN PART".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004931-043".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 131, name: "1/4\" NPT GREASE ZERK".to_string(), category: "Shredder".to_string(), quantity: 6, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("13-B724".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 132, name: "MID-SECTION SIDE, LH 16,231".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688149-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 133, name: "MID-SECTION SIDE, RH 16,231".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688149-200".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 134, name: "MID-SECTION BACKWALL 11,926".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0004972-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 135, name: "KICK-OUT DOOR LEVER ARM, RH".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0003417-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 136, name: "KICK-OUT DOOR LEVER ARM, LH".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0003417-200".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 137, name: "INFEED BAFFLE WELDMENT 2,703".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0005203-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 138, name: "HHSC, 1 1/2\"-6 UNC x 6 1/2\" GR".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("A9-AB43".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 139, name: "HHSC, 2\"-8 UNC 13 GR".to_string(), category: "Shredder".to_string(), quantity: 22, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("ZX11390266".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 140, name: "FLAT WASHER, 2\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 22, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-L70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 141, name: "ESNA, 2\"-8 UN".to_string(), category: "Shredder".to_string(), quantity: 22, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR49NU-3208".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 142, name: "DEFLECTOR BOX WELDMENT 19,804".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1723221".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 143, name: "HINGE PIN".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1688150-100".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 144, name: "COTTER PIN, 1/2\" x 5\"".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("ZX11397800".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 145, name: "HYDRAULIC CYLINDER, 8\"x54\"x4 1/2\" MID-SECTION TILT".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-A128".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 146, name: "HYDRAULIC CYLINDER, 6\"x28\"x3 1/2\" TOP SECTION".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-A129".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 147, name: "HYDRAULIC CYLINDER, 5\"x24\"x3\" KICK-OUT DOOR".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Hydraulics".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01252-A124".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 148, name: "ESNA, 2 1/2\"-8 UN".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR49NU-4008".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 149, name: "ROTOR BEARING STUD 3\" x 26 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-354A".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 150, name: "BEARING WEDGE ROTOR BEARING".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-E99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 151, name: "BEARING WEDGE STUD 1 1/2\" x 7\"".to_string(), category: "Shredder".to_string(), quantity: 12, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-G99".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 152, name: "1\" PIPE PLUG, SQ. HEAD TOP SECTION PIPE COUPLING PLUG".to_string(), category: "Shredder".to_string(), quantity: 5, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID01126-F119".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 153, name: "LINER ARRANGEMENT INCLUDES ITEMS 52-106 -".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MM1696474".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 154, name: "INTAKE SPREADER LINER, RH".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A107".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 155, name: "INTAKE SPREADER LINER, CENTER".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B107".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 156, name: "INTAKE SPREADER LINER, LH".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-C107".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 157, name: "LOWER SIDE LINERS RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 158, name: "LOWER SIDE LINERS LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-B63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 159, name: "LOWER SIDE LINERS LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-C63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 160, name: "LOWER SIDE LINERS RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-D63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 161, name: "LOWER SIDE LINERS RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-E63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 162, name: "LOWER SIDE LINERS LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-F63".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 163, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0A66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 164, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0B66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 165, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0C66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 166, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0D66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 167, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0E66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 168, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0F66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 169, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0G66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 170, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0H66".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 171, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0A67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 172, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0B67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 173, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0C67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 174, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0D67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 175, name: "UPPER SIDE LINER RIGHT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0E67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 176, name: "UPPER SIDE LINER LEFT HAND".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0F67".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 177, name: "UPPER SIDE LINER RIGHT & LEFT SIDES".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-0A11".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 178, name: "REAR ROOF CASTING 7,682".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-00A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 179, name: "FRONT ROOF CASTING 8,399".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-0A61".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 180, name: "REAR WALL 6,799".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0005035-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 181, name: "TOP GRATE 11,255".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A6".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 182, name: "KICK-OUT DOOR 8,129".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID78100-00A5".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 183, name: "ANVIL CASTINGS".to_string(), category: "Shredder".to_string(), quantity: 3, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-00A8".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 184, name: "CASTING, MAIN LINER".to_string(), category: "Shredder".to_string(), quantity: 8, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("SAT021397-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 185, name: "SOLID GRATE 3,366".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A2".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 186, name: "FILLER GRATE 5,319".to_string(), category: "Shredder".to_string(), quantity: 1, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A4".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 187, name: "OPEN GRATE 3 1/4\" OPENING 2,362".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A1".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 188, name: "OPEN GRATE 4 1/4\" OPENING 2,499".to_string(), category: "Shredder".to_string(), quantity: 5, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07880-00A3".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 189, name: "SHIM PLATE 1/2\" x 6\" x 6\" USE W/ ROOF CASTING".to_string(), category: "Shredder".to_string(), quantity: 10, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-A158".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 190, name: "SHIM PLATE 1/2\" x 2\" x 29\" USE W/ REAR WALL CASTING".to_string(), category: "Shredder".to_string(), quantity: 2, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73080-A103".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 191, name: "TIE ROD 3\" x 10'-4 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 7, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Shredder".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID73100-C108".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 192, name: "OVAL HEAD BOLT, 1\"-14 UNF x 5\"".to_string(), category: "Shredder".to_string(), quantity: 40, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("31_100-500".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 193, name: "FLATWASHER, 1\" GR 5".to_string(), category: "Shredder".to_string(), quantity: 40, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("9-E70".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 194, name: "OVAL HEAD BOLT, 1 1/2\"-6 UNC x 9 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 18, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-C300".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 195, name: "OVAL HEAD BOLT, 2\"-8 UN x 11 1/4\"".to_string(), category: "Shredder".to_string(), quantity: 6, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("MR0007096-000".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 196, name: "OVAL HEAD BOLT, 2\"-8 UN x 13\" WIS".to_string(), category: "Shredder".to_string(), quantity: 4, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A338".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 197, name: "OVAL HEAD BOLT, 2\"-8 UN x 13\"".to_string(), category: "Shredder".to_string(), quantity: 62, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A310".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 198, name: "2\" OVAL HEAD BOLT x 14\"".to_string(), category: "Shredder".to_string(), quantity: 50, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A291".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
        Part { id: 199, name: "OVAL HEAD BOLT, 2 1/2\"-8 UN x 20 1/2\"".to_string(), category: "Shredder".to_string(), quantity: 12, min_quantity: 1, location: Some("Yard".to_string()), description: None, part_type: Some("Wear Part".to_string()), manufacturer: Some("Lindemann".to_string()), part_number: Some("CID07700-A303".to_string()), lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) },
    ]
}
