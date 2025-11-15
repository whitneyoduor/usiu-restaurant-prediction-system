const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user (Admin only)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, role, displayName } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
    });

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
        role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user status (Admin only)
router.patch('/:uid/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { active } = req.body;
    
    await db.collection('users').doc(req.params.uid).update({
      active
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
