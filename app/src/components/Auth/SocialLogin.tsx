import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SocialLoginProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const { 
    signInWithGoogle, 
    signInWithFacebook, 
    signInWithApple,
    signInWithTwitter,
    signInWithGitHub 
  } = useAuth();

  const handleSocialLogin = async (
    provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'github',
    loginFunction: () => Promise<void>
  ) => {
    if (disabled) return;

    try {
      await loginFunction();
      toast.success(`Welcome! Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)} 🎴`);
      onSuccess?.();
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error);
      
      let errorMessage = `Failed to sign in with ${provider}. Please try again.`;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in is not enabled. Please contact support.`;
      }
      
      toast.error(errorMessage);
      onError?.(error);
    }
  };

  const socialProviders = [
    {
      name: 'Google',
      icon: '🔍',
      color: 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700',
      onClick: () => handleSocialLogin('google', signInWithGoogle)
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white',
      onClick: () => handleSocialLogin('facebook', signInWithFacebook)
    },
    {
      name: 'Apple',
      icon: '🍎',
      color: 'bg-black hover:bg-gray-900 border-black text-white',
      onClick: () => handleSocialLogin('apple', signInWithApple)
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400 hover:bg-blue-500 border-blue-400 text-white',
      onClick: () => handleSocialLogin('twitter', signInWithTwitter)
    },
    {
      name: 'GitHub',
      icon: '🐙',
      color: 'bg-gray-800 hover:bg-gray-900 border-gray-800 text-white',
      onClick: () => handleSocialLogin('github', signInWithGitHub)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.name}
            onClick={provider.onClick}
            disabled={disabled}
            className={`
              w-full flex items-center justify-center px-4 py-3 border rounded-lg
              font-medium text-sm transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${provider.color}
            `}
            data-testid={`${provider.name.toLowerCase()}-login-button`}
          >
            <span className="mr-3 text-lg">{provider.icon}</span>
            <span>Continue with {provider.name}</span>
          </button>
        ))}
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By continuing, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default SocialLogin; 