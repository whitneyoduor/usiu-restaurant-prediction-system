const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get all meals
router.get('/', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    let query = db.collection('meals').orderBy('date', 'desc');
    
    if (startDate) {
      query = query.where('date', '>=', new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('date', '<=', new Date(endDate));
    }
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const meals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date
    }));
    
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record new meal
router.post('/', verifyToken, requireRole('admin', 'chef'), async (req, res) => {
  try {
    const { name, quantity, ingredients } = req.body;

    // Start a batch write
    const batch = db.batch();

    // Add meal record
    const mealRef = db.collection('meals').doc();
    batch.set(mealRef, {
      name,
      quantity: parseInt(quantity),
      ingredients,
      date: admin.firestore.Timestamp.now(),
      recordedBy: req.user.uid,
      createdAt: new Date().toISOString()
    });

    // Deduct ingredients and create alerts
    const alerts = [];
    
    for (const ingredient of ingredients) {
      const inventoryDoc = await db.collection('inventory').doc(ingredient.ingredientId).get();
      
      if (inventoryDoc.exists) {
        const currentData = inventoryDoc.data();
        const totalDeduction = ingredient.quantity * parseInt(quantity);
        const newQuantity = Math.max(0, currentData.quantity - totalDeduction);
        
        // Update inventory
        batch.update(db.collection('inventory').doc(ingredient.ingredientId), {
          quantity: newQuantity,
          updatedAt: new Date().toISOString()
        });

        // Create alert if below threshold
        if (newQuantity <= currentData.threshold) {
          const alertRef = db.collection('alerts').doc();
          batch.set(alertRef, {
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            currentQuantity: newQuantity,
            threshold: currentData.threshold,
            dateDetected: admin.firestore.Timestamp.now(),
            cleared: false
          });
        }
      }
    }

    // Commit all changes
    await batch.commit();

    res.status(201).json({
      id: mealRef.id,
      message: 'Meal recorded successfully'
    });
  } catch (error) {
    console.error('Error recording meal:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get meals statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const snapshot = await db.collection('meals')
      .where('date', '>=', admin.firestore.Timestamp.fromDate(today))
      .get();
    
    const totalMeals = snapshot.docs.reduce((sum, doc) => sum + (doc.data().quantity || 0), 0);
    
    res.json({
      mealsToday: totalMeals,
      totalRecords: snapshot.size
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
