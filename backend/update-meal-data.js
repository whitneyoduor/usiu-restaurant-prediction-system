const { db, admin } = require('./config/firebase');
require('dotenv').config();

async function updateMealData() {
  try {
    console.log('\n🔄 Updating meal data to use recipe-based meals with smooth increasing trend...\n');

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
    console.log('🍽️  Creating new meal records with dummy data (smoothly increasing over time)...');
    const today = new Date();

    // We generate 30 days of history with a gently increasing daily total.
    // This produces a very clear "increasing" trend and a high R² accuracy
    // for the linear regression used in the Forecast page.
    const DAYS_OF_HISTORY = 30;
    const BASE_START = 80;      // starting daily total servings
    const DAILY_INCREMENT = 4;  // how much the daily total should grow each day

    const meals = [];

    // Helper weights to distribute daily total across several recipes
    const baseWeights = [0.5, 0.3, 0.2];

    for (let offset = DAYS_OF_HISTORY - 1; offset >= 0; offset--) {
      // Oldest day is offset = DAYS_OF_HISTORY - 1, most recent (today) is offset = 0
      const date = new Date(today);
      date.setDate(date.getDate() - offset);

      const dayIndex = DAYS_OF_HISTORY - 1 - offset; // 0 ... DAYS_OF_HISTORY-1

      // Target total for this day grows linearly over time
      const idealTotal = BASE_START + dayIndex * DAILY_INCREMENT;

      // Add a small amount of noise so data is realistic but still highly linear
      const noiseFactor = 0.15; // 15% max noise around the line
      const noise = (Math.random() * 2 - 1) * noiseFactor * idealTotal; // ±15%
      const totalForDay = Math.max(40, Math.round(idealTotal + noise));

      // Choose 2–3 recipes for this day
      const recipesPerDay = Math.min(3, Math.max(2, recipes.length));
      const selectedRecipes = recipes
        .slice()
        .sort(() => 0.5 - Math.random())
        .slice(0, recipesPerDay);

      // Distribute totalForDay across the selected recipes
      let remaining = totalForDay;

      selectedRecipes.forEach((recipe, index) => {
        // Use predefined weights for first few recipes, fall back to equal share if more
        const weight =
          baseWeights[index] !== undefined
            ? baseWeights[index]
            : 1 / recipesPerDay;

        let servings =
          index === selectedRecipes.length - 1
            ? remaining
            : Math.max(10, Math.round(totalForDay * weight));

        // Ensure we don't overshoot / undershoot dramatically
        if (index !== selectedRecipes.length - 1) {
          remaining -= servings;
        }

        // Randomize time of day between breakfast and late dinner
        const mealDate = new Date(date);
        mealDate.setHours(
          7 + Math.floor(Math.random() * 14),
          Math.floor(Math.random() * 60),
          0,
          0
        );

        const ingredients = (recipe.ingredients || []).map(ing => ({
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName,
          quantity: ing.quantity,
        }));

        meals.push({
          name: recipe.name,
          quantity: servings,
          ingredients,
          date: admin.firestore.Timestamp.fromDate(mealDate),
          createdAt: mealDate.toISOString(),
        });
      });
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
    console.log(`📅 Date Range: Last ${DAYS_OF_HISTORY} days (increasing trend)`);
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

