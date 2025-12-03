# Supabase Setup Guide for CIMCO Tracker

## Quick Setup (10 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `cimco-equipment-tracker` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"** and wait ~2 minutes

### Step 2: Get Your API Credentials
1. In your project, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Configure Environment Variables
1. Open the `.env` file in the `cimco` folder
2. Paste your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Database Schema
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `cimco/database/schema.sql` on your computer
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see: `Success. No rows returned`

### Step 5: Verify Setup
1. In the `cimco` folder, run:
```bash
npm install
npm run dev
```
2. Open http://localhost:3000
3. Try clicking **"Browse All Equipment"** - you should see 5 demo items

## What's Included

Your database now has:
- **5 demo equipment** (shredder, crane, conveyor, baler, forklift)
- **14 maintenance logs** with realistic data
- **QR codes table** for tracking
- **Photo storage bucket** for maintenance photos

## Troubleshooting

**"Invalid API key" error:**
- Double-check you copied the **anon public** key, not the service_role key
- Make sure there are no extra spaces in the `.env` file

**"relation does not exist" error:**
- The schema didn't run successfully
- Try running it again in the SQL Editor

**Can't connect to database:**
- Check your internet connection
- Verify the Project URL is correct in `.env`

## Next Steps

Once setup is complete, you can:
1. Print QR codes from http://localhost:3000/qr-codes.html
2. Scan them with your phone
3. Log maintenance with the new voice entry feature!
