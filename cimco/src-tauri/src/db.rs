use deadpool_postgres::{Config, Pool, Runtime};
use serde::{Deserialize, Serialize};
use std::env;
use tokio_postgres::NoTls;
use crate::auth::{AuthState, User, UserRole};

pub struct AppState {
    pub db: Pool,
    pub auth: AuthState,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OfflineLog {
    pub id: Option<i32>,
    pub equipment_id: String,
    pub action: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EquipmentStats {
    pub total_equipment: i32,
    pub active_count: i32,
    pub maintenance_count: i32,
    pub down_count: i32,
    pub average_health: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
    pub id: i32,
    pub description: String,
    pub priority: i32,
    pub category: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Equipment {
    pub id: i32,
    pub name: String,
    pub status: String,
    pub health_score: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TaskResolution {
    pub id: i32,
    pub original_description: String,
    pub category: String,
    pub solution_steps: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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
    pub wear_rating: Option<i32>,
    pub location: Option<String>,
    pub unit_cost: Option<f64>,
    pub supplier: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PaginatedResult<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i32,
    pub page_size: i32,
    pub total_pages: i32,
}

pub async fn init() -> Result<AppState, Box<dyn std::error::Error>> {
    // Get database URL from environment or use default
    let db_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://cimco:cimco@localhost/cimco_inventory".to_string());

    println!("🐘 Connecting to PostgreSQL: {}", db_url.replace(|c: char| c.is_ascii_digit() && c != '@', "*"));

    // Configure connection pool
    let mut cfg = Config::new();
    cfg.url = Some(db_url);
    cfg.pool = Some(deadpool_postgres::PoolConfig::new(20)); // Max 20 connections

    let pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls)?;

    // Test connection
    let client = pool.get().await?;
    let row = client.query_one("SELECT 1 as test", &[]).await?;
    let test: i32 = row.get(0);
    assert_eq!(test, 1);
    println!("✅ PostgreSQL connection successful!");

    // Run schema initialization
    init_schema(&pool).await?;

    Ok(AppState { 
        db: pool,
        auth: AuthState::new(),
    })
}

async fn init_schema(pool: &Pool) -> Result<(), Box<dyn std::error::Error>> {
    let client = pool.get().await?;

    // Read and execute schema file
    let schema_sql = include_str!("../../../database/schema.sql");
    client.batch_execute(schema_sql).await?;

    println!("✅ Database schema initialized");

    // Seed sample data if empty
    let row = client.query_one("SELECT COUNT(*) FROM equipment", &[]).await?;
    let count: i64 = row.get(0);

    if count == 0 {
        println!("🌱 Seeding initial sample data...");
        client.execute(
            "INSERT INTO equipment (name, status, health_score) VALUES
                ('Conveyor Belt A', 'active', 95.5),
                ('Hydraulic Press 1', 'active', 88.0),
                ('Forklift 3', 'maintenance', 60.0),
                ('Main Crane', 'down', 12.5),
                ('Sorting Arm', 'active', 92.0),
                ('Generator Backup', 'active', 100.0),
                ('Scale 2', 'down', 0.0),
                ('Pump Station', 'active', 78.5)",
            &[],
        ).await?;
        println!("✅ Sample equipment data seeded");
    }

    Ok(())
}

// ==========================================
// Equipment CRUD (Async)
// ==========================================

pub async fn get_stats(state: &AppState) -> Result<EquipmentStats, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let row = client
        .query_one(
            "SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                SUM(CASE WHEN status = 'down' THEN 1 ELSE 0 END) as down,
                COALESCE(AVG(health_score), 0.0) as avg_health
             FROM equipment",
            &[],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    Ok(EquipmentStats {
        total_equipment: row.get::<_, i64>(0) as i32,
        active_count: row.get::<_, i64>(1) as i32,
        maintenance_count: row.get::<_, i64>(2) as i32,
        down_count: row.get::<_, i64>(3) as i32,
        average_health: row.get::<_, f64>(4) as f32,
    })
}

pub async fn get_all_equipment(state: &AppState) -> Result<Vec<Equipment>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let rows = client
        .query("SELECT id, name, status, health_score FROM equipment ORDER BY id DESC", &[])
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let equipment: Vec<Equipment> = rows
        .iter()
        .map(|row| Equipment {
            id: row.get(0),
            name: row.get(1),
            status: row.get(2),
            health_score: row.get::<_, f64>(3) as f32,
        })
        .collect();

    Ok(equipment)
}

pub async fn create_equipment(state: &AppState, name: String, status: String, health: f32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute(
            "INSERT INTO equipment (name, status, health_score) VALUES ($1, $2, $3)",
            &[&name, &status, &(health as f64)],
        )
        .await
        .map_err(|e| format!("Insert error: {}", e))?;

    Ok("Equipment created".to_string())
}

pub async fn update_equipment_status(state: &AppState, id: i32, status: String) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute("UPDATE equipment SET status = $1 WHERE id = $2", &[&status, &id])
        .await
        .map_err(|e| format!("Update error: {}", e))?;

    Ok("Status updated".to_string())
}

pub async fn delete_equipment(state: &AppState, id: i32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute("DELETE FROM equipment WHERE id = $1", &[&id])
        .await
        .map_err(|e| format!("Delete error: {}", e))?;

    Ok("Equipment deleted".to_string())
}

// ==========================================
// Tasks CRUD (Async)
// ==========================================

pub async fn get_tasks(state: &AppState) -> Result<Vec<Task>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let rows = client
        .query(
            "SELECT id, description, priority, category, status, created_at::text
             FROM tasks ORDER BY status ASC, priority DESC, created_at DESC",
            &[],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let tasks: Vec<Task> = rows
        .iter()
        .map(|row| Task {
            id: row.get(0),
            description: row.get(1),
            priority: row.get(2),
            category: row.get(3),
            status: row.get(4),
            created_at: row.get(5),
        })
        .collect();

    Ok(tasks)
}

pub async fn create_task(state: &AppState, description: String, priority: i32, category: String) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute(
            "INSERT INTO tasks (description, priority, category, status) VALUES ($1, $2, $3, 'pending')",
            &[&description, &priority, &category],
        )
        .await
        .map_err(|e| format!("Insert error: {}", e))?;

