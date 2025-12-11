use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::sqlite::SqlitePool;

mod models;
mod ai;
mod error;
mod db;
mod handlers;

#[derive(Clone)]
pub struct AppState {
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
    let pool = db::init_pool(db_url).await.expect("Failed to connect to database");

    // Run Migrations
    db::run_migrations(&pool).await.expect("Failed to run migrations");

    // Initialize AI Service
    let ai_service = ai::AIService::new();

    let state = AppState {
        pool,
        ai: ai_service,
    };

    // Build application
    let app = Router::new()
        .route("/", get(handlers::handler))
        .route("/equipment", get(handlers::list_equipment))
        .route("/analyze", post(handlers::analyze_image))
        .route("/api/workflow/analyze-photo", post(handlers::analyze_photo_workflow))
        .with_state(state);

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
