# 🛠️ n8n Tools and Setup Guide

## 🚀 **Quick Start: Import the Workflows**

### **Step 1: Import the Workflow Collection**
1. Open your n8n instance
2. Click **"Import from file"**
3. Select: `workflows/lifetime-fitness-maintenance-workflows.json`
4. This will import **5 complete workflows**:
   - 📧 Email Automation Workflow
   - 🤖 AI Assistant Workflow  
   - 📋 Task Processing Workflow
   - 📸 Photo Analysis Workflow
   - 🛒 Shopping Processing Workflow

### **Step 2: Configure Environment Variables**
In your n8n instance, add these environment variables:
```bash
PERPLEXITY_API_KEY=your-perplexity-api-key-here
GMAIL_CREDENTIALS=your-gmail-credentials
```

### **Step 3: Activate Workflows**
- Toggle each workflow to **active**
- Copy the webhook URLs for each workflow
- Update your React app with the webhook URLs

---

## 🛠️ **Helpful n8n Tools from GitHub**

### **1. n8n Community Nodes**
**Repository:** https://github.com/n8n-io/n8n-nodes-starter-template
- Template for creating custom n8n nodes
- Great for extending functionality

### **2. n8n Workflow Templates**
**Repository:** https://github.com/n8n-io/n8n-workflow-templates
- Pre-built workflow templates
- Examples for common use cases

### **3. n8n CLI Tool**
**Repository:** https://github.com/n8n-io/n8n
```bash
# Install n8n CLI
npm install -g n8n

# Start n8n locally
n8n start

# Export workflows
n8n export:workflow --all

# Import workflows
n8n import:workflow --input=workflows.json
```

### **4. n8n Docker Setup**
**Repository:** https://github.com/n8n-io/n8n/tree/master/docker
```bash
# Quick Docker setup
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### **5. n8n Workflow Validator**
**Repository:** https://github.com/n8n-io/n8n/tree/master/packages/cli
```bash
# Validate workflow JSON
n8n validate:workflow --input=workflow.json
```

---

## 🔧 **Development Tools**

### **1. n8n VS Code Extension**
- **Name:** n8n
- **Publisher:** n8n
- **Features:** Syntax highlighting, validation, snippets

### **2. n8n Workflow Builder**
- **URL:** https://n8n.io/workflow
- **Features:** Visual workflow builder, testing, debugging

### **3. n8n API Documentation**
- **URL:** https://docs.n8n.io/api/
- **Features:** Complete API reference, examples

---

## 📊 **Testing Tools**

### **1. Postman Collection for n8n**
Create a Postman collection with these requests:

```json
{
  "info": {
    "name": "Lifetime Maintenance n8n Workflows",
    "description": "Test collection for maintenance workflows"
  },
  "item": [
    {
      "name": "Email Automation",
      "request": {
        "method": "POST",
        "url": "{{n8n_base_url}}/webhook/email-automation",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"topic\": \"Equipment maintenance update\",\n  \"recipient\": \"team@lifetimefitness.com\",\n  \"urgency\": \"normal\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "AI Assistant",
      "request": {
        "method": "POST",
        "url": "{{n8n_base_url}}/webhook/ai-assistant",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"What maintenance tasks are due today?\",\n  \"context\": \"fitness-facility-maintenance\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "Task Processing",
      "request": {
        "method": "POST",
        "url": "{{n8n_base_url}}/webhook/task-processing",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"description\": \"Check treadmill maintenance schedule\",\n  \"priority\": \"high\",\n  \"equipment\": \"treadmill\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "Photo Analysis",
      "request": {
        "method": "POST",
        "url": "{{n8n_base_url}}/webhook/photo-analysis",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"description\": \"Equipment damage assessment\",\n  \"category\": \"equipment-maintenance\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "Shopping Processing",
      "request": {
        "method": "POST",
        "url": "{{n8n_base_url}}/webhook/shopping-processing",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"item\": \"treadmill belt\",\n  \"quantity\": 1,\n  \"urgency\": \"medium\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    }
  ],
  "variable": [
    {
      "key": "n8n_base_url",
      "value": "https://your-n8n-instance.com"
    }
  ]
}
```

### **2. cURL Commands for Testing**
```bash
# Test Email Automation
curl -X POST "https://your-n8n-instance.com/webhook/email-automation" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Equipment maintenance update",
    "recipient": "team@lifetimefitness.com",
    "urgency": "normal"
  }'

# Test AI Assistant
curl -X POST "https://your-n8n-instance.com/webhook/ai-assistant" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What maintenance tasks are due today?",
    "context": "fitness-facility-maintenance"
  }'

# Test Task Processing
curl -X POST "https://your-n8n-instance.com/webhook/task-processing" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Check treadmill maintenance schedule",
    "priority": "high",
    "equipment": "treadmill"
  }'

# Test Photo Analysis
curl -X POST "https://your-n8n-instance.com/webhook/photo-analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Equipment damage assessment",
    "category": "equipment-maintenance"
  }'

# Test Shopping Processing
curl -X POST "https://your-n8n-instance.com/webhook/shopping-processing" \
  -H "Content-Type: application/json" \
  -d '{
    "item": "treadmill belt",
    "quantity": 1,
    "urgency": "medium"
  }'
```

---

## 🔍 **Debugging Tools**

### **1. n8n Execution Logs**
- View execution history in n8n interface
- Check for errors and performance issues
- Monitor webhook calls

### **2. Browser Developer Tools**
- Network tab to monitor API calls
- Console for JavaScript errors
- Performance profiling

### **3. n8n Debug Mode**
```bash
# Start n8n in debug mode
N8N_LOG_LEVEL=debug n8n start
```

---

## 📈 **Monitoring Tools**

### **1. n8n Metrics**
- Execution count
- Success/failure rates
- Response times
- Error rates

### **2. External Monitoring**
- **Uptime Robot** - Monitor webhook availability
- **PagerDuty** - Alert on workflow failures
- **Grafana** - Custom dashboards

---

## 🚀 **Deployment Tools**

### **1. Docker Compose**
```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### **2. Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n
spec:
  replicas: 1
  selector:
    matchLabels:
      app: n8n
  template:
    metadata:
      labels:
        app: n8n
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n
        ports:
        - containerPort: 5678
        env:
        - name: PERPLEXITY_API_KEY
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: perplexity-api-key
```

---

## 🎯 **Best Practices**

### **1. Workflow Organization**
- Use descriptive names
- Add comments to complex nodes
- Group related workflows with tags

### **2. Error Handling**
- Always add error handling nodes
- Use conditional logic for different scenarios
- Log errors for debugging

### **3. Security**
- Use environment variables for sensitive data
- Validate input data
- Implement rate limiting

### **4. Performance**
- Use batch processing for large datasets
- Implement caching where appropriate
- Monitor execution times

---

## 🔗 **Useful Links**

- **n8n Documentation:** https://docs.n8n.io/
- **n8n Community:** https://community.n8n.io/
- **n8n GitHub:** https://github.com/n8n-io/n8n
- **n8n Workflow Templates:** https://n8n.io/workflows
- **n8n Blog:** https://n8n.io/blog/

---

## 🎉 **Next Steps**

1. **Import the workflow collection**
2. **Configure environment variables**
3. **Test each workflow individually**
4. **Connect to your React app**
5. **Monitor and optimize performance**

**Your n8n workflows are ready to power your Lifetime Fitness Maintenance app!** 🚀 