import React from 'react';
import { Users, Building, Upload, Activity, Shield } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const SimpleAdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.full_name || user?.email}
              </span>
              <LogoutButton showText={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Admin Dashboard
          </h2>
          <p className="text-gray-600">
            You have successfully logged in as an administrator. Here you can manage users, clubs, and system settings.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions
            </p>
            <button 
              onClick={() => navigate('/admin/users')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Building className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Club Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create and manage golf clubs
            </p>
            <button 
              onClick={() => navigate('/admin/clubs')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Clubs
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Upload className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Maps</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Upload and manage golf course maps
            </p>
            <button 
              onClick={() => navigate('/admin/upload')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Upload Maps
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Storage</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Normal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">API</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;
