import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth not available - using mock authentication');
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
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
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { signInWithPopup, FacebookAuthProvider } = await import('firebase/auth');
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { signInWithPopup, TwitterAuthProvider } = await import('firebase/auth');
      const provider = new TwitterAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Twitter sign in error:', error);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { signInWithPopup, GithubAuthProvider } = await import('firebase/auth');
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (displayName: string) => {
    if (!user) throw new Error('No user logged in');
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth');
      await firebaseUpdateProfile(user, { displayName });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 