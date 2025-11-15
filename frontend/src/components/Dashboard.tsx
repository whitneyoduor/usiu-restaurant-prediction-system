import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { UtensilsCrossed, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    mealsToday: 0,
    totalStock: 0,
    alertsCount: 0,
    totalUsers: 0,
  });
  const [mealData, setMealData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch meals today
      const mealsQuery = query(
        collection(db, 'meals'),
        where('date', '>=', Timestamp.fromDate(today)),
        where('date', '<', Timestamp.fromDate(tomorrow))
      );
      const mealsSnapshot = await getDocs(mealsQuery);
      const totalMealsToday = mealsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().quantity || 0), 0);

      // Fetch inventory
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const totalStock = inventorySnapshot.size;

      // Fetch alerts
      const alertsQuery = query(collection(db, 'alerts'), where('cleared', '==', false));
      const alertsSnapshot = await getDocs(alertsQuery);
      const alertsCount = alertsSnapshot.size;

      // Fetch users (admin only)
      let totalUsers = 0;
      if (userData?.role === 'admin') {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        totalUsers = usersSnapshot.size;
      }

      // Fetch last 7 days meal data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekMealsQuery = query(
        collection(db, 'meals'),
        where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
      );
      const weekMealsSnapshot = await getDocs(weekMealsQuery);
      
      // Group by date
      const mealsByDate: { [key: string]: number } = {};
      weekMealsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        mealsByDate[date] = (mealsByDate[date] || 0) + (data.quantity || 0);
      });

      const chartData = Object.entries(mealsByDate).map(([date, quantity]) => ({
        date,
        meals: quantity,
      }));

      setStats({
        mealsToday: totalMealsToday,
        totalStock,
        alertsCount,
        totalUsers,
      });
      setMealData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userData?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meals Today</p>
                <p className="text-3xl mt-2">{stats.mealsToday}</p>
              </div>
              <UtensilsCrossed className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Items</p>
                <p className="text-3xl mt-2">{stats.totalStock}</p>
              </div>
              <Package className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-3xl mt-2">{stats.alertsCount}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {userData?.role === 'admin' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl mt-2">{stats.totalUsers}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Meals Recorded - Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mealData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="meals" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(userData?.role === 'admin' || userData?.role === 'chef') && (
            <Button
              size="lg"
              className="h-auto py-6"
              onClick={() => onNavigate('meals')}
            >
              <UtensilsCrossed className="w-6 h-6 mr-3" />
              Record Meals
            </Button>
          )}
          
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6"
            onClick={() => onNavigate('inventory')}
          >
            <Package className="w-6 h-6 mr-3" />
            View Inventory
          </Button>

          {stats.alertsCount > 0 && (
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-6 border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={() => onNavigate('alerts')}
            >
              <AlertTriangle className="w-6 h-6 mr-3" />
              View Alerts ({stats.alertsCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
