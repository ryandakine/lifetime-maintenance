"""
Flask-based API for Lifetime Fitness Maintenance System
Alternative to FastAPI while resolving compatibility issues
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import datetime

# Import our logging system
from app.core.logging import info, error, log_startup, log_shutdown

# Create Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.before_request
def log_request():
    """Log all incoming requests"""
    info("API Request", {
        "method": request.method,
        "endpoint": request.endpoint,
        "path": request.path,
        "ip": request.remote_addr,
        "user_agent": request.headers.get('User-Agent')
    })

@app.after_request
def log_response(response):
    """Log all outgoing responses"""
    info("API Response", {
        "method": request.method,
        "endpoint": request.endpoint,
        "status_code": response.status_code,
        "content_length": len(response.get_data())
    })
    return response

@app.route('/health')
def health_check():
    """Health check endpoint"""
    info("Health check requested")
    return jsonify({
        "status": "healthy", 
        "service": "lifetime-fitness-maintenance-api",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/')
def root():
    """Root endpoint"""
    info("Root endpoint accessed")
    return jsonify({
        "message": "Lifetime Fitness Maintenance API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/test')
def test():
    """Test endpoint"""
    info("Test endpoint accessed")
    return jsonify({
        "message": "API is working correctly",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/api/v1/tasks')
def get_tasks():
    """Get tasks endpoint"""
    info("Tasks endpoint accessed")
    return jsonify({
        "tasks": [],
        "message": "Tasks endpoint working",
        "timestamp": datetime.datetime.now().isoformat()
    })

if __name__ == '__main__':
    log_startup("Lifetime Fitness Maintenance API (Flask)", {
        "version": "2.0.0",
        "port": 8000,
        "framework": "Flask"
    })
    
    try:
        app.run(host='0.0.0.0', port=8000, debug=True)
    except KeyboardInterrupt:
        log_shutdown("Lifetime Fitness Maintenance API (Flask)", "User interrupted")
    except Exception as e:
        error("Failed to start Flask server", e)
        raise 