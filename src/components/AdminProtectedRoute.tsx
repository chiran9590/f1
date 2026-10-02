import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email is verified
  if (!user.email_confirmed_at) {
    // Redirect to login with verification message
    return <Navigate to="/login" state={{ message: 'Please verify your email before accessing the admin dashboard.' }} replace />;
  }

  // Check if user has admin role
  if (profile?.role !== 'admin') {
    // Redirect to regular dashboard or login with access denied message
    return <Navigate to="/login" state={{ message: 'Access denied. Admin privileges required.' }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
