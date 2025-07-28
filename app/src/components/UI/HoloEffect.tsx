import React, { useEffect, useState } from 'react';

interface HoloEffectProps {
  children: React.ReactNode;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  className?: string;
  testId?: string;
}

export const HoloEffect: React.FC<HoloEffectProps> = ({
  children,
  rarity = 'common',
  className = '',
  testId
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Delay showing holo effect to prevent initial flash
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't apply holo effects if user prefers reduced motion
  if (prefersReducedMotion || rarity === 'common') {
    return (
      <div className={className} data-testid={testId || 'holo-effect'}>
        {children}
      </div>
    );
  }

  const getHoloIntensity = () => {
    switch (rarity) {
      case 'legendary':
        return 'animate-holo-legendary';
      case 'rare':
        return 'animate-holo-rare';
      case 'uncommon':
        return 'animate-holo-uncommon';
      default:
        return '';
    }
  };

  const getHoloGradient = () => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'rare':
        return 'from-purple-400 via-pink-500 to-red-500';
      case 'uncommon':
        return 'from-green-400 via-blue-500 to-purple-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
        ${className}
      `}
      data-testid={testId || 'holo-effect'}
    >
      {/* Holo overlay */}
      <div 
        className={`
          absolute inset-0 pointer-events-none
          bg-gradient-to-r ${getHoloGradient()}
          opacity-20 mix-blend-overlay
          ${getHoloIntensity()}
        `}
        style={{
          backgroundSize: '200% 200%',
          animation: prefersReducedMotion ? 'none' : 'holo-shimmer 3s ease-in-out infinite'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Add custom CSS animations to globals.css
export const addHoloAnimations = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes holo-shimmer {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
    
    .animate-holo-legendary {
      animation: holo-shimmer 2s ease-in-out infinite;
    }
    
    .animate-holo-rare {
      animation: holo-shimmer 3s ease-in-out infinite;
    }
    
    .animate-holo-uncommon {
      animation: holo-shimmer 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}; 