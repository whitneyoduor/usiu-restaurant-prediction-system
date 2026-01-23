import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface ForecastData {
  date: string;
  actual: number;
  predicted: number;
}

export const Forecast: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [stats, setStats] = useState({
    avgDailyMeals: 0,
    trend: 'stable' as 'increasing' | 'decreasing' | 'stable',
    nextWeekTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateForecast();
  }, []);

  const generateForecast = async () => {
    try {
      // Fetch historical meal data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        collection(db, 'meals'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);

      // Group meals by date
      const mealsByDate: { [key: string]: number } = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.date.toDate().toDateString();
        mealsByDate[date] = (mealsByDate[date] || 0) + (data.quantity || 0);
      });

      // Calculate moving average for prediction
      const dates = Object.keys(mealsByDate).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      const values = dates.map(date => mealsByDate[date]);
      const avgMeals = values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : 0;

      // Simple moving average (3-day window)
      const windowSize = 3;
      const movingAverage = (arr: number[], window: number) => {
        if (arr.length < window) return arr[arr.length - 1] || 0;
        const recent = arr.slice(-window);
        return recent.reduce((a, b) => a + b, 0) / window;
      };

      const recentAvg = movingAverage(values, windowSize);

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (values.length >= 2) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) trend = 'increasing';
        else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
      }

      // Generate forecast for next 7 days
      const today = new Date();
      const forecast: ForecastData[] = [];
      
      // Add last 7 days actual data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        forecast.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actual: mealsByDate[dateStr] || 0,
          predicted: 0,
        });
      }

      // Add next 7 days predicted data
      let predictedValue = recentAvg;
      const trendFactor = trend === 'increasing' ? 1.05 : trend === 'decreasing' ? 0.95 : 1.0;
      let nextWeekTotal = 0;

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        predictedValue = Math.round(predictedValue * trendFactor);
        nextWeekTotal += predictedValue;
        
        forecast.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actual: 0,
          predicted: predictedValue,
        });
      }

      setForecastData(forecast);
      setStats({
        avgDailyMeals: Math.round(avgMeals),
        trend,
        nextWeekTotal: Math.round(nextWeekTotal),
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Generating forecast...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Demand Forecast
        </h1>
        <p className="text-gray-600 text-lg">Predict future meal demand using historical data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-100 font-medium">Avg Daily Meals</p>
                <p className="text-4xl font-bold">{stats.avgDailyMeals}</p>
                <p className="text-xs text-blue-200 mt-1">servings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg text-white ${
          stats.trend === 'increasing' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
          stats.trend === 'decreasing' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
          'bg-gradient-to-br from-gray-500 to-slate-600'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  stats.trend === 'increasing' ? 'text-green-100' :
                  stats.trend === 'decreasing' ? 'text-red-100' :
                  'text-gray-100'
                }`}>Trend</p>
                <p className="text-4xl font-bold capitalize">{stats.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-100 font-medium">Next Week Total</p>
                <p className="text-4xl font-bold">{stats.nextWeekTotal}</p>
                <p className="text-xs text-purple-200 mt-1">predicted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">14-Day Meal Forecast</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Last 7 days (actual) vs Next 7 days (predicted)</p>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={forecastData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.8}/>
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
                itemStyle={{ fontWeight: 600 }}
                cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="url(#colorActual)" 
                strokeWidth={3}
                name="Actual Meals"
                dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#059669' }}
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="url(#colorPredicted)" 
                strokeWidth={3}
                strokeDasharray="8 8"
                name="Predicted Meals"
                dot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#047857' }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <Card className="shadow-lg border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-800">Forecasting Method</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <p>
                <strong className="text-blue-700">Algorithm:</strong> Moving Average with Trend Analysis
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <p>
                <strong className="text-purple-700">Window Size:</strong> 3 days (adjusts for recent patterns)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
              <p>
                <strong className="text-pink-700">Trend Detection:</strong> Compares first and second half of historical data
              </p>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">↑</span>
                  <span><strong>Increasing trend:</strong> +5% adjustment per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">↓</span>
                  <span><strong>Decreasing trend:</strong> -5% adjustment per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-600 font-bold">→</span>
                  <span><strong>Stable trend:</strong> No adjustment</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
