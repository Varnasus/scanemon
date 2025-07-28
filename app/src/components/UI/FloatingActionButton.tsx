import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  testId?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = '🪙',
  label = 'Scan',
  onClick,
  href,
  className = '',
  testId
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide FAB when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        bg-gradient-to-r from-blue-600 to-purple-600
        hover:from-blue-700 hover:to-purple-700
        shadow-lg hover:shadow-xl
        transform transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center
        text-white font-semibold
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        ${className}
      `}
      data-testid={testId || 'floating-action-button'}
      aria-label={`Quick ${label}`}
    >
      <span className="text-xl mb-1" role="img" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs">{label}</span>
    </button>
  );
}; 