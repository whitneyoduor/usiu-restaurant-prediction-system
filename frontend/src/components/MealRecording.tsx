import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ChefHat, UtensilsCrossed, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

interface MealIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: MealIngredient[];
}

export const MealRecording: React.FC = () => {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [mealQuantity, setMealQuantity] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();
    fetchRecentMeals();
  }, []);

  const fetchRecipes = async () => {
    setRecipesLoading(true);
    setRecipesError(null);
    try {
      const snapshot = await getDocs(collection(db, 'recipes'));
      const recipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Recipe));
      
      console.log('Recipes fetched:', recipes.length, recipes);
      setAvailableRecipes(recipes);
      
      if (recipes.length === 0) {
        setRecipesError('No recipes found. Please run populate-recipes.js script first.');
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      setRecipesError(`Failed to load recipes: ${error.message}`);
      toast.error('Failed to load recipes. Check console for details.');
    } finally {
      setRecipesLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'inventory'));
      const ingredients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ingredient));
      setAvailableIngredients(ingredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchRecentMeals = async () => {
    try {
      const q = query(collection(db, 'meals'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const meals = snapshot.docs.slice(0, 5).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentMeals(meals);
    } catch (error) {
      console.error('Error fetching recent meals:', error);
    }
  };

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    const recipe = availableRecipes.find(r => r.id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
    } else {
      setSelectedRecipe(null);
    }
  };

  const checkAndCreateAlerts = async (ingredientId: string, newQuantity: number, threshold: number, ingredientName: string) => {
    if (newQuantity <= threshold) {
      // Create alert
      await addDoc(collection(db, 'alerts'), {
        ingredientId,
        ingredientName,
        currentQuantity: newQuantity,
        threshold,
        dateDetected: Timestamp.now(),
        cleared: false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe || !mealQuantity) {
      toast.error('Please select a meal and enter the number of servings');
      return;
    }

    const servings = parseInt(mealQuantity);
    if (isNaN(servings) || servings <= 0) {
      toast.error('Please enter a valid number of servings');
      return;
    }

    setLoading(true);
    try {
      // Prepare ingredients for the meal record
      const mealIngredients = selectedRecipe.ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName,
        quantity: ing.quantity // quantity per serving
      }));

      // Record the meal
      await addDoc(collection(db, 'meals'), {
        name: selectedRecipe.name,
        quantity: servings,
        ingredients: mealIngredients,
        date: Timestamp.now(),
      });

      // Deduct ingredients from inventory
      for (const mealIng of mealIngredients) {
        const ingredient = availableIngredients.find(ing => ing.id === mealIng.ingredientId);
        if (ingredient) {
          const totalDeduction = mealIng.quantity * servings;
          const newQuantity = Math.max(0, ingredient.quantity - totalDeduction);
          
          await updateDoc(doc(db, 'inventory', mealIng.ingredientId), {
            quantity: newQuantity,
          });

          // Check and create alerts
          await checkAndCreateAlerts(mealIng.ingredientId, newQuantity, ingredient.threshold, ingredient.name);
        }
      }

      toast.success(
        `${selectedRecipe.name} recorded! ${servings} servings prepared. Ingredients automatically deducted from inventory.`,
        { duration: 5000 }
      );
      setSelectedRecipeId('');
      setSelectedRecipe(null);
      setMealQuantity('');
      fetchIngredients();
      fetchRecentMeals();
    } catch (error) {
      console.error('Error recording meal:', error);
      toast.error('Failed to record meal');
    } finally {
      setLoading(false);
    }
  };

  const getIngredientStock = (ingredientId: string) => {
    const ingredient = availableIngredients.find(ing => ing.id === ingredientId);
    return ingredient;
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Meal Recording
        </h1>
        <p className="text-gray-600 text-lg">Select a meal recipe and automatically deduct ingredients from inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-blue-600" />
                Record New Meal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Automatic Deduction Notice */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 rounded-full p-2 mt-0.5">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-800 mb-1">Automatic Ingredient Deduction</h3>
                      <p className="text-sm text-green-700">
                        When you record a meal, ingredients are <strong>automatically deducted</strong> from inventory. 
                        Each serving uses a <strong>fixed amount per ingredient</strong> - multiply by number of servings to get total deduction.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipe" className="text-base font-semibold">Select Meal Recipe</Label>
                    {recipesLoading ? (
                      <div className="h-12 flex items-center justify-center border rounded-md bg-gray-50">
                        <span className="text-sm text-gray-500">Loading recipes...</span>
                      </div>
                    ) : recipesError ? (
                      <div className="h-12 flex items-center justify-center border-2 border-red-300 rounded-md bg-red-50">
                        <span className="text-sm text-red-600">{recipesError}</span>
                      </div>
                    ) : (
                      <Select
                        value={selectedRecipeId}
                        onValueChange={handleRecipeSelect}
                        required
                        disabled={availableRecipes.length === 0}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder={availableRecipes.length === 0 ? "No recipes available" : "Choose a meal recipe..."} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {availableRecipes.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No recipes found. Please add recipes first.
                            </div>
                          ) : (
                            availableRecipes.map(recipe => (
                              <SelectItem key={recipe.id} value={recipe.id} className="py-3">
                                <div className="flex items-center gap-2 w-full">
                                  <UtensilsCrossed className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-gray-900 block">{recipe.name}</span>
                                    <span className="text-xs text-gray-500">{recipe.description}</span>
                                  </div>
                                  <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">{recipe.category}</Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {selectedRecipe && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-900">{selectedRecipe.name}</p>
                        <p className="text-xs text-blue-700">{selectedRecipe.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-base font-semibold">Number of Servings</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="e.g., 50"
                      value={mealQuantity}
                      onChange={(e) => setMealQuantity(e.target.value)}
                      required
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Ingredients List */}
                {selectedRecipe && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-yellow-700" />
                        <Label className="text-base font-bold text-yellow-900">Ingredient Deduction Details</Label>
                      </div>
                      <p className="text-sm text-yellow-800">
                        Each ingredient has a <strong>fixed amount per serving</strong>. 
                        Total deduction = <strong>Amount per serving × Number of servings</strong>
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                        <span className="text-sm font-semibold text-gray-700">Ingredient</span>
                        <span className="text-sm font-semibold text-gray-700">Per Serving</span>
                        {mealQuantity && (
                          <span className="text-sm font-semibold text-gray-700">Total Needed ({mealQuantity} servings)</span>
                        )}
                        <span className="text-sm font-semibold text-gray-700">Available</span>
                      </div>
                      
                      {selectedRecipe.ingredients.map((ing, index) => {
                        const stock = getIngredientStock(ing.ingredientId);
                        const servings = parseInt(mealQuantity) || 0;
                        const totalNeeded = ing.quantity * servings;
                        const hasStock = stock && stock.quantity >= totalNeeded;
                        const willDeduct = totalNeeded > 0;
                        
                        return (
                          <div 
                            key={index} 
                            className={`grid ${mealQuantity ? 'grid-cols-4' : 'grid-cols-3'} gap-3 p-4 rounded-lg border-2 ${
                              hasStock ? 'bg-white border-green-300' : 'bg-red-50 border-red-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{ing.ingredientName}</span>
                              {!hasStock && stock && (
                                <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                              )}
                            </div>
                            
                            <div className="text-sm">
                              <div className="font-medium text-blue-700">
                                {ing.quantity} {ing.unit}
                              </div>
                              <div className="text-xs text-gray-500">per serving</div>
                            </div>
                            
                            {mealQuantity && (
                              <div className="text-sm">
                                <div className="font-bold text-green-700">
                                  {totalNeeded.toFixed(2)} {ing.unit}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {ing.quantity} × {servings} = {totalNeeded.toFixed(2)}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-sm">
                              {stock ? (
                                <>
                                  <div className={`font-medium ${hasStock ? 'text-green-700' : 'text-red-700'}`}>
                                    {stock.quantity} {stock.unit}
                                  </div>
                                  {willDeduct && (
                                    <div className="text-xs text-gray-500">
                                      After: {(stock.quantity - totalNeeded).toFixed(2)} {stock.unit}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {mealQuantity && selectedRecipe && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-500 rounded-full p-2 mt-0.5">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-green-900 mb-2">
                              Ready to Record: {selectedRecipe.name}
                            </h4>
                            <p className="text-sm text-green-800 mb-2">
                              <strong>{mealQuantity} servings</strong> will be prepared.
                            </p>
                            <p className="text-sm font-semibold text-green-900 bg-white/50 p-2 rounded">
                              ⚡ Ingredients will be <strong>automatically deducted</strong> from inventory when you click "Record Meal"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
                  disabled={loading || !selectedRecipe}
                >
                  {loading ? 'Recording Meal...' : 'Record Meal'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Meals */}
        <div>
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-xl font-bold">Recent Meals</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {recentMeals.map(meal => (
                  <div key={meal.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-gray-800">{meal.name}</p>
                      </div>
                      <Badge className="bg-blue-600">{meal.quantity} servings</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {meal.date?.toDate().toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Package className="w-3 h-3" />
                      <span>{meal.ingredients?.length || 0} ingredients used</span>
                    </div>
                  </div>
                ))}
                {recentMeals.length === 0 && (
                  <div className="text-center py-8">
                    <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No meals recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
