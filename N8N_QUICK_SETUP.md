# 🚀 Quick n8n Setup for Lifetime Fitness Maintenance

## 📋 **What You Need to Do:**

### **Step 1: Import the Workflow**
1. **Open your n8n cloud instance**
2. **Click "Import from file"**
3. **Select:** `workflows/simple-email-workflow.json`
4. **Click "Import"**

### **Step 2: Set Environment Variable**
1. **In n8n, go to Settings** → **Environment Variables**
2. **Click "Add Variable"**
3. **Name:** `PERPLEXITY_API_KEY`
4. **Value:** `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`
5. **Click "Save"**

### **Step 3: Activate the Workflow**
1. **Toggle the switch** to activate the workflow
2. **Copy the webhook URL** from the "Email Webhook" node

### **Step 4: Test the Workflow**
```bash
curl -X POST "your-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Equipment maintenance needed",
    "recipient": "team@lifetimefitness.com",
    "urgency": "high"
  }'
```

## ✅ **What This Workflow Does:**

- **Receives webhook requests** from your React app
- **Processes email data** (topic, recipient, urgency)
- **Uses Perplexity Pro API** to generate professional email content
- **Returns formatted email** ready to send

## 🔑 **API Keys Available:**

From your MLB betting system, you have:
- ✅ **Perplexity Pro API Key** - Ready to use (updated)
- ✅ **OpenAI API Key** - Available if needed
- ✅ **Anthropic API Key** - Available if needed
- ✅ **Grok API Key** - Available if needed
- ✅ **The Odds API Key** - Available if needed

## 🎯 **Next Steps:**

1. **Import the workflow** into n8n
2. **Set the environment variable** (PERPLEXITY_API_KEY)
3. **Activate the workflow**
4. **Test it works**
5. **Update your React app** with the webhook URL

## 📞 **Need Help?**

If you run into any issues:
1. Check the n8n execution logs
2. Verify the environment variable is set correctly
3. Test the webhook URL is accessible

---

**You're all set! This uses your Perplexity Pro API key for better AI responses.** 🎉 