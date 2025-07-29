import React, { useState, useRef, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';

interface SwipeableCardProps {
  children: React.ReactNode;
  onFavorite?: () => void;
  onTrade?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  className?: string;
  testId?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onFavorite,
  onTrade,
  onReport,
  onDelete,
  className = '',
  testId
}) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout
  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  // Reset swipe state
  const resetSwipe = useCallback(() => {
    setIsSwiped(false);
    setSwipeDirection(null);
    setSwipeDistance(0);
  }, []);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Show partial swipe feedback
      const distance = Math.abs(eventData.deltaX);
      setSwipeDistance(distance);
      
      if (distance > 20) {
        setSwipeDirection(eventData.deltaX > 0 ? 'right' : 'left');
      }
    },
    onSwipedLeft: (eventData) => {
      setSwipeDirection('left');
      setIsSwiped(true);
      setSwipeDistance(80); // Full swipe distance
      
      // Auto-reset after 3 seconds
      clearResetTimeout();
      resetTimeoutRef.current = setTimeout(resetSwipe, 3000);
    },
    onSwipedRight: (eventData) => {
      setSwipeDirection('right');
      setIsSwiped(true);
      setSwipeDistance(80); // Full swipe distance
      
      // Auto-reset after 3 seconds
      clearResetTimeout();
      resetTimeoutRef.current = setTimeout(resetSwipe, 3000);
    },
    onSwiped: (eventData) => {
      // If swipe wasn't long enough, reset immediately
      if (Math.abs(eventData.deltaX) < 50) {
        resetSwipe();
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10, // Minimum distance to trigger swipe
    swipeDuration: 500, // Maximum time for swipe gesture
  });

  const handleAction = useCallback((action: (() => void) | undefined) => {
    if (action) {
      action();
      clearResetTimeout();
      resetSwipe();
    }
  }, [clearResetTimeout, resetSwipe]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      clearResetTimeout();
    };
  }, [clearResetTimeout]);

  // Calculate transform based on swipe state
  const getTransform = () => {
    if (!isSwiped && swipeDistance === 0) return 'translateX(0)';
    
    const maxDistance = 80;
    const currentDistance = Math.min(swipeDistance, maxDistance);
    
    if (swipeDirection === 'left') {
      return `translateX(-${currentDistance}px)`;
    } else if (swipeDirection === 'right') {
      return `translateX(${currentDistance}px)`;
    }
    
    return 'translateX(0)';
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      data-testid={testId || 'swipeable-card'}
      {...handlers}
    >
      {/* Action buttons behind the card */}
      <div className="absolute inset-0 flex">
        {/* Left actions */}
        <div className="flex-1 flex items-center justify-end space-x-2 pr-4">
          {onFavorite && (
            <button
              onClick={() => handleAction(onFavorite)}
              className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
              data-testid="swipe-favorite-button"
              aria-label="Add to favorites"
            >
              ⭐
            </button>
          )}
          {onTrade && (
            <button
              onClick={() => handleAction(onTrade)}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
              data-testid="swipe-trade-button"
              aria-label="Add to trade"
            >
              ↔
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex-1 flex items-center justify-start space-x-2 pl-4">
          {onReport && (
            <button
              onClick={() => handleAction(onReport)}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
              data-testid="swipe-report-button"
              aria-label="Report issue"
            >
              ⚠️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => handleAction(onDelete)}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
              data-testid="swipe-delete-button"
              aria-label="Delete card"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all duration-300 ease-out"
        style={{
          transform: getTransform(),
        }}
      >
        {children}
      </div>

      {/* Swipe hint (only show on mobile) */}
      <div className="md:hidden absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="text-white/50 text-xs">
          ← Swipe for actions →
        </div>
      </div>
    </div>
  );
}; 