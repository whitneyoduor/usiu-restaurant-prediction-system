const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');

// Create new user (Admin only - should be protected)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, displayName } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
    });

    // Store user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role: role || 'chef',
      active: true,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email,
        role: role || 'chef'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user data
router.get('/user/:uid', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