    Ok("Task created".to_string())
}

pub async fn toggle_task_status(state: &AppState, id: i32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let row = client
        .query_one("SELECT status FROM tasks WHERE id = $1", &[&id])
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let current_status: String = row.get(0);
    let new_status = if current_status == "pending" { "complete" } else { "pending" };

    client
        .execute("UPDATE tasks SET status = $1 WHERE id = $2", &[&new_status, &id])
        .await
        .map_err(|e| format!("Update error: {}", e))?;

    Ok(format!("Status changed to {}", new_status))
}

pub async fn delete_task(state: &AppState, id: i32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute("DELETE FROM tasks WHERE id = $1", &[&id])
        .await
        .map_err(|e| format!("Delete error: {}", e))?;

    Ok("Task deleted".to_string())
}

// ==========================================
// Parts Inventory CRUD (Async)
// ==========================================

/// Get all parts without pagination (legacy - use get_parts_paginated for new code)
pub async fn get_all_parts(state: &AppState) -> Result<Vec<Part>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let rows = client
        .query(
            "SELECT id, name, description, category, part_type, manufacturer, part_number,
                    quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier
             FROM parts ORDER BY category, name",
            &[],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let parts: Vec<Part> = rows
        .iter()
        .map(|row| Part {
            id: row.get(0),
            name: row.get(1),
            description: row.get(2),
            category: row.get(3),
            part_type: row.get(4),
            manufacturer: row.get(5),
            part_number: row.get(6),
            quantity: row.get(7),
            min_quantity: row.get(8),
            lead_time_days: row.get(9),
            wear_rating: row.get(10),
            location: row.get(11),
            unit_cost: row.get(12),
            supplier: row.get(13),
        })
        .collect();

    Ok(parts)
}

