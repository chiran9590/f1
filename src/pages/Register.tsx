import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/enhancedAuthService';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: 'Very Weak', color: 'bg-red-500' });
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Handle rate limit cooldown
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCooldown(rateLimitCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCooldown]);

  // Handle password strength
  useEffect(() => {
    if (password) {
      setPasswordStrength(authService.getPasswordStrength(password));
    }
  }, [password]);

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Name validation
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      return false;
    }

    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }



    // Terms acceptance
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check rate limit cooldown
    if (rateLimitCooldown > 0) {
      setError(`Please wait ${rateLimitCooldown} seconds before trying again.`);
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const { error: signupError } = await authService.signUp({
        email,
        password,
        fullName: fullName.trim(),
        role: 'client', // Always register as client
      });

      if (signupError) {
        setError(signupError);
        
        // If it's a rate limit error, set cooldown
        if (signupError.includes('too many') || signupError.includes('wait') || signupError.includes('rate limit')) {
          setRateLimitCooldown(60); // 60 second cooldown
        }
        return;
      }

      // Show success message with more details
      showSuccess(
        'Account Created Successfully!',
        `Welcome ${fullName}! Please check your email at ${email} to verify your account. You'll need to verify before logging in.`
      );
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setTermsAccepted(false);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Account created! Please check your email for verification link.' } 
        });
      }, 2000);
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create an account';
      setError(errorMessage);
      showError('Registration Failed', errorMessage);
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
        <h2 className="text-4xl font-bold text-center">Request Access</h2>
        <p className="text-xl text-teal-100 text-center max-w-md mt-4">
          Join our AI-powered golf course analytics platform and unlock deep learning insights for superior turf management
        </p>
      </div>

      {/* Right Section - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6" role="alert">
              <span className="block text-sm">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>


            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
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
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  placeholder="Create a strong password (min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, and numbers</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-teal-600 hover:text-teal-700 underline">Terms and Conditions</Link> and <Link to="/privacy" className="text-teal-600 hover:text-teal-700 underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Account Type Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Client Account</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                You are registering as a client user. Your golf club will be assigned by an administrator after registration.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || rateLimitCooldown > 0}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creating Account...
                  </span>
                ) : rateLimitCooldown > 0 ? (
                  <span>Wait {rateLimitCooldown}s</span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <Link
              to="/login"
              className="text-teal-600 hover:text-teal-700 text-sm font-medium transition duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
