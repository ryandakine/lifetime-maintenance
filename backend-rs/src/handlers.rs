use axum::{
    extract::{State, Multipart},
    Json,
};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use serde_json::json;

use crate::{ai, error::AppError, AppState, models};

pub async fn handler() -> &'static str {
    "Hello, Rust Agent! DB Connected. AI Ready."
}

pub async fn list_equipment(
    State(state): State<AppState>,
) -> Result<Json<Vec<models::Equipment>>, AppError> {
    let equipment = sqlx::query_as::<_, models::Equipment>("SELECT * FROM equipment")
        .fetch_all(&state.pool)
        .await?;
        
    Ok(Json(equipment))
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