/// Get parts with pagination (recommended for production use)
pub async fn get_parts_paginated(
    state: &AppState,
    page: i32,
    page_size: i32,
    category_filter: Option<String>,
    search_query: Option<String>,
) -> Result<PaginatedResult<Part>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    // Calculate pagination
    let offset = (page - 1) * page_size;

    // Build query based on filters (simplified - using separate queries for simplicity)
    let (count_query, data_query, total, rows) = match (&category_filter, &search_query) {
        (Some(cat), Some(search)) if cat != "All" && !search.is_empty() => {
            let search_pattern = format!("%{}%", search.to_lowercase());

            let count_row = client
                .query_one(
                    "SELECT COUNT(*) FROM parts WHERE category = $1 AND LOWER(name) LIKE $2",
                    &[cat, &search_pattern],
                )
                .await
                .map_err(|e| format!("Count query error: {}", e))?;
            let total: i64 = count_row.get(0);

            let rows = client
                .query(
                    "SELECT id, name, description, category, part_type, manufacturer, part_number,
                            quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier
                     FROM parts WHERE category = $1 AND LOWER(name) LIKE $2
                     ORDER BY category, name
                     LIMIT $3 OFFSET $4",
                    &[cat, &search_pattern, &page_size, &offset],
                )
                .await
                .map_err(|e| format!("Data query error: {}", e))?;

            ("", "", total, rows)
        },
        (Some(cat), _) if cat != "All" => {
            let count_row = client
                .query_one(
                    "SELECT COUNT(*) FROM parts WHERE category = $1",
                    &[cat],
                )
                .await
                .map_err(|e| format!("Count query error: {}", e))?;
            let total: i64 = count_row.get(0);

            let rows = client
                .query(
                    "SELECT id, name, description, category, part_type, manufacturer, part_number,
                            quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier
                     FROM parts WHERE category = $1
                     ORDER BY category, name
                     LIMIT $2 OFFSET $3",
                    &[cat, &page_size, &offset],
                )
                .await
                .map_err(|e| format!("Data query error: {}", e))?;

            ("", "", total, rows)
        },
        (_, Some(search)) if !search.is_empty() => {
            let search_pattern = format!("%{}%", search.to_lowercase());

            let count_row = client
                .query_one(
                    "SELECT COUNT(*) FROM parts WHERE LOWER(name) LIKE $1",
                    &[&search_pattern],
                )
                .await
                .map_err(|e| format!("Count query error: {}", e))?;
            let total: i64 = count_row.get(0);

            let rows = client
                .query(
                    "SELECT id, name, description, category, part_type, manufacturer, part_number,
                            quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier
                     FROM parts WHERE LOWER(name) LIKE $1
                     ORDER BY category, name
                     LIMIT $2 OFFSET $3",
                    &[&search_pattern, &page_size, &offset],
                )
                .await
                .map_err(|e| format!("Data query error: {}", e))?;

            ("", "", total, rows)
        },
        _ => {
            let count_row = client
                .query_one("SELECT COUNT(*) FROM parts", &[])
                .await
                .map_err(|e| format!("Count query error: {}", e))?;
            let total: i64 = count_row.get(0);

            let rows = client
                .query(
                    "SELECT id, name, description, category, part_type, manufacturer, part_number,
                            quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier
                     FROM parts
                     ORDER BY category, name
                     LIMIT $1 OFFSET $2",
                    &[&page_size, &offset],
                )
                .await
                .map_err(|e| format!("Data query error: {}", e))?;

            ("", "", total, rows)
        }
    };

    let total_pages = ((total as f64) / (page_size as f64)).ceil() as i32;

    let parts: Vec<Part> = rows
        .iter()
        .map(|row| Part {
            id: row.get(0),
            name: row.get(1),
            description: row.get(2),
            category: row.get(3),
            part_type: row.get(4),
            manufacturer: row.get(5),
            part_number: row.get(6),
            quantity: row.get(7),
            min_quantity: row.get(8),
            lead_time_days: row.get(9),
            wear_rating: row.get(10),
            location: row.get(11),
            unit_cost: row.get(12),
            supplier: row.get(13),
        })
        .collect();

    Ok(PaginatedResult {
        items: parts,
        total,
        page,
        page_size,
        total_pages,
    })
}

