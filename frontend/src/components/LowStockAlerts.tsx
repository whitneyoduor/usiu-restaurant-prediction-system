import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Alert {
  id: string;
  ingredientId: string;
  ingredientName: string;
  currentQuantity: number;
  threshold: number;
  dateDetected: any;
  cleared: boolean;
}

export const LowStockAlerts: React.FC = () => {
  const { userData } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canClear = userData?.role === 'admin';

  useEffect(() => {
    // Set up real-time listener for alerts
    const q = query(
      collection(db, 'alerts'),
      where('cleared', '==', false),
      orderBy('dateDetected', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Fetch current inventory quantities for each alert
        const alertsWithCurrentQuantity = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const alertData = docSnapshot.data() as Alert;
            try {
              // Get current inventory quantity
              const inventoryDoc = await getDoc(doc(db, 'inventory', alertData.ingredientId));
              if (inventoryDoc.exists()) {
                const inventoryData = inventoryDoc.data();
                return {
                  id: docSnapshot.id,
                  ...alertData,
                  currentQuantity: inventoryData.quantity || alertData.currentQuantity,
                  threshold: inventoryData.threshold || alertData.threshold,
                } as Alert;
              }
            } catch (error) {
              console.error('Error fetching inventory for alert:', error);
            }
            return {
              id: docSnapshot.id,
              ...alertData,
            } as Alert;
          })
        );
        setAlerts(alertsWithCurrentQuantity);
        setLoading(false);
      },
      (error) => {
        console.error('Error in alerts listener:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchAlerts = async () => {
    setRefreshing(true);
    try {
      const q = query(
        collection(db, 'alerts'),
        where('cleared', '==', false),
        orderBy('dateDetected', 'desc')
      );
      const snapshot = await getDocs(q);
      
      // Fetch current inventory quantities
      const alertsWithCurrentQuantity = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const alertData = docSnapshot.data() as Alert;
          try {
            const inventoryDoc = await getDoc(doc(db, 'inventory', alertData.ingredientId));
            if (inventoryDoc.exists()) {
              const inventoryData = inventoryDoc.data();
              return {
                id: docSnapshot.id,
                ...alertData,
                currentQuantity: inventoryData.quantity || alertData.currentQuantity,
                threshold: inventoryData.threshold || alertData.threshold,
              } as Alert;
            }
          } catch (error) {
            console.error('Error fetching inventory for alert:', error);
          }
          return {
            id: docSnapshot.id,
            ...alertData,
          } as Alert;
        })
      );
      setAlerts(alertsWithCurrentQuantity);
      toast.success('Alerts refreshed!');
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to refresh alerts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearAlert = async (alertId: string) => {
    if (!canClear) return;

    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        cleared: true,
      });
      toast.success('Alert cleared successfully!');
      fetchAlerts();
    } catch (error) {
      console.error('Error clearing alert:', error);
      toast.error('Failed to clear alert');
    }
  };

  const getSeverity = (currentQuantity: number, threshold: number) => {
    if (currentQuantity === 0) return { label: 'Critical', color: 'bg-red-600' };
    if (currentQuantity <= threshold * 0.5) return { label: 'High', color: 'bg-orange-500' };
    return { label: 'Medium', color: 'bg-yellow-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Low Stock Alerts</h1>
          <p className="text-gray-600">Monitor ingredients that need restocking</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAlerts}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-12 h-12 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-3xl">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="w-12 h-12 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-3xl">
                  {alerts.filter(a => a.currentQuantity === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-3xl">
                  {alerts.filter(a => a.currentQuantity > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl mb-2">All Clear!</h3>
                <p className="text-gray-600">No low stock alerts at the moment</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          alerts.map(alert => {
            const severity = getSeverity(alert.currentQuantity, alert.threshold);
            return (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${severity.color} bg-opacity-10`}>
                        <AlertTriangle className={`w-6 h-6 text-${severity.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg">{alert.ingredientName}</h3>
                          <Badge className={`${severity.color} text-white`}>
                            {severity.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Stock</p>
                            <p className={alert.currentQuantity === 0 ? 'text-red-600' : ''}>
                              {alert.currentQuantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Threshold</p>
                            <p>{alert.threshold}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Detected</p>
                            <p>{alert.dateDetected?.toDate().toLocaleDateString()}</p>
                          </div>
                        </div>

                        {alert.currentQuantity === 0 && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              ⚠️ This ingredient is completely out of stock!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {canClear && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClearAlert(alert.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
