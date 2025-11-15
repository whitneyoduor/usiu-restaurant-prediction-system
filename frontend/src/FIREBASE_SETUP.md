# Firebase Setup Guide

This meal management system uses Firebase for authentication and database. Follow these steps to set it up:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "meal-management-system")
4. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** authentication

## 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click "Enable"

## 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (</>)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

## 5. Update Configuration

Open `/lib/firebase.ts` and replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 6. Set Up Firestore Collections

The app will automatically create these collections when you use it:
- `users` - User profiles with roles
- `inventory` - Ingredient stock levels
- `meals` - Meal records
- `alerts` - Low stock alerts

### Firestore Security Rules (Production)

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper function to check user role
    function hasRole(role) {
      return isSignedIn() && getUserData().role == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
    
    // Inventory collection
    match /inventory/{itemId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin') || hasRole('chef');
    }
    
    // Meals collection
    match /meals/{mealId} {
      allow read: if isSignedIn();
      allow create: if hasRole('admin') || hasRole('chef');
      allow update, delete: if hasRole('admin');
    }
    
    // Alerts collection
    match /alerts/{alertId} {
      allow read: if isSignedIn();
      allow create: if hasRole('admin') || hasRole('chef');
      allow update: if hasRole('admin');
    }
  }
}
```

## 7. Create Initial Admin User

### Option A: Using Firebase Console
1. Go to **Authentication** > **Users**
2. Click "Add user"
3. Enter email: `admin@example.com`
4. Enter password: `admin123` (change in production!)
5. Copy the generated UID
6. Go to **Firestore Database**
7. Create a document in the `users` collection with the UID as document ID:
   ```json
   {
     "uid": "THE_COPIED_UID",
     "email": "admin@example.com",
     "role": "admin",
     "active": true,
     "displayName": "Admin"
   }
   ```

### Option B: Using Firebase Auth REST API
You can also create users programmatically using the Firebase Admin SDK on a server.

## 8. Create Demo Users (Optional)

Follow the same process for:
- Chef: `chef@example.com` / `chef123` / role: `"chef"`
- Manager: `manager@example.com` / `manager123` / role: `"manager"`

## 9. Test the Application

1. Open the application
2. Log in with your admin credentials
3. Navigate to User Management to create more users
4. Add some inventory items
5. Record meals to test the system

## Important Notes

- **Security**: Change default passwords immediately
- **Test Mode**: Firestore test mode allows anyone to read/write. Update rules before going to production
- **Billing**: Firebase has a free tier, but set up billing alerts
- **Backups**: Enable automatic backups in Firestore settings
- **PII**: This system is for demonstration. Don't store sensitive personal information

## Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Ensure user document exists in `users` collection
- Verify user has `active: true` status

### Authentication errors
- Verify Firebase config is correct
- Check that Email/Password auth is enabled
- Ensure network connectivity

### Data not appearing
- Check browser console for errors
- Verify Firestore collections exist
- Check user permissions

## Next Steps

Once set up:
1. Add inventory items
2. Create meal records
3. Monitor low stock alerts
4. View demand forecasts
5. Manage users (admin only)

For more information, visit [Firebase Documentation](https://firebase.google.com/docs)
