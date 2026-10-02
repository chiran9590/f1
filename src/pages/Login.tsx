import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/enhancedAuthService';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  console.log('Login component rendering');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

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
      
      const { error: loginError } = await authService.signIn(email, password);

      if (loginError) {
        setError(loginError);
        showError('Login Failed', loginError);
        return;
      }

      // Successful login - redirect based on user role
      showSuccess('Login Successful', 'Welcome back to HealthMaps!');
      
      // Redirect via auth-redirect to wait for profile/role to load reliably
      setTimeout(() => {
        navigate('/auth-redirect', { replace: true, state: { loginType: 'client' } });
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
    <div className="min-h-screen flex bg-teal-600">
      {/* Left Section - PhytoMaps Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12">
        {/* Logo Circle with HealthMaps Image */}
        <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
          <img 
            src="/healthmaps.jpeg" 
            alt="HealthMaps Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Tagline */}
        <p className="text-xl font-semibold mb-6 uppercase tracking-wide">PUSH BEYOND LIMITS</p>
        
        {/* Portal Description */}
        <h2 className="text-4xl font-bold text-center">AI Analytics Portal</h2>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo size="lg" />
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

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Type Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Client Login</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Sign in to access your client dashboard, health monitoring, and analytics features.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <div>
              <Link
                to="/admin-login"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium transition duration-200"
              >
                Admin Login
              </Link>
            </div>
            <div>
              <Link
                to="/forgot-password"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium transition duration-200"
              >
                Forgot Password?
              </Link>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <Link
                to="/register"
                className="text-teal-600 hover:text-teal-700 text-sm font-medium transition duration-200"
              >
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
