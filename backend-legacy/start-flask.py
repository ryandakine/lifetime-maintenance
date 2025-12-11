#!/usr/bin/env python3
"""
Startup script for Flask-based Lifetime Fitness Maintenance API
Alternative to FastAPI while resolving compatibility issues
"""

import os
import sys
import logging
from pathlib import Path

# Add the app directory to Python path
backend_dir = Path(__file__).parent
app_dir = backend_dir / "app"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(app_dir))

# Import Flask app
from app.main_flask import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """Start the Flask application"""
    port = int(os.environ.get('PORT', 8000))
    
    print(f"🚀 Starting Lifetime Fitness Maintenance API (Flask)")
    print(f"📍 API will be available at: http://localhost:{port}")
    print(f"📚 API Documentation at: http://localhost:{port}/docs")
    print(f"🔍 Health check at: http://localhost:{port}/health")
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=True,
            use_reloader=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 