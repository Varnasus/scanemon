import React from 'react';
import { componentStyles, theme } from '../../styles/theme';

// Background component with gradient and star speckles
export const Background: React.FC<{ children: React.ReactNode; withSpeckles?: boolean; testId?: string }> = ({ 
  children, 
  withSpeckles = true,
  testId
}) => {
  return (
    <div className={withSpeckles ? componentStyles.background.withSpeckles : componentStyles.background.main} data-testid={testId || 'background'}>
      {children}
    </div>
  );
};

// Card component with glassmorphism effect
export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  variant?: 'base' | 'feature';
  hover?: boolean;
  testId?: string;
}> = ({ children, className = '', variant = 'base', hover = true, testId }) => {
  const baseClasses = componentStyles.card[variant];
  const hoverClasses = hover ? componentStyles.card.hover : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} data-testid={testId || `card-${variant}`}>
      {children}
    </div>
  );
};

// Button component with gradient effects
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  testId?: string;
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  testId
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses = componentStyles.button[variant];
  const sizeClass = sizeClasses[size];
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClass} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId || `button-${variant}-${size}-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  );
};

// Feature card component for the three main features
export const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  color: 'purple' | 'blue' | 'orange';
  className?: string;
  testId?: string;
}> = ({ icon, title, description, color, className = '', testId }) => {
  const colorClasses = {
    purple: 'bg-feature-purple',
    blue: 'bg-feature-blue',
    orange: 'bg-feature-orange',
  };

  return (
    <Card variant="feature" className={`p-6 text-center ${className}`} testId={testId || `feature-card-${color}`}>
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mx-auto mb-4 shadow-glow-${color}`} data-testid={`feature-card-${color}-icon`}>
        <span className="text-white text-xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2" data-testid={`feature-card-${color}-title`}>{title}</h3>
      <p className="text-white/70 text-sm" data-testid={`feature-card-${color}-description`}>{description}</p>
    </Card>
  );
};

// Navigation item component
export const NavItem: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  testId?: string;
}> = ({ children, isActive = false, onClick, className = '', testId }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-white/10 text-white shadow-lg' 
          : 'text-white/70 hover:text-white hover:bg-white/5'
      } ${className}`}
      data-testid={testId || `nav-item-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  );
};

// Input component with theme styling
export const Input: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
  testId?: string;
}> = ({ 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  className = '',
  disabled = false,
  testId
}) => {
  const inputTestId = testId || `input-${type}-field`;
  
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${className}`}
      data-testid={inputTestId}
    />
  );
};

// Level badge component
export const LevelBadge: React.FC<{ level: number; className?: string; testId?: string }> = ({ 
  level, 
  className = '',
  testId
}) => {
  return (
    <div className={`inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full text-sm ${className}`} data-testid={testId || `level-badge-${level}`}>
      <span className="mr-1">⭐</span>
      Level {level}
    </div>
  );
};

// Upload button component
export const UploadButton: React.FC<{
  onClick?: () => void;
  className?: string;
  testId?: string;
}> = ({ onClick, className = '', testId }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
      data-testid={testId || 'upload-button'}
    >
      <span>📷</span>
      <span>Upload Card</span>
    </button>
  );
};

// Scan button component
export const ScanButton: React.FC<{
  onClick?: () => void;
  className?: string;
  testId?: string;
}> = ({ onClick, className = '', testId }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
      data-testid={testId || 'scan-button'}
    >
      <span>🔍</span>
      <span>Scan Card</span>
    </button>
  );
};

// Header component
export const Header: React.FC<{
  children: React.ReactNode;
  className?: string;
  testId?: string;
}> = ({ children, className = '', testId }) => {
  return (
    <header className={`bg-white/10 backdrop-blur-sm border-b border-white/20 ${className}`} data-testid={testId || 'header'}>
      {children}
    </header>
  );
};

// Container component
export const Container: React.FC<{
  children: React.ReactNode;
  className?: string;
  testId?: string;
}> = ({ children, className = '', testId }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`} data-testid={testId || 'container'}>
      {children}
    </div>
  );
};

// Feature grid component
export const FeatureGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  testId?: string;
}> = ({ children, className = '', testId }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`} data-testid={testId || 'feature-grid'}>
      {children}
    </div>
  );
};

// Hero component
export const Hero: React.FC<{
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  className?: string;
  testId?: string;
}> = ({ title, subtitle, children, className = '', testId }) => {
  return (
    <section className={`text-center py-20 ${className}`} data-testid={testId || 'hero'}>
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="hero-title">
        {title}
      </h1>
      <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto" data-testid="hero-subtitle">
        {subtitle}
      </p>
      {children && (
        <div data-testid="hero-children">
          {children}
        </div>
      )}
    </section>
  );
};

// Logo component
export const Logo: React.FC<{ className?: string; testId?: string }> = ({ className = '', testId }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`} data-testid={testId || 'logo'}>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" data-testid="logo-icon">
        <span className="text-white font-bold text-lg">🎴</span>
      </div>
      <span className="text-2xl font-bold text-white" data-testid="logo-text">Scanémon</span>
    </div>
  );
}; 