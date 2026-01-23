const { db, admin } = require('./config/firebase');
require('dotenv').config();

async function populateSampleData() {
  try {
    console.log('\n🎨 Populating database with colorful sample data...\n');

    // Sample inventory items with various categories and colors
    const inventoryItems = [
      // Vegetables (Green theme)
      { name: 'Tomatoes', quantity: 45, unit: 'kg', threshold: 20, category: 'Vegetables' },
      { name: 'Onions', quantity: 80, unit: 'kg', threshold: 30, category: 'Vegetables' },
      { name: 'Carrots', quantity: 35, unit: 'kg', threshold: 15, category: 'Vegetables' },
      { name: 'Potatoes', quantity: 120, unit: 'kg', threshold: 40, category: 'Vegetables' },
      { name: 'Bell Peppers', quantity: 25, unit: 'kg', threshold: 10, category: 'Vegetables' },
      { name: 'Lettuce', quantity: 15, unit: 'kg', threshold: 8, category: 'Vegetables' },
      { name: 'Cucumbers', quantity: 30, unit: 'kg', threshold: 12, category: 'Vegetables' },
      { name: 'Spinach', quantity: 18, unit: 'kg', threshold: 7, category: 'Vegetables' },
      
      // Meat & Protein (Red theme)
      { name: 'Chicken Breast', quantity: 60, unit: 'kg', threshold: 25, category: 'Meat' },
      { name: 'Beef', quantity: 40, unit: 'kg', threshold: 15, category: 'Meat' },
      { name: 'Pork', quantity: 35, unit: 'kg', threshold: 12, category: 'Meat' },
      { name: 'Fish Fillet', quantity: 28, unit: 'kg', threshold: 10, category: 'Meat' },
      { name: 'Ground Beef', quantity: 22, unit: 'kg', threshold: 8, category: 'Meat' },
      
      // Dairy (White/Yellow theme)
      { name: 'Milk', quantity: 50, unit: 'liters', threshold: 20, category: 'Dairy' },
      { name: 'Cheese', quantity: 15, unit: 'kg', threshold: 5, category: 'Dairy' },
      { name: 'Butter', quantity: 12, unit: 'kg', threshold: 4, category: 'Dairy' },
      { name: 'Eggs', quantity: 240, unit: 'pieces', threshold: 100, category: 'Dairy' },
      { name: 'Yogurt', quantity: 30, unit: 'liters', threshold: 12, category: 'Dairy' },
      
      // Grains & Staples (Brown theme)
      { name: 'Rice', quantity: 200, unit: 'kg', threshold: 80, category: 'Grains' },
      { name: 'Pasta', quantity: 45, unit: 'kg', threshold: 15, category: 'Grains' },
      { name: 'Flour', quantity: 80, unit: 'kg', threshold: 30, category: 'Grains' },
      { name: 'Bread', quantity: 60, unit: 'loaves', threshold: 20, category: 'Grains' },
      
      // Spices & Condiments (Colorful theme)
      { name: 'Salt', quantity: 25, unit: 'kg', threshold: 8, category: 'Spices' },
      { name: 'Black Pepper', quantity: 8, unit: 'kg', threshold: 3, category: 'Spices' },
      { name: 'Garlic', quantity: 12, unit: 'kg', threshold: 4, category: 'Spices' },
      { name: 'Ginger', quantity: 10, unit: 'kg', threshold: 3, category: 'Spices' },
      { name: 'Olive Oil', quantity: 35, unit: 'liters', threshold: 12, category: 'Condiments' },
      { name: 'Soy Sauce', quantity: 18, unit: 'liters', threshold: 6, category: 'Condiments' },
      
      // Low stock items (for alerts)
      { name: 'Cilantro', quantity: 3, unit: 'kg', threshold: 5, category: 'Vegetables' },
      { name: 'Lemon', quantity: 8, unit: 'kg', threshold: 10, category: 'Fruits' },
      { name: 'Mushrooms', quantity: 5, unit: 'kg', threshold: 8, category: 'Vegetables' },
      { name: 'Chili Peppers', quantity: 2, unit: 'kg', threshold: 5, category: 'Vegetables' },
    ];

    console.log('📦 Adding inventory items...');
    const inventoryRefs = [];
    for (const item of inventoryItems) {
      const docRef = await db.collection('inventory').add({
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      inventoryRefs.push({ id: docRef.id, ...item });
      console.log(`   ✓ ${item.name}`);
    }

    // Get some inventory IDs for meal ingredients
    const tomatoId = inventoryRefs.find(i => i.name === 'Tomatoes')?.id;
    const onionId = inventoryRefs.find(i => i.name === 'Onions')?.id;
    const chickenId = inventoryRefs.find(i => i.name === 'Chicken Breast')?.id;
    const riceId = inventoryRefs.find(i => i.name === 'Rice')?.id;
    const carrotId = inventoryRefs.find(i => i.name === 'Carrots')?.id;
    const potatoId = inventoryRefs.find(i => i.name === 'Potatoes')?.id;
    const milkId = inventoryRefs.find(i => i.name === 'Milk')?.id;
    const flourId = inventoryRefs.find(i => i.name === 'Flour')?.id;
    const eggId = inventoryRefs.find(i => i.name === 'Eggs')?.id;
    const beefId = inventoryRefs.find(i => i.name === 'Beef')?.id;
    const pastaId = inventoryRefs.find(i => i.name === 'Pasta')?.id;
    const cheeseId = inventoryRefs.find(i => i.name === 'Cheese')?.id;

    // Create meals for the last 7 days with varying quantities
    console.log('\n🍽️  Creating meal records for the last 7 days...');
    const mealTypes = [
      { name: 'Breakfast', baseQuantity: 45 },
      { name: 'Lunch', baseQuantity: 120 },
      { name: 'Dinner', baseQuantity: 95 },
      { name: 'Brunch', baseQuantity: 60 },
      { name: 'Snacks', baseQuantity: 30 },
    ];

    const meals = [];
    const today = new Date();
    
    for (let day = 6; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      
      // Vary meal quantities to create interesting chart data
      const dayMultiplier = day === 0 ? 1.2 : (day === 1 ? 0.9 : (day === 2 ? 1.1 : (day === 3 ? 0.85 : (day === 4 ? 1.15 : (day === 5 ? 0.95 : 1.05)))));
      
      // Create 2-4 meals per day
      const mealsPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < mealsPerDay; i++) {
        const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
        const quantity = Math.floor(mealType.baseQuantity * dayMultiplier * (0.8 + Math.random() * 0.4));
        
        // Set time throughout the day
        const mealDate = new Date(date);
        mealDate.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
        
        // Create different ingredient combinations
        let ingredients = [];
        if (mealType.name === 'Breakfast') {
          ingredients = [
            { ingredientId: eggId, ingredientName: 'Eggs', quantity: 0.15 },
            { ingredientId: milkId, ingredientName: 'Milk', quantity: 0.1 },
            { ingredientId: flourId, ingredientName: 'Flour', quantity: 0.05 },
          ];
        } else if (mealType.name === 'Lunch') {
          ingredients = [
            { ingredientId: riceId, ingredientName: 'Rice', quantity: 0.2 },
            { ingredientId: chickenId, ingredientName: 'Chicken Breast', quantity: 0.15 },
            { ingredientId: tomatoId, ingredientName: 'Tomatoes', quantity: 0.1 },
            { ingredientId: onionId, ingredientName: 'Onions', quantity: 0.08 },
          ];
        } else {
          ingredients = [
            { ingredientId: riceId, ingredientName: 'Rice', quantity: 0.18 },
            { ingredientId: beefId, ingredientName: 'Beef', quantity: 0.12 },
            { ingredientId: carrotId, ingredientName: 'Carrots', quantity: 0.1 },
            { ingredientId: potatoId, ingredientName: 'Potatoes', quantity: 0.12 },
            { ingredientId: onionId, ingredientName: 'Onions', quantity: 0.08 },
          ];
        }
        
        meals.push({
          name: mealType.name,
          quantity,
          ingredients,
          date: admin.firestore.Timestamp.fromDate(mealDate),
          createdAt: mealDate.toISOString()
        });
      }
    }

    // Add today's meals (more for today)
    const todayMeals = [
      { name: 'Breakfast', quantity: 52, ingredients: [
        { ingredientId: eggId, ingredientName: 'Eggs', quantity: 0.15 },
        { ingredientId: milkId, ingredientName: 'Milk', quantity: 0.1 },
      ]},
      { name: 'Lunch', quantity: 145, ingredients: [
        { ingredientId: riceId, ingredientName: 'Rice', quantity: 0.2 },
        { ingredientId: chickenId, ingredientName: 'Chicken Breast', quantity: 0.15 },
        { ingredientId: tomatoId, ingredientName: 'Tomatoes', quantity: 0.1 },
      ]},
      { name: 'Dinner', quantity: 128, ingredients: [
        { ingredientId: pastaId, ingredientName: 'Pasta', quantity: 0.18 },
        { ingredientId: beefId, ingredientName: 'Beef', quantity: 0.12 },
        { ingredientId: cheeseId, ingredientName: 'Cheese', quantity: 0.05 },
      ]},
    ];

    for (const meal of todayMeals) {
      const mealDate = new Date();
      mealDate.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
      meals.push({
        ...meal,
        date: admin.firestore.Timestamp.fromDate(mealDate),
        createdAt: mealDate.toISOString()
      });
    }

    // Add all meals
    for (const meal of meals) {
      await db.collection('meals').add(meal);
    }
    console.log(`   ✓ Created ${meals.length} meal records`);

    // Create alerts for low stock items
    console.log('\n⚠️  Creating low stock alerts...');
    const lowStockItems = inventoryRefs.filter(item => item.quantity <= item.threshold);
    
    for (const item of lowStockItems) {
      await db.collection('alerts').add({
        ingredientId: item.id,
        ingredientName: item.name,
        currentQuantity: item.quantity,
        threshold: item.threshold,
        dateDetected: admin.firestore.Timestamp.now(),
        cleared: false
      });
      console.log(`   ⚠️  Alert: ${item.name} (${item.quantity} ${item.unit} remaining)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Sample data populated successfully!');
    console.log('='.repeat(60));
    console.log(`📦 Inventory Items: ${inventoryItems.length}`);
    console.log(`🍽️  Meal Records: ${meals.length}`);
    console.log(`⚠️  Active Alerts: ${lowStockItems.length}`);
    console.log('='.repeat(60));
    console.log('\n🎨 Your dashboard should now be colorful and detailed!');
    console.log('💡 Refresh your browser to see the changes.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

populateSampleData();

