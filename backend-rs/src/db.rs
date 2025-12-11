use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};


pub async fn init_pool(db_url: &str) -> std::result::Result<SqlitePool, sqlx::Error> {
    tracing::info!("Connecting to database: {}", db_url);
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(db_url)
        .await?;

    Ok(pool)
}

pub async fn run_migrations(pool: &SqlitePool) -> std::result::Result<(), sqlx::Error> {
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations")
        .run(pool)
        .await?;
    tracing::info!("Migrations applied successfully");
    Ok(())
}
