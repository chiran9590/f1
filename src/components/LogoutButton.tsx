import React, { useState } from 'react';
import { LogOut, Loader } from 'lucide-react';
import { useAuth } from '../context/EnhancedAuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown';
  className?: string;
  showText?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'button', 
  className = '',
  showText = true 
}) => {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await signOut();
      showSuccess('Logged Out', 'You have been successfully logged out');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, redirect to login
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'dropdown') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${className}`}
      >
        <LogOut className="w-4 h-4 mr-3" />
        {loading ? 'Logging out...' : 'Sign out'}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4" />
          {showText && <span>Logout</span>}
        </>
      )}
    </button>
  );
};

export default LogoutButton;
