// Unified Design System for Scanémon
// Based on the HomePage styling with consistent patterns

export const designSystem = {
  // Color Palette
  colors: {
    // Primary gradient colors
    gradient: {
      primary: 'from-indigo-950 to-cyan-900',
      secondary: 'from-purple-600 to-pink-600',
      accent: 'from-blue-600 to-blue-700',
      success: 'from-green-600 to-green-700',
      warning: 'from-orange-600 to-orange-700',
      error: 'from-red-600 to-red-700'
    },
    
    // Background colors
    background: {
      primary: 'bg-gradient-to-br from-indigo-950 to-cyan-900',
      secondary: 'bg-black/30',
      card: 'bg-white/10',
      cardHover: 'bg-white/15',
      glass: 'bg-white/5 backdrop-blur-sm'
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
      accent: 'text-blue-400'
    },
    
    // Button colors
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-pink-500 hover:bg-pink-600',
      accent: 'bg-purple-500 hover:bg-purple-600',
      success: 'bg-green-600 hover:bg-green-700',
      warning: 'bg-orange-500 hover:bg-orange-600',
      error: 'bg-red-600 hover:bg-red-700',
      outline: 'border border-white/20 bg-white/5 hover:bg-white/10'
    }
  },

  // Typography
  typography: {
    font: 'font-sans', // Inter font family
    heading: {
      h1: 'text-4xl md:text-5xl font-extrabold leading-tight',
      h2: 'text-3xl md:text-4xl font-bold leading-tight',
      h3: 'text-2xl md:text-3xl font-semibold',
      h4: 'text-xl md:text-2xl font-semibold',
      h5: 'text-lg md:text-xl font-medium',
      h6: 'text-base md:text-lg font-medium'
    },
    body: {
      large: 'text-lg',
      base: 'text-base',
      small: 'text-sm',
      xs: 'text-xs'
    }
  },

  // Spacing
  spacing: {
    section: 'mt-20',
    card: 'p-6',
    button: 'px-6 py-3',
    input: 'px-4 py-3',
    nav: 'px-8 py-4'
  },

  // Border radius
  borderRadius: {
    small: 'rounded-md',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  },

  // Shadows
  shadows: {
    card: 'shadow-lg',
    button: 'shadow-medium',
    glow: 'shadow-glow-blue'
  },

  // Transitions
  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500'
  },

  // Hover effects
  hover: {
    scale: 'hover:scale-105',
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-glow-blue'
  }
};

// Component-specific styles
export const componentStyles = {
  // Navigation
  navigation: {
    container: 'flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-black/30',
    logo: 'flex items-center space-x-2 font-bold text-xl',
    navLinks: 'hidden md:flex items-center space-x-6',
    navLink: 'hover:underline transition-all duration-150',
    button: 'bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-md transition-all duration-150 hover:scale-105',
    levelBadge: 'text-sm bg-white/10 px-3 py-1 rounded-full'
  },

  // Cards
  card: {
    base: 'bg-white/10 rounded-2xl p-6 text-white shadow-lg',
    feature: 'bg-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center text-white shadow-lg space-y-6 md:space-y-0 md:space-x-6',
    hover: 'hover:bg-white/15 hover:shadow-large transition-all duration-300',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-medium'
  },

  // Buttons
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 hover:scale-105',
    secondary: 'bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-md transition-all duration-150 hover:scale-105',
    outline: 'border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300',
    small: 'px-3 py-1 rounded-lg text-sm font-medium transition-colors'
  },

  // Forms
  form: {
    input: 'bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300',
    label: 'text-sm font-medium text-gray-300 mb-2',
    group: 'space-y-4'
  },

  // Layout
  layout: {
    container: 'min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white font-sans',
    section: 'mt-20 px-6',
    content: 'max-w-5xl mx-auto',
    centered: 'text-center'
  },

  // Hero sections
  hero: {
    container: 'text-center mt-24 px-6',
    title: 'text-4xl md:text-5xl font-extrabold leading-tight',
    subtitle: 'mt-4 text-gray-300 text-lg',
    cta: 'mt-8'
  }
};

// Utility functions
export const getComponentClass = (component: keyof typeof componentStyles, variant: string = 'base') => {
  const componentStyle = componentStyles[component];
  
  // Check if the variant exists on the component style
  if (variant in componentStyle) {
    return componentStyle[variant as keyof typeof componentStyle];
  }
  
  // Return the first available property as fallback
  const firstKey = Object.keys(componentStyle)[0];
  return componentStyle[firstKey as keyof typeof componentStyle];
};

export const getColorClass = (category: keyof typeof designSystem.colors, variant: string) => {
  const colorCategory = designSystem.colors[category];
  return colorCategory[variant as keyof typeof colorCategory] || '';
};

export default designSystem; 