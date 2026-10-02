import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/EnhancedAuthContext';
import LogoutButton from '../../components/LogoutButton';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/clubs', label: 'Clubs' },
  { to: '/admin/upload', label: 'Upload' },
];

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              <span className="text-lg font-bold text-gray-900">HealthMaps Admin</span>
            </div>
            <nav className="flex gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <LogoutButton showText={true} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
