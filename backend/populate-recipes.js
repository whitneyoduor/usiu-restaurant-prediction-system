const { db } = require('./config/firebase');
require('dotenv').config();

async function populateRecipes() {
  try {
    console.log('\n🍳 Creating meal recipes...\n');

    // First, get inventory items to map ingredient names to IDs
    const inventorySnapshot = await db.collection('inventory').get();
    const inventoryMap = {};
    inventorySnapshot.docs.forEach(doc => {
      const data = doc.data();
      inventoryMap[data.name.toLowerCase()] = { id: doc.id, ...data };
    });

    // Helper function to find ingredient by name
    const findIngredient = (name) => {
      const key = name.toLowerCase();
      return inventoryMap[key] || Object.values(inventoryMap).find(item => 
        item.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(item.name.toLowerCase())
      );
    };

    // Define realistic meal recipes
    const recipes = [
      {
        name: 'Chicken Curry',
        category: 'Main Course',
        description: 'Spicy chicken curry with rice',
        ingredients: [
          { name: 'Chicken Breast', quantity: 0.15, unit: 'kg' },
          { name: 'Rice', quantity: 0.2, unit: 'kg' },
          { name: 'Onions', quantity: 0.08, unit: 'kg' },
          { name: 'Tomatoes', quantity: 0.1, unit: 'kg' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
          { name: 'Ginger', quantity: 0.01, unit: 'kg' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
      {
        name: 'Spaghetti Bolognese',
        category: 'Main Course',
        description: 'Classic Italian pasta with meat sauce',
        ingredients: [
          { name: 'Pasta', quantity: 0.15, unit: 'kg' },
          { name: 'Ground Beef', quantity: 0.12, unit: 'kg' },
          { name: 'Tomatoes', quantity: 0.15, unit: 'kg' },
          { name: 'Onions', quantity: 0.06, unit: 'kg' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
          { name: 'Cheese', quantity: 0.03, unit: 'kg' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
      {
        name: 'Beef Stew',
        category: 'Main Course',
        description: 'Hearty beef stew with vegetables',
        ingredients: [
          { name: 'Beef', quantity: 0.15, unit: 'kg' },
          { name: 'Potatoes', quantity: 0.12, unit: 'kg' },
          { name: 'Carrots', quantity: 0.1, unit: 'kg' },
          { name: 'Onions', quantity: 0.08, unit: 'kg' },
          { name: 'Tomatoes', quantity: 0.08, unit: 'kg' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
        ]
      },
      {
        name: 'Fried Rice',
        category: 'Main Course',
        description: 'Asian-style fried rice with vegetables',
        ingredients: [
          { name: 'Rice', quantity: 0.2, unit: 'kg' },
          { name: 'Eggs', quantity: 0.2, unit: 'pieces' },
          { name: 'Carrots', quantity: 0.08, unit: 'kg' },
          { name: 'Onions', quantity: 0.06, unit: 'kg' },
          { name: 'Bell Peppers', quantity: 0.05, unit: 'kg' },
          { name: 'Soy Sauce', quantity: 0.03, unit: 'liters' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
      {
        name: 'Chicken Fried Rice',
        category: 'Main Course',
        description: 'Fried rice with chicken',
        ingredients: [
          { name: 'Rice', quantity: 0.2, unit: 'kg' },
          { name: 'Chicken Breast', quantity: 0.12, unit: 'kg' },
          { name: 'Eggs', quantity: 0.15, unit: 'pieces' },
          { name: 'Carrots', quantity: 0.08, unit: 'kg' },
          { name: 'Onions', quantity: 0.06, unit: 'kg' },
          { name: 'Soy Sauce', quantity: 0.03, unit: 'liters' },
        ]
      },
      {
        name: 'Grilled Chicken',
        category: 'Main Course',
        description: 'Grilled chicken breast with sides',
        ingredients: [
          { name: 'Chicken Breast', quantity: 0.18, unit: 'kg' },
          { name: 'Potatoes', quantity: 0.1, unit: 'kg' },
          { name: 'Carrots', quantity: 0.08, unit: 'kg' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
        ]
      },
      {
        name: 'Pasta Carbonara',
        category: 'Main Course',
        description: 'Creamy pasta with bacon and cheese',
        ingredients: [
          { name: 'Pasta', quantity: 0.15, unit: 'kg' },
          { name: 'Eggs', quantity: 0.2, unit: 'pieces' },
          { name: 'Cheese', quantity: 0.05, unit: 'kg' },
          { name: 'Butter', quantity: 0.02, unit: 'kg' },
          { name: 'Black Pepper', quantity: 0.001, unit: 'kg' },
        ]
      },
      {
        name: 'Beef Stir Fry',
        category: 'Main Course',
        description: 'Quick stir-fried beef with vegetables',
        ingredients: [
          { name: 'Beef', quantity: 0.15, unit: 'kg' },
          { name: 'Bell Peppers', quantity: 0.1, unit: 'kg' },
          { name: 'Onions', quantity: 0.08, unit: 'kg' },
          { name: 'Carrots', quantity: 0.08, unit: 'kg' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
          { name: 'Soy Sauce', quantity: 0.03, unit: 'liters' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
      {
        name: 'Scrambled Eggs',
        category: 'Breakfast',
        description: 'Classic scrambled eggs',
        ingredients: [
          { name: 'Eggs', quantity: 0.2, unit: 'pieces' },
          { name: 'Butter', quantity: 0.01, unit: 'kg' },
          { name: 'Milk', quantity: 0.05, unit: 'liters' },
          { name: 'Salt', quantity: 0.001, unit: 'kg' },
        ]
      },
      {
        name: 'Pancakes',
        category: 'Breakfast',
        description: 'Fluffy pancakes with syrup',
        ingredients: [
          { name: 'Flour', quantity: 0.1, unit: 'kg' },
          { name: 'Eggs', quantity: 0.15, unit: 'pieces' },
          { name: 'Milk', quantity: 0.15, unit: 'liters' },
          { name: 'Butter', quantity: 0.02, unit: 'kg' },
        ]
      },
      {
        name: 'French Toast',
        category: 'Breakfast',
        description: 'Sweet French toast',
        ingredients: [
          { name: 'Bread', quantity: 0.15, unit: 'loaves' },
          { name: 'Eggs', quantity: 0.15, unit: 'pieces' },
          { name: 'Milk', quantity: 0.1, unit: 'liters' },
          { name: 'Butter', quantity: 0.02, unit: 'kg' },
        ]
      },
      {
        name: 'Omelette',
        category: 'Breakfast',
        description: 'Vegetable omelette',
        ingredients: [
          { name: 'Eggs', quantity: 0.2, unit: 'pieces' },
          { name: 'Tomatoes', quantity: 0.05, unit: 'kg' },
          { name: 'Onions', quantity: 0.03, unit: 'kg' },
          { name: 'Bell Peppers', quantity: 0.04, unit: 'kg' },
          { name: 'Cheese', quantity: 0.02, unit: 'kg' },
          { name: 'Butter', quantity: 0.01, unit: 'kg' },
        ]
      },
      {
        name: 'Chicken Salad',
        category: 'Salad',
        description: 'Fresh chicken salad',
        ingredients: [
          { name: 'Chicken Breast', quantity: 0.12, unit: 'kg' },
          { name: 'Lettuce', quantity: 0.1, unit: 'kg' },
          { name: 'Tomatoes', quantity: 0.08, unit: 'kg' },
          { name: 'Cucumbers', quantity: 0.06, unit: 'kg' },
          { name: 'Onions', quantity: 0.03, unit: 'kg' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
      {
        name: 'Vegetable Soup',
        category: 'Soup',
        description: 'Hearty vegetable soup',
        ingredients: [
          { name: 'Carrots', quantity: 0.1, unit: 'kg' },
          { name: 'Potatoes', quantity: 0.1, unit: 'kg' },
          { name: 'Onions', quantity: 0.06, unit: 'kg' },
          { name: 'Tomatoes', quantity: 0.08, unit: 'kg' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
      {
        name: 'Fish Curry',
        category: 'Main Course',
        description: 'Spicy fish curry',
        ingredients: [
          { name: 'Fish Fillet', quantity: 0.15, unit: 'kg' },
          { name: 'Rice', quantity: 0.2, unit: 'kg' },
          { name: 'Tomatoes', quantity: 0.1, unit: 'kg' },
          { name: 'Onions', quantity: 0.08, unit: 'kg' },
          { name: 'Garlic', quantity: 0.01, unit: 'kg' },
          { name: 'Ginger', quantity: 0.01, unit: 'kg' },
          { name: 'Olive Oil', quantity: 0.02, unit: 'liters' },
        ]
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const recipe of recipes) {
      // Map ingredient names to IDs
      const ingredients = [];
      let allFound = true;

      for (const ing of recipe.ingredients) {
        const ingredient = findIngredient(ing.name);
        if (ingredient) {
          ingredients.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            quantity: ing.quantity,
            unit: ing.unit
          });
        } else {
          console.log(`   ⚠️  Warning: Ingredient "${ing.name}" not found in inventory for recipe "${recipe.name}"`);
          allFound = false;
        }
      }

      if (allFound && ingredients.length > 0) {
        await db.collection('recipes').add({
          name: recipe.name,
          category: recipe.category,
          description: recipe.description,
          ingredients,
          createdAt: new Date().toISOString()
        });
        console.log(`   ✓ ${recipe.name} (${ingredients.length} ingredients)`);
        createdCount++;
      } else {
        console.log(`   ✗ Skipped ${recipe.name} (missing ingredients)`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Recipes populated successfully!');
    console.log('='.repeat(60));
    console.log(`📝 Recipes Created: ${createdCount}`);
    console.log(`⚠️  Recipes Skipped: ${skippedCount}`);
    console.log('='.repeat(60));
    console.log('\n💡 You can now select meals from recipes in Meal Recording!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating recipes:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

populateRecipes();

