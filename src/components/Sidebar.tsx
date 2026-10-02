import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Settings
} from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import LogoutButton from './LogoutButton';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { profile } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
  ];

  // Add admin menu item for admin users
  const adminMenuItem = profile?.role === 'admin' ? {
    icon: Settings, label: 'Admin Panel', path: '/admin/dashboard'
  } : null;

  // Add client dashboard link for admin users
  const clientDashboardLink = profile?.role === 'admin' ? {
    icon: LayoutDashboard, label: 'Client Dashboard', path: '/dashboard'
  } : null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center p-6 border-b border-gray-200">
            <Logo size="md" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => onClose()}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive(item.path)
                          ? 'bg-green-50 text-green-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Admin separator and menu item */}
              {adminMenuItem && (
                <>
                  <li className="pt-4">
                    <div className="px-4 py-2">
                      <div className="border-t border-gray-200"></div>
                    </div>
                  </li>
                  <li>
                    <Link
                      to={adminMenuItem.path}
                      onClick={() => onClose()}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive(adminMenuItem.path)
                          ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-200'
                          : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent'
                        }
                      `}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">{adminMenuItem.label}</span>
                    </Link>
                  </li>
                </>
              )}

              {/* Client Dashboard link for admin users */}
              {clientDashboardLink && (
                <li>
                  <Link
                    to={clientDashboardLink.path}
                    onClick={() => onClose()}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive(clientDashboardLink.path)
                        ? 'bg-green-50 text-green-600 shadow-sm border border-green-200'
                        : 'text-green-600 hover:bg-green-50 hover:text-green-700 border border-transparent'
                      }
                    `}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">{clientDashboardLink.label}</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <LogoutButton 
              variant="dropdown"
              className="text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
