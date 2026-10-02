import React, { useState } from 'react';
import { useAuth } from '../context/EnhancedAuthContext';
import { supabase } from '../lib/supabase';

const AuthTest: React.FC = () => {
  const { user, profile, role, loading, refreshProfile } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `${icon} ${message}`]);
  };

  const runAuthTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('Starting authentication test...', 'info');

    // Test 1: Check Supabase Connection
    try {
      const { error } = await supabase.from('profiles').select('count').single();
      if (error) {
        addResult(`Database connection failed: ${error.message}`, 'error');
      } else {
        addResult('Database connection successful', 'success');
      }
    } catch (err) {
      addResult(`Database test failed: ${err}`, 'error');
    }

    // Test 2: Check Current Session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addResult(`Session check failed: ${error.message}`, 'error');
      } else if (session) {
        addResult(`Active session found for: ${session.user.email}`, 'success');
      } else {
        addResult('No active session', 'info');
      }
    } catch (err) {
      addResult(`Session test failed: ${err}`, 'error');
    }

    // Test 3: Check User State
    if (user) {
      addResult(`User state: ${user.email}`, 'success');
      addResult(`User ID: ${user.id}`, 'info');
      addResult(`Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`, 'info');
    } else {
      addResult('No user in state', 'info');
    }

    // Test 4: Check Profile State
    if (profile) {
      addResult(`Profile found: ${profile.full_name}`, 'success');
      addResult(`Profile role: ${profile.role}`, 'info');
      addResult(`Profile email: ${profile.email}`, 'info');
    } else {
      addResult('No profile in state', 'info');
    }

    // Test 5: Check Role State
    if (role) {
      addResult(`Role determined: ${role}`, 'success');
    } else {
      addResult('Role not determined', 'info');
    }

    // Test 6: Profile Refresh Test
    if (user) {
      try {
        addResult('Testing profile refresh...', 'info');
        await refreshProfile();
        addResult('Profile refresh successful', 'success');
      } catch (err) {
        addResult(`Profile refresh failed: ${err}`, 'error');
      }
    }

    // Test 7: Auth Context Loading State
    addResult(`Auth loading state: ${loading ? 'Still loading' : 'Completed'}`, loading ? 'info' : 'success');

    addResult('Authentication test completed!', 'info');
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Authentication Test</h2>
      
      <div className="space-y-4">
        {/* Current State Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Current State:</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
            <div><strong>User:</strong> {user ? user.email : 'None'}</div>
            <div><strong>Profile:</strong> {profile ? profile.full_name : 'None'}</div>
            <div><strong>Role:</strong> {role || 'None'}</div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex space-x-4">
          <button
            onClick={runAuthTest}
            disabled={isRunning}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Test...' : 'Run Auth Test'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test Results:</h3>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : 'text-blue-600'}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Actions:</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Debug Info:</strong> Open browser console for detailed logs
            </div>
            <div>
              <strong>Session Check:</strong> Refresh page to test session persistence
            </div>
            <div>
              <strong>Profile Test:</strong> Try logging out and back in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
