import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authMode: 'firebase' | 'local' | 'offline';
  connectionStatus: 'online' | 'offline' | 'degraded';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getAuthStatus: () => { mode: string; status: string; features: any };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'firebase' | 'local' | 'offline'>('firebase');
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'degraded'>('online');

  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('online');
      } else {
        setConnectionStatus('offline');
        setAuthMode('offline');
      }
    };

    // Initial check
    checkConnection();

    // Listen for online/offline events
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth not available - using local authentication');
      setAuthMode('local');
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setLoading(false);
      
      // Update auth mode based on user state
      if (user) {
        setAuthMode('firebase');
      } else if (connectionStatus === 'offline') {
        setAuthMode('offline');
      } else {
        setAuthMode('local');
      }
    });

    return unsubscribe;
  }, [connectionStatus]);

  const handleAuthFailure = (error: any) => {
    console.error('Auth failure:', error);
    
    // Fallback to local auth if Firebase fails
    if (authMode === 'firebase') {
      setAuthMode('local');
      console.log('Falling back to local authentication');
    }
  };

  const signIn = async (email: string, password: string) => {
    if (authMode === 'offline') {
      throw new Error('Authentication unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local authentication fallback
      const mockUser = {
        uid: 'local-user',
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (authMode === 'offline') {
      throw new Error('Registration unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local registration fallback
      const mockUser = {
        uid: 'local-user',
        email,
        displayName,
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error) {
      console.error('Sign up error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (authMode === 'offline') {
      throw new Error('Social login unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local social login fallback
      const mockUser = {
        uid: 'local-google-user',
        email: 'user@gmail.com',
        displayName: 'Google User',
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    if (authMode === 'offline') {
      throw new Error('Social login unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local social login fallback
      const mockUser = {
        uid: 'local-facebook-user',
        email: 'user@facebook.com',
        displayName: 'Facebook User',
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signInWithPopup, FacebookAuthProvider } = await import('firebase/auth');
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Facebook sign in error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    if (authMode === 'offline') {
      throw new Error('Social login unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local social login fallback
      const mockUser = {
        uid: 'local-apple-user',
        email: 'user@apple.com',
        displayName: 'Apple User',
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Apple sign in error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    if (authMode === 'offline') {
      throw new Error('Social login unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local social login fallback
      const mockUser = {
        uid: 'local-twitter-user',
        email: 'user@twitter.com',
        displayName: 'Twitter User',
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signInWithPopup, TwitterAuthProvider } = await import('firebase/auth');
      const provider = new TwitterAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Twitter sign in error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    if (authMode === 'offline') {
      throw new Error('Social login unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Local social login fallback
      const mockUser = {
        uid: 'local-github-user',
        email: 'user@github.com',
        displayName: 'GitHub User',
        photoURL: null,
      } as User;
      setUser(mockUser);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signInWithPopup, GithubAuthProvider } = await import('firebase/auth');
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('GitHub sign in error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const signOut = async () => {
    if (authMode === 'local' || authMode === 'offline') {
      setUser(null);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force sign out even if Firebase fails
      setUser(null);
      throw error;
    }
  };

  const updateProfile = async (displayName: string) => {
    if (authMode === 'local' || authMode === 'offline') {
      if (user) {
        setUser({ ...user, displayName });
      }
      return;
    }

    if (!auth || !auth.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth');
      await firebaseUpdateProfile(auth.currentUser, { displayName });
    } catch (error) {
      console.error('Update profile error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (authMode === 'offline') {
      throw new Error('Password reset unavailable in offline mode');
    }

    if (authMode === 'local') {
      // Mock password reset for local mode
      console.log('Password reset email would be sent to:', email);
      return;
    }

    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      handleAuthFailure(error);
      throw error;
    }
  };

  const getAuthStatus = () => {
    return {
      mode: authMode,
      status: connectionStatus,
      features: {
        cloud_sync: authMode === 'firebase' && connectionStatus === 'online',
        local_storage: true,
        offline_support: true,
        social_login: authMode !== 'offline'
      }
    };
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authMode,
      connectionStatus,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      signInWithApple,
      signInWithTwitter,
      signInWithGitHub,
      signOut,
      updateProfile,
      resetPassword,
      getAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 