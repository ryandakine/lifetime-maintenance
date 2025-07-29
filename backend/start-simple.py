#!/usr/bin/env py
"""
Simplified Startup script for Lifetime Fitness Maintenance FastAPI Backend
"""

import uvicorn
import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting Lifetime Fitness Maintenance API (Simplified)...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 API Documentation at: http://localhost:8000/docs")
    print("🔍 Health check at: http://localhost:8000/health")
    print()
    
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 8000))
    
    print(f"📍 API will be available at: http://localhost:{port}")
    print(f"📚 API Documentation at: http://localhost:{port}/docs")
    print(f"🔍 Health check at: http://localhost:{port}/health")
    print()
    
    uvicorn.run(
        "app.main-simple:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    ) 