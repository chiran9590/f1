import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
    return <Navigate to="/login" state={{ message: 'Please verify your email before accessing the dashboard.' }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
