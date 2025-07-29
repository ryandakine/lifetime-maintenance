#!/usr/bin/env py
"""
Simplified Startup script for Lifetime Fitness Maintenance Flask Backend
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
backend_dir = Path(__file__).parent
app_dir = backend_dir / "app"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(app_dir))

# Import Flask app
from app.main_flask import app

if __name__ == "__main__":
    print("🚀 Starting Lifetime Fitness Maintenance API (Flask)...")
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
    
    try:
        app.run(
            host="0.0.0.0",
            port=port,
            debug=True,
            use_reloader=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1) 