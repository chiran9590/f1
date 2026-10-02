import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe, Upload, LogOut, Menu, X, Search, Plus, Edit, Trash2, UserCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService, AdminUser, GolfClub, MapTile } from '../services/adminService';
import { useToast } from '../context/ToastContext';

const AdminDashboardFinal: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
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
  const { showSuccess, showError } = useToast();

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

      setUsers(usersData);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      showError('Error', 'Failed to sign out');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      showSuccess('Success', 'User deleted successfully');
      fetchDashboardData();
    } catch (error) {
      showError('Error', 'Failed to delete user');
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    try {
      await adminService.deleteGolfClub(clubId);
      showSuccess('Success', 'Golf club deleted successfully');
      fetchDashboardData();
    } catch (error) {
      showError('Error', 'Failed to delete golf club');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { id: 'users', icon: <Users size={20} />, label: 'User Management' },
    { id: 'clubs', icon: <Globe size={20} />, label: 'Golf Clubs' },
    { id: 'upload', icon: <Upload size={20} />, label: 'Tile Upload' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
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
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* User Cards */}
              <div className="grid gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.full_name || 'Unknown'}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'admin' ? 'Admin' : 'Client'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'clubs':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Golf Clubs</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={20} />
                  <span>Add Club</span>
                </button>
              </div>

              {clubs.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No golf clubs found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {clubs.map((club) => (
                    <div key={club.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Globe className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{club.name}</h3>
                            <p className="text-sm text-gray-600">{club.location || 'No location'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Created {new Date(club.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClub(club.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tile Upload</h2>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your files here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Choose Files
                </button>
              </div>

              {/* Recent Uploads */}
              {mapTiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Uploads</h3>
                  <div className="space-y-2">
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
                            <p className="text-sm text-gray-600">
                              {(tile.file_size ? tile.file_size / 1024 / 1024 : 0).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tile.upload_status === 'completed' ? 'bg-green-100 text-green-800' :
                          tile.upload_status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {tile.upload_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navItems.find(item => item.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {renderContent()}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboardFinal;
