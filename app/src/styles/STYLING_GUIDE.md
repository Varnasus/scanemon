# 🎨 Unified Design System Guide

## Overview

The Scanémon application now uses a unified design system based on the HomePage styling. This ensures consistent visual appearance and user experience across all pages and components.

## 🎯 Design Principles

- **Dark Theme First**: Primary gradient background with glassmorphism effects
- **Consistent Spacing**: Standardized padding, margins, and component spacing
- **Smooth Animations**: Hover effects and transitions for better interactivity
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Accessibility**: Proper contrast ratios and focus states

## 🎨 Color Palette

### Primary Colors
```css
/* Background Gradient */
bg-gradient-to-br from-indigo-950 to-cyan-900

/* Text Colors */
text-white          /* Primary text */
text-gray-300       /* Secondary text */
text-gray-400       /* Muted text */
text-blue-400       /* Accent text */
```

### Component Colors
```css
/* Cards & Containers */
bg-white/10         /* Semi-transparent white */
bg-black/30         /* Semi-transparent black */
border-white/20     /* Subtle borders */

/* Buttons */
bg-blue-600 hover:bg-blue-700     /* Primary buttons */
bg-pink-500 hover:bg-pink-600     /* Secondary buttons */
bg-white/5 hover:bg-white/10      /* Outline buttons */
```

## 📐 Typography

### Font Family
```css
font-sans  /* Inter font family */
```

### Heading Sizes
```css
text-4xl md:text-5xl font-extrabold  /* H1 - Page titles */
text-3xl md:text-4xl font-bold       /* H2 - Section titles */
text-2xl md:text-3xl font-semibold   /* H3 - Subsection titles */
text-xl md:text-2xl font-semibold    /* H4 */
text-lg md:text-xl font-medium       /* H5 */
text-base md:text-lg font-medium     /* H6 */
```

### Body Text
```css
text-lg    /* Large body text */
text-base  /* Regular body text */
text-sm    /* Small text */
text-xs    /* Extra small text */
```

## 🧩 Component System

### Using Unified Components

Import the unified components:
```tsx
import { Button, Card, Input, PageLayout } from '../components/UI/UnifiedComponents';
```

### Button Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="small">Small Button</Button>
```

### Card Variants
```tsx
<Card variant="base">Standard Card</Card>
<Card variant="feature">Feature Card</Card>
<Card variant="glass">Glass Effect Card</Card>
```

### Form Components
```tsx
<Input 
  value={value} 
  onChange={setValue} 
  label="Input Label" 
  placeholder="Enter text..."
/>

<Select 
  value={selected} 
  onChange={setSelected}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  label="Select Option"
/>
```

### Layout Components
```tsx
<PageLayout 
  title="Page Title" 
  subtitle="Page description"
>
  <Section title="Section Title">
    {/* Content */}
  </Section>
</PageLayout>
```

## 🎭 Styling Patterns

### Page Structure
```tsx
// Standard page layout
<div className="min-h-screen bg-gradient-to-br from-indigo-950 to-cyan-900 text-white font-sans">
  <div className="container mx-auto px-6 py-8">
    {/* Page content */}
  </div>
</div>
```

### Card Styling
```tsx
// Standard card
<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-6">
  {/* Card content */}
</div>
```

### Button Styling
```tsx
// Primary button
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 hover:scale-105">
  Button Text
</button>
```

### Form Input Styling
```tsx
// Input field
<input className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" />
```

## 🎪 Animation & Interactions

### Hover Effects
```css
hover:scale-105          /* Slight scale on hover */
hover:bg-white/20        /* Background color change */
hover:text-white         /* Text color change */
transition-all duration-150  /* Smooth transitions */
```

### Loading States
```tsx
// Loading spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
```

### Focus States
```css
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first approach */
sm: 640px   /* Small screens */
md: 768px   /* Medium screens */
lg: 1024px  /* Large screens */
xl: 1280px  /* Extra large screens */
```

### Responsive Typography
```css
text-4xl md:text-5xl    /* Responsive heading sizes */
text-base md:text-lg    /* Responsive body text */
```

### Responsive Layouts
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  /* Responsive grids */
flex flex-col md:flex-row                       /* Responsive flexbox */
```

## 🎨 Glassmorphism Effects

### Backdrop Blur
```css
backdrop-blur-sm    /* Subtle blur */
backdrop-blur-md    /* Medium blur */
backdrop-blur-lg    /* Strong blur */
```

### Transparency
```css
bg-white/10         /* 10% white overlay */
bg-black/30         /* 30% black overlay */
border-white/20     /* 20% white border */
```

## 🔧 Utility Classes

### Spacing
```css
px-6 py-8           /* Standard page padding */
p-6                 /* Card padding */
space-y-4           /* Vertical spacing */
gap-6               /* Grid/flex gap */
```

### Shadows
```css
shadow-lg           /* Large shadow */
shadow-medium       /* Medium shadow */
shadow-glow-blue    /* Glow effect */
```

### Border Radius
```css
rounded-lg          /* Standard radius */
rounded-xl          /* Large radius */
rounded-2xl         /* Extra large radius */
rounded-full        /* Full radius */
```

## 📋 Implementation Checklist

When creating new pages or components:

- [ ] Use the unified color palette
- [ ] Apply consistent spacing patterns
- [ ] Include hover effects and transitions
- [ ] Ensure responsive design
- [ ] Use unified components when possible
- [ ] Follow typography hierarchy
- [ ] Apply glassmorphism effects appropriately
- [ ] Test accessibility and focus states

## 🚀 Best Practices

1. **Consistency**: Always use the design system components and classes
2. **Accessibility**: Maintain proper contrast ratios and focus states
3. **Performance**: Use CSS classes over inline styles
4. **Maintainability**: Keep styling centralized in the design system
5. **Responsiveness**: Test on multiple screen sizes
6. **Animations**: Use subtle, purposeful animations

## 🔄 Migration Guide

To update existing components to use the unified design system:

1. Replace background colors with gradient classes
2. Update text colors to use the unified palette
3. Apply consistent spacing and border radius
4. Add hover effects and transitions
5. Use unified components where applicable
6. Test responsiveness and accessibility

## 📚 Examples

### Complete Page Example
```tsx
import { PageLayout, Section, Card, Button } from '../components/UI/UnifiedComponents';

const ExamplePage = () => {
  return (
    <PageLayout 
      title="Example Page" 
      subtitle="This is an example page using the unified design system"
    >
      <Section title="Features">
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="feature">
            <h3 className="text-xl font-semibold mb-2">Feature 1</h3>
            <p className="text-gray-300">Feature description</p>
          </Card>
          <Card variant="feature">
            <h3 className="text-xl font-semibold mb-2">Feature 2</h3>
            <p className="text-gray-300">Feature description</p>
          </Card>
          <Card variant="feature">
            <h3 className="text-xl font-semibold mb-2">Feature 3</h3>
            <p className="text-gray-300">Feature description</p>
          </Card>
        </div>
      </Section>
      
      <div className="text-center mt-8">
        <Button variant="primary">Call to Action</Button>
      </div>
    </PageLayout>
  );
};
```

This unified design system ensures a consistent, professional, and engaging user experience across the entire Scanémon application. 