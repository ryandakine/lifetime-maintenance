"""
Minimal working FastAPI application for Lifetime Fitness Maintenance System
Avoids Pydantic compatibility issues by using only essential imports
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="Lifetime Fitness Maintenance API",
    description="Backend API for Lifetime Fitness Maintenance System",
    version="2.0.0"
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

# Simple test endpoint
@app.get("/test")
async def test():
    return {"message": "API is working correctly"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main_working:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 