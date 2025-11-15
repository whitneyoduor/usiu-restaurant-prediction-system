const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch meals today
    const mealsSnapshot = await db.collection('meals')
      .where('date', '>=', admin.firestore.Timestamp.fromDate(today))
      .where('date', '<', admin.firestore.Timestamp.fromDate(tomorrow))
      .get();
    
    const totalMealsToday = mealsSnapshot.docs.reduce((sum, doc) => 
      sum + (doc.data().quantity || 0), 0
    );

    // Fetch inventory count
    const inventorySnapshot = await db.collection('inventory').get();
    const totalStock = inventorySnapshot.size;

    // Fetch active alerts count
    const alertsSnapshot = await db.collection('alerts')
      .where('cleared', '==', false)
      .get();
    const alertsCount = alertsSnapshot.size;

    // Fetch users count (admin only)
    let totalUsers = 0;
    if (req.user.role === 'admin') {
      const usersSnapshot = await db.collection('users').get();
      totalUsers = usersSnapshot.size;
    }

    res.json({
      mealsToday: totalMealsToday,
      totalStock,
      alertsCount,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chart data for last 7 days
router.get('/chart', verifyToken, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await db.collection('meals')
      .where('date', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
      .get();

    // Group by date
    const mealsByDate = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      mealsByDate[date] = (mealsByDate[date] || 0) + (data.quantity || 0);
    });

    const chartData = Object.entries(mealsByDate).map(([date, meals]) => ({
      date,
      meals
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
