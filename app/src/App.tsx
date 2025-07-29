import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingSpinner } from './components/UI/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ScanPage = React.lazy(() => import('./pages/ScanPage'));
const CollectionPage = React.lazy(() => import('./pages/CollectionPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const ModerationPage = React.lazy(() => import('./pages/ModerationPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const CardDetailPage = React.lazy(() => import('./pages/CardDetailPage'));
const MonitoringPage = React.lazy(() => import('./pages/MonitoringPage'));

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available');
              // You could show a notification to the user here
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Offline/Online detection
const setupOfflineDetection = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    console.log('Connection status changed:', isOnline ? 'Online' : 'Offline');
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('connectionChange', {
      detail: { isOnline }
    }));
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
};

// Background sync registration
const registerBackgroundSync = async () => {
  // Background sync API is deprecated and not widely supported
  // Removing this functionality to avoid TypeScript errors
  console.log('Background sync not supported in this browser');
};

function App() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();
    
    // Setup offline detection
    setupOfflineDetection();
    
    // Register background sync
    registerBackgroundSync();
    
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary testId="app-error-boundary">
            <div className="App min-h-screen">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <Layout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/scan" element={<ScanPage />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/moderation" element={<ModerationPage />} />
                    <Route path="/monitoring" element={<MonitoringPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/card/:id" element={<CardDetailPage />} />
                    <Route path="*" element={
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          The page you're looking for doesn't exist.
                        </p>
                      </div>
                    } />
                  </Routes>
                </Suspense>
              </Layout>
            </div>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 