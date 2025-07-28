import React, { useState, useRef, useEffect } from 'react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  testId?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className = '',
  testId
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, threshold]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = isPulling || isRefreshing;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      data-testid={testId || 'pull-to-refresh-container'}
    >
      {/* Pull to refresh indicator */}
      {shouldShowIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-blue-500/20 to-transparent z-50 transition-all duration-200"
          style={{ 
            height: `${Math.min(pullDistance, 120)}px`,
            transform: `translateY(${Math.min(pullDistance, 120)}px)`
          }}
          data-testid="pull-to-refresh-indicator"
        >
          <div className="flex flex-col items-center space-y-2">
            {/* Pokéball animation */}
            <div className="relative">
              <div 
                className={`w-8 h-8 rounded-full border-2 border-white transition-all duration-200 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                style={{
                  background: `conic-gradient(from 0deg, #ff0000 0deg, #ff0000 180deg, #ffffff 180deg, #ffffff 360deg)`,
                  transform: isRefreshing ? 'rotate(360deg)' : `rotate(${progress * 360}deg)`
                }}
              >
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            {/* Text indicator */}
            <span className="text-white text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{
          transform: shouldShowIndicator ? `translateY(${Math.min(pullDistance, 120)}px)` : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
}; 