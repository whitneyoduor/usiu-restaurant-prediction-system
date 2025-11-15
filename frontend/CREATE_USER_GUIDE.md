# How to Fix "Access Denied" for Chef and Manager Users

If chef or manager users are getting "Access Denied" errors, it's because their user document doesn't exist in Firestore.

## Solution: Create User Document in Firestore

### Step 1: Get the User's UID

When the user tries to log in, they'll see an error message with their UID. Copy that UID.

OR

1. Go to Firebase Console → Authentication → Users
2. Find the user (chef or manager)
3. Copy their UID

### Step 2: Create User Document in Firestore

1. Go to Firebase Console → Firestore Database
2. Make sure you're in the `users` collection
3. Click "Add document"
4. Use the UID as the Document ID
5. Add these fields:

**For Chef:**
```json
{
  "uid": "PASTE_THE_UID_HERE",
  "email": "chef@example.com",
  "role": "chef",
  "active": true,
  "displayName": "Chef User",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**For Manager:**
```json
{
  "uid": "PASTE_THE_UID_HERE",
  "email": "manager@example.com",
  "role": "manager",
  "active": true,
  "displayName": "Manager User",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Step 3: Verify

1. Have the user log out and log back in
2. They should now have access

## Alternative: Use the Registration API

You can also create users via the backend API:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "chef@example.com",
  "password": "chef123",
  "role": "chef",
  "displayName": "Chef User"
}
```

This will create both the Firebase Auth user AND the Firestore document automatically.

