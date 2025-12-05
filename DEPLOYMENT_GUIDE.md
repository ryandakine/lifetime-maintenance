# 🚀 Deployment Guide - Lifetime Fitness Maintenance App

## Problem: Work Computer Group Policy Blocks Local Development

Your work computer's group policy blocks Vite from running locally. **Solution: Deploy to the cloud where the build happens on remote servers!**

---

## ✅ Quick Deploy to Vercel (Recommended - 5 Minutes)

### Step 1: Sign Up/Login to Vercel
1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"** to connect your GitHub account

### Step 2: Import Your Repository
1. Once logged in, click **"Add New..."** → **"Project"**
2. Find and select **`ryandakine/lifetime-maintenance`** from your repositories
3. Click **"Import"**

### Step 3: Configure Build Settings
Vercel should auto-detect your Vite project. Verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables (IMPORTANT!)
Before deploying, add your environment variables:

1. In the Vercel project settings, go to **"Environment Variables"**
2. Add these variables (you'll need to update with actual values):

```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_key
VITE_PERPLEXITY_API_KEY=your_actual_perplexity_key
```

**Don't have these yet?** See the "Getting API Keys" section below.

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes for Vercel to build and deploy
3. You'll get a live URL like: `https://lifetime-maintenance-xyz.vercel.app`

### Step 6: Share with Your Dad!
- Send him the Vercel URL
- The app will automatically redeploy when you push to GitHub
- No local build needed ever!

---

## 🔑 Getting API Keys (If You Don't Have Them)

### Supabase (Backend Database)
1. Go to **[supabase.com](https://supabase.com)**
2. Create a free account
3. Create a new project (takes ~2 minutes)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

### Perplexity AI (Optional - For AI Features)
1. Go to **[perplexity.ai](https://www.perplexity.ai/)**
2. Sign up for Perplexity Pro API
3. Get your API key
4. Use as `VITE_PERPLEXITY_API_KEY`

**Note:** The app will work without Perplexity, but AI features will be limited.

---

## 🎯 Alternative Deployment Options

### Option 2: Netlify (Also Great!)

1. Go to **[netlify.com](https://netlify.com)**
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repo
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables in site settings
7. Deploy!

### Option 3: GitHub Pages with Actions

GitHub can build and deploy automatically using Actions:

1. Go to your GitHub repo settings
2. Navigate to **Pages**
3. Enable GitHub Pages
4. We'll need to add a GitHub Actions workflow (I can help with this)

---

## 🔧 Fine-Tuning for Your Dad's Contract

### Things to Check Before Presenting:

1. **Branding**
   - Update company name/logo if needed
   - Customize colors to match Lifetime Fitness brand
   - Add contact information

2. **Demo Data**
   - Add sample tasks, equipment, maintenance records
   - Create a demo mode for showing features

3. **Documentation**
   - Create a user guide (I can help!)
   - Add screenshots/video walkthrough
   - Document all features

4. **Mobile Testing**
   - Test on your phone (it's a PWA!)
   - Verify all features work on mobile
   - Test offline capabilities

5. **Professional Polish**
   - Remove any "demo" or "test" labels
   - Ensure all features work smoothly
   - Fix any console errors

---

## 📱 After Deployment - Installing as PWA

Once deployed, users can install it as an app:

### On Desktop:
1. Visit the Vercel URL in Chrome/Edge
2. Look for install icon in address bar
3. Click to install as desktop app

### On Mobile:
1. Visit the URL in Safari/Chrome
2. Tap "Share" → "Add to Home Screen"
3. App appears like a native app!

---

## 🔄 Automatic Updates

Every time you push to GitHub:
- Vercel automatically rebuilds
- New version deploys in minutes
- No manual deployment needed!

```bash
# To update the live site:
git add .
git commit -m "Update feature X"
git push origin main
# Vercel deploys automatically!
```

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check the build logs in Vercel dashboard
- Common issues:
  - Missing dependencies → Add to `package.json`
  - Environment variables → Make sure they're set
  - Import errors → Check file paths

### App Loads But Features Don't Work
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Supabase database is set up

### Need Help?
- Vercel has great documentation
- Vercel also has a Discord community
- I can help troubleshoot specific errors!

---

## 📊 Next Steps After Deployment

1. **Get the URL from Vercel**
2. **Test all features thoroughly**
3. **Prepare demo/presentation for your dad**
4. **Document any custom features he needs**
5. **Discuss ongoing maintenance/updates**

---

## 💡 Pro Tips

- **Custom Domain**: Vercel lets you add a custom domain (like `maintenance.lifetimefitness.com`)
- **Analytics**: Enable Vercel Analytics to track usage
- **Preview Deployments**: Every PR gets a preview URL for testing
- **Performance**: Vercel automatically optimizes your app

---

**Ready to deploy? Start with Vercel - it's the fastest path from code to live app!**

Need help with any of these steps? Just ask!
