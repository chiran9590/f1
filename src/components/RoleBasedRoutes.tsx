import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

interface ClientRouteProps {
  children: React.ReactNode;
}

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Admin Route Component - Only allows access to admin users
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ AdminRoute - User:', user?.email, 'Role:', role, 'Loading:', loading);
  console.log('🛡️ AdminRoute - Current path:', location.pathname);

  // Show loading spinner while checking authentication and role
  if (loading) {
    console.log('⏳ AdminRoute - Still loading...');
    return <LoadingSpinner />;
  }

  // Redirect to admin login if not authenticated
  if (!user) {
    console.log('🚫 AdminRoute - No user, redirecting to admin login');
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // If user is logged in but role is not yet determined, wait a bit longer
  if (role === null || role === undefined) {
    console.log('⏳ AdminRoute - Role not determined yet, waiting...');
    // Give more time for role to be determined after login
    if (!loading) {
      // If loading is complete but role is still null, redirect to admin login
      console.log('🚫 AdminRoute - Loading complete but no role, redirecting to admin login');
      return <Navigate to="/admin-login" replace />;
    }
    return <LoadingSpinner />;
  }

  // Redirect to client dashboard if not admin role
  if (role !== 'admin') {
    console.log('🚫 AdminRoute - User is not admin, redirecting to client dashboard. Role:', role);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AdminRoute - User has admin role, allowing access');
  return <>{children}</>;
};

// Client Route Component - Only allows access to client users
export const ClientRoute: React.FC<ClientRouteProps> = ({ children }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  console.log('👥 ClientRoute - User:', user?.email, 'Role:', role, 'Loading:', loading);

  // Show loading spinner while checking authentication and role
  if (loading) {
    console.log('⏳ ClientRoute - Still loading...');
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 ClientRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not yet determined, wait a bit
  if (role === null || role === undefined) {
    console.log('⏳ ClientRoute - Role not determined yet, waiting...');
    if (!loading) {
      // Fallback to avoid infinite loading when role fetch fails.
      return <>{children}</>;
    }
    return <LoadingSpinner />;
  }

  // Redirect to admin dashboard if admin role
  if (role === 'admin') {
    console.log('🔄 ClientRoute - User is admin, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Only allow access if role is 'client'
  if (role !== 'client') {
    console.log('🚫 ClientRoute - Invalid role, redirecting to login. Role:', role);
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ClientRoute - User has client role, allowing access');
  return <>{children}</>;
};

// Authenticated route for both client and admin (portal, analyze, map)
export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Role-based redirect component for login flow
export const RoleBasedRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const loginType = (location.state as any)?.loginType as 'client' | 'admin' | undefined;
  const navigate = useNavigate();
  const timeoutFiredRef = useRef(false);

  console.log('🔄 RoleBasedRedirect - User:', user?.email, 'Role:', role, 'Loading:', loading);

  // If auth/profile loading gets stuck, still route the user based on loginType.
  useEffect(() => {
    if (timeoutFiredRef.current) return;
    if (!loading) return;
    if (!loginType) return;

    const t = window.setTimeout(() => {
      timeoutFiredRef.current = true;
      navigate('/portal', { replace: true });
    }, 2000);

    return () => window.clearTimeout(t);
  }, [loading, loginType, navigate]);

  // Show loading spinner while checking authentication and role
  if (loading) {
    console.log('⏳ RoleBasedRedirect - Still loading...');
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 RoleBasedRedirect - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If role is not yet determined, wait a bit
  if (role === null || role === undefined) {
    console.log('⏳ RoleBasedRedirect - Role not determined yet');
    // If we already finished loading auth but role is missing, fall back.
    if (!loading) {
      return <Navigate to="/portal" replace />;
    }

    return <LoadingSpinner />;
  }

  // Redirect to post-login chooser for all authenticated roles
  if (role === 'admin' || role === 'client') {
    console.log('✅ RoleBasedRedirect - Redirecting to /portal');
    return <Navigate to="/portal" replace />;
  } else {
    console.log('🚫 RoleBasedRedirect - Invalid role, redirecting to login');
    return <Navigate to="/login" replace />;
  }
};

// Enhanced Protected Route with role checking
export const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}> = ({ children, allowedRoles = [], redirectTo = '/login' }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute - User:', user?.email, 'Role:', role, 'Loading:', loading);

  // Show loading spinner while checking authentication and role
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role if allowed roles are specified
  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    // Redirect based on current role
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
