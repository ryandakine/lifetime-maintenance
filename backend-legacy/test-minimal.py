from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Lifetime Fitness Maintenance API - Test",
    description="Minimal test version",
    version="1.0.0"
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
    return {"status": "healthy", "service": "lifetime-fitness-maintenance-api-test"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Lifetime Fitness Maintenance API - Test Version",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "test-minimal:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 