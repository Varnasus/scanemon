import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  testId?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '',
  testId
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 border-blue-400 ${sizeClasses[size]} ${className}`}
      data-testid={testId || `loading-spinner-${size}`}
    />
  );
}; 