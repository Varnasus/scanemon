import React from 'react';
import { componentStyles } from '../../styles/designSystem';

// Button Components
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'small';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  testId?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
  testId
}) => {
  const baseClasses = componentStyles.button[variant];
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      data-testid={testId || `button-${variant}-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  );
};

// Card Components
interface CardProps {
  children: React.ReactNode;
  variant?: 'base' | 'feature' | 'glass';
  className?: string;
  onClick?: () => void;
  testId?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'base',
  className = '',
  onClick,
  testId
}) => {
  const baseClasses = componentStyles.card[variant];
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-105' : '';
  
  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      data-testid={testId || `card-${variant}`}
    >
      {children}
    </div>
  );
};

// Input Components
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  className?: string;
  required?: boolean;
  testId?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  type = 'text',
  className = '',
  required = false,
  testId
}) => {
  const inputTestId = testId || `input-${type}-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
  
  return (
    <div className="space-y-2" data-testid={`${inputTestId}-container`}>
      {label && (
        <label className="text-sm font-medium text-gray-300" data-testid={`${inputTestId}-label`}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`${componentStyles.form.input} ${className}`}
        data-testid={inputTestId}
      />
    </div>
  );
};

// Select Components
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
  testId?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  className = '',
  testId
}) => {
  const selectTestId = testId || `select-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
  return (
    <div className="space-y-2" data-testid={`${selectTestId}-container`}>
      {label && (
        <label className="text-sm font-medium text-gray-300" data-testid={`${selectTestId}-label`}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${componentStyles.form.input} ${className}`}
        data-testid={selectTestId}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Loading Spinner
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
    <div className={`animate-spin rounded-full border-b-2 border-blue-400 ${sizeClasses[size]} ${className}`} data-testid={testId || 'loading-spinner'} />
  );
};

// Badge Components
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  testId?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  testId
}) => {
  const variantClasses = {
    default: 'bg-white/10 text-white',
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`} data-testid={testId || `badge-${variant}`}>
      {children}
    </span>
  );
};

// Modal Components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  testId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid={testId || 'modal-overlay'}>
      <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 ${className}`} data-testid={testId || 'modal-content'}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            data-testid={testId ? `${testId}-close-button` : 'modal-close-button'}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Alert Components
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  testId?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
  testId
}) => {
  const typeClasses = {
    success: 'bg-green-500/20 border-green-500/30 text-green-200',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
    error: 'bg-red-500/20 border-red-500/30 text-red-200',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-200'
  };

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <div className={`border rounded-xl p-4 ${typeClasses[type]} ${className}`} data-testid={testId || `alert-${type}`}>
      <div className="flex items-start">
        <span className="mr-2">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-current hover:opacity-70 transition-opacity"
            data-testid={testId ? `${testId}-close-button` : 'alert-close-button'}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

// Stats Card Components
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  className?: string;
  testId?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  className = '',
  testId
}) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400'
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg ${className}`} data-testid={testId || `stats-card-${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
          <div className="text-sm text-gray-300">{title}</div>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
};

// Section Components
interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  testId?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  className = '',
  testId
}) => {
  return (
    <section className={`mt-20 px-6 ${className}`} data-testid={testId || 'section'}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-300">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

// Container Components
interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  testId?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  className = '',
  testId
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={`container mx-auto px-6 py-8 ${maxWidthClasses[maxWidth]} ${className}`} data-testid={testId || 'container'}>
      {children}
    </div>
  );
};

// Page Layout Components
interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  testId?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  className = '',
  testId
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white font-sans" data-testid={testId || 'page-layout'}>
      <Container className={className} testId={testId ? `${testId}-container` : undefined}>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg text-gray-300">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </div>
  );
};

export default {
  Button,
  Card,
  Input,
  Select,
  LoadingSpinner,
  Badge,
  Modal,
  Alert,
  StatsCard,
  Section,
  Container,
  PageLayout
}; 