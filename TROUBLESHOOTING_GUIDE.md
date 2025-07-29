# 🚨 Lifetime Fitness Maintenance - Troubleshooting Guide

## **Current Issues Found:**
- ❌ Supabase config missing in .env
- ❌ Flask backend error (port 8001 in use but not responding)
- 🔴 Multiple ports in use (3000-3005, 8001)

## **Quick Fixes for Tomorrow:**

### **1. If Frontend Won't Load (White Screen/404)**
```bash
# Kill all existing processes
taskkill /f /im node.exe
taskkill /f /im python.exe

# Start fresh with dynamic port finder
node scripts/dynamic-start.js
```

### **2. If Backend API Errors**
```bash
# Check if Flask is running
curl http://localhost:8001/health

# If not responding, restart Flask
cd backend
py start-flask.py
```

### **3. If AI Analysis Fails**
```bash
# Check API keys
cat .env | grep GROK
cat .env | grep SUPABASE

# If missing, add to .env:
# GROK_PRO_API_KEY=your-key-here
# SUPABASE_URL=your-url-here
# SUPABASE_ANON_KEY=your-key-here
```

### **4. If Photo Upload Fails**
```bash
# Check Supabase storage
# Verify bucket exists: 'photos'
# Check file size limits: < 10MB
# Supported formats: JPEG, PNG
```

### **5. If Database Issues**
```bash
# Reset database
rm backend/database/maintenance.db
node backend/database/setup.js
```

### **6. If Mobile Features Don't Work**
- Grant camera permissions in browser
- Check localStorage: `localStorage.getItem('offlinePhotos')`
- Test offline mode by disconnecting internet
- Verify touch events work

## **Emergency Commands:**

### **Complete System Reset:**
```bash
# 1. Kill all processes
taskkill /f /im node.exe
taskkill /f /im python.exe

# 2. Clear ports
netstat -ano | findstr :3000
netstat -ano | findstr :8001

# 3. Start fresh
node scripts/dynamic-start.js
```

### **Database Reset:**
```bash
# Backup current data (if needed)
cp backend/database/maintenance.db backup_$(date +%Y%m%d).db

# Reset database
rm backend/database/maintenance.db
node backend/database/setup.js
```

### **Frontend Only Reset:**
```bash
# Clear cache and restart
npm run clean
npm install
npm run dev -- --port 3006
```

## **Common Error Messages & Solutions:**

### **"Cannot find module"**
```bash
npm install
```

### **"Port already in use"**
```bash
# Use dynamic port finder
node scripts/dynamic-start.js
```

### **"API key not configured"**
```bash
# Check .env file
cat .env
# Add missing API keys
```

### **"Database locked"**
```bash
# Kill processes and restart
taskkill /f /im python.exe
cd backend && py start-flask.py
```

### **"Camera permission denied"**
- Click camera icon in browser
- Grant permissions
- Refresh page

## **Testing Checklist for Tomorrow:**

### **✅ Basic Functionality:**
- [ ] Frontend loads at http://localhost:3006
- [ ] Backend responds at http://localhost:8001/health
- [ ] Database tables exist
- [ ] Photo upload works

### **✅ AI Features:**
- [ ] Enhanced AI analysis option available
- [ ] Equipment recognition works
- [ ] Damage detection functions
- [ ] Tasks auto-generate

### **✅ Mobile Features:**
- [ ] Camera access works
- [ ] Offline photo capture
- [ ] Annotation tools
- [ ] Touch interface responsive

### **✅ Analytics:**
- [ ] Dashboard loads
- [ ] Real data displays
- [ ] Charts render correctly
- [ ] Recent activity shows

## **Performance Monitoring:**

### **Check System Resources:**
```bash
# CPU/Memory usage
tasklist | findstr node
tasklist | findstr python

# Disk space
dir backend\database\maintenance.db
```

### **Monitor Logs:**
```bash
# Check for errors
tail -f backend/logs/app.log
```

## **Contact Information:**
- **Emergency**: Use diagnostic script: `node diagnostic-check.js`
- **Reset**: Use dynamic start: `node scripts/dynamic-start.js`
- **Database**: Use setup script: `node backend/database/setup.js`

## **Success Indicators:**
- ✅ Frontend loads without errors
- ✅ Photo upload completes successfully
- ✅ AI analysis returns results
- ✅ Tasks appear in task list
- ✅ Analytics dashboard shows data
- ✅ Mobile features work on phone/tablet

**Remember: The app is designed to be resilient. If one feature fails, others should still work!** 