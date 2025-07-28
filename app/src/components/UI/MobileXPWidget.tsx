import React, { useState, useEffect } from 'react';

interface MobileXPWidgetProps {
  currentXP?: number;
  level?: number;
  recentScans?: number;
  streak?: number;
  className?: string;
  testId?: string;
}

export const MobileXPWidget: React.FC<MobileXPWidgetProps> = ({
  currentXP = 1250,
  level = 3,
  recentScans = 5,
  streak = 3,
  className = '',
  testId
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateXP, setAnimateXP] = useState(false);

  // Show widget on mobile only
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setIsVisible(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animate XP increase when component mounts
  useEffect(() => {
    if (isVisible) {
      setAnimateXP(true);
      const timer = setTimeout(() => setAnimateXP(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const xpToNextLevel = 2000;
  const progress = (currentXP % 1000) / 1000;

  return (
    <div 
      className={`
        md:hidden bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4
        border border-white/20 shadow-lg
        ${className}
      `}
      data-testid={testId || 'mobile-xp-widget'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg" role="img" aria-hidden="true">⭐</span>
          <span className="text-white font-semibold">Level {level}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-white/70">
          <span className="flex items-center space-x-1">
            <span role="img" aria-hidden="true">📊</span>
            <span>{recentScans} scans</span>
          </span>
          <span className="flex items-center space-x-1">
            <span role="img" aria-hidden="true">🔥</span>
            <span>{streak} day streak</span>
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-white/70 mb-1">
          <span>XP Progress</span>
          <span className={animateXP ? 'text-yellow-400 font-bold' : ''}>
            {currentXP} / {xpToNextLevel}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className={`
              h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full
              transition-all duration-1000 ease-out
              ${animateXP ? 'animate-pulse' : ''}
            `}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-lg font-bold text-white">{level}</div>
          <div className="text-xs text-white/60">Level</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-lg font-bold text-white">{recentScans}</div>
          <div className="text-xs text-white/60">Today</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-lg font-bold text-white">{streak}</div>
          <div className="text-xs text-white/60">Streak</div>
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="mt-3 text-center">
        <p className="text-sm text-white/80">
          {streak > 0 
            ? `🔥 ${streak} day streak! Keep it up!`
            : "Ready to start scanning? Let's catch 'em all! 🪙"
          }
        </p>
      </div>
    </div>
  );
}; 