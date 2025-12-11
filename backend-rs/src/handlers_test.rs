use crate::handlers::*;
use crate::AppState;
use axum::{
    extract::{Query, State},
};
use sqlx::sqlite::SqlitePool;

/// Helper to create a test database pool
async fn create_test_db() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite::memory:")
        .await
        .expect("Failed to create test database");
    
    // Run migrations
    sqlx::query(
        "CREATE TABLE equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            equipment_type TEXT,
            status TEXT DEFAULT 'operational',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    )
    .execute(&pool)
    .await
    .expect("Failed to create equipment table");
    
    sqlx::query(
        "CREATE TABLE maintenance_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            equipment_id INTEGER NOT NULL,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    )
    .execute(&pool)
    .await
    .expect("Failed to create tasks table");
    
    pool
}

/// Helper to seed test data
async fn seed_test_data(pool: &SqlitePool) {
    for i in 1..=25 {
        sqlx::query(
            "INSERT INTO equipment (name, location, equipment_type, status) 
             VALUES (?, ?, ?, ?)"
        )
        .bind(format!("Equipment {}", i))
        .bind(format!("Location {}", i % 3))
        .bind(if i % 2 == 0 { "treadmill" } else { "weights" })
        .bind("operational")
        .execute(pool)
        .await
        .expect("Failed to seed equipment");
    }
    
    for i in 1..=30 {
        sqlx::query(
            "INSERT INTO maintenance_tasks (title, description, equipment_id, priority, status)
             VALUES (?, ?, ?, ?, ?)"
        )
        .bind(format!("Task {}", i))
        .bind(format!("Fix equipment {}", i % 25 + 1))
        .bind(i % 25 + 1)
        .bind(if i % 3 == 0 { "high" } else { "medium" })
        .bind("pending")
        .execute(pool)
        .await
        .expect("Failed to seed tasks");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_list_equipment_default_pagination() {
        let pool = create_test_db().await;
        seed_test_data(&pool).await;
        
        let state = AppState {
            pool: pool.clone(),
            ai: crate::ai::AIService::new(),
        };
        
        let query = PaginationQuery {
            limit: 20,
            offset: 0,
        };
        
        let result = list_equipment(State(state), Query(query))
            .await
            .expect("Handler failed");
        
        let response = result.0;
        
        assert!(response.get("data").is_some());
        assert!(response.get("pagination").is_some());
        
        let data = response.get("data").unwrap().as_array().unwrap();
        assert_eq!(data.len(), 20); // Should return 20 items (default limit)
        
        let pagination = response.get("pagination").unwrap();
        assert_eq!(pagination.get("total").unwrap().as_i64().unwrap(), 25);
        assert_eq!(pagination.get("limit").unwrap().as_i64().unwrap(), 20);
        assert_eq!(pagination.get("offset").unwrap().as_i64().unwrap(), 0);
    }

    #[tokio::test]
    async fn test_list_equipment_custom_pagination() {
        let pool = create_test_db().await;
        seed_test_data(&pool).await;
        
        let state = AppState {
            pool: pool.clone(),
            ai: crate::ai::AIService::new(),
        };
        
        let query = PaginationQuery {
            limit: 10,
            offset: 15,
        };
        
        let result = list_equipment(State(state), Query(query))
            .await
            .expect("Handler failed");
        
        let response = result.0;
        let data = response.get("data").unwrap().as_array().unwrap();
        
        assert_eq!(data.len(), 10); // Should return remaining 10 items
        
        let pagination = response.get("pagination").unwrap();
        assert_eq!(pagination.get("limit").unwrap().as_i64().unwrap(), 10);
        assert_eq!(pagination.get("offset").unwrap().as_i64().unwrap(), 15);
    }

    #[tokio::test]
    async fn test_list_tasks_pagination() {
        let pool = create_test_db().await;
        seed_test_data(&pool).await;
        
        let state = AppState {
            pool: pool.clone(),
            ai: crate::ai::AIService::new(),
        };
        
        let query = PaginationQuery {
            limit: 15,
            offset: 0,
        };
        
        let result = list_tasks(State(state), Query(query))
            .await
            .expect("Handler failed");
        
        let response = result.0;
        let data = response.get("data").unwrap().as_array().unwrap();
        
        assert_eq!(data.len(), 15);
        
        let pagination = response.get("pagination").unwrap();
        assert_eq!(pagination.get("total").unwrap().as_i64().unwrap(), 30);
    }

    #[tokio::test]
    async fn test_pagination_beyond_total() {
        let pool = create_test_db().await;
        seed_test_data(&pool).await;
        
        let state = AppState {
            pool: pool.clone(),
            ai: crate::ai::AIService::new(),
        };
        
        let query = PaginationQuery {
            limit: 20,
            offset: 100, // Beyond total items
        };
        
        let result = list_equipment(State(state), Query(query))
            .await
            .expect("Handler failed");
        
        let response = result.0;
        let data = response.get("data").unwrap().as_array().unwrap();
        
        assert_eq!(data.len(), 0); // Should return empty array
    }

    #[tokio::test]
    async fn test_health_check() {
        let result = handler().await;
        assert_eq!(result, "Hello, Rust Agent! DB Connected. AI Ready.");
    }
}
