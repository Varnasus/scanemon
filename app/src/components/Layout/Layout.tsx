import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Navigation from './Navigation';
import UserProfile from './UserProfile';
import { MobileDrawer, MobileMenuButton } from './MobileDrawer';
import { FloatingActionButton } from '../UI/FloatingActionButton';
import { componentStyles } from '../../styles/designSystem';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white font-sans" data-testid="layout">
      {/* Header */}
      <header className="backdrop-blur-sm bg-black/30 border-b border-white/10" data-testid="layout-header">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2" data-testid="layout-logo">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" data-testid="layout-logo-icon">
                <span className="text-white font-bold text-lg">🪙</span>
              </div>
              <span className="text-xl font-bold text-white" data-testid="layout-logo-text">
                Scanémon
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <MobileMenuButton 
              onClick={() => setIsMobileDrawerOpen(true)}
              testId="mobile-menu-button"
            />

            {/* User Profile & Theme Toggle */}
            <div className="flex items-center space-x-4" data-testid="layout-header-actions">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-150 hover:scale-105"
                aria-label="Toggle theme"
                data-testid="theme-toggle-button"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" data-testid="theme-toggle-sun-icon">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" data-testid="theme-toggle-moon-icon">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              {user ? (
                <UserProfile user={user} />
              ) : (
                <div className="flex items-center space-x-2" data-testid="layout-guest-profile">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" data-testid="layout-guest-avatar">
                    <span className="text-white text-sm font-bold">G</span>
                  </div>
                  <span className="text-sm text-white/70" data-testid="layout-guest-label">Guest</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex" data-testid="layout-main">
        {/* Sidebar Navigation - Hidden on mobile */}
        <aside className="hidden md:block w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 min-h-screen" data-testid="layout-sidebar">
          <Navigation currentPath={location.pathname} />
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6" data-testid="layout-content">
          <div className="max-w-7xl mx-auto" data-testid="layout-content-container">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        testId="mobile-drawer"
      />

      {/* Floating Action Button - Only show on mobile */}
      <FloatingActionButton 
        href="/scan"
        testId="floating-scan-button"
      />
    </div>
  );
};

export default Layout; 