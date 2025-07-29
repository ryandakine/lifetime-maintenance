from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

# Import our logging system
from app.core.logging import info, error, log_startup, log_shutdown

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        log_startup("Lifetime Fitness Maintenance API", {
            "version": "2.0.0",
            "port": 8000
        })
        info("Database initialization started")
        
        # Import database components here to avoid circular imports
        from app.core.database import engine, Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        info("Database tables created successfully")
        
    except Exception as e:
        error("Failed to initialize database", e)
        raise
    
    yield
    
    # Shutdown
    try:
        from app.core.database import engine
        await engine.dispose()
        log_shutdown("Lifetime Fitness Maintenance API", "Normal shutdown")
    except Exception as e:
        error("Error during shutdown", e)

app = FastAPI(
    title="Lifetime Fitness Maintenance API",
    description="Backend API for Lifetime Fitness Maintenance System",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5175", "http://localhost:3000", "http://localhost:3003", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    info("Health check requested")
    return {"status": "healthy", "service": "lifetime-fitness-maintenance-api"}

# Root endpoint
@app.get("/")
async def root():
    info("Root endpoint accessed")
    return {
        "message": "Lifetime Fitness Maintenance API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Include API routes (only if they exist and don't cause import issues)
try:
    from app.api.v1.api import api_router
    app.include_router(api_router, prefix="/api/v1")
    info("API router included successfully")
except ImportError as e:
    error("Failed to import API router", e, {"note": "API routes will not be available"})
except Exception as e:
    error("Error including API router", e)

if __name__ == "__main__":
    info("Starting FastAPI server", {
        "host": "0.0.0.0",
        "port": 8000,
        "reload": True
    })
    uvicorn.run(
        "app.main_simple_fixed:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 