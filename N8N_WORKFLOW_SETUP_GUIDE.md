# 🚀 n8n Workflow Setup Guide - Option 2

## Current Status ✅
- **React app is running** on `http://localhost:3003/`
- **n8n cloud instance** is available
- **Workflows are ready** to import

## 🎯 Quick Setup Steps

### Step 1: Import the Simple Email Workflow
1. Go to your n8n cloud instance
2. Click **"Import from file"**
3. Select: `workflows/simple-email-workflow.json`
4. **Activate the workflow**
5. **Copy the webhook URL** from the "Email Webhook" node

### Step 2: Import the Visual Maintenance Workflow
1. Click **"Import from file"** again
2. Select: `workflows/visual-maintenance-assistant.json`
3. **Activate the workflow**
4. **Copy the webhook URL** from the "Photo Upload Webhook" node

### Step 3: Set Environment Variables in n8n
In your n8n cloud instance, add these environment variables:
```
PERPLEXITY_API_KEY=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
```

### Step 4: Test the Workflows
1. **Test Email Workflow:**
   ```bash
   curl -X POST "YOUR_EMAIL_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{
       "topic": "Treadmill maintenance needed",
       "recipient": "maintenance@lifetimefitness.com",
       "urgency": "high"
     }'
   ```

2. **Test Visual Maintenance:**
   ```bash
   curl -X POST "YOUR_VISUAL_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{
       "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
       "location": "Cardio Room A",
       "issue": "Treadmill belt slipping"
     }'
   ```

## 🎮 Using the React App

### Dashboard Tab
- **Trigger workflows** directly from the UI
- **View workflow results** and history
- **Monitor system status**

### Visual AI Tab
- **Upload equipment photos**
- **Get AI analysis** of maintenance needs
- **View parts recommendations**

### Voice Tab
- **Voice commands** to trigger workflows
- **Natural language** processing
- **Hands-free operation**

## 🔧 Workflow Features

### Email Automation Workflow
- ✅ **AI-powered email generation**
- ✅ **Professional formatting**
- ✅ **Fitness maintenance context**
- ✅ **Multiple urgency levels**

### Visual Maintenance Workflow
- ✅ **Photo analysis with AI**
- ✅ **Equipment identification**
- ✅ **Parts recommendations**
- ✅ **Grainger integration**
- ✅ **Maintenance job creation**

## 🚨 Troubleshooting

### Webhook Not Responding
- Check if workflow is **activated**
- Verify **webhook URL** is correct
- Check **n8n logs** for errors

### AI Not Working
- Verify **PERPLEXITY_API_KEY** is set
- Check **API quota** limits
- Review **request format**

### React App Issues
- Ensure app is running on `http://localhost:3003/`
- Check **browser console** for errors
- Verify **webhook URLs** are configured

## 🎉 Success Metrics

Once set up, you'll have:
- ✅ **AI-powered email generation**
- ✅ **Visual equipment analysis**
- ✅ **Automated parts lookup**
- ✅ **Voice command interface**
- ✅ **Professional maintenance workflows**

## 📞 Next Steps

1. **Import workflows** into n8n
2. **Test basic functionality**
3. **Configure webhook URLs** in React app
4. **Start using AI features**
5. **Later**: Fix Python backend issues

---

**Ready to get your AI-powered maintenance system running!** 🚀 