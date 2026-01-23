# 🔧 Fix Vercel Build Error - Set Root Directory

## The Problem
Vercel is trying to run `cd frontend && npm install` but failing because it doesn't know the `frontend` directory is your project root.

## ✅ Solution: Configure Root Directory in Vercel Dashboard

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in to your account
   - Click on your project: **usiu-restaurant-prediction-system**

2. **Navigate to Settings**
   - Click on **Settings** tab (top navigation)
   - Click on **General** (left sidebar)

3. **Set Root Directory**
   - Scroll down to find **Root Directory** section
   - Click the **Edit** button (pencil icon)
   - In the input field, type: `frontend`
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Find the latest failed deployment
   - Click the **⋯** (three dots) menu
   - Click **Redeploy**
   - OR just push a new commit (I've already pushed fixes)

## What This Does

Setting Root Directory to `frontend` tells Vercel:
- ✅ The project root is the `frontend` folder
- ✅ Run `npm install` from `frontend/`
- ✅ Run `npm run build` from `frontend/`
- ✅ Output directory is `frontend/dist` (relative to root)

## After Setting Root Directory

Once you set Root Directory to `frontend`:
1. Vercel will automatically detect it's a Vite project
2. It will run `npm install` in the `frontend` directory
3. It will run `npm run build` 
4. It will use `dist` as the output directory

## Alternative: If Root Directory Setting Doesn't Work

If for some reason you can't set Root Directory, you can:
1. Create a new Vercel project
2. During setup, manually set:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Verify It's Working

After setting Root Directory and redeploying, check:
- ✅ Build logs show: "Running npm install" (from frontend directory)
- ✅ Build logs show: "Running npm run build"
- ✅ Deployment succeeds
- ✅ Your app is live!

---

**This is the recommended solution and should fix the build error immediately!**

