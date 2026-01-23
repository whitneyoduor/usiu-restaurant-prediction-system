# Fix Vercel Build Error

## The Problem
Vercel can't find the `frontend` directory because it's trying to build from the repository root.

## Solution: Configure Root Directory in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in and select your project: `usiu-restaurant-prediction-system`

### Step 2: Update Project Settings
1. Click on your project
2. Go to **Settings** → **General**
3. Scroll down to **Root Directory**
4. Click **Edit**
5. Set Root Directory to: `frontend`
6. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

## Alternative: Update vercel.json (if Root Directory doesn't work)

If setting Root Directory doesn't work, update the root `vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite"
}
```

But **Root Directory setting in dashboard is the recommended solution**.

## After Fix

Once deployed successfully:
1. Make sure recipes are populated in Firestore (run `node backend/populate-recipes.js`)
2. Hard refresh your deployed site (Ctrl+Shift+R)
3. Check the Meal Recording page - dropdown should show recipes

