# Deployment Guide - USIU Restaurant Prediction System

This guide will help you deploy your application to GitHub and set up hosting.

## Step 1: Prepare for GitHub

### 1.1 Initialize Git Repository

```bash
# In the project root directory
git init
```

### 1.2 Add All Files

```bash
git add .
```

### 1.3 Create Initial Commit

```bash
git commit -m "Initial commit: USIU Restaurant Prediction System"
```

## Step 2: Create GitHub Repository

### 2.1 Create Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `usiu-restaurant-prediction-system`
4. Description: "USIU Restaurant Prediction System - Meal Management & Demand Forecasting"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

### 2.2 Connect and Push to GitHub

GitHub will show you commands. Run these in your project root:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/usiu-restaurant-prediction-system.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify .gitignore is Working

Make sure these files are **NOT** in your repository:

- ✅ `backend/.env` - Should be ignored
- ✅ `node_modules/` - Should be ignored
- ✅ `package-lock.json` - Can be included or ignored (your choice)

To verify:
```bash
git status
```

You should NOT see `.env` files or `node_modules` in the output.

## Step 4: Deployment Options

### Option A: Deploy Backend to Railway/Render/Heroku

#### Railway (Recommended - Easy Setup)

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Railway will auto-detect it's a Node.js app
6. Add environment variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `PORT` (Railway sets this automatically)
   - `FRONTEND_URL` (your frontend URL)
7. Deploy!

#### Render

1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Settings:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
6. Add environment variables (same as Railway)
7. Deploy!

### Option B: Deploy Frontend to Vercel/Netlify

#### Vercel (Recommended for React)

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Deploy!

#### Netlify

1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Click **Add new site** → **Import an existing project**
4. Select your repository
5. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Deploy!

## Step 5: Update Frontend API URL

After deploying the backend, update the frontend to use the production API URL.

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

Or update your API calls to use environment variables.

## Step 6: Update Firebase Configuration

### For Production:

1. Update Firestore security rules (remove test mode)
2. Add your production frontend URL to Firebase authorized domains
3. Consider using environment variables for Firebase config in frontend

## Important Security Checklist

Before deploying to production:

- [ ] Remove test mode from Firestore security rules
- [ ] Update Firestore rules with proper role-based access
- [ ] Change all default passwords
- [ ] Use strong passwords for all users
- [ ] Enable Firebase App Check (optional but recommended)
- [ ] Set up Firebase billing alerts
- [ ] Review and restrict CORS settings
- [ ] Use HTTPS only
- [ ] Set up proper error logging

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify Firebase credentials
- Check logs in your hosting platform

### Frontend can't connect to backend
- Verify CORS settings in backend
- Check `FRONTEND_URL` environment variable
- Ensure backend URL is correct in frontend

### Firestore permission errors
- Check security rules
- Verify user documents exist
- Check user roles are correct

## Next Steps

1. Set up CI/CD (optional)
2. Add automated testing
3. Set up monitoring and error tracking
4. Configure custom domain
5. Set up SSL certificates (usually automatic)

## Support

If you encounter issues, check:
- Backend logs in your hosting platform
- Browser console for frontend errors
- Firebase Console for authentication/database issues

