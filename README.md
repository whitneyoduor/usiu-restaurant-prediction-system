# USIU Restaurant Prediction System

A full-stack meal management and demand forecasting system built with React, Node.js, Express, and Firebase.

## Features

- 🔐 **User Authentication** - Role-based access control (Admin, Chef, Manager)
- 📊 **Dashboard** - Real-time statistics and insights
- 🍽️ **Meal Recording** - Track meals and automatically deduct inventory
- 📦 **Inventory Management** - Manage ingredient stock levels
- ⚠️ **Low Stock Alerts** - Automatic alerts when inventory is low
- 📈 **Demand Forecasting** - Predict future meal demand
- 👥 **User Management** - Admin can manage users and roles

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Firebase Client SDK
- shadcn/ui components

### Backend
- Node.js
- Express
- Firebase Admin SDK
- Firestore Database

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Full-Stack Meal Management App"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
- Get `FIREBASE_PROJECT_ID` from Firebase Console
- Get `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from Firebase Console → Project Settings → Service Accounts

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

The Firebase configuration is already set in `src/lib/firebase.ts`.

### 4. Firebase Setup

1. Enable **Email/Password** authentication in Firebase Console
2. Create **Firestore Database** in test mode (for development)
3. Set up Firestore security rules (see `frontend/src/FIREBASE_SETUP.md`)

### 5. Create First User

Create an admin user using the script:

```bash
cd backend
node create-user-doc.js <USER_UID> <email> admin "Admin Name"
```

Or create users via Firebase Console (see `frontend/CREATE_USER_GUIDE.md`)

## Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:3000`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

## Project Structure

```
.
├── backend/
│   ├── config/          # Firebase Admin SDK config
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── server.js        # Express server
│   └── .env            # Environment variables (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── lib/         # Firebase client config
│   │   └── styles/      # Global styles
│   └── vite.config.ts   # Vite configuration
│
└── README.md
```

## Environment Variables

### Backend (.env)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

## Deployment

### Backend Deployment (Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Deploy with start command: `npm start`
3. Make sure `PORT` environment variable is set

### Frontend Deployment (Vercel, Netlify)

1. Build the app: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables if needed

## Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Update Firestore security rules before production
- ⚠️ Change default passwords
- ⚠️ Use strong passwords in production

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.

