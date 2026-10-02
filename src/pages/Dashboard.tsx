import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    console.log('Logout');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            {/* HealthMaps Logo */}
            <img 
              src="/healthmaps.jpeg" 
              alt="HealthMaps Logo" 
              className="h-8 w-auto"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            <div className="text-gray-500 text-sm px-3 py-2">
              Dashboard content coming soon...
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <FiLogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-0">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <FiMenu size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back</p>
                <p className="text-xs text-gray-500">
                  HealthMaps User
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>
              <p className="text-gray-600 mb-8">Your AI-powered golf course analytics dashboard is being prepared.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900">AI Analysis</h3>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900">Courses</h3>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
