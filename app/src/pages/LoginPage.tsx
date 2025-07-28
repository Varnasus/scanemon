import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SocialLogin from '../components/Auth/SocialLogin';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Welcome back, Trainer! 🎴');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleSocialLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="login-page">
      <div className="max-w-md w-full space-y-8" data-testid="login-container">
        {/* Header */}
        <div className="text-center" data-testid="login-header">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8" data-testid="login-logo">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center" data-testid="login-logo-icon">
              <span className="text-white font-bold text-2xl">🎴</span>
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="login-logo-text">
              Scanémon
            </span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="login-title">
            Welcome back, Trainer!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300" data-testid="login-subtitle">
            Sign in to continue your collection adventure
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8" data-testid="login-form-container">
          <form className="space-y-6" onSubmit={handleSubmit} data-testid="login-form">
            <div data-testid="email-field-container">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-testid="email-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="trainer@example.com"
                data-testid="email-input"
              />
            </div>

            <div data-testid="password-field-container">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-testid="password-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter your password"
                data-testid="password-input"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                data-testid="forgot-password-button"
              >
                Forgot your password?
              </button>
            </div>

            {/* Forgot Password Form */}
            {showForgotPassword && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" data-testid="forgot-password-form">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    data-testid="forgot-password-email"
                  />
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    data-testid="send-reset-email-button"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            <div data-testid="login-actions">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                data-testid="login-submit-button"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2" data-testid="login-loading">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" data-testid="login-spinner"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Social Login */}
            <SocialLogin 
              onSuccess={handleSocialLoginSuccess}
              disabled={isLoading}
            />

            <div className="text-center" data-testid="login-footer">
              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="login-no-account">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  data-testid="login-register-link"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 