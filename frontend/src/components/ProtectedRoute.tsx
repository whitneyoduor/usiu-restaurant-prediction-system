import React from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { userData, loading, currentUser } = useAuth();

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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-xl font-semibold mb-2">Not Authenticated</p>
          <p className="text-sm text-gray-600 mt-2">Please log in to continue</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-xl font-semibold mb-2">User Profile Not Found</p>
          <p className="text-sm text-yellow-700 mb-4">
            Your account exists but your user profile is missing in the database.
          </p>
          <p className="text-xs text-yellow-600">
            Please contact an administrator to create your user profile in Firestore.
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            Your UID: <code className="bg-yellow-100 px-2 py-1 rounded">{currentUser.uid}</code>
          </p>
        </div>
      </div>
    );
  }

  if (!userData.active) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Account Deactivated</p>
          <p className="text-sm text-gray-600 mt-2">Please contact an administrator</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Access Denied</p>
          <p className="text-sm text-gray-600 mt-2">
            You don't have permission to view this page
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
