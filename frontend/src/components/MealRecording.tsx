import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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
}

export const MealRecording: React.FC = () => {
  const [mealName, setMealName] = useState('');
  const [mealQuantity, setMealQuantity] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<MealIngredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);

  useEffect(() => {
    fetchIngredients();
    fetchRecentMeals();
  }, []);

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

  const addIngredient = () => {
    setSelectedIngredients([...selectedIngredients, { ingredientId: '', ingredientName: '', quantity: 0 }]);
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...selectedIngredients];
    if (field === 'ingredientId') {
      const ingredient = availableIngredients.find(ing => ing.id === value);
      updated[index].ingredientId = value;
      updated[index].ingredientName = ingredient?.name || '';
    } else {
      updated[index][field as keyof MealIngredient] = value;
    }
    setSelectedIngredients(updated);
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
    if (!mealName || !mealQuantity || selectedIngredients.length === 0) {
      toast.error('Please fill all fields and add at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      // Record the meal
      await addDoc(collection(db, 'meals'), {
        name: mealName,
        quantity: parseInt(mealQuantity),
        ingredients: selectedIngredients,
        date: Timestamp.now(),
      });

      // Deduct ingredients from inventory
      for (const mealIng of selectedIngredients) {
        const ingredient = availableIngredients.find(ing => ing.id === mealIng.ingredientId);
        if (ingredient) {
          const totalDeduction = mealIng.quantity * parseInt(mealQuantity);
          const newQuantity = Math.max(0, ingredient.quantity - totalDeduction);
          
          await updateDoc(doc(db, 'inventory', mealIng.ingredientId), {
            quantity: newQuantity,
          });

          // Check and create alerts
          await checkAndCreateAlerts(mealIng.ingredientId, newQuantity, ingredient.threshold, ingredient.name);
        }
      }

      toast.success('Meal recorded successfully!');
      setMealName('');
      setMealQuantity('');
      setSelectedIngredients([]);
      fetchIngredients();
      fetchRecentMeals();
    } catch (error) {
      console.error('Error recording meal:', error);
      toast.error('Failed to record meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Meal Recording</h1>
        <p className="text-gray-600">Record meals and automatically deduct ingredients from inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Record New Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mealName">Meal Name</Label>
                    <Input
                      id="mealName"
                      placeholder="e.g., Lunch, Breakfast"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Servings</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="e.g., 50"
                      value={mealQuantity}
                      onChange={(e) => setMealQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ingredients</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>

                  {selectedIngredients.map((ing, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Ingredient</Label>
                        <Select
                          value={ing.ingredientId}
                          onValueChange={(value) => updateIngredient(index, 'ingredientId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableIngredients.map(ingredient => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-32 space-y-2">
                        <Label>Qty per Serving</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          value={ing.quantity || ''}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {selectedIngredients.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No ingredients added yet
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Meal'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Meals */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMeals.map(meal => (
                  <div key={meal.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p>{meal.name}</p>
                      <Badge>{meal.quantity} servings</Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {meal.date?.toDate().toLocaleString()}
                    </p>
                    <div className="mt-2 text-xs text-gray-600">
                      {meal.ingredients?.length || 0} ingredients
                    </div>
                  </div>
                ))}
                {recentMeals.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No meals recorded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
