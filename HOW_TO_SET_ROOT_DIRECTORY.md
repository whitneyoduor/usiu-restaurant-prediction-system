# 📖 How to Set Root Directory in Vercel - Step by Step

## What Does "Root Directory" Mean?

**Root Directory** tells Vercel which folder contains your project files. Since your React app is in the `frontend` folder (not the root of your repository), Vercel needs to know to look there.

Think of it like this:
- Your repository has: `frontend/`, `backend/`, `README.md`, etc.
- Vercel needs to know: "The actual app I should build is in the `frontend` folder"

## Step-by-Step Instructions

### Step 1: Go to Vercel Website
1. Open your web browser
2. Go to: **https://vercel.com**
3. Sign in with your GitHub account (the same one you use for your repository)

### Step 2: Find Your Project
1. After signing in, you'll see a list of your projects
2. Look for: **usiu-restaurant-prediction-system**
3. Click on it (click anywhere on the project card/name)

### Step 3: Open Settings
1. At the top of the page, you'll see tabs like: **Overview**, **Deployments**, **Analytics**, **Settings**
2. Click on **Settings** (it's usually the rightmost tab)

### Step 4: Go to General Settings
1. On the left side, you'll see a menu with:
   - General
   - Environment Variables
   - Git
   - Domains
   - etc.
2. Click on **General** (it should be the first option, already selected)

### Step 5: Find Root Directory Section
1. Scroll down the page
2. Look for a section called **"Root Directory"**
3. You'll see something like:
   ```
   Root Directory
   . (current: repository root)
   [Edit] button
   ```

### Step 6: Edit Root Directory
1. Click the **Edit** button (or pencil icon) next to Root Directory
2. A text input field will appear
3. Delete whatever is in there (probably just `.` or empty)
4. Type: **frontend** (just the word "frontend", nothing else)
5. Click **Save** (or press Enter)

### Step 7: Redeploy
1. Go to the **Deployments** tab (at the top)
2. You'll see a list of deployments (builds)
3. Find the most recent one (usually at the top)
4. Click the **⋯** (three dots) on the right side of that deployment
5. Click **Redeploy** from the dropdown menu
6. Confirm if asked

## Visual Guide (What You'll See)

```
Vercel Dashboard
├── Your Project: usiu-restaurant-prediction-system
│   ├── [Tabs at top]
│   │   ├── Overview
│   │   ├── Deployments
│   │   ├── Analytics
│   │   └── Settings ← Click here
│   │
│   └── Settings Page
│       ├── [Left Menu]
│       │   └── General ← Click here (usually selected)
│       │
│       └── [Main Content]
│           └── Scroll down to find:
│               └── Root Directory
│                   └── Current: . (repository root)
│                   └── [Edit] ← Click here
│                       └── Type: frontend
│                       └── [Save]
```

## What Happens After You Save?

1. ✅ Vercel will remember that your project is in the `frontend` folder
2. ✅ Next time it builds, it will:
   - Go into the `frontend` folder
   - Run `npm install` there
   - Run `npm run build` there
   - Use the `dist` folder as output
3. ✅ Your build should succeed!

## Troubleshooting

### I don't see "Root Directory" option
- Make sure you're in **Settings** → **General**
- Scroll down more - it might be further down the page
- Try refreshing the page

### I can't find my project
- Make sure you're signed in with the correct GitHub account
- Check if the project name is slightly different
- Look in "All Projects" if you have many projects

### The Edit button doesn't work
- Try refreshing the page
- Make sure you have permission to edit the project
- Try a different browser

### After saving, build still fails
- Make sure you typed exactly: **frontend** (lowercase, no spaces)
- Go to Deployments and click "Redeploy" manually
- Check the build logs to see the new error (if any)

## Alternative: If You Can't Find the Setting

If you absolutely cannot find the Root Directory setting, you can:

1. **Delete and Recreate the Project** (last resort):
   - Delete the current Vercel project
   - Create a new project
   - When importing from GitHub, look for "Root Directory" during setup
   - Set it to `frontend` at that time

2. **Contact Vercel Support**:
   - They can help you configure it

## After It Works

Once the build succeeds:
1. ✅ Your app will be live
2. ✅ Run `node backend/populate-recipes.js` to add recipes
3. ✅ Refresh your deployed site
4. ✅ The meal dropdown should work!

---

**Need more help?** The Root Directory setting is usually about halfway down the General settings page. Look for it carefully!

