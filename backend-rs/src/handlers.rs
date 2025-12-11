use axum::{
    extract::{State, Multipart, Query},
    Json,
};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use serde_json::json;

use crate::{ai, error::AppError, AppState, models};

/// Pagination query parameters
#[derive(serde::Deserialize)]
pub struct PaginationQuery {
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

fn default_limit() -> i64 {
    20
}

pub async fn handler() -> &'static str {
    "Hello, Rust Agent! DB Connected. AI Ready."
}

pub async fn list_equipment(
    State(state): State<AppState>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let equipment = sqlx::query_as::<_, models::Equipment>(
        "SELECT * FROM equipment ORDER BY id LIMIT ? OFFSET ?"
    )
        .bind(pagination.limit)
        .bind(pagination.offset)
        .fetch_all(&state.pool)
        .await?;
    
    // Get total count for pagination metadata
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM equipment")
        .fetch_one(&state.pool)
        .await?;
        
    Ok(Json(json!({
        "data": equipment,
        "pagination": {
            "limit": pagination.limit,
            "offset": pagination.offset,
            "total": total.0
        }
    })))
}

pub async fn list_tasks(
    State(state): State<AppState>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let tasks = sqlx::query_as::<_, models::MaintenanceTask>(
        "SELECT * FROM maintenance_tasks ORDER BY id LIMIT ? OFFSET ?"
    )
        .bind(pagination.limit)
        .bind(pagination.offset)
        .fetch_all(&state.pool)
        .await?;
    
    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM maintenance_tasks")
        .fetch_one(&state.pool)
        .await?;
        
    Ok(Json(json!({
        "data": tasks,
        "pagination": {
            "limit": pagination.limit,
            "offset": pagination.offset,
            "total": total.0
        }
    })))
}

#[derive(serde::Deserialize)]
pub struct AnalyzeRequest {
    description: String,
    context: String,
}

pub async fn analyze_image(
    State(state): State<AppState>,
    Json(payload): Json<AnalyzeRequest>,
) -> Result<Json<ai::AnalysisResult>, AppError> {
    // Map anyhow error to AppError
    let result = state.ai.analyze_image(&payload.description, &payload.context)
        .await
        .map_err(|e| AppError::Analysis(e.to_string()))?;
    
    Ok(Json(result))
}

pub async fn analyze_photo_workflow(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let mut photo_data = None;
    let mut location = String::new();
    let mut issue = String::new();
    let mut urgency = String::new();

    while let Some(field) = multipart.next_field().await.map_err(|e| AppError::Multipart(e.to_string()))? {
        let name = field.name().unwrap_or_default().to_string();
        
        match name.as_str() {
            "photo" => {
                let data = field.bytes().await.map_err(|e| AppError::Multipart(e.to_string()))?;
                photo_data = Some(BASE64.encode(&data));
            },
            "location" => {
                location = field.text().await.map_err(|e| AppError::Multipart(e.to_string()))?;
            },
            "issue" => {
                issue = field.text().await.map_err(|e| AppError::Multipart(e.to_string()))?;
            },
            "urgency" => {
                urgency = field.text().await.map_err(|e| AppError::Multipart(e.to_string()))?;
            },
            _ => {}
        }
    }

    if let Some(base64_img) = photo_data {
        let context = format!("Location: {}, Issue: {}, Urgency: {}", location, issue, urgency);
        
        let res = state.ai.analyze_image_with_photo(&base64_img, &context)
            .await
            .map_err(|e| AppError::Analysis(e.to_string()))?;

        // Construct Frontend-compatible response
        Ok(Json(json!({
            "success": true,
            "data": {
                "ai_analysis": {
                    "equipment_type": "Detected Equipment",
                    "damage_assessment": res.analysis,
                    "safety_concerns": if res.priority == "critical" { "Critical Safety Issue" } else { "None" },
                    "time_estimate": "1-2 hours",
                    "tools_needed": "Standard Toolkit"
                },
                "parts_lookup": { "grainger_parts": [] },
                "purchase_order": null
            }
        })))
    } else {
        Err(AppError::Multipart("No photo provided".to_string()))
    }
}

#[cfg(test)]
mod tests {
    include!("handlers_test.rs");
}
