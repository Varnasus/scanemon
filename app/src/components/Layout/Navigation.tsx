import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { componentStyles } from '../../styles/designSystem';

interface NavigationProps {
  currentPath: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const { user } = useAuth();

  // Mock user stats - these would come from your backend
  const userStats = {
    level: 5,
    xp: 1250,
    xpToNext: 2000,
    cardsScanned: 47,
    streak: 3
  };

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      path: '/scan',
      label: 'Scan Cards',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: 'New'
    },
    {
      path: '/collection',
      label: 'Collection',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: 'New'
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="p-4" data-testid="navigation">
      {/* User Stats Card */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6 text-white shadow-lg" data-testid="user-stats-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center" data-testid="user-stats-avatar">
              <span className="text-sm font-bold">🎴</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white/90" data-testid="user-stats-level">Level {userStats.level}</p>
              <p className="text-xs text-white/75" data-testid="user-stats-title">Trainer</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/75" data-testid="user-stats-xp-label">XP</p>
            <p className="text-sm font-bold text-white" data-testid="user-stats-xp">{userStats.xp}/{userStats.xpToNext}</p>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-3" data-testid="xp-progress-container">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(userStats.xp / userStats.xpToNext) * 100}%` }}
            data-testid="xp-progress-bar"
          />
        </div>
        
        {/* Stats Row */}
        <div className="flex justify-between text-xs" data-testid="user-stats-row">
          <div className="text-center" data-testid="user-stats-cards">
            <p className="font-bold text-white" data-testid="user-stats-cards-count">{userStats.cardsScanned}</p>
            <p className="text-white/75" data-testid="user-stats-cards-label">Cards</p>
          </div>
          <div className="text-center" data-testid="user-stats-streak">
            <p className="font-bold text-white" data-testid="user-stats-streak-count">{userStats.streak}</p>
            <p className="text-white/75" data-testid="user-stats-streak-label">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1" data-testid="navigation-items">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              data-testid={`nav-link-${item.path.replace('/', '')}`}
            >
              <span className={`${isActive ? 'text-blue-400' : 'text-white/70'}`} data-testid={`nav-icon-${item.path.replace('/', '')}`}>
                {item.icon}
              </span>
              <span data-testid={`nav-label-${item.path.replace('/', '')}`}>{item.label}</span>
              {item.badge && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full" data-testid={`nav-badge-${item.path.replace('/', '')}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation; 