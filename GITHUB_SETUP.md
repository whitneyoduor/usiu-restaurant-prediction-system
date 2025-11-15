# GitHub Setup Guide - Step by Step

Follow these steps to deploy your project to GitHub.

## Step 1: Initialize Git Repository

Open PowerShell or Command Prompt in your project folder and run:

```bash
cd "C:\Users\HP\Desktop\Full-Stack Meal Management App"
git init
```

## Step 2: Check What Will Be Committed

```bash
git status
```

This shows which files will be added. Make sure `.env` files are NOT listed (they should be ignored).

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Create First Commit

```bash
git commit -m "Initial commit: USIU Restaurant Prediction System"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **+** icon (top right) → **New repository**
3. Repository name: `usiu-restaurant-prediction-system`
4. Description: `USIU Restaurant Prediction System - Meal Management & Demand Forecasting`
5. Choose **Public** or **Private**
6. **DO NOT** check "Initialize with README" (we already have one)
7. Click **Create repository**

## Step 6: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/usiu-restaurant-prediction-system.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 7: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files
3. Make sure you **DO NOT** see:
   - `backend/.env` file
   - `node_modules/` folders
   - Any sensitive credentials

## Important Notes

### ⚠️ Security Checklist

Before pushing, verify:
- ✅ `.env` files are in `.gitignore` and NOT committed
- ✅ Firebase credentials are safe (they're in code, but that's okay for client config)
- ✅ No passwords or API keys are hardcoded (except Firebase client config is public)

### 🔒 What's Safe to Push

- ✅ Source code
- ✅ Configuration files (without secrets)
- ✅ Package.json files
- ✅ README and documentation

### 🚫 What Should NOT Be Pushed

- ❌ `.env` files (already in .gitignore)
- ❌ `node_modules/` (already in .gitignore)
- ❌ Private keys or passwords
- ❌ Build outputs (dist/, build/)

## Next Steps After GitHub Upload

1. **Deploy Backend**: Use Railway, Render, or Heroku
2. **Deploy Frontend**: Use Vercel or Netlify
3. **Update Environment Variables**: Set them in your hosting platform
4. **Test**: Make sure everything works in production

See `DEPLOYMENT.md` for detailed hosting instructions.

