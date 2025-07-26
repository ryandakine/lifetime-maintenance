# 🚀 Lifetime Fitness Maintenance - Setup Guide

## 📋 **What We're Setting Up:**

1. ✅ **React App** - Already running at `http://localhost:5175/`
2. 🔄 **n8n Local Instance** - Starting up (should be at `http://localhost:5678/`)
3. 📦 **Workflow Import** - Need to import the workflows
4. 🔗 **Webhook URLs** - Need to get these from n8n
5. 🧪 **Testing** - Test everything works

---

## 🎯 **Step 1: Wait for n8n to Start**

n8n is starting up in the background. Wait about 30-60 seconds, then:

1. **Open your browser**
2. **Go to:** `http://localhost:5678/`
3. **You should see the n8n interface**

---

## 🎯 **Step 2: Import the Workflows**

Once n8n is running:

1. **Click "Import from file"** (usually in the top right)
2. **Select this file:** `workflows/lifetime-fitness-maintenance-workflows.json`
3. **Click "Import"**
4. **You'll see 5 new workflows appear**

---

## 🎯 **Step 3: Set Up Environment Variables**

In n8n:

1. **Go to Settings** (gear icon ⚙️)
2. **Click "Environment Variables"**
3. **Add these two:**

**First Variable:**
- **Name:** `PERPLEXITY_API_KEY`
- **Value:** `your-perplexity-api-key-here` (replace with your actual key)

**Second Variable:**
- **Name:** `GMAIL_CREDENTIALS`
- **Value:** `your-gmail-credentials` (replace with your actual Gmail setup)

---

## 🎯 **Step 4: Activate Workflows**

For each of the 5 workflows:

1. **Click on the workflow**
2. **Look for the "Active" toggle switch**
3. **Turn it ON**
4. **Copy the webhook URL** (it will appear)

**You need these 5 webhook URLs:**
- Email Automation webhook URL
- AI Assistant webhook URL
- Task Processing webhook URL
- Photo Analysis webhook URL
- Shopping Processing webhook URL

---

## 🎯 **Step 5: Update Your React App**

Once you have the webhook URLs:

1. **Open:** `src/components/Dashboard.jsx`
2. **Find the fetch URLs** (they look like `/api/n8n/email-automation`)
3. **Replace them** with your actual webhook URLs
4. **Save the file**

---

## 🎯 **Step 6: Test Everything**

Run this command to test all workflows:

```bash
node n8n-setup-config.js
```

Or test individual workflows with cURL:

```bash
# Test Email Workflow
curl -X POST "YOUR_EMAIL_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Equipment maintenance update",
    "recipient": "team@lifetimefitness.com",
    "urgency": "normal"
  }'
```

---

## 🎯 **Step 7: Test Your React App**

1. **Go to:** `http://localhost:5175/`
2. **Click on the Dashboard tab**
3. **Try the "Quick Actions" buttons**
4. **They should trigger the n8n workflows!**

---

## 🚨 **Troubleshooting:**

**Problem:** n8n won't start
**Solution:** Wait a bit longer, or restart with `npx n8n start`

**Problem:** Can't import workflows
**Solution:** Make sure you're using the right file path

**Problem:** Workflows won't activate
**Solution:** Check that you set the environment variables first

**Problem:** Webhook URLs don't work
**Solution:** Make sure you copied the full URL correctly

---

## 🎉 **Success Checklist:**

- [ ] n8n is running at `http://localhost:5678/`
- [ ] Imported the workflow file
- [ ] Set environment variables
- [ ] Activated all 5 workflows
- [ ] Copied all webhook URLs
- [ ] Updated React app with webhook URLs
- [ ] Tested workflows work
- [ ] Tested React app integration

**Once you complete this checklist, your app will be fully functional!** 🚀

---

## 📞 **Need Help?**

If you get stuck at any step, just tell me:
1. **Which step you're on**
2. **What error you're seeing**
3. **What you've tried**

I'll help you get it working! 💪 