use axum::{
    extract::{State, Json},
    http::{StatusCode, Method},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;
use serde_json::{json, Value};
use tokio::net::TcpListener;

// Import modules (compiled as part of this binary)
mod db;
mod auth;

use crate::db::AppState;
use crate::auth::User;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    println!("Starting CIMCO Web Server...");
    println!("Connecting to database...");

    let app_state = match db::init().await {
        Ok(state) => state,
        Err(e) => {
            eprintln!("Failed to initialize database: {}", e);
            std::process::exit(1);
        }
    };

    println!("Database connected.");

    let shared_state = Arc::new(app_state);

    let cors = CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(tower_http::cors::Any);

    // Define API routes
    let api_routes = Router::new()
        .route("/login", post(login_handler))
        .route("/get_parts_paginated", post(get_parts_paginated_handler))
        .route("/update_part_quantity", post(update_part_quantity_handler))
        .route("/update_part_location", post(update_part_location_handler))
        .route("/get_incoming_orders", post(get_incoming_orders_handler))
        .route("/get_equipment", post(get_equipment_handler))
        .route("/get_stats", post(get_stats_handler))
        .with_state(shared_state);

    // Combine API and Static Files (Frontend)
    // Serve files from ../dist
    let dist_path = "/home/ryan/lifetime-maintenance/cimco/dist";
    
    let app = Router::new()
        .nest("/api", api_routes)
        .nest_service("/", ServeDir::new(dist_path))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    println!("Server listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// Handlers

async fn login_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Value>,
) -> Response {
    let username = payload["username"].as_str().unwrap_or("");
    let password = payload["password"].as_str().unwrap_or("");

    if username.is_empty() || password.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(json!({"error": "Missing credentials"}))).into_response();
    }

    // 1. Get user
    let user = match db::get_user_by_username(&state, username) { // Sync call
        Ok(Some(u)) => u,
        Ok(None) => return (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid credentials"}))).into_response(),
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    };

    // 2. Verify password
    let is_valid = auth::verify_password(password, &user.password_hash).unwrap_or(false);
    if !is_valid {
        return (StatusCode::UNAUTHORIZED, Json(json!({"error": "Invalid credentials"}))).into_response();
    }

    // 3. Create Session
    let session = state.auth.create_session(&user);

    // Return Session (Frontend should store this)
    (StatusCode::OK, Json(session)).into_response()
}

async fn get_parts_paginated_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Value>,
) -> Response {
    let page = payload["page"].as_i64().unwrap_or(1) as i32;
    let page_size = payload["page_size"].as_i64().unwrap_or(50) as i32;
    let category = payload["category_filter"].as_str().map(|s| s.to_string());
    let search = payload["search_query"].as_str().map(|s| s.to_string());

    match db::get_parts_paginated(&state, page, page_size, category, search).await {
        Ok(result) => (StatusCode::OK, Json(result)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    }
}

async fn update_part_quantity_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Value>,
) -> Response {
    let id = payload["id"].as_i64().unwrap_or(0) as i32;
    let change = payload["quantity_change"].as_i64().unwrap_or(0) as i32;

    match db::update_part_quantity(&state, id, change).await {
        Ok(msg) => (StatusCode::OK, Json(msg)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    }
}

async fn update_part_location_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Value>,
) -> Response {
    let id = payload["id"].as_i64().unwrap_or(0) as i32;
    let location = payload["location"].as_str().unwrap_or("").to_string();

    match db::update_part_location(&state, id, location).await {
        Ok(msg) => (StatusCode::OK, Json(msg)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    }
}

// Returns incoming orders from DB
async fn get_incoming_orders_handler(
    State(state): State<Arc<AppState>>,
    Json(_): Json<Value>,
) -> Response {
    match db::get_incoming_orders(&state).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    }
}

async fn get_equipment_handler(
    State(state): State<Arc<AppState>>,
    Json(_): Json<Value>,
) -> Response {
    match db::get_all_equipment(&state).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    }
}

async fn get_stats_handler(
    State(state): State<Arc<AppState>>,
    Json(_): Json<Value>,
) -> Response {
    match db::get_stats(&state).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e}))).into_response(),
    }
}
