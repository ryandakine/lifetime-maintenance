use axum::{
    routing::{get, post},
    Router,
    extract::{State, Multipart},
    Json,
};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::sync::Arc;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

mod models;
mod ai;

#[derive(Clone)]
struct AppState {
    pool: SqlitePool,
    ai: ai::AIService,
}

#[tokio::main]
async fn main() {
    // Initialize verbose logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend_rs=debug,tower_http=debug,sqlx=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Database Connection
    let db_url = "sqlite:maintenance.db?mode=rwc";
    tracing::info!("Connecting to database: {}", db_url);
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(db_url)
        .await
        .expect("Failed to connect to database");

    // Run Migrations
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");
    tracing::info!("Migrations applied successfully");

    // Initialize AI Service
    let ai_service = ai::AIService::new();

    let state = AppState {
        pool,
        ai: ai_service,
    };

    // Build application
    let app = Router::new()
        .route("/", get(handler))
        .route("/equipment", get(list_equipment))
        .route("/analyze", post(analyze_image))
        .route("/api/workflow/analyze-photo", post(analyze_photo_workflow))
        .with_state(state);

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handler() -> &'static str {
    "Hello, Rust Agent! DB Connected. AI Ready."
}

async fn list_equipment(
    State(state): State<AppState>,
) -> Json<Vec<models::Equipment>> {
    let equipment = sqlx::query_as::<_, models::Equipment>("SELECT * FROM equipment")
        .fetch_all(&state.pool)
        .await
        .unwrap(); 

    Json(equipment)
}

#[derive(serde::Deserialize)]
struct AnalyzeRequest {
    description: String,
    context: String,
}

async fn analyze_image(
    State(state): State<AppState>,
    Json(payload): Json<AnalyzeRequest>,
) -> Json<ai::AnalysisResult> {
    let result = state.ai.analyze_image(&payload.description, &payload.context)
        .await
        .unwrap_or_else(|e| {
            tracing::error!("AI Analysis failed: {}", e);
            ai::AnalysisResult {
                analysis: format!("Error analyzing image: {}", e),
                priority: "medium".to_string(),
            }
        });
    
    Json(result)
}

async fn analyze_photo_workflow(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Json<serde_json::Value> {
    let mut photo_data = None;
    let mut location = String::new();
    let mut issue = String::new();
    let mut urgency = String::new();

    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        if name == "photo" {
            let data = field.bytes().await.unwrap();
            photo_data = Some(BASE64.encode(&data));
        } else if name == "location" {
            location = field.text().await.unwrap();
        } else if name == "issue" {
            issue = field.text().await.unwrap();
        } else if name == "urgency" {
            urgency = field.text().await.unwrap();
        }
    }

    if let Some(base64_img) = photo_data {
        let context = format!("Location: {}, Issue: {}, Urgency: {}", location, issue, urgency);
        let result = state.ai.analyze_image_with_photo(&base64_img, &context).await;
        
        match result {
            Ok(res) => {
                // Construct Frontend-compatible response
                serde_json::json!({
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
                }).into()
            },
            Err(e) => {
                tracing::error!("Workflow failed: {}", e);
                serde_json::json!({
                    "success": false,
                    "error": e.to_string()
                }).into()
            }
        }
    } else {
        Json(serde_json::json!({
            "success": false,
            "error": "No photo provided"
        }))
    }
}
