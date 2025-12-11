from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine, Base

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    await engine.dispose()

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

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "lifetime-fitness-maintenance-api"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Lifetime Fitness Maintenance API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main-simple:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    ) 