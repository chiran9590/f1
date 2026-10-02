import React, { useState, useEffect } from 'react';
import { Users, Building, Upload, TrendingUp, Map, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DashboardSwitcher from '../components/DashboardSwitcher';
import AdminDashboardSections from '../components/AdminDashboardSections';
import { Link, useLocation } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalClubs: number;
  totalUploads: number;
  recentActivity: number;
}

const AdminDashboardHome: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClubs: 0,
    totalUploads: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total clubs
      const { count: clubsCount } = await supabase
        .from('golf_clubs')
        .select('*', { count: 'exact', head: true });

      // Fetch total uploads
      const { count: uploadsCount } = await supabase
        .from('map_uploads')
        .select('*', { count: 'exact', head: true });

      // Fetch recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCount } = await supabase
        .from('map_uploads')
        .select('*', { count: 'exact', head: true })
        .gte('uploaded_at', sevenDaysAgo.toISOString());

      setStats({
        totalUsers: usersCount || 0,
        totalClubs: clubsCount || 0,
        totalUploads: uploadsCount || 0,
        recentActivity: recentCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Clubs',
      value: stats.totalClubs,
      icon: Building,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Uploads',
      value: stats.totalUploads,
      icon: Upload,
      color: 'bg-purple-500',
      change: '+24%',
      changeType: 'increase' as const,
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'increase' as const,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Switcher */}
      <DashboardSwitcher />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin dashboard. Here's your system overview.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('upload-tiles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'upload-tiles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload Tiles
          </button>
          <button
            onClick={() => setActiveTab('upload-metadata')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'upload-metadata'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload Metadata
          </button>
          <button
            onClick={() => setActiveTab('club-client-management')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'club-client-management'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Club & Client Management
          </button>
          <button
            onClick={() => setActiveTab('instant-analyze')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'instant-analyze'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Instant Analyze
          </button>
          <Link
            to="/admin/users"
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              location.pathname === '/admin/users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </Link>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">from last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('upload-tiles')}
                  className="w-full flex items-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Map className="w-5 h-5 mr-3" />
                  Upload Tiles
                </button>
                <button
                  onClick={() => setActiveTab('upload-metadata')}
                  className="w-full flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-3" />
                  Upload Metadata
                </button>
                <button
                  onClick={() => setActiveTab('club-client-management')}
                  className="w-full flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Building className="w-5 h-5 mr-3" />
                  Club & Client Management
                </button>
                <button
                  onClick={() => setActiveTab('instant-analyze')}
                  className="w-full flex items-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Camera className="w-5 h-5 mr-3" />
                  Instant Analyze
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage (R2)</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Normal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <AdminDashboardSections activeTab={activeTab} />
      )}
    </div>
  );
};

export default AdminDashboardHome;
