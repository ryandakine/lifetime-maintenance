// Database integration tests
use super::*;
use tempfile::NamedTempFile;
use std::sync::Arc;

/// Helper function to create a test database
fn create_test_db() -> Result<AppState, Box<dyn std::error::Error>> {
    let temp_file = NamedTempFile::new()?;
    let path = temp_file.path().to_path_buf();

    let manager = SqliteConnectionManager::file(&path);
    let pool = Pool::new(manager)?;

    let conn = pool.get()?;
    conn.execute("PRAGMA foreign_keys = ON;", [])?;

    // Create all tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at INTEGER NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            health_score REAL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            priority INTEGER NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    Ok(AppState {
        db: pool,
        auth: crate::auth::AuthState::new(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::UserRole;

    #[test]
    fn test_create_user_success() {
        let state = create_test_db().unwrap();

        let result = create_user(
            &state,
            "testuser".to_string(),
            "password123".to_string(),
            UserRole::Worker,
        );

        assert!(result.is_ok());
    }

    #[test]
    fn test_create_user_duplicate_username() {
        let state = create_test_db().unwrap();

        // Create first user
        create_user(
            &state,
            "testuser".to_string(),
            "password123".to_string(),
            UserRole::Worker,
        ).unwrap();

        // Try to create duplicate
        let result = create_user(
            &state,
            "testuser".to_string(),
            "different_password".to_string(),
            UserRole::Worker,
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("already exists"));
    }

    #[test]
    fn test_create_user_invalid_username_empty() {
        let state = create_test_db().unwrap();

        let result = create_user(
            &state,
            "".to_string(),
            "password123".to_string(),
            UserRole::Worker,
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("1-50 characters"));
    }

    #[test]
    fn test_create_user_invalid_username_too_long() {
        let state = create_test_db().unwrap();

        let long_username = "a".repeat(51);
        let result = create_user(
            &state,
            long_username,
            "password123".to_string(),
            UserRole::Worker,
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("1-50 characters"));
    }

    #[test]
    fn test_create_user_invalid_password_too_short() {
        let state = create_test_db().unwrap();

        let result = create_user(
            &state,
            "testuser".to_string(),
            "short".to_string(),
            UserRole::Worker,
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("at least 8 characters"));
    }

    #[test]
    fn test_get_user_by_username_success() {
        let state = create_test_db().unwrap();

        create_user(
            &state,
            "testuser".to_string(),
            "password123".to_string(),
            UserRole::Worker,
        ).unwrap();

        let user = get_user_by_username(&state, "testuser").unwrap();
        assert!(user.is_some());
        assert_eq!(user.unwrap().username, "testuser");
    }

    #[test]
    fn test_get_user_by_username_not_found() {
        let state = create_test_db().unwrap();

        let user = get_user_by_username(&state, "nonexistent").unwrap();
        assert!(user.is_none());
    }

    #[test]
    fn test_create_equipment_success() {
        let state = create_test_db().unwrap();

        let result = create_equipment(
            &state,
            "Test Equipment".to_string(),
            "active".to_string(),
            95.5,
        );

        assert!(result.is_ok());
    }

    #[test]
    fn test_get_all_equipment() {
        let state = create_test_db().unwrap();

        create_equipment(&state, "Equipment 1".to_string(), "active".to_string(), 95.0).unwrap();
        create_equipment(&state, "Equipment 2".to_string(), "maintenance".to_string(), 60.0).unwrap();

        let equipment = get_all_equipment(&state).unwrap();
        assert_eq!(equipment.len(), 2);
    }

    #[test]
    fn test_update_equipment_status() {
        let state = create_test_db().unwrap();

        create_equipment(&state, "Test Equipment".to_string(), "active".to_string(), 95.0).unwrap();

        let equipment = get_all_equipment(&state).unwrap();
        let id = equipment[0].id;

        let result = update_equipment_status(&state, id, "maintenance".to_string());
        assert!(result.is_ok());

        let updated = get_all_equipment(&state).unwrap();
        assert_eq!(updated[0].status, "maintenance");
    }

    #[test]
    fn test_delete_equipment() {
        let state = create_test_db().unwrap();

        create_equipment(&state, "Test Equipment".to_string(), "active".to_string(), 95.0).unwrap();

        let equipment = get_all_equipment(&state).unwrap();
        let id = equipment[0].id;

        delete_equipment(&state, id).unwrap();

        let remaining = get_all_equipment(&state).unwrap();
        assert_eq!(remaining.len(), 0);
    }

    #[test]
    fn test_create_task_success() {
        let state = create_test_db().unwrap();

        let result = create_task(
            &state,
            "Test task".to_string(),
            3,
            "Maintenance".to_string(),
        );

        assert!(result.is_ok());
    }

    #[test]
    fn test_get_tasks() {
        let state = create_test_db().unwrap();

        create_task(&state, "Task 1".to_string(), 3, "Maintenance".to_string()).unwrap();
        create_task(&state, "Task 2".to_string(), 1, "Inspection".to_string()).unwrap();

        let tasks = get_tasks(&state).unwrap();
        assert_eq!(tasks.len(), 2);
    }

    #[test]
    fn test_toggle_task_status() {
        let state = create_test_db().unwrap();

        create_task(&state, "Test task".to_string(), 3, "Maintenance".to_string()).unwrap();

        let tasks = get_tasks(&state).unwrap();
        let id = tasks[0].id;

        // Toggle to complete
        toggle_task_status(&state, id).unwrap();
        let updated = get_tasks(&state).unwrap();
        assert_eq!(updated[0].status, "complete");

        // Toggle back to pending
        toggle_task_status(&state, id).unwrap();
        let updated = get_tasks(&state).unwrap();
        assert_eq!(updated[0].status, "pending");
    }

    #[test]
    fn test_delete_task() {
        let state = create_test_db().unwrap();

        create_task(&state, "Test task".to_string(), 3, "Maintenance".to_string()).unwrap();

        let tasks = get_tasks(&state).unwrap();
        let id = tasks[0].id;

        delete_task(&state, id).unwrap();

        let remaining = get_tasks(&state).unwrap();
        assert_eq!(remaining.len(), 0);
    }

    #[test]
    fn test_get_stats() {
        let state = create_test_db().unwrap();

        create_equipment(&state, "Equipment 1".to_string(), "active".to_string(), 100.0).unwrap();
        create_equipment(&state, "Equipment 2".to_string(), "active".to_string(), 80.0).unwrap();
        create_equipment(&state, "Equipment 3".to_string(), "maintenance".to_string(), 60.0).unwrap();
        create_equipment(&state, "Equipment 4".to_string(), "down".to_string(), 0.0).unwrap();

        let stats = get_stats(&state).unwrap();
        assert_eq!(stats.total_equipment, 4);
        assert_eq!(stats.active_count, 2);
        assert_eq!(stats.maintenance_count, 1);
        assert_eq!(stats.down_count, 1);
        assert_eq!(stats.average_health, 60.0);
    }

    #[test]
    fn test_password_remains_hashed() {
        let state = create_test_db().unwrap();

        let password = "SecurePassword123!";
        create_user(
            &state,
            "testuser".to_string(),
            password.to_string(),
            UserRole::Worker,
        ).unwrap();

        let user = get_user_by_username(&state, "testuser").unwrap().unwrap();

        // Password should be hashed, not plain text
        assert_ne!(user.password_hash, password);
        assert!(user.password_hash.starts_with("$argon2"));
    }

    #[test]
    fn test_sql_injection_prevention() {
        let state = create_test_db().unwrap();

        // Try SQL injection in username
        let result = create_user(
            &state,
            "admin' OR '1'='1".to_string(),
            "password123".to_string(),
            UserRole::Worker,
        );

        // Should succeed (but not as SQL injection)
        assert!(result.is_ok());

        // Verify it was created as literal string, not executed as SQL
        let user = get_user_by_username(&state, "admin' OR '1'='1").unwrap();
        assert!(user.is_some());
    }
}
