const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get all active alerts
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('alerts')
      .where('cleared', '==', false)
      .orderBy('dateDetected', 'desc')
      .get();
    
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateDetected: doc.data().dateDetected?.toDate?.()?.toISOString() || doc.data().dateDetected
    }));
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear alert (Admin only)
router.patch('/:id/clear', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('alerts').doc(req.params.id).update({
      cleared: true,
      clearedAt: new Date().toISOString(),
      clearedBy: req.user.uid
    });

    res.json({ message: 'Alert cleared successfully' });
  } catch (error) {
    console.error('Error clearing alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get alert statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('alerts')
      .where('cleared', '==', false)
      .get();
    
    const alerts = snapshot.docs.map(doc => doc.data());
    const outOfStock = alerts.filter(a => a.currentQuantity === 0).length;
    const lowStock = alerts.filter(a => a.currentQuantity > 0).length;
    
    res.json({
      total: alerts.length,
      outOfStock,
      lowStock
    });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
