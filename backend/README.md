# Meal Management System - Backend

Node.js/Express backend API with Firebase Admin SDK.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Firebase Admin SDK

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. Set Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials from the downloaded JSON:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/user/:uid` - Get user data

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PATCH /api/users/:uid/status` - Update user status

### Inventory
- `GET /api/inventory` - Get all items
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item (Admin/Chef)
- `PUT /api/inventory/:id` - Update item (Admin/Chef)
- `DELETE /api/inventory/:id` - Delete item (Admin/Chef)

### Meals
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Record meal (Admin/Chef)
- `GET /api/meals/stats` - Get meal statistics

### Alerts
- `GET /api/alerts` - Get active alerts
- `PATCH /api/alerts/:id/clear` - Clear alert (Admin)
- `GET /api/alerts/stats` - Get alert statistics

### Forecast
- `GET /api/forecast` - Get forecast data (Admin/Manager)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart` - Get chart data

## Authentication

All protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Project Structure

```
backend/
├── config/           # Configuration files
│   └── firebase.js   # Firebase Admin initialization
├── middleware/       # Express middleware
│   └── auth.js       # Authentication & authorization
├── routes/           # API routes
│   ├── auth.js       # Authentication routes
│   ├── users.js      # User management routes
│   ├── inventory.js  # Inventory routes
│   ├── meals.js      # Meal recording routes
│   ├── alerts.js     # Alert routes
│   ├── forecast.js   # Forecast routes
│   └── dashboard.js  # Dashboard routes
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore file
├── package.json      # Dependencies
├── server.js         # Express server entry point
└── README.md         # This file
```

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Firebase authentication errors
- Check `.env` file has correct credentials
- Ensure private key has `\n` escaped properly
- Verify service account has required permissions

### CORS errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL

### Port already in use
- Change `PORT` in `.env`
- Or kill the process using port 5000
