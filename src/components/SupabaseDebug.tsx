import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Check environment variables
        const envCheck = {
          VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
          VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
          supabaseUrl: supabase ? '✅ Connected' : '❌ Not Connected',
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Key Set' : '❌ Key Missing'
        };

        // Test database connection
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        // Test auth connection
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Test auth state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        setDebugInfo({
          environment: envCheck,
          database: {
            connected: !profileError,
            error: profileError?.message || 'None',
            sampleData: profileData?.length || 0
          },
          auth: {
            user: user ? '✅ User found' : '❌ No user',
            userId: user?.id || 'None',
            userEmail: user?.email || 'None',
            authError: authError?.message || 'None'
          },
          session: {
            active: !!session,
            expiresAt: session?.expires_at || 'None',
            sessionError: sessionError?.message || 'None'
          }
        });
      } catch (error: any) {
        setDebugInfo({
          error: error?.message || 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    checkSupabaseConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Checking Supabase connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg text-sm">
      <h3 className="font-bold text-lg mb-4">🔍 Supabase Debug Info</h3>
      
      {debugInfo.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          <strong>Error:</strong> {debugInfo.error}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Environment Check */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold mb-2">📋 Environment Variables</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(debugInfo.environment || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Database Connection */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold mb-2">🗄️ Database Connection</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={debugInfo.database?.connected ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.database?.connected ? '✅ Connected' : '❌ Failed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Error:</span>
                <span>{debugInfo.database?.error}</span>
              </div>
              <div className="flex justify-between">
                <span>Sample Records:</span>
                <span>{debugInfo.database?.sampleData}</span>
              </div>
            </div>
          </div>

          {/* Auth Status */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold mb-2">🔐 Authentication</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>User Status:</span>
                <span>{debugInfo.auth?.user}</span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-xs">{debugInfo.auth?.userId}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{debugInfo.auth?.userEmail}</span>
              </div>
            </div>
          </div>

          {/* Session Status */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold mb-2">🎫 Session</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Active:</span>
                <span className={debugInfo.session?.active ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.session?.active ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span>{debugInfo.session?.expiresAt ? String(debugInfo.session.expiresAt) : 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseDebug;
