# 🚀 Deployment Guide for CIMCO Tracker

## Recommended: Vercel (Best for Vite/React)

1.  **Create Account**: Go to [vercel.com](https://vercel.com) and sign up (free).
2.  **Import Project**:
    *   Click **"Add New..."** > **"Project"**.
    *   Select your GitHub repo: `lifetime-maintenance`.
3.  **Configure**:
    *   Framework Preset: `Vite` (Auto-detected).
    *   Root Directory: `cimco` (IMPORTANT: Click "Edit" and select the `cimco` folder).
4.  **Environment Variables** (Expand the section):
    *   `VITE_SUPABASE_URL`: Paste your Supabase URL.
    *   `VITE_SUPABASE_ANON_KEY`: Paste your Supabase Anon Key.
5.  **Deploy**: Click **"Deploy"**.

## Alternative: Netlify

1.  Go to [netlify.com](https://netlify.com).
2.  "Add new site" > "Import an existing project".
3.  Select GitHub > `lifetime-maintenance`.
4.  **Base directory**: `cimco`.
5.  **Build command**: `npm run build`.
6.  **Publish directory**: `dist`.
7.  **Environment variables**: Add your Supabase keys here too.
