import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/EnhancedAuthContext';
import AuthDebug from '../components/AuthDebug';
import AdminDebugPanel from '../components/AdminDebugPanel';
import Logo from '../components/Logo';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const { adminSignIn } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const { error: loginError } = await adminSignIn(email, password);

      if (loginError) {
        setError(loginError);
        showError('Login Failed', loginError);
        return;
      }

      // Successful login
      showSuccess('Admin Login Successful', 'Welcome to the Admin Panel!');

      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 300);
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to log in';
      setError(errorMessage);
      showError('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Left Section - Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12">
        {/* Logo Component */}
        <div className="mb-8">
          <Logo size="lg" showText={false} className="w-48 h-48" />
        </div>
        
        {/* Tagline */}
        <p className="text-xl font-semibold mb-6 uppercase tracking-wide">ADMIN PORTAL</p>
        
        {/* Portal Description */}
        <h2 className="text-4xl font-bold text-center">System Administration</h2>
        <p className="text-xl text-gray-300 text-center max-w-md mt-4">
          Secure access for system administrators and managers
        </p>
      </div>

      {/* Right Section - Admin Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-8">
          {/* Admin Login Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h6m-6 0v6m0-6v-6m0 6h6m-9-6h6a3 3 0 013 3v6a3 3 0 01-3 3H6a3 3 0 01-3-3V8a3 3 0 013-3h6a3 3 0 013 3v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-600">Sign in to access system administration</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6" role="alert">
              <span className="block text-sm">{success}</span>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6" role="alert">
              <span className="block text-sm">{error}</span>
            </div>
          )}

          {/* Admin Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-200"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <div>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-700 text-sm font-medium transition duration-200"
              >
                ← Back to User Login
              </Link>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Need an account? </span>
              <Link
                to="/register"
                className="text-gray-600 hover:text-gray-700 text-sm font-medium transition duration-200"
              >
                Request Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Component - Remove in production */}
      <AuthDebug />
      <AdminDebugPanel />
    </div>
  );
};

export default AdminLogin;
