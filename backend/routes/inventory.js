const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get all inventory items
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('inventory').get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single inventory item
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('inventory').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create inventory item
router.post('/', verifyToken, requireRole('admin', 'chef'), async (req, res) => {
  try {
    const { name, quantity, unit, threshold, category } = req.body;

    const docRef = await db.collection('inventory').add({
      name,
      quantity: parseFloat(quantity),
      unit,
      threshold: parseFloat(threshold),
      category,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      id: docRef.id,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update inventory item
router.put('/:id', verifyToken, requireRole('admin', 'chef'), async (req, res) => {
  try {
    const { name, quantity, unit, threshold, category } = req.body;

    await db.collection('inventory').doc(req.params.id).update({
      name,
      quantity: parseFloat(quantity),
      unit,
      threshold: parseFloat(threshold),
      category,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', verifyToken, requireRole('admin', 'chef'), async (req, res) => {
  try {
    await db.collection('inventory').doc(req.params.id).delete();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
