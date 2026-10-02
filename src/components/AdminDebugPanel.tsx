import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/EnhancedAuthContext';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminDebugPanel: React.FC = () => {
  const { user, profile, role, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info = {
        timestamp: new Date().toISOString(),
        auth: {
          user: user ? {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            user_metadata: user.user_metadata
          } : null,
          session: !!user
        },
        profile: {
          profile: profile ? {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            full_name: profile.full_name,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          } : null,
          hasProfile: !!profile
        },
        role: {
          current: role,
          expected: 'admin',
          isAdmin: role === 'admin',
          isClient: role === 'client',
          isValid: ['admin', 'client'].includes(role || '')
        },
        loading: {
          isLoading: loading,
          stage: loading ? 'Checking authentication...' : 'Complete'
        },
        checks: {
          email: user?.email || 'No user',
          emailConfirmed: !!user?.email_confirmed_at,
          profileExists: !!profile,
          roleMatches: role === 'admin'
        }
      };

      // Add database check
      try {
        if (user?.email) {
          const { data: profileCheck } = await supabase
            .from('profiles')
            .select('role, email, full_name')
            .eq('email', user.email)
            .single();

          info.databaseCheck = {
            profileFound: !!profileCheck,
            profileRole: profileCheck?.role || 'No role',
            profileEmail: profileCheck?.email || 'No email',
            profileName: profileCheck?.full_name || 'No name'
          };
        }
      } catch (error) {
        info.databaseCheck = {
          error: error,
          profileFound: false
        };
      }

      setDebugInfo(info);
    };

    gatherDebugInfo();
  }, [user, profile, role, loading]);

  const refreshDebug = async () => {
    setRefreshing(true);
    try {
      // Force refresh auth state
      const { data } = await supabase.auth.refreshSession();
      console.log('Session refreshed:', data);
      
      // Wait a moment and regather info
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Admin Login Debug</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshDebug}
            disabled={refreshing}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showDebug && (
        <div className="space-y-4 text-sm">
          {/* Authentication Status */}
          <div className="border rounded p-3">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              Authentication Status
              <span className={`ml-2 ${getStatusColor(debugInfo.auth?.session)}`}>
                {getStatusIcon(debugInfo.auth?.session)}
              </span>
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">User Logged In:</span>
                <span className={getStatusColor(debugInfo.auth?.session)}>
                  {debugInfo.auth?.session ? 'Yes' : 'No'}
                </span>
              </div>
              {debugInfo.auth?.user && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-mono text-xs">{debugInfo.auth.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Confirmed:</span>
                    <span className={getStatusColor(debugInfo.checks?.emailConfirmed)}>
                      {debugInfo.checks?.emailConfirmed ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Status */}
          <div className="border rounded p-3">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              Profile Status
              <span className={`ml-2 ${getStatusColor(debugInfo.profile?.hasProfile)}`}>
                {getStatusIcon(debugInfo.profile?.hasProfile)}
              </span>
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Exists:</span>
                <span className={getStatusColor(debugInfo.profile?.hasProfile)}>
                  {debugInfo.profile?.hasProfile ? 'Yes' : 'No'}
                </span>
              </div>
              {debugInfo.profile?.profile && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Email:</span>
                    <span className="font-mono text-xs">{debugInfo.profile.profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Role:</span>
                    <span className={`font-bold ${debugInfo.role?.isAdmin ? 'text-red-600' : 'text-gray-900'}`}>
                      {debugInfo.profile?.profile.role}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Role Check */}
          <div className="border rounded p-3">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              Role Verification
              <span className={`ml-2 ${getStatusColor(debugInfo.role?.isAdmin)}`}>
                {getStatusIcon(debugInfo.role?.isAdmin)}
              </span>
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Role:</span>
                <span className={`font-bold ${debugInfo.role?.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                  {debugInfo.role?.current || 'No role'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Role:</span>
                <span className="text-gray-900">admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role Matches:</span>
                <span className={getStatusColor(debugInfo.role?.isAdmin)}>
                  {debugInfo.role?.isAdmin ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Database Check */}
          {debugInfo.databaseCheck && (
            <div className="border rounded p-3">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                Database Check
                {debugInfo.databaseCheck.error && <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />}
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Found:</span>
                  <span className={getStatusColor(debugInfo.databaseCheck.profileFound)}>
                    {debugInfo.databaseCheck.profileFound ? 'Yes' : 'No'}
                  </span>
                </div>
                {debugInfo.databaseCheck.profileFound && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DB Role:</span>
                      <span className={`font-bold ${debugInfo.databaseCheck.profileRole === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                        {debugInfo.databaseCheck.profileRole}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DB Email:</span>
                      <span className="font-mono text-xs">{debugInfo.databaseCheck.profileEmail}</span>
                    </div>
                  </>
                )}
                {debugInfo.databaseCheck.error && (
                  <div className="text-red-600 text-xs">
                    Error: {JSON.stringify(debugInfo.databaseCheck.error)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="border rounded p-3 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">Debug Info</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Loading:</span>
                <span>{debugInfo.loading?.isLoading ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span>{debugInfo.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/admin-login';
              }}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
            >
              Clear & Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDebugPanel;
