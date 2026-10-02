import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';

const DashboardSwitcher: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const isAdminDashboard = location.pathname.startsWith('/admin');
  const isClientDashboard = location.pathname.startsWith('/dashboard');

  // Don't show switcher on login pages or if user is not admin
  if (!isAdmin || (!isAdminDashboard && !isClientDashboard)) {
    return null;
  }

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isAdminDashboard ? 'bg-indigo-100' : 'bg-green-100'
          }`}>
            {isAdminDashboard ? (
              <Shield className="w-5 h-5 text-indigo-600" />
            ) : (
              <User className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isAdminDashboard ? 'Admin Dashboard' : 'Client Dashboard'}
            </p>
            <p className="text-xs text-gray-500">
              {isAdminDashboard ? 'System administration' : 'Personal health analytics'}
            </p>
          </div>
        </div>
        
        <Link
          to={isAdminDashboard ? '/dashboard' : '/admin/dashboard'}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <span>Switch to</span>
          {isAdminDashboard ? (
            <>
              <User className="w-4 h-4" />
              <span>Client</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </>
          )}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardSwitcher;
