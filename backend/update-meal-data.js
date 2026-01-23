const { db, admin } = require('./config/firebase');
require('dotenv').config();

async function updateMealData() {
  try {
    console.log('\n🔄 Updating meal data to use recipe-based meals...\n');

    // Step 1: Delete all old meals
    console.log('🗑️  Deleting old meal records...');
    const oldMealsSnapshot = await db.collection('meals').get();
    const deletePromises = oldMealsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`   ✓ Deleted ${oldMealsSnapshot.size} old meal records\n`);

    // Step 2: Get recipes
    const recipesSnapshot = await db.collection('recipes').get();
    const recipes = recipesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (recipes.length === 0) {
      console.log('⚠️  No recipes found. Please run populate-recipes.js first.');
      process.exit(1);
    }

    console.log(`📝 Found ${recipes.length} recipes\n`);

    // Step 3: Create new meal records using recipes (last 7 days)
    console.log('🍽️  Creating new meal records...');
    const today = new Date();
    const mealTypes = [
      { recipeName: 'Chicken Curry', servings: [120, 135, 110, 125, 130, 115, 140] },
      { recipeName: 'Spaghetti Bolognese', servings: [95, 105, 100, 110, 98, 102, 108] },
      { recipeName: 'Fried Rice', servings: [85, 90, 88, 92, 87, 91, 89] },
      { recipeName: 'Beef Stew', servings: [75, 80, 78, 82, 76, 79, 81] },
      { recipeName: 'Grilled Chicken', servings: [65, 70, 68, 72, 66, 69, 71] },
      { recipeName: 'Chicken Fried Rice', servings: [90, 95, 92, 97, 91, 94, 96] },
      { recipeName: 'Scrambled Eggs', servings: [45, 50, 48, 52, 46, 49, 51] },
      { recipeName: 'Pancakes', servings: [40, 45, 42, 47, 41, 44, 46] },
      { recipeName: 'Omelette', servings: [35, 40, 38, 42, 36, 39, 41] },
      { recipeName: 'Chicken Salad', servings: [55, 60, 58, 62, 56, 59, 61] },
    ];

    const meals = [];
    
    for (let day = 6; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      
      // Create 2-3 meals per day
      const mealsPerDay = Math.floor(Math.random() * 2) + 2;
      const selectedMeals = mealTypes.sort(() => 0.5 - Math.random()).slice(0, mealsPerDay);
      
      for (let i = 0; i < selectedMeals.length; i++) {
        const mealType = selectedMeals[i];
        const recipe = recipes.find(r => r.name === mealType.recipeName);
        
        if (!recipe) {
          console.log(`   ⚠️  Recipe "${mealType.recipeName}" not found, skipping...`);
          continue;
        }

        const servings = mealType.servings[day] || mealType.servings[0];
        
        // Set time throughout the day
        const mealDate = new Date(date);
        mealDate.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
        
        // Prepare ingredients
        const ingredients = recipe.ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName,
          quantity: ing.quantity
        }));

        meals.push({
          name: recipe.name,
          quantity: servings,
          ingredients,
          date: admin.firestore.Timestamp.fromDate(mealDate),
          createdAt: mealDate.toISOString()
        });
      }
    }

    // Add today's meals (more variety)
    const todayMeals = [
      { recipeName: 'Chicken Curry', servings: 145 },
      { recipeName: 'Spaghetti Bolognese', servings: 128 },
      { recipeName: 'Fried Rice', servings: 95 },
    ];

    for (const mealData of todayMeals) {
      const recipe = recipes.find(r => r.name === mealData.recipeName);
      if (recipe) {
        const mealDate = new Date();
        mealDate.setHours(7 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), 0, 0);
        
        const ingredients = recipe.ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName,
          quantity: ing.quantity
        }));

        meals.push({
          name: recipe.name,
          quantity: mealData.servings,
          ingredients,
          date: admin.firestore.Timestamp.fromDate(mealDate),
          createdAt: mealDate.toISOString()
        });
      }
    }

    // Add all meals to Firestore
    for (const meal of meals) {
      await db.collection('meals').add(meal);
    }

    console.log(`   ✓ Created ${meals.length} new meal records using recipes`);
    console.log('\n' + '='.repeat(60));
    console.log('✅ Meal data updated successfully!');
    console.log('='.repeat(60));
    console.log(`📊 Total Meals: ${meals.length}`);
    console.log(`📅 Date Range: Last 7 days + today`);
    console.log('='.repeat(60));
    console.log('\n💡 All meals now use recipe-based structure!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating meal data:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

updateMealData();

