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
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-gray-800">{userData?.email}</span></p>
        <div className="mt-2 flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            userData?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
            userData?.role === 'chef' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {userData?.role?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">Meals Today</p>
                <p className="text-4xl font-bold mt-2">{stats.mealsToday}</p>
                <p className="text-xs text-blue-200 mt-1">servings</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <UtensilsCrossed className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 font-medium">Stock Items</p>
                <p className="text-4xl font-bold mt-2">{stats.totalStock}</p>
                <p className="text-xs text-green-200 mt-1">ingredients</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Package className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100 font-medium">Active Alerts</p>
                <p className="text-4xl font-bold mt-2">{stats.alertsCount}</p>
                <p className="text-xs text-orange-200 mt-1">low stock</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {userData?.role === 'admin' && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 font-medium">Total Users</p>
                  <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
                  <p className="text-xs text-purple-200 mt-1">registered</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chart */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">Meals Recorded - Last 7 Days</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Daily meal serving trends</p>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={mealData}>
              <defs>
                <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="50%" stopColor="#34d399" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorMealsHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={1}/>
                  <stop offset="50%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: 600 }}
                tick={{ fill: '#4b5563' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontWeight: 600 }}
                tick={{ fill: '#4b5563' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                  padding: '12px'
                }}
                labelStyle={{ color: '#059669', fontWeight: 700, fontSize: '14px' }}
                itemStyle={{ color: '#10b981', fontWeight: 600 }}
                cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
              />
              <Bar 
                dataKey="meals" 
                fill="url(#colorMeals)" 
                radius={[10, 10, 0, 0]}
                stroke="#059669"
                strokeWidth={2}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(userData?.role === 'admin' || userData?.role === 'chef') && (
            <Button
              size="lg"
              className="h-auto py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => onNavigate('meals')}
            >
              <UtensilsCrossed className="w-6 h-6 mr-3" />
              Record Meals
            </Button>
          )}
          
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 shadow-md hover:shadow-lg transition-all"
            onClick={() => onNavigate('inventory')}
          >
            <Package className="w-6 h-6 mr-3" />
            View Inventory
          </Button>

          {stats.alertsCount > 0 && (
            <Button
              size="lg"
              variant="outline"
              className="h-auto py-6 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 shadow-md hover:shadow-lg transition-all animate-pulse"
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
