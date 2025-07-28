# Scanémon Theme Guide 🎨

This guide documents the comprehensive theme system for the Scanémon application, featuring a beautiful dark purple-to-blue gradient design with star speckles.

## 🎯 Design Overview

The theme is based on a dark, modern aesthetic with:
- **Primary Gradient**: Dark purple (#1e1b4b) to dark blue (#1e3a8a)
- **Star Speckles**: Subtle white speckles for depth and atmosphere
- **Glassmorphism**: Semi-transparent elements with backdrop blur
- **Vibrant Accents**: Purple, blue, and orange for feature highlights

## 🎨 Color Palette

### Primary Colors
```typescript
// Purple theme colors
primary: {
  50: '#faf5ff',   // Lightest purple
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',  // Main purple
  600: '#9333ea',
  700: '#7c3aed',
  800: '#6b21a8',
  900: '#581c87',  // Darkest purple
}
```

### Blue Accent Colors
```typescript
blue: {
  50: '#eff6ff',   // Lightest blue
  500: '#3b82f6',  // Main blue
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',  // Darkest blue
}
```

### Feature Colors
```typescript
feature: {
  purple: '#8b5cf6', // AI-Powered Scanning
  blue: '#3b82f6',   // Smart Collection
  orange: '#f97316', // XP System
}
```

### Background Gradients
```typescript
gradient: {
  from: '#1e1b4b', // Dark purple
  to: '#1e3a8a',   // Dark blue
}
```

## 🧩 Reusable Components

### Background Component
```tsx
import { Background } from '../components/UI/ThemeComponents';

// With star speckles (default)
<Background withSpeckles={true}>
  <YourContent />
</Background>

// Without star speckles
<Background withSpeckles={false}>
  <YourContent />
</Background>
```

### Card Components
```tsx
import { Card, FeatureCard } from '../components/UI/ThemeComponents';

// Basic card with glassmorphism
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Feature card with colored icon
<FeatureCard
  icon="📷"
  title="AI-Powered Scanning"
  description="Instantly ID cards"
  color="purple"
/>
```

### Button Components
```tsx
import { Button, UploadButton, ScanButton } from '../components/UI/ThemeComponents';

// Primary button (blue gradient)
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Secondary button (purple gradient)
<Button variant="secondary">
  Secondary Action
</Button>

// Accent button (orange gradient)
<Button variant="accent">
  Accent Action
</Button>

// Outline button
<Button variant="outline">
  Outline Action
</Button>

// Pre-built buttons
<UploadButton onClick={handleUpload} />
<ScanButton onClick={handleScan} />
```

### Navigation Components
```tsx
import { Header, NavItem, Logo, LevelBadge } from '../components/UI/ThemeComponents';

<Header>
  <div className="flex items-center justify-between">
    <Logo />
    <div className="flex items-center gap-6">
      <NavItem>Collection</NavItem>
      <NavItem isActive={true}>Active Page</NavItem>
      <LevelBadge level={3} />
    </div>
  </div>
</Header>
```

### Layout Components
```tsx
import { Container, Hero, FeatureGrid } from '../components/UI/ThemeComponents';

<Container>
  <Hero 
    title="Your Collection, Leveled Up"
    subtitle="Scan, organize, and flex your Pokémon cards with AI."
  >
    <YourCallToAction />
  </Hero>
  
  <FeatureGrid>
    <FeatureCard ... />
    <FeatureCard ... />
    <FeatureCard ... />
  </FeatureGrid>
</Container>
```

## 🎨 CSS Classes

### Background Classes
```css
.bg-gradient-dark          /* Main gradient background */
.bg-gradient-dark-reverse  /* Reversed gradient */
.bg-star-speckles         /* Gradient with star speckles */
.bg-gradient-card         /* Card gradient */
```

### Button Classes
```css
.btn-primary    /* Blue gradient button */
.btn-secondary  /* Purple gradient button */
.btn-accent     /* Orange gradient button */
.btn-outline    /* Transparent outline button */
```

### Card Classes
```css
.card-base      /* Basic glassmorphism card */
.card-feature   /* Feature card with gradient */
.card-hover     /* Hover effects */
```

### Utility Classes
```css
.glass          /* Glassmorphism effect */
.glass-strong   /* Stronger glassmorphism */
.text-gradient  /* Gradient text */
.text-gradient-blue
.text-gradient-purple
.text-gradient-orange
```

## 🎭 Animations

### Available Animations
```css
.animate-fade-in
.animate-slide-up
.animate-scale-in
.animate-bounce-in
.animate-twinkle
.animate-star-sparkle
.animate-float
.animate-glow
```

### Animation Delays
```css
.animation-delay-100
.animation-delay-200
.animation-delay-300
.animation-delay-500
```

## 📱 Responsive Design

### Breakpoints
```typescript
breakpoints: {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1600px',
}
```

### Responsive Utilities
```css
.container mx-auto px-4  /* Responsive container */
grid md:grid-cols-3      /* Responsive grid */
flex flex-col sm:flex-row /* Responsive flex */
```

## 🎨 Usage Examples

### Complete Page Example
```tsx
import React from 'react';
import { 
  Background, 
  Header, 
  Container, 
  Hero, 
  FeatureGrid, 
  FeatureCard, 
  Logo, 
  NavItem, 
  UploadButton, 
  LevelBadge 
} from '../components/UI/ThemeComponents';

const ExamplePage: React.FC = () => {
  return (
    <Background withSpeckles={true}>
      <Header>
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <UploadButton />
            <NavItem>Collection</NavItem>
            <NavItem>Achievements</NavItem>
            <NavItem>Events</NavItem>
            <LevelBadge level={3} />
          </div>
        </div>
      </Header>

      <Container>
        <Hero 
          title="Your Collection, Leveled Up"
          subtitle="Scan, organize, and flex your Pokémon cards with AI."
        >
          <YourCallToAction />
        </Hero>

        <FeatureGrid>
          <FeatureCard
            icon="📷"
            title="AI-Powered Scanning"
            description="Instantly ID cards"
            color="purple"
          />
          <FeatureCard
            icon="📊"
            title="Smart Collection"
            description="Track progress"
            color="blue"
          />
          <FeatureCard
            icon="🏆"
            title="XP System"
            description="Unlock rewards"
            color="orange"
          />
        </FeatureGrid>
      </Container>
    </Background>
  );
};
```

### Custom Component Example
```tsx
import React from 'react';
import { Card, Button } from '../components/UI/ThemeComponents';

const CustomComponent: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        Custom Component
      </h2>
      <p className="text-white/70 mb-6">
        This component uses the theme system.
      </p>
      <div className="flex gap-4">
        <Button variant="primary">Primary Action</Button>
        <Button variant="outline">Secondary Action</Button>
      </div>
    </Card>
  );
};
```

## 🎯 Best Practices

### 1. Use Theme Components
Always use the provided theme components instead of creating custom styles:
```tsx
// ✅ Good
<Button variant="primary">Click Me</Button>

// ❌ Avoid
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click Me
</button>
```

### 2. Consistent Spacing
Use the theme's spacing system:
```tsx
// ✅ Good
<div className="p-6 mb-8">Content</div>

// ❌ Avoid
<div className="p-24 mb-32">Content</div>
```

### 3. Proper Color Usage
Use semantic color names:
```tsx
// ✅ Good
<div className="text-white/70">Muted text</div>
<div className="bg-feature-purple">Purple feature</div>

// ❌ Avoid
<div className="text-gray-300">Muted text</div>
<div className="bg-purple-500">Purple feature</div>
```

### 4. Responsive Design
Always consider mobile-first design:
```tsx
// ✅ Good
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>Content</Card>
</div>

// ❌ Avoid
<div className="grid grid-cols-3 gap-4">
  <Card>Content</Card>
</div>
```

## 🎨 Accessibility

### High Contrast Support
The theme includes high contrast mode support:
```css
@media (prefers-contrast: high) {
  .card-base,
  .card-feature {
    @apply border-2 border-white;
  }
}
```

### Reduced Motion Support
Respect user preferences for reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States
All interactive elements have proper focus states:
```css
.focus-visible:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}
```

## 🔧 Customization

### Adding New Colors
To add new colors to the theme, update `tailwind.config.js`:
```javascript
colors: {
  // ... existing colors
  custom: {
    500: '#your-color',
    600: '#your-darker-color',
  }
}
```

### Adding New Components
Create new components in `ThemeComponents.tsx`:
```tsx
export const CustomComponent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`card-base ${className}`}>
      {children}
    </div>
  );
};
```

### Adding New Animations
Add animations to `tailwind.config.js`:
```javascript
animation: {
  // ... existing animations
  'custom-animation': 'customKeyframes 1s ease-in-out infinite',
},
keyframes: {
  // ... existing keyframes
  customKeyframes: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
}
```

This theme system provides a consistent, beautiful, and accessible design foundation for the entire Scanémon application. Use these components and patterns to maintain visual consistency across all pages and features. 