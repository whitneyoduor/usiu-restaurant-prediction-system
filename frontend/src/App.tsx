import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MealRecording } from './components/MealRecording';
import { InventoryManagement } from './components/InventoryManagement';
import { LowStockAlerts } from './components/LowStockAlerts';
import { UserManagement } from './components/UserManagement';
import { Forecast } from './components/Forecast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onSuccess={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ProtectedRoute>
            <Dashboard onNavigate={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'meals':
        return (
          <ProtectedRoute allowedRoles={['admin', 'chef']}>
            <MealRecording />
          </ProtectedRoute>
        );
      case 'inventory':
        return (
          <ProtectedRoute>
            <InventoryManagement />
          </ProtectedRoute>
        );
      case 'alerts':
        return (
          <ProtectedRoute>
            <LowStockAlerts />
          </ProtectedRoute>
        );
      case 'forecast':
        return (
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Forecast />
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute>
            <Dashboard onNavigate={setCurrentPage} />
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