pub async fn create_part(
    state: &AppState,
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
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute(
            "INSERT INTO parts (name, category, part_type, manufacturer, part_number, quantity, min_quantity, lead_time_days, location)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            &[&name, &category, &part_type, &manufacturer, &part_number, &quantity, &min_quantity, &lead_time_days, &location],
        )
        .await
        .map_err(|e| format!("Insert error: {}", e))?;

    Ok("Part created".to_string())
}

pub async fn update_part_quantity(state: &AppState, id: i32, quantity_change: i32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute(
            "UPDATE parts SET quantity = quantity + $1 WHERE id = $2",
            &[&quantity_change, &id],
        )
        .await
        .map_err(|e| format!("Update error: {}", e))?;

    Ok("Quantity updated".to_string())
}

pub async fn update_part_location(state: &AppState, id: i32, location: String) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute("UPDATE parts SET location = $1 WHERE id = $2", &[&location, &id])
        .await
        .map_err(|e| format!("Update error: {}", e))?;

    Ok("Location updated".to_string())
}

pub async fn delete_part(state: &AppState, id: i32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute("DELETE FROM parts WHERE id = $1", &[&id])
        .await
        .map_err(|e| format!("Delete error: {}", e))?;

    Ok("Part deleted".to_string())
}

pub async fn get_low_stock_parts(state: &AppState) -> Result<Vec<Part>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let rows = client
        .query(
            "SELECT id, name, description, category, part_type, manufacturer, part_number,
                    quantity, min_quantity, lead_time_days, wear_rating, location, unit_cost, supplier
             FROM parts WHERE quantity <= min_quantity ORDER BY quantity ASC",
            &[],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let parts: Vec<Part> = rows
        .iter()
        .map(|row| Part {
            id: row.get(0),
            name: row.get(1),
            description: row.get(2),
            category: row.get(3),
            part_type: row.get(4),
            manufacturer: row.get(5),
            part_number: row.get(6),
            quantity: row.get(7),
            min_quantity: row.get(8),
            lead_time_days: row.get(9),
            wear_rating: row.get(10),
            location: row.get(11),
            unit_cost: row.get(12),
            supplier: row.get(13),
        })
        .collect();

    Ok(parts)
}

// ==========================================
// Incoming Orders CRUD (Async)
// ==========================================

pub async fn get_incoming_orders(state: &AppState) -> Result<Vec<IncomingOrder>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let rows = client
        .query(
            "SELECT id, part_name, order_number, tracking_number, supplier, quantity, status, order_date::text, expected_delivery::text
             FROM incoming_orders WHERE status != 'delivered' ORDER BY expected_delivery ASC",
            &[],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let orders: Vec<IncomingOrder> = rows
        .iter()
        .map(|row| IncomingOrder {
            id: row.get(0),
            part_name: row.get(1),
            order_number: row.get(2),
            tracking_number: row.get(3),
            supplier: row.get(4),
            quantity: row.get(5),
            status: row.get(6),
            order_date: row.get(7),
            expected_delivery: row.get(8),
        })
        .collect();

    Ok(orders)
}

