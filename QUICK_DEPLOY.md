# 🎯 Quick Deploy Reference Card

## Fastest Path to Live App (15 Minutes)

### Step 1: Get Supabase Keys (5 min)
```
1. Go to supabase.com → Sign up (free)
2. Create new project → Wait 2 min for setup
3. Settings → API → Copy URL and anon key
```

### Step 2: Deploy to Vercel (5 min)
```
1. Go to vercel.com → Sign up with GitHub
2. "Add New Project" → Import "lifetime-maintenance"
3. Add environment variables:
   - VITE_SUPABASE_URL = [paste from step 1]
   - VITE_SUPABASE_ANON_KEY = [paste from step 1]
4. Click "Deploy" → Wait 3 minutes
```

### Step 3: Test & Share (5 min)
```
1. Open the Vercel URL you get
2. Test: Click through Dashboard, Tasks, Shopping
3. Copy URL to share with your dad
```

---

## 📋 Environment Variables You Need

| Variable | Where to Get | Required? |
|----------|--------------|-----------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → API | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → API | ✅ Yes |
| `VITE_PERPLEXITY_API_KEY` | Perplexity.ai (paid) | ⭕ Optional |

---

## 🔗 Quick Links

- **Deploy Here**: https://vercel.com/new
- **Get Database**: https://supabase.com
- **Your Repo**: https://github.com/ryandakine/lifetime-maintenance
- **Your Live App**: (will be something like `lifetime-maintenance-xyz.vercel.app`)

---

## 🆘 Common Issues & Fixes

### "Build Failed" on Vercel
- Check environment variables are set correctly
- Look at build logs for specific error
- Most common: Missing VITE_SUPABASE_URL

### "Can't Connect to Database"
- Verify Supabase keys in Vercel settings
- Check Supabase project is active
- Make sure keys don't have extra spaces

### "App is Blank/White Screen"
- Open browser console (F12)
- Look for red errors
- Usually means environment variables missing

---

## 💰 Costs Breakdown

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| Vercel Hosting | ✅ Free forever | $20/mo for custom domain |
| Supabase Database | ✅ 500MB free | $25/mo for 8GB |
| Perplexity AI | ❌ No free tier | ~$20/mo for API |
| **Total (Basic)** | **$0/month** | **$20-65/month for full features** |

**For showing your dad: Use free tier - it's plenty!**

---

## 🎨 After Deploy - Quick Customizations

### Change App Title
File: `src/App.jsx` line 126
```jsx
<h1 className="app-title">
  🏋️ [Your Dad's Company Name] Maintenance
</h1>
```

### Change Colors
File: `src/App.css` (search for color definitions)

### Add Logo
1. Add logo file to `public/` folder
2. Update `public/manifest.json`

**After changes:** Just push to GitHub - Vercel auto-deploys!

---

## 📱 Demo Script for Your Dad

1. **Open the live URL**
   - "This is a fully deployed web app, works on any device"

2. **Show Dashboard Tab**
   - "See real-time overview of all maintenance tasks"

3. **Show Tasks Tab**
   - "Add, track, and complete maintenance tasks"
   - Click "Add Task" to demonstrate

4. **Show Shopping Tab**
   - "Manage supply orders and track spending"

5. **Show Photos Tab**
   - "Document equipment issues with photos"
   - "AI can analyze images" (if Perplexity key added)

6. **Show Mobile**
   - Open on your phone
   - "Install as app" - Add to home screen
   - "Works offline for field work"

7. **Value Prop**
   - "Replaces spreadsheets and paper"
   - "Team collaboration built-in"
   - "Scalable for growth"

---

## 🚀 Deploy Commands (If You Want to Update Later)

```bash
# Make changes to code
cd c:\Users\e362891\lifetime-maintenance

# Commit and push (triggers auto-deploy)
git add .
git commit -m "Updated feature X"
git push origin main

# Vercel automatically rebuilds and deploys!
# Live in 2-3 minutes
```

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Discord**: Community support
- **Your GitHub**: All code is there

---

**Bottom Line: You can deploy in 15 minutes and have a live app to show! 🎉**

All the heavy work (React, UI, features) is already done. You just need to:
1. Push the gas pedal (Click deploy on Vercel)
2. Add fuel (Environment variables from Supabase)
3. Drive (Share the URL)

**Good luck with the contract! 💪**
