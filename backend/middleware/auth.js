const { auth, db } = require('../config/firebase');

// Verify Firebase token and attach user data
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (!userData.active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
