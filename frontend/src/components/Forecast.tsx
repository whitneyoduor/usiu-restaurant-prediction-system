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
    accuracy: 0,
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

      // Prepare data for Linear Regression
      const dates = Object.keys(mealsByDate).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      const values = dates.map(date => mealsByDate[date]);
      const avgMeals = values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : 0;

      // Linear Regression Algorithm
      // y = mx + b, where y is meals, x is day number
      const linearRegression = (x: number[], y: number[]) => {
        const n = x.length;
        if (n < 2) return { slope: 0, intercept: y[0] || 0 };

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
      };

      // Prepare data points for regression (use last 14 days if available)
      const recentDays = Math.min(14, values.length);
      const xValues = Array.from({ length: recentDays }, (_, i) => i + 1);
      const yValues = values.slice(-recentDays);

      const { slope, intercept } = linearRegression(xValues, yValues);

      // Determine trend from slope
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (slope > 0.5) trend = 'increasing';
      else if (slope < -0.5) trend = 'decreasing';

      // Calculate R-squared for accuracy measure
      const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
      const ssRes = yValues.reduce((sum, yi, i) => {
        const predicted = slope * xValues[i] + intercept;
        return sum + Math.pow(yi - predicted, 2);
      }, 0);
      const ssTot = yValues.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
      const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

      // Generate forecast for next 14 days
      const today = new Date();
      const forecast: ForecastData[] = [];
      
      // Add last 7 days actual data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const dayNumber = recentDays - i;
        const predicted = Math.max(0, Math.round(slope * dayNumber + intercept));
        
        forecast.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actual: mealsByDate[dateStr] || 0,
          predicted: predicted,
        });
      }

      // Add next 7 days predicted data using linear regression
      let nextWeekTotal = 0;
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayNumber = recentDays + i;
        const predictedValue = Math.max(0, Math.round(slope * dayNumber + intercept));
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
        accuracy: Math.round(rSquared * 100),
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-100 font-medium">Model Accuracy</p>
                <p className="text-4xl font-bold">{stats.accuracy}%</p>
                <p className="text-xs text-orange-200 mt-1">R² score</p>
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
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="areaActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="areaPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '13px', fontWeight: 600 }}
                tick={{ fill: '#4b5563' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '13px', fontWeight: 600 }}
                tick={{ fill: '#4b5563' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
                  padding: '14px',
                  fontSize: '13px'
                }}
                labelStyle={{ color: '#8b5cf6', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}
                itemStyle={{ fontWeight: 600, fontSize: '13px', padding: '4px' }}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }}
                iconType="line"
                iconSize={16}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="url(#colorActual)" 
                strokeWidth={4}
                name="Actual Meals"
                dot={{ r: 7, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 10, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="url(#colorPredicted)" 
                strokeWidth={4}
                strokeDasharray="10 5"
                name="Predicted Meals"
                dot={{ r: 7, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 10, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1200}
                animationEasing="ease-out"
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
                <strong className="text-blue-700">Algorithm:</strong> Linear Regression (y = mx + b)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <p>
                <strong className="text-purple-700">Data Window:</strong> Last 14 days (optimal for accuracy)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
              <p>
                <strong className="text-pink-700">Accuracy Metric:</strong> R² (Coefficient of Determination)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <p>
                <strong className="text-green-700">Prediction Method:</strong> Extrapolates trend line forward
              </p>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
              <p className="font-semibold text-gray-800 mb-3">How It Works:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold text-lg">1.</span>
                  <span>Analyzes last 14 days of meal data to find the best-fit line</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold text-lg">2.</span>
                  <span>Calculates slope (m) and intercept (b) using least squares method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold text-lg">3.</span>
                  <span>Projects the trend line forward 7 days for predictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold text-lg">4.</span>
                  <span>R² score shows how well the model fits historical data (0-100%)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
