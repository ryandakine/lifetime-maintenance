use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use uuid::Uuid;
use std::time::{SystemTime, UNIX_EPOCH};

/// User roles for RBAC
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UserRole {
    Admin,
    Worker,
}

/// User account stored in database
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub password_hash: String,
    pub role: UserRole,
    pub created_at: i64,
}

/// Session token for authenticated users
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub token: String,
    pub user_id: String,
    pub username: String,
    pub role: UserRole,
    pub expires_at: i64,
}

/// Authentication state manager
pub struct AuthState {
    pub sessions: Arc<Mutex<HashMap<String, Session>>>,
}

impl AuthState {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Create a new session for a user
    pub fn create_session(&self, user: &User) -> Session {
        let token = Uuid::new_v4().to_string();
        let expires_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
            + 86400; // 24 hours

        let session = Session {
            token: token.clone(),
            user_id: user.id.clone(),
            username: user.username.clone(),
            role: user.role.clone(),
            expires_at,
        };

        let mut sessions = self.sessions.lock().unwrap();
        sessions.insert(token, session.clone());

        session
    }

    /// Validate a session token
    pub fn validate_session(&self, token: &str) -> Option<Session> {
        let sessions = self.sessions.lock().unwrap();
        if let Some(session) = sessions.get(token) {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs() as i64;

            if session.expires_at > now {
                return Some(session.clone());
            }
        }
        None
    }

    /// Logout - remove session
    pub fn logout(&self, token: &str) {
        let mut sessions = self.sessions.lock().unwrap();
        sessions.remove(token);
    }

    /// Check if user has required role
    pub fn has_role(&self, token: &str, required_role: UserRole) -> bool {
        if let Some(session) = self.validate_session(token) {
            // Admin has access to everything
            if session.role == UserRole::Admin {
                return true;
            }
            // Otherwise, role must match exactly
            return session.role == required_role;
        }
        false
    }

    /// Clean up expired sessions
    pub fn cleanup_expired(&self) {
        let mut sessions = self.sessions.lock().unwrap();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        sessions.retain(|_, session| session.expires_at > now);
    }
}

/// Hash a password using Argon2
pub fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| format!("Failed to hash password: {}", e))
}

/// Verify a password against a hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, String> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| format!("Invalid hash format: {}", e))?;

    let argon2 = Argon2::default();

    Ok(argon2
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_hashing() {
        let password = "SecurePassword123!";
        let hash = hash_password(password).unwrap();

        // Verify correct password
        assert!(verify_password(password, &hash).unwrap());

        // Verify wrong password fails
        assert!(!verify_password("WrongPassword", &hash).unwrap());
    }

    #[test]
    fn test_session_creation() {
        let auth_state = AuthState::new();
        let user = User {
            id: "user123".to_string(),
            username: "testuser".to_string(),
            password_hash: "hash".to_string(),
            role: UserRole::Worker,
            created_at: 0,
        };

        let session = auth_state.create_session(&user);

        // Session should be valid
        assert!(auth_state.validate_session(&session.token).is_some());

        // Invalid token should fail
        assert!(auth_state.validate_session("invalid-token").is_none());
    }

    #[test]
    fn test_role_based_access() {
        let auth_state = AuthState::new();
        let admin_user = User {
            id: "admin1".to_string(),
            username: "admin".to_string(),
            password_hash: "hash".to_string(),
            role: UserRole::Admin,
            created_at: 0,
        };

        let session = auth_state.create_session(&admin_user);

        // Admin should have access to both roles
        assert!(auth_state.has_role(&session.token, UserRole::Admin));
        assert!(auth_state.has_role(&session.token, UserRole::Worker));
    }
}
