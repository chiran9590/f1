import React from 'react';
import { useAuth } from '../context/EnhancedAuthContext';

const AuthDebug: React.FC = () => {
  const { user, session, profile, role, loading } = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div className="space-y-1">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
        <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
        <p><strong>Role:</strong> {role || 'Not loaded'}</p>
        <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded'}</p>
        {profile && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p><strong>Profile Email:</strong> {profile.email}</p>
            <p><strong>Profile Role:</strong> {profile.role}</p>
            <p><strong>Profile Name:</strong> {profile.full_name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
