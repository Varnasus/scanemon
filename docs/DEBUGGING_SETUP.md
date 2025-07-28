# Frontend Debugging Setup

## Overview
This document outlines the debugging infrastructure implemented across the Scanémon frontend application. All interactive elements now have unique `data-testid` attributes for easier debugging, testing, and development.

## Implementation Summary

### Components Updated
1. **UI Components** (`app/src/components/UI/`)
   - `UnifiedComponents.tsx` - All reusable UI components
   - `ThemeComponents.tsx` - Theme-specific components
   - `LoadingSpinner.tsx` - Loading spinner component

2. **Layout Components** (`app/src/components/Layout/`)
   - `Layout.tsx` - Main layout wrapper
   - `Navigation.tsx` - Sidebar navigation
   - `UserProfile.tsx` - User profile dropdown

3. **Page Components** (`app/src/pages/`)
   - `LoginPage.tsx` - Login form and authentication
   - `ScanPage.tsx` - Card scanning interface

### Test ID Naming Convention
All test IDs follow a hierarchical naming pattern: `component-type-purpose`

#### Examples:
- **Buttons**: `button-primary-submit`, `button-secondary-cancel`
- **Inputs**: `input-email-field`, `input-password-field`
- **Navigation**: `nav-link-dashboard`, `nav-link-scan`
- **Modals**: `modal-close-button`, `modal-content`
- **Forms**: `login-form`, `scan-form`
- **Sections**: `upload-section`, `results-section`

### Key Features Added

#### 1. Automatic Fallback Test IDs
Components generate descriptive test IDs when none are provided:
```tsx
data-testid={testId || `button-${variant}-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
```

#### 2. Container and Section IDs
Major page sections have container test IDs for easier navigation:
- `login-page`, `scan-page`
- `login-container`, `scan-container`
- `upload-section`, `results-section`

#### 3. Form Element Identification
All form elements are clearly identified:
- `email-input`, `password-input`
- `file-input`, `report-reason-select`
- `login-submit-button`, `scan-button`

#### 4. Interactive Element Tracking
All clickable elements have unique identifiers:
- Navigation links: `nav-link-dashboard`, `nav-link-scan`
- Action buttons: `add-to-collection-button`, `report-button`
- Theme toggle: `theme-toggle-button`
- User profile: `user-profile-toggle`

## Usage in Browser Dev Tools

### Finding Elements
1. **Open Dev Tools** (F12)
2. **Use Console** to find elements:
   ```javascript
   // Find specific button
   document.querySelector('[data-testid="scan-button"]')
   
   // Find all buttons
   document.querySelectorAll('[data-testid*="button"]')
   
   // Find form elements
   document.querySelectorAll('[data-testid*="input"]')
   ```

### Debugging Examples
```javascript
// Check if scan button is disabled
document.querySelector('[data-testid="scan-button"]').disabled

// Get input value
document.querySelector('[data-testid="email-input"]').value

// Trigger click events
document.querySelector('[data-testid="login-submit-button"]').click()

// Check if modal is visible
document.querySelector('[data-testid="report-modal"]') !== null
```

## Testing Integration

### Jest/React Testing Library
```tsx
import { render, screen } from '@testing-library/react';

test('scan button is disabled when no file selected', () => {
  render(<ScanPage />);
  const scanButton = screen.getByTestId('scan-button');
  expect(scanButton).toBeDisabled();
});
```

### Cypress
```javascript
// Click scan button
cy.get('[data-testid="scan-button"]').click();

// Fill email field
cy.get('[data-testid="email-input"]').type('test@example.com');

// Check if modal is visible
cy.get('[data-testid="report-modal"]').should('be.visible');
```

## Benefits

### 1. Easier Debugging
- Quickly identify elements in browser dev tools
- Consistent naming across the application
- Clear hierarchy of components

### 2. Improved Testing
- Reliable element selection for automated tests
- No dependency on CSS classes or text content
- Better test maintainability

### 3. Better Accessibility
- Screen readers can better identify elements
- Improved user experience for assistive technologies

### 4. Developer Experience
- Faster troubleshooting
- Clearer code structure
- Better collaboration between developers

## Future Maintenance

### Adding New Components
When creating new components, always:
1. Add `testId?: string` to the component interface
2. Generate fallback test IDs for common patterns
3. Use descriptive, hierarchical naming
4. Include test IDs for containers and major sections

### Example Template
```tsx
interface NewComponentProps {
  children: React.ReactNode;
  onClick?: () => void;
  testId?: string; // Always include this
}

export const NewComponent: React.FC<NewComponentProps> = ({
  children,
  onClick,
  testId
}) => {
  return (
    <div data-testid={testId || 'new-component'}>
      <button 
        onClick={onClick}
        data-testid={testId ? `${testId}-button` : 'new-component-button'}
      >
        {children}
      </button>
    </div>
  );
};
```

## Rules Enforcement
The debugging setup is now enforced through the frontend rules in `rules/frontend.rules`. All new components must follow the established patterns for data-testid attributes.

This setup provides a robust foundation for debugging, testing, and maintaining the Scanémon frontend application. 