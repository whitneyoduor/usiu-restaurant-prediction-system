# Meal Management System

A full-stack web application for managing meals, inventory, and forecasting demand with role-based access control.

## 🚀 Features

- **Role-Based Authentication** - Admin, Chef, and Manager roles with different permissions
- **Dashboard** - Real-time statistics and visualizations
- **Meal Recording** - Track meals and automatically deduct ingredients
- **Inventory Management** - Complete CRUD operations for stock management
- **Low-Stock Alerts** - Automatic alerts when inventory falls below threshold
- **Demand Forecasting** - AI-powered predictions using moving average algorithm
- **User Management** - Admin controls for creating and managing users
- **Modern UI** - Clean, responsive design with Tailwind CSS

## 📁 Project Structure

```
meal-management-system/
├── backend/              # Node.js/Express API
│   ├── config/          # Firebase Admin & configurations
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API route handlers
│   ├── .env.example     # Environment variables template
│   ├── server.js        # Express server entry point
│   └── package.json     # Backend dependencies
│
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── lib/         # Utilities (Firebase, API client)
│   │   ├── styles/      # CSS and Tailwind styles
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── .env.example     # Environment variables template
│   ├── index.html       # HTML entry point
│   ├── vite.config.js   # Vite configuration
│   └── package.json     # Frontend dependencies
│
└── README.md            # This file
```

## 🛠️ Tech Stack

### Backend

- **Node.js** + **Express** - Server framework
- **Firebase Admin SDK** - Authentication and Firestore database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Firebase Client SDK** - Authentication
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **shadcn/ui** - UI components

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Firebase** project (free tier works)
- **Git** (optional)

## 🚀 Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** > **Email/Password**
4. Create **Firestore Database** in test mode
5. Get your credentials:
   - **For Backend**: Project Settings > Service Accounts > Generate Private Key
   - **For Frontend**: Project Settings > General > Your apps > Web app config

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase Admin credentials
nano .env  # or use your favorite editor

# Start the server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase client credentials
nano .env  # or use your favorite editor

# Copy UI components (if not already present)
mkdir -p src/components/ui
# Copy shadcn/ui components from root to frontend/src/components/ui

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Create Initial Admin User

Using Firebase Console:

1. Go to **Authentication** > **Users**
2. Click "Add user"
3. Email: `admin@example.com`, Password: `admin123`
4. Copy the generated UID
5. Go to **Firestore Database**
6. Create collection: `users`
7. Add document with the UID as document ID:
   ```json
   {
     "uid": "THE_COPIED_UID",
     "email": "admin@example.com",
     "role": "admin",
     "active": true,
     "displayName": "Admin"
   }
   ```

### 5. Login and Use

1. Open `http://localhost:5173`
2. Login with `admin@example.com` / `admin123`
3. Create more users via User Management page
4. Start managing inventory and recording meals!

## 📖 User Roles & Permissions

### Admin

- ✅ Full system access
- ✅ Manage users
- ✅ View all dashboards
- ✅ Record meals
- ✅ Manage inventory
- ✅ Clear alerts
- ✅ View forecasts

### Chef

- ✅ Record meals
- ✅ Manage inventory
- ✅ View alerts (read-only)
- ❌ Cannot manage users
- ❌ Cannot view forecasts

### Manager

- ✅ View dashboards
- ✅ View inventory (read-only)
- ✅ View alerts (read-only)
- ✅ View forecasts
- ❌ Cannot record meals
- ❌ Cannot edit inventory
- ❌ Cannot manage users

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Create user
- `GET /api/auth/user/:uid` - Get user data

### Dashboard

- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/chart` - Get chart data

### Inventory

- `GET /api/inventory` - List all items
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Meals

- `GET /api/meals` - List meals
- `POST /api/meals` - Record meal
- `GET /api/meals/stats` - Get statistics

### Alerts

- `GET /api/alerts` - Get active alerts
- `PATCH /api/alerts/:id/clear` - Clear alert

### Users (Admin only)

- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:uid/status` - Update status

### Forecast

- `GET /api/forecast` - Get forecast data

## 🔧 Configuration

### Backend Environment Variables

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_API_URL=http://localhost:5000/api
```

## 📱 Usage Guide

### Recording a Meal

1. Navigate to "Meal Recording"
2. Enter meal name and number of servings
3. Add ingredients with quantities per serving
4. Submit - inventory automatically deducted

### Managing Inventory

1. Navigate to "Inventory"
2. Add new ingredients with stock levels
3. Set low-stock thresholds
4. Edit or delete items as needed

### Viewing Forecasts

1. Navigate to "Demand Forecast" (Admin/Manager)
2. View historical trends
3. See 7-day predictions
4. Plan inventory based on forecasts

## 🐛 Troubleshooting

### Backend Issues

- **Port 5000 in use**: Change `PORT` in `.env`
- **Firebase auth error**: Check service account credentials
- **Module not found**: Run `npm install` in backend directory

### Frontend Issues

- **Cannot connect to API**: Verify backend is running
- **Firebase errors**: Check client configuration in frontend `.env`
- **UI components missing**: Copy shadcn/ui components to `frontend/src/components/ui/`

### Database Issues

- **Permission denied**: Update Firestore security rules
- **User not found**: Ensure user document exists in Firestore
- **Data not syncing**: Check browser console for errors

## 🚢 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Push code to repository
2. Set environment variables
3. Deploy with start command: `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the app: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables
4. Update `VITE_API_URL` to production backend URL

### Firestore Security Rules (Production)

Update your Firestore rules to restrict access based on authentication and roles.

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📧 Support

For issues or questions, check the troubleshooting section or review the Firebase documentation.

---

**Note**: This application is for demonstration purposes. Do not use it to store sensitive personal information (PII) without implementing proper security measures.