# 🏗️ Hybrid Architecture Guide

## Overview

This guide explains how to run both the **React + n8n** setup and the **FastAPI backend** together for maximum flexibility and power.

## 🎯 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │   FastAPI       │    │   n8n Cloud     │
│   (Port 3001)   │◄──►│   (Port 8000)   │◄──►│   (Cloud)       │
│                 │    │                 │    │                 │
│ • UI Components │    │ • API Endpoints │    │ • Complex       │
│ • State Mgmt    │    │ • Database      │    │   Workflows     │
│ • PWA Features  │    │ • AI Services   │    │ • Automation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Start React App (Existing)
```bash
# In the main directory
npm run dev
# Runs on http://localhost:3001
```

### 2. Start FastAPI Backend (New)
```bash
# In the backend directory
cd backend
pip install -r requirements.txt
python start.py
# Runs on http://localhost:8000
```

### 3. Set Up n8n Workflows (Optional)
- Import workflows to your n8n cloud instance
- Configure environment variables
- Get webhook URLs

## 🔄 Integration Strategies

### Strategy 1: FastAPI Primary + n8n Secondary
- **FastAPI**: Core features (equipment, tasks, photos, shopping)
- **n8n**: Complex automation (email scheduling, notifications, integrations)

### Strategy 2: n8n Primary + FastAPI Secondary
- **n8n**: Main workflow orchestration
- **FastAPI**: Database operations and AI services

### Strategy 3: Hybrid Approach (Recommended)
- **FastAPI**: Real-time operations, database, AI analysis
- **n8n**: Background tasks, scheduling, external integrations

## 📡 API Integration Examples

### Frontend to FastAPI

```javascript
// In your React components
const API_BASE = 'http://localhost:8000/api/v1';

// Fetch equipment
const getEquipment = async () => {
  const response = await fetch(`${API_BASE}/maintenance/equipment/`);
  return response.json();
};

// Create maintenance task
const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE}/maintenance/tasks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return response.json();
};

// Upload and analyze photo
const uploadPhoto = async (equipmentId, file, description) => {
  const formData = new FormData();
  formData.append('equipment_id', equipmentId);
  formData.append('description', description);
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/maintenance/upload-equipment-photo/`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### FastAPI to n8n

```python
# In your FastAPI services
import httpx

async def trigger_n8n_workflow(workflow_url: str, data: dict):
    """Trigger n8n workflow from FastAPI"""
    async with httpx.AsyncClient() as client:
        response = await client.post(workflow_url, json=data)
        return response.json()

# Example usage in FastAPI endpoint
@router.post("/tasks/{task_id}/notify")
async def notify_task_completion(task_id: int, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    
    # Update task status
    task.status = "completed"
    task.completed_date = datetime.now()
    db.commit()
    
    # Trigger n8n workflow for notifications
    if settings.N8N_WEBHOOK_URL:
        await trigger_n8n_workflow(settings.N8N_WEBHOOK_URL, {
            "task_id": task_id,
            "action": "task_completed",
            "task_data": {
                "title": task.title,
                "assigned_to": task.assigned_to,
                "completed_date": task.completed_date.isoformat()
            }
        })
    
    return {"message": "Task completed and notification sent"}
```

## 🎯 Feature Distribution

### FastAPI Handles:
- ✅ Equipment management
- ✅ Maintenance tasks
- ✅ Photo upload and AI analysis
- ✅ Shopping lists
- ✅ Real-time database operations
- ✅ Direct AI integration

### n8n Handles:
- ✅ Email automation
- ✅ Scheduled notifications
- ✅ External integrations (Slack, Teams)
- ✅ Complex workflow orchestration
- ✅ Background processing
- ✅ Multi-step automation

### React Handles:
- ✅ User interface
- ✅ State management
- ✅ PWA features
- ✅ Offline support
- ✅ Camera integration
- ✅ Real-time updates

## 🔧 Configuration

### Environment Variables

```env
# FastAPI (.env in backend/)
DATABASE_URL=sqlite:///./lifetime_maintenance.db
PERPLEXITY_API_KEY=your-perplexity-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-automation

# React (existing)
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-automation
```

### CORS Configuration

FastAPI is already configured to allow requests from your React app:

```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Development Workflow

### 1. Start All Services
```bash
# Terminal 1: React App
npm run dev

# Terminal 2: FastAPI Backend
cd backend
python start.py

# Terminal 3: n8n (if running locally)
n8n start
```

### 2. Test Integration
```bash
# Test FastAPI health
curl http://localhost:8000/health

# Test React app
curl http://localhost:3001

# Test n8n webhook (if configured)
curl -X POST "your-n8n-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📊 Monitoring

### Health Checks
- **React**: http://localhost:3001
- **FastAPI**: http://localhost:8000/health
- **n8n**: Your n8n cloud instance

### API Documentation
- **FastAPI**: http://localhost:8000/docs
- **OpenAPI**: http://localhost:8000/openapi.json

## 🔄 Migration Strategy

### Phase 1: Parallel Operation
- Keep existing React + n8n setup
- Add FastAPI backend
- Test both systems

### Phase 2: Feature Migration
- Move simple features to FastAPI
- Keep complex workflows in n8n
- Update React to use FastAPI

### Phase 3: Optimization
- Optimize based on performance
- Choose best tool for each feature
- Maintain hybrid approach

## 🎯 Benefits of Hybrid Approach

### ✅ Advantages
- **Flexibility**: Use best tool for each job
- **Scalability**: Scale components independently
- **Reliability**: Redundancy and fallbacks
- **Development Speed**: Parallel development
- **Cost Effective**: Use existing n8n cloud

### ⚠️ Considerations
- **Complexity**: More moving parts
- **Maintenance**: Multiple systems to maintain
- **Debugging**: Distributed troubleshooting
- **Data Sync**: Potential consistency issues

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FastAPI CORS configuration
   - Verify React app URL is in allowed origins

2. **Database Issues**
   - Ensure SQLite file is writable
   - Check database path in settings

3. **AI Service Errors**
   - Verify Perplexity API key
   - Check network connectivity

4. **n8n Integration Issues**
   - Verify webhook URLs
   - Check n8n workflow status

### Debug Commands

```bash
# Check if services are running
netstat -ano | findstr :3001  # React
netstat -ano | findstr :8000  # FastAPI

# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/maintenance/equipment/

# Check logs
# React: Browser console
# FastAPI: Terminal output
# n8n: Cloud dashboard
```

## 🎉 Success Metrics

- ✅ Both systems running simultaneously
- ✅ React app can call FastAPI endpoints
- ✅ FastAPI can trigger n8n workflows
- ✅ AI analysis working
- ✅ Database operations successful
- ✅ Photo upload and analysis functional

This hybrid approach gives you the best of both worlds: the simplicity and power of FastAPI for core features, and the flexibility of n8n for complex automation workflows! 🚀 