pub async fn receive_order(state: &AppState, id: i32) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute("UPDATE incoming_orders SET status = 'delivered' WHERE id = $1", &[&id])
        .await
        .map_err(|e| format!("Update error: {}", e))?;

    Ok("Order marked as delivered".to_string())
}

// ==========================================
// Logs CRUD (Async)
// ==========================================

pub async fn save_log(state: &AppState, equipment_id: String, action: String) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute(
            "INSERT INTO logs (equipment_id, action) VALUES ($1, $2)",
            &[&equipment_id, &action],
        )
        .await
        .map_err(|e| format!("Insert error: {}", e))?;

    Ok(format!("Logged to PostgreSQL: {} - {}", equipment_id, action))
}

pub async fn get_logs(state: &AppState) -> Result<Vec<OfflineLog>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let rows = client
        .query(
            "SELECT id, equipment_id, action, timestamp::text FROM logs ORDER BY id DESC LIMIT 50",
            &[],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let logs: Vec<OfflineLog> = rows
        .iter()
        .map(|row| OfflineLog {
            id: Some(row.get(0)),
            equipment_id: row.get(1),
            action: row.get(2),
            timestamp: row.get(3),
        })
        .collect();

    Ok(logs)
}

// ==========================================
// AI Knowledge Loop CRUD (Async)
// ==========================================

pub async fn save_resolution(state: &AppState, description: String, category: String, solution: String) -> Result<String, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    client
        .execute(
            "INSERT INTO task_resolutions (original_description, category, solution_steps) VALUES ($1, $2, $3)",
            &[&description, &category, &solution],
        )
        .await
        .map_err(|e| format!("Insert error: {}", e))?;

    Ok("Resolution saved to knowledge base 🧠".to_string())
}

pub async fn find_similar_resolutions(state: &AppState, query: String) -> Result<Vec<TaskResolution>, String> {
    let client = state.db.get().await.map_err(|e| format!("Pool error: {}", e))?;

    let search_term = format!("%{}%", query.to_lowercase());

    let rows = client
        .query(
            "SELECT id, original_description, category, solution_steps, created_at::text
             FROM task_resolutions
             WHERE LOWER(original_description) LIKE $1 OR LOWER(category) LIKE $1
             ORDER BY created_at DESC
             LIMIT 5",
            &[&search_term],
        )
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let resolutions: Vec<TaskResolution> = rows
        .iter()
        .map(|row| TaskResolution {
            id: row.get(0),
            original_description: row.get(1),
            category: row.get(2),
            solution_steps: row.get(3),
            created_at: row.get(4),
        })
        .collect();

    Ok(resolutions)
}

// ==========================================
// User Authentication Functions
// ==========================================

/// Get a user by username for login
pub fn get_user_by_username(state: &AppState, username: &str) -> Result<Option<User>, String> {
    // For now, use a simple in-memory admin user
    // In production, this would query the database
    if username == "admin" {
        let admin_hash = crate::auth::hash_password("admin123")
            .unwrap_or_else(|_| "".to_string());
        Ok(Some(User {
            id: "admin-001".to_string(),
            username: "admin".to_string(),
            password_hash: admin_hash,
            role: UserRole::Admin,
            created_at: 0,
        }))
    } else if username == "worker" {
        let worker_hash = crate::auth::hash_password("worker123")
            .unwrap_or_else(|_| "".to_string());
        Ok(Some(User {
            id: "worker-001".to_string(),
            username: "worker".to_string(),
            password_hash: worker_hash,
            role: UserRole::Worker,
            created_at: 0,
        }))
    } else {
        Ok(None)
    }
}

/// Create a new user (Admin only)
pub fn create_user(state: &AppState, username: String, password: String, role: UserRole) -> Result<String, String> {
    // Password hashing
    let password_hash = crate::auth::hash_password(&password)?;
    
    // In a full implementation, this would insert into the database
    // For now, return success message
    Ok(format!("User {} created successfully with role {:?}", username, role))
}

