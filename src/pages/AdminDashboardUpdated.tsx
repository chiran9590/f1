import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, Upload, BarChart3, LogOut, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService, AdminUser, GolfClub, MapTile } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import UsersTable from '../components/admin/UsersTable';
import ClubCard from '../components/admin/ClubCard';
import UploadZone from '../components/admin/UploadZone';

const AdminDashboardUpdated: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [clubs, setClubs] = useState<GolfClub[]>([]);
  const [mapTiles, setMapTiles] = useState<MapTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClubs: 0,
    totalUploads: 0,
    recentActivity: 0
  });
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { showError } = useToast();

  // Check admin access
  useEffect(() => {
    if (user && profile?.role !== 'admin') {
      showError('Access Denied', 'You do not have admin privileges.');
      navigate('/login');
      return;
    }
  }, [user, profile, navigate, showError]);

  // Fetch data
  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [usersData, clubsData, tilesData, statsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getGolfClubs(),
        adminService.getMapTiles(),
        adminService.getDashboardStats()
      ]);

      setClubs(clubsData);
      setMapTiles(tilesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin');
  };

  const navItems = [
    { id: 'users', icon: <Users size={20} />, label: 'User Management' },
    { id: 'clubs', icon: <Globe size={20} />, label: 'Golf Clubs' },
    { id: 'upload', icon: <Upload size={20} />, label: 'Tile Upload' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return (
          <UsersTable
            searchQuery={searchTerm}
            onUserDeleted={fetchDashboardData}
          />
        );

      case 'clubs':
        return (
          <div className="space-y-4">
            {clubs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Golf Clubs</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first golf club.</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Club
                </button>
              </div>
            ) : (
              clubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onClubUpdated={fetchDashboardData}
                  onClubDeleted={fetchDashboardData}
                />
              ))
            )}
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <UploadZone
              onUploadComplete={(tile) => {
                setMapTiles(prev => [tile, ...prev]);
                setStats(prev => ({
                  ...prev,
                  totalUploads: prev.totalUploads + 1
                }));
              }}
              clubs={clubs.map(club => ({ id: club.id, name: club.name }))}
            />

            {/* Recent Uploads */}
            {mapTiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
                <div className="space-y-3">
                  {mapTiles.slice(0, 5).map((tile) => (
                    <div key={tile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          tile.upload_status === 'completed' ? 'bg-green-500' :
                          tile.upload_status === 'failed' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{tile.file_name}</p>
                          <p className="text-sm text-gray-600">{tile.club_name || 'Unknown Club'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tile.upload_status === 'completed' ? 'bg-green-100 text-green-800' :
                          tile.upload_status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {tile.upload_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Admin Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{profile.full_name || 'Admin'}</p>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <h1 className="text-xl font-bold text-gray-900 capitalize">
                {navItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>

            {/* Search Bar */}
            {activeTab === 'users' && (
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Golf Clubs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardUpdated;
