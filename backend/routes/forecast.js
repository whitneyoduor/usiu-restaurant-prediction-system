const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get forecast data
router.get('/', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    // Fetch last 30 days of meal data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db.collection('meals')
      .where('date', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .orderBy('date', 'asc')
      .get();

    // Group meals by date
    const mealsByDate = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate().toDateString();
      mealsByDate[date] = (mealsByDate[date] || 0) + (data.quantity || 0);
    });

    // Calculate statistics
    const values = Object.values(mealsByDate);
    const avgMeals = values.length > 0 
      ? values.reduce((a, b) => a + b, 0) / values.length 
      : 0;

    // Calculate moving average
    const windowSize = 3;
    const recentValues = values.slice(-windowSize);
    const recentAvg = recentValues.length > 0
      ? recentValues.reduce((a, b) => a + b, 0) / recentValues.length
      : avgMeals;

    // Determine trend
    let trend = 'stable';
    if (values.length >= 2) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
    }

    // Generate forecast
    const forecast = [];
    const today = new Date();
    
    // Last 7 days actual
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      forecast.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: mealsByDate[dateStr] || 0,
        predicted: 0
      });
    }

    // Next 7 days predicted
    let predictedValue = recentAvg;
    const trendFactor = trend === 'increasing' ? 1.05 : trend === 'decreasing' ? 0.95 : 1.0;
    let nextWeekTotal = 0;

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      predictedValue = Math.round(predictedValue * trendFactor);
      nextWeekTotal += predictedValue;
      
      forecast.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: 0,
        predicted: predictedValue
      });
    }

    res.json({
      forecast,
      stats: {
        avgDailyMeals: Math.round(avgMeals),
        trend,
        nextWeekTotal: Math.round(nextWeekTotal)
      }
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
