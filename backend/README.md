# 🏋️ Lifetime Fitness Maintenance API

FastAPI backend for the Lifetime Fitness Maintenance system with AI-powered features.

## 🚀 Features

- **Equipment Management**: Track fitness equipment with detailed information
- **Maintenance Tasks**: Create and manage maintenance tasks with priorities
- **AI-Powered Analysis**: Analyze photos using Perplexity AI
- **Shopping Lists**: Manage parts and supplies
- **Email Generation**: AI-powered email content generation
- **Photo Upload**: Upload and analyze equipment photos
- **Database**: SQLAlchemy with SQLite (easily upgradeable to PostgreSQL)

## 🛠️ Tech Stack

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: Database ORM
- **Perplexity AI**: AI-powered analysis and content generation
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server
- **SQLite**: Database (production-ready for PostgreSQL)

## 📦 Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```env
# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=Lifetime Fitness Maintenance API

# Database
DATABASE_URL=sqlite:///./lifetime_maintenance.db

# Perplexity API
PERPLEXITY_API_KEY=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

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Start the API Server

```bash
python start.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📚 API Endpoints

### Equipment Management

- `GET /api/v1/maintenance/equipment/` - Get all equipment
- `POST /api/v1/maintenance/equipment/` - Create new equipment
- `GET /api/v1/maintenance/equipment/{id}` - Get equipment by ID
- `PUT /api/v1/maintenance/equipment/{id}` - Update equipment

### Maintenance Tasks

- `GET /api/v1/maintenance/tasks/` - Get maintenance tasks
- `POST /api/v1/maintenance/tasks/` - Create new task
- `GET /api/v1/maintenance/tasks/{id}` - Get task by ID
- `PUT /api/v1/maintenance/tasks/{id}` - Update task

### AI Analysis

- `POST /api/v1/maintenance/analyze-image/` - Analyze image description
- `POST /api/v1/maintenance/upload-equipment-photo/` - Upload and analyze photo
- `POST /api/v1/maintenance/generate-email/` - Generate email content

### Shopping Lists

- `GET /api/v1/maintenance/shopping/` - Get shopping items
- `POST /api/v1/maintenance/shopping/` - Create shopping item
- `PUT /api/v1/maintenance/shopping/{id}` - Update shopping item

## 🔧 Usage Examples

### Create Equipment

```bash
curl -X POST "http://localhost:8000/api/v1/maintenance/equipment/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Treadmill A1",
    "location": "Cardio Room",
    "equipment_type": "Cardio",
    "manufacturer": "Life Fitness",
    "model": "T5",
    "status": "operational"
  }'
```

### Create Maintenance Task

```bash
curl -X POST "http://localhost:8000/api/v1/maintenance/tasks/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Treadmill Belt Replacement",
    "description": "Replace worn treadmill belt on Treadmill A1",
    "equipment_id": 1,
    "priority": "high",
    "assigned_to": "John Smith",
    "estimated_hours": 2.5
  }'
```

### Analyze Image

```bash
curl -X POST "http://localhost:8000/api/v1/maintenance/analyze-image/" \
  -H "Content-Type: application/json" \
  -d '{
    "image_description": "Treadmill belt showing signs of wear and tear",
    "context": "Routine maintenance inspection",
    "analysis_type": "maintenance"
  }'
```

### Generate Email

```bash
curl -X POST "http://localhost:8000/api/v1/maintenance/generate-email/" \
  -F "topic=Treadmill maintenance required" \
  -F "recipient=maintenance@lifetimefitness.com" \
  -F "urgency=high"
```

## 🗄️ Database Schema

### Equipment
- Basic equipment information
- Location and status tracking
- Maintenance history

### Maintenance Tasks
- Task details and priorities
- Assignment and scheduling
- Progress tracking

### Photos
- Equipment and task photos
- AI analysis results
- File management

### Shopping Items
- Parts and supplies tracking
- Cost estimation
- Purchase status

## 🔄 Integration with React Frontend

The FastAPI backend is designed to work alongside your existing React frontend:

1. **React App** (Port 3001) - User interface
2. **FastAPI Backend** (Port 8000) - API and business logic
3. **n8n Workflows** - Complex automation (optional)

### Frontend Integration

Update your React app to use the FastAPI endpoints:

```javascript
// Example: Fetch equipment
const response = await fetch('http://localhost:8000/api/v1/maintenance/equipment/');
const equipment = await response.json();

// Example: Create task
const taskResponse = await fetch('http://localhost:8000/api/v1/maintenance/tasks/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(taskData)
});
```

## 🚀 Production Deployment

### Using PostgreSQL

1. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/lifetime_maintenance
```

2. Install PostgreSQL dependencies:
```bash
pip install psycopg2-binary
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔍 Monitoring and Logging

- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs`
- **OpenAPI Schema**: `GET /openapi.json`

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use type hints and Pydantic models

## 📄 License

This project is part of the Lifetime Fitness Maintenance system. 