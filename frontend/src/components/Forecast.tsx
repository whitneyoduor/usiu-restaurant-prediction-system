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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Demand Forecast</h1>
        <p className="text-gray-600">Predict future meal demand using historical data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-12 h-12 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Daily Meals</p>
                <p className="text-3xl">{stats.avgDailyMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className={`w-12 h-12 ${
                stats.trend === 'increasing' ? 'text-green-500' :
                stats.trend === 'decreasing' ? 'text-red-500' :
                'text-gray-500'
              }`} />
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-2xl capitalize">{stats.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-12 h-12 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Next Week Total</p>
                <p className="text-3xl">{stats.nextWeekTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>14-Day Meal Forecast</CardTitle>
          <p className="text-sm text-gray-600">Last 7 days (actual) vs Next 7 days (predicted)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Actual Meals"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Meals"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <Card>
        <CardHeader>
          <CardTitle>Forecasting Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Algorithm:</strong> Moving Average with Trend Analysis
            </p>
            <p>
              <strong>Window Size:</strong> 3 days (adjusts for recent patterns)
            </p>
            <p>
              <strong>Trend Detection:</strong> Compares first and second half of historical data
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
              <li>Increasing trend: +5% adjustment per day</li>
              <li>Decreasing trend: -5% adjustment per day</li>
              <li>Stable trend: No adjustment</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
