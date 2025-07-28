// Theme configuration for Scanémon app
// Based on the dark purple-to-blue gradient design with star speckles

export const theme = {
  // Color palette
  colors: {
    // Primary theme colors
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Blue accent colors
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Dark theme colors
    dark: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    // Feature card colors
    feature: {
      purple: '#8b5cf6', // AI-Powered Scanning
      blue: '#3b82f6',   // Smart Collection
      orange: '#f97316', // XP System
    },
    // Background gradient colors
    gradient: {
      from: '#1e1b4b', // Dark purple
      to: '#1e3a8a',   // Dark blue
    },
    // Star speckle color
    speckle: '#ffffff',
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      muted: '#94a3b8',
      accent: '#3b82f6',
    },
    // Button colors
    button: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f97316',
      outline: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Gradients
  gradients: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
    backgroundReverse: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    button: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    buttonHover: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },

  // Shadows
  shadows: {
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    large: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
    glow: {
      blue: '0 0 20px rgba(59, 130, 246, 0.5)',
      purple: '0 0 20px rgba(139, 92, 246, 0.5)',
      orange: '0 0 20px rgba(249, 115, 22, 0.5)',
      green: '0 0 20px rgba(16, 185, 129, 0.5)',
    },
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1600px',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

// Utility functions for theme usage
export const getGradient = (type: 'background' | 'backgroundReverse' | 'card' | 'button' | 'buttonHover') => {
  return theme.gradients[type];
};

export const getColor = (category: keyof typeof theme.colors, shade?: string | number) => {
  if (shade) {
    return theme.colors[category][shade as keyof typeof theme.colors[typeof category]];
  }
  return theme.colors[category];
};

export const getShadow = (type: keyof typeof theme.shadows) => {
  return theme.shadows[type];
};

// Common component styles
export const componentStyles = {
  // Card styles
  card: {
    base: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-medium',
    hover: 'hover:bg-white/15 hover:shadow-large transition-all duration-300',
    feature: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl shadow-medium',
  },

  // Button styles
  button: {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-medium hover:shadow-glow-blue transition-all duration-300',
    secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-medium hover:shadow-glow-purple transition-all duration-300',
    accent: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-medium hover:shadow-glow-orange transition-all duration-300',
    outline: 'border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300',
  },

  // Input styles
  input: {
    base: 'bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300',
  },

  // Navigation styles
  nav: {
    item: 'text-white/70 hover:text-white transition-colors duration-200',
    active: 'text-white font-semibold',
  },

  // Background styles
  background: {
    main: 'bg-gradient-to-br from-gradient-from to-gradient-to min-h-screen',
    withSpeckles: 'bg-gradient-to-br from-gradient-from to-gradient-to bg-star-speckles min-h-screen',
  },
};

export default theme; 