# 🚀 GitHub Pages Deployment Guide

Since this is a subfolder (`cimco`) in your repo, we need a specific strategy.

## 1. Install `gh-pages` package
Run this in your terminal:
```bash
cd cimco
npm install gh-pages --save-dev
```

## 2. Update `package.json`
Add these scripts to your `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## 3. Deploy!
Run:
```bash
npm run deploy
```

This will:
1.  Build your app.
2.  Push the `dist` folder to a `gh-pages` branch on GitHub.
3.  Your app will be live at: `https://ryandakine.github.io/lifetime-maintenance/`
