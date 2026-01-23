# Full-Stack Meal Management System - Complete Explanation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Key Features](#key-features)
5. [Project Structure](#project-structure)
6. [Frontend Components](#frontend-components)
7. [Backend API Routes](#backend-api-routes)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Structure](#database-structure)
10. [Data Flow](#data-flow)
11. [How It Works](#how-it-works)

---

## System Overview

**USIU Restaurant Prediction System** is a comprehensive full-stack meal management and demand forecasting application designed for restaurant operations. The system helps manage:

- **Meal Recording**: Track meals served and automatically deduct ingredients from inventory
- **Inventory Management**: Monitor ingredient stock levels with automatic low-stock alerts
- **Demand Forecasting**: Predict future meal demand using historical data analysis
- **User Management**: Role-based access control for different user types (Admin, Chef, Manager)
- **Real-time Alerts**: Automatic notifications when inventory falls below thresholds

---

## Architecture

The system follows a **client-server architecture** with Firebase as the backend-as-a-service:

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   React Frontend│ ◄─────► │  Express Backend  │ ◄─────► │   Firebase   │
│   (TypeScript)  │         │   (Node.js)       │         │  (Firestore)  │
└─────────────────┘         └──────────────────┘         └──────────────┘
       │                              │
       │                              │
       └──────────┬───────────────────┘
                  │
            Firebase Auth
         (User Authentication)
```

### Architecture Layers:

1. **Frontend Layer** (React + TypeScript)
   - User interface components
   - Client-side Firebase SDK for direct database access
   - State management via React Context

2. **Backend Layer** (Express + Node.js)
   - RESTful API endpoints
   - Firebase Admin SDK for server-side operations
   - Authentication middleware
   - Role-based access control

3. **Database Layer** (Firebase Firestore)
   - NoSQL document database
   - Real-time data synchronization
   - Collections: `users`, `inventory`, `meals`, `alerts`

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library (Radix UI based)
- **Firebase Client SDK** - Direct database access
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Server-side Firebase operations
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database & Services
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User authentication
- **Firebase Admin** - Server-side authentication

---

## Key Features

### 1. **User Authentication & Authorization**
- Email/password authentication via Firebase Auth
- Role-based access control (Admin, Chef, Manager)
- Protected routes based on user roles
- User account activation/deactivation

### 2. **Meal Recording**
- Record meals with multiple ingredients
- Automatic inventory deduction
- Track meal quantities (servings)
- View recent meal history
- Automatic alert generation when inventory drops

### 3. **Inventory Management**
- Add, edit, delete ingredients
- Track quantities and units
- Set low-stock thresholds
- Categorize ingredients
- Real-time stock status (Good/Medium/Low)

### 4. **Low Stock Alerts**
- Automatic alert creation when inventory ≤ threshold
- Real-time alert updates
- Alert severity levels (Critical/High/Medium)
- Alert clearing functionality (Admin only)
- Out-of-stock detection

### 5. **Demand Forecasting**
- Historical data analysis (last 30 days)
- Moving average algorithm
- Trend detection (increasing/decreasing/stable)
- 7-day future predictions
- Visual charts showing actual vs predicted

### 6. **Dashboard**
- Real-time statistics
- Today's meal count
- Total inventory items
- Active alerts count
- User count (Admin only)
- 7-day meal trend chart
- Quick action buttons

### 7. **User Management** (Admin Only)
- Create new users
- Assign roles (Admin, Chef, Manager)
- Activate/deactivate user accounts
- View all system users

---

## Project Structure

```
Full-Stack Meal Management App/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard.tsx   # Main dashboard with stats
│   │   │   ├── MealRecording.tsx # Meal recording interface
│   │   │   ├── InventoryManagement.tsx # Inventory CRUD
│   │   │   ├── LowStockAlerts.tsx # Alert management
│   │   │   ├── Forecast.tsx    # Demand forecasting
│   │   │   ├── UserManagement.tsx # User CRUD (Admin)
│   │   │   ├── Login.tsx       # Authentication UI
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── ProtectedRoute.tsx # Route protection
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Authentication state
│   │   ├── lib/
│   │   │   └── firebase.ts     # Firebase client config
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Express backend API
│   ├── config/
│   │   └── firebase.js         # Firebase Admin SDK setup
│   ├── middleware/
│   │   └── auth.js             # Auth middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── users.js            # User management routes
│   │   ├── inventory.js        # Inventory CRUD routes
│   │   ├── meals.js            # Meal recording routes
│   │   ├── alerts.js           # Alert management routes
│   │   ├── forecast.js         # Forecasting routes
│   │   └── dashboard.js        # Dashboard stats routes
│   ├── server.js               # Express server setup
│   ├── create-user-doc.js     # User creation script
│   └── package.json
│
└── README.md                    # Project documentation
```

---

## Frontend Components

### 1. **App.tsx** - Main Application Component
- **Purpose**: Root component that manages routing and authentication
- **Features**:
  - Wraps app in `AuthProvider` for global auth state
  - Handles page navigation
  - Renders `Login` if not authenticated
  - Renders `Sidebar` and main content if authenticated
  - Implements role-based page access via `ProtectedRoute`

### 2. **AuthContext.tsx** - Authentication Context
- **Purpose**: Global authentication state management
- **Features**:
  - Manages current user state
  - Fetches user data from Firestore
  - Provides `signIn` and `signOut` functions
  - Tracks user role and active status
  - Handles authentication state changes

### 3. **Dashboard.tsx** - Main Dashboard
- **Purpose**: Display system overview and statistics
- **Features**:
  - Real-time stats cards (meals today, stock items, alerts, users)
  - 7-day meal trend bar chart
  - Quick action buttons for navigation
  - Role-based content (admin sees user count)

### 4. **MealRecording.tsx** - Meal Recording Interface
- **Purpose**: Record meals and deduct inventory
- **Features**:
  - Form to record meal name and quantity (servings)
  - Dynamic ingredient selection (from inventory)
  - Quantity per serving input
  - Automatic inventory deduction on submit
  - Automatic alert creation if inventory drops below threshold
  - Recent meals display (last 5)

**Key Functionality**:
```typescript
// When meal is recorded:
1. Save meal to 'meals' collection
2. For each ingredient:
   - Calculate total deduction = quantity per serving × number of servings
   - Update inventory quantity
   - Check if new quantity ≤ threshold
   - Create alert if needed
```

### 5. **InventoryManagement.tsx** - Inventory CRUD
- **Purpose**: Manage ingredient inventory
- **Features**:
  - View all inventory items in grid
  - Add new ingredients (Admin/Chef only)
  - Edit existing ingredients
  - Delete ingredients
  - Stock status indicators (Good/Medium/Low)
  - Automatic alert checking on update

**Stock Status Logic**:
- **Low Stock**: quantity ≤ threshold
- **Medium**: quantity ≤ threshold × 1.5
- **Good**: quantity > threshold × 1.5

### 6. **LowStockAlerts.tsx** - Alert Management
- **Purpose**: Monitor and manage low stock alerts
- **Features**:
  - Real-time alert updates (Firestore listeners)
  - Alert severity levels (Critical/High/Medium)
  - Current inventory quantity display
  - Clear alerts (Admin only)
  - Summary cards (Total, Out of Stock, Low Stock)
  - Auto-refresh functionality

**Alert Severity**:
- **Critical**: quantity = 0
- **High**: quantity ≤ threshold × 0.5
- **Medium**: quantity > threshold × 0.5 but ≤ threshold

### 7. **Forecast.tsx** - Demand Forecasting
- **Purpose**: Predict future meal demand
- **Features**:
  - Historical data analysis (last 30 days)
  - Moving average algorithm (3-day window)
  - Trend detection (comparing first vs second half)
  - 14-day forecast chart (7 days actual + 7 days predicted)
  - Statistics cards (avg daily meals, trend, next week total)

**Forecasting Algorithm**:
1. Fetch last 30 days of meal data
2. Calculate moving average (3-day window)
3. Detect trend by comparing data halves
4. Apply trend factor:
   - Increasing: +5% per day
   - Decreasing: -5% per day
   - Stable: no adjustment
5. Generate 7-day predictions

### 8. **UserManagement.tsx** - User Administration
- **Purpose**: Manage system users (Admin only)
- **Features**:
  - Create new users with email/password
  - Assign roles (Admin, Chef, Manager)
  - View all users
  - Activate/deactivate accounts
  - Role badges with color coding

### 9. **ProtectedRoute.tsx** - Route Protection
- **Purpose**: Protect routes based on authentication and roles
- **Features**:
  - Checks if user is authenticated
  - Verifies user data exists in Firestore
  - Checks if account is active
  - Validates role permissions
  - Shows appropriate error messages

### 10. **Sidebar.tsx** - Navigation Sidebar
- **Purpose**: Main navigation menu
- **Features**:
  - Role-based menu items
  - Current page highlighting
  - User info display
  - Sign out button
  - Responsive design

### 11. **Login.tsx** - Authentication UI
- **Purpose**: User login interface
- **Features**:
  - Email/password form
  - Error handling
  - Loading states

---

## Backend API Routes

### Server Setup (`server.js`)
- Express server configuration
- CORS setup
- Body parser middleware
- Route mounting
- Error handling middleware
- Health check endpoint

### Authentication Routes (`routes/auth.js`)
- `POST /api/auth/register` - Create new user (should be protected)
- `GET /api/auth/user/:uid` - Get user data

### User Routes (`routes/users.js`)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Inventory Routes (`routes/inventory.js`)
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item (Admin/Chef)
- `PUT /api/inventory/:id` - Update item (Admin/Chef)
- `DELETE /api/inventory/:id` - Delete item (Admin/Chef)

### Meal Routes (`routes/meals.js`)
- `GET /api/meals` - Get all meals (with optional filters)
- `POST /api/meals` - Record new meal (Admin/Chef)
  - Deducts inventory
  - Creates alerts if needed
  - Uses batch writes for atomicity
- `GET /api/meals/stats` - Get meal statistics

### Alert Routes (`routes/alerts.js`)
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get single alert
- `PUT /api/alerts/:id/clear` - Clear alert (Admin)

### Forecast Routes (`routes/forecast.js`)
- `GET /api/forecast` - Generate forecast data
- `GET /api/forecast/stats` - Get forecast statistics

### Dashboard Routes (`routes/dashboard.js`)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart` - Get chart data (last 7 days)

---

## Authentication & Authorization

### Authentication Flow

1. **User Login**:
   ```
   User enters email/password
   → Firebase Auth verifies credentials
   → AuthContext fetches user data from Firestore
   → User data stored in context
   → User redirected to dashboard
   ```

2. **Token Verification** (Backend):
   ```
   Request with Bearer token
   → Middleware extracts token
   → Firebase Admin verifies token
   → Fetches user data from Firestore
   → Attaches user to request object
   → Route handler executes
   ```

### Authorization Levels

1. **Admin**:
   - Full system access
   - User management
   - All CRUD operations
   - Alert clearing

2. **Chef**:
   - Meal recording
   - Inventory management
   - View alerts
   - View dashboard
   - Cannot access forecasting or user management

3. **Manager**:
   - View dashboard
   - View inventory
   - View alerts
   - Access forecasting
   - Cannot record meals or manage inventory

### Protected Routes

Frontend routes are protected by `ProtectedRoute` component:
- Checks authentication
- Validates user data exists
- Checks account active status
- Verifies role permissions

Backend routes are protected by middleware:
- `verifyToken` - Verifies Firebase ID token
- `requireRole(...roles)` - Checks user role

---

## Database Structure

### Firestore Collections

#### 1. **users** Collection
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  role: 'admin' | 'chef' | 'manager',
  active: boolean,          // Account status
  displayName: string,      // Optional display name
  createdAt: timestamp
}
```

#### 2. **inventory** Collection
```javascript
{
  name: string,             // Ingredient name
  quantity: number,          // Current quantity
  unit: string,             // Unit (kg, lbs, pcs, etc.)
  threshold: number,        // Low stock threshold
  category: string,         // Category (Vegetables, Meat, etc.)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. **meals** Collection
```javascript
{
  name: string,             // Meal name (e.g., "Lunch", "Breakfast")
  quantity: number,         // Number of servings
  ingredients: [            // Array of ingredients used
    {
      ingredientId: string,
      ingredientName: string,
      quantity: number      // Quantity per serving
    }
  ],
  date: timestamp,          // When meal was recorded
  recordedBy: string,       // User UID who recorded
  createdAt: timestamp
}
```

#### 4. **alerts** Collection
```javascript
{
  ingredientId: string,     // Reference to inventory item
  ingredientName: string,    // Ingredient name (for quick access)
  currentQuantity: number,  // Current stock level
  threshold: number,        // Threshold that triggered alert
  dateDetected: timestamp,  // When alert was created
  cleared: boolean          // Whether alert has been cleared
}
```

---

## Data Flow

### Meal Recording Flow

```
1. User fills meal form (name, quantity, ingredients)
   ↓
2. User submits form
   ↓
3. Frontend saves meal to 'meals' collection
   ↓
4. For each ingredient:
   a. Calculate total deduction = ingredient.quantity × meal.quantity
   b. Update inventory quantity
   c. Check if new quantity ≤ threshold
   d. If yes, create alert in 'alerts' collection
   ↓
5. Success notification shown
   ↓
6. Inventory and recent meals refreshed
```

### Alert Generation Flow

```
1. Inventory quantity changes (via meal recording or manual update)
   ↓
2. System checks: newQuantity ≤ threshold?
   ↓
3. If yes:
   a. Check if alert already exists for this ingredient
   b. If exists, update it
   c. If not, create new alert
   ↓
4. Alert appears in Low Stock Alerts page
   ↓
5. Real-time listener updates UI automatically
```

### Forecasting Flow

```
1. User navigates to Forecast page
   ↓
2. System fetches last 30 days of meal data
   ↓
3. Data grouped by date
   ↓
4. Calculate moving average (3-day window)
   ↓
5. Detect trend (compare first vs second half)
   ↓
6. Generate predictions for next 7 days:
   - Start with recent average
   - Apply trend factor daily
   ↓
7. Display chart with actual (last 7 days) and predicted (next 7 days)
```

---

## How It Works

### Real-time Updates

The system uses **Firebase Firestore real-time listeners** for automatic updates:

- **Low Stock Alerts**: Uses `onSnapshot` to listen for new/updated alerts
- **Inventory**: Updates reflect immediately across all users
- **Meals**: New meals appear in recent meals list automatically

### Automatic Inventory Deduction

When a meal is recorded:
1. System calculates total ingredient usage: `quantity per serving × number of servings`
2. Deducts from inventory: `newQuantity = currentQuantity - totalDeduction`
3. Prevents negative quantities: `Math.max(0, newQuantity)`
4. Updates Firestore document

### Alert System

Alerts are automatically created when:
- Inventory quantity drops to or below threshold
- Meal recording causes inventory to drop
- Manual inventory update causes drop

Alerts are automatically cleared when:
- Inventory quantity rises above threshold
- Admin manually clears alert

### Role-Based Access

**Frontend**:
- `ProtectedRoute` component checks user role before rendering
- `Sidebar` filters menu items based on role
- Components show/hide features based on role

**Backend**:
- `verifyToken` middleware validates authentication
- `requireRole` middleware checks role permissions
- Routes return 403 Forbidden if role insufficient

### Error Handling

- **Frontend**: Toast notifications for errors
- **Backend**: Error middleware catches and formats errors
- **Firebase**: Try-catch blocks handle Firestore errors
- **User Feedback**: Loading states and error messages

---

## Key Design Decisions

1. **Direct Firestore Access (Frontend)**: Frontend uses Firebase Client SDK for direct database access, reducing backend load but requiring proper security rules.

2. **Backend API (Optional)**: Backend provides RESTful API for server-side operations, but most operations use direct Firestore access.

3. **Real-time Listeners**: Uses Firestore `onSnapshot` for real-time updates instead of polling.

4. **Batch Writes**: Meal recording uses batch writes to ensure atomicity (all-or-nothing).

5. **Role-Based UI**: UI adapts based on user role, hiding/showing features dynamically.

6. **Automatic Alerts**: Alerts are created automatically, not manually, ensuring no missed low-stock situations.

---

## Security Considerations

1. **Firestore Security Rules**: Must be configured to prevent unauthorized access
2. **Token Verification**: Backend verifies Firebase ID tokens
3. **Role Validation**: Both frontend and backend validate user roles
4. **Environment Variables**: Sensitive data stored in `.env` files
5. **CORS**: Backend configured with specific frontend URL

---

## Future Enhancements

Potential improvements:
- Email notifications for alerts
- Advanced forecasting algorithms (ML-based)
- Inventory reorder suggestions
- Meal cost calculation
- Reporting and analytics
- Mobile app support
- Barcode scanning for inventory
- Recipe management
- Supplier management

---

This system provides a complete solution for restaurant meal and inventory management with automatic alerts and demand forecasting capabilities.

