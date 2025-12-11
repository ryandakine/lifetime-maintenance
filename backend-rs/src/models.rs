use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Equipment {
    pub id: i64,
    pub name: String,
    pub location: Option<String>,
    pub equipment_type: Option<String>,
    pub manufacturer: Option<String>,
    pub model: Option<String>,
    pub serial_number: Option<String>,
    pub installation_date: Option<DateTime<Utc>>,
    pub last_maintenance: Option<DateTime<Utc>>,
    pub next_maintenance: Option<DateTime<Utc>>,
    pub status: Option<String>,
    pub notes: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct MaintenanceTask {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub equipment_id: i64,
    pub priority: Option<String>,
    pub status: Option<String>,
    pub assigned_to: Option<String>,
    pub due_date: Option<DateTime<Utc>>,
    pub completed_date: Option<DateTime<Utc>>,
    pub estimated_hours: Option<f64>,
    pub actual_hours: Option<f64>,
    pub cost: Option<f64>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
