import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
}

export const InventoryManagement: React.FC = () => {
  const { userData } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    threshold: '',
    category: '',
  });

  const canEdit = userData?.role === 'admin' || userData?.role === 'chef';

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'inventory'));
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ingredient));
      setIngredients(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: '',
      threshold: '',
      category: '',
    });
    setEditingItem(null);
  };

  const checkAndUpdateAlerts = async (ingredientId: string, newQuantity: number, threshold: number, ingredientName: string) => {
    try {
      // Check if there's an existing alert for this ingredient
      const alertsQuery = query(
        collection(db, 'alerts'),
        where('ingredientId', '==', ingredientId),
        where('cleared', '==', false)
      );
      const existingAlerts = await getDocs(alertsQuery);

      if (newQuantity <= threshold) {
        // Create or update alert
        if (existingAlerts.empty) {
          // Create new alert
          await addDoc(collection(db, 'alerts'), {
            ingredientId,
            ingredientName,
            currentQuantity: newQuantity,
            threshold,
            dateDetected: Timestamp.now(),
            cleared: false,
          });
        } else {
          // Update existing alert with current quantity
          const alertDoc = existingAlerts.docs[0];
          await updateDoc(doc(db, 'alerts', alertDoc.id), {
            currentQuantity: newQuantity,
            threshold,
          });
        }
      } else {
        // Clear alerts if quantity is above threshold
        await Promise.all(
          existingAlerts.docs.map((alertDoc) =>
            updateDoc(doc(db, 'alerts', alertDoc.id), {
              cleared: true,
            })
          )
        );
      }
    } catch (error) {
      console.error('Error updating alerts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      const data = {
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        threshold: parseFloat(formData.threshold),
        category: formData.category,
      };

      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), data);
        // Check and update alerts when inventory is updated
        await checkAndUpdateAlerts(
          editingItem.id,
          data.quantity,
          data.threshold,
          data.name
        );
        toast.success('Ingredient updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'inventory'), data);
        // Check and create alerts for new items
        await checkAndUpdateAlerts(
          docRef.id,
          data.quantity,
          data.threshold,
          data.name
        );
        toast.success('Ingredient added successfully!');
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast.error('Failed to save ingredient');
    }
  };

  const handleEdit = (item: Ingredient) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      threshold: item.threshold.toString(),
      category: item.category,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteDoc(doc(db, 'inventory', id));
      toast.success('Ingredient deleted successfully!');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity <= threshold) return { label: 'Low Stock', color: 'bg-red-500' };
    if (quantity <= threshold * 1.5) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Good', color: 'bg-green-500' };
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Inventory Management</h1>
          <p className="text-gray-600">Track and manage ingredient stock levels</p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Ingredient' : 'Add New Ingredient'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ingredient Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="kg, lbs, pcs"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Stock Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.01"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Vegetables, Meat, Dairy"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingItem ? 'Update' : 'Add'} Ingredient
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map(item => {
          const status = getStockStatus(item.quantity, item.threshold);
          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-2xl">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {item.threshold} {item.unit}
                    </p>
                  </div>

                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {ingredients.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              No ingredients in inventory. Add some to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
