# Mojo UI - Component Structure Standards

## Overview

This document defines the standard structure and patterns for all Mojo UI components to ensure consistency across the library.

---

## Component Directory Structure

Every component must follow this structure:

```
src/components/[component-name]/
├── index.ts              # Public exports
├── [component-name].tsx  # Component implementation
├── [component-name].module.scss  # Component styles
└── [component-name].stories.tsx  # Storybook stories (optional)
```

### Example: Button Component

```
src/components/button/
├── index.ts
├── button.tsx
├── button.module.scss
└── button.stories.tsx
```

---

## Component Implementation Standards

### 1. Component File Pattern

```typescript
// Component Props Interface
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'green' | 'yellow' | 'gray' | 'red' | 'dark';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
}

// Component Implementation
export const Button: FC<ButtonProps> = ({
  variant,
  size = 'medium',
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        styles.button,
        styles[size],
        className,
      )}
      {...props}
    >
      {/* Component content */}
    </button>
  );
};

Button.displayName = 'Button';
```

### 2. Index File Pattern

```typescript
export { Button } from './button';
export type { ButtonProps } from './button';
```

### 3. SCSS Module Standards

```scss
@use '../../styles' as *;

// Root element - uses semantic class name
.componentName {
  // Use design tokens, no hardcoded values
  background: $color-bg-surface;
  color: $color-text-primary;
  border-radius: $radius-md;
  
  // Size variants
  &.small {
    padding: $space-2 $space-3;
    font-size: $font-size-sm;
  }
  
  &.medium {
    padding: $space-3 $space-4;
    font-size: $font-size-base;
  }
  
  // Color variants
  &.success {
    background: $gradient-success;
  }
}

// Child elements use elementClass naming
.elementClass {
  // Styles
}

// Modifiers use modifier naming
.modifierClass {
  // Styles
}
```

---

## Naming Conventions

### 1. Component Names
- **PascalCase** for component names: `Button`, `Input`, `Card`
- **camelCase** for file names: `button.tsx`, `input.tsx`
- Directory names use **kebab-case**: `icon-button/`, `progress-bar/`

### 2. CSS Class Names
- Use **camelCase** in SCSS modules
- Root element: `componentName` (e.g., `.button`, `.input`)
- Child elements: `elementName` (e.g., `.label`, `.icon`)
- Modifiers: `modifierName` (e.g., `.disabled`, `.error`)

### 3. Props Naming
- Use **camelCase**: `rightElement`, `isOpen`, `onClose`
- Boolean props: prefix with verb or use `is/has` (e.g., `isDisabled`, `hasError`)
- Event handlers: prefix with `on` (e.g., `onClick`, `onChange`)

---

## Design Token Usage

### Colors
```scss
// ✅ Good - use tokens
background: $color-bg-surface;
color: $color-text-primary;
border-color: $color-border-subtle;

// ❌ Bad - hardcoded values
background: #2a2a2a;
color: #ffffff;
border-color: rgba(255, 255, 255, 0.1);
```

### Spacing
```scss
// ✅ Good - use spacing scale
padding: $space-4;
margin: $space-2;
gap: $space-3;

// ❌ Bad - arbitrary values
padding: 16px;
margin: 8px;
gap: 12px;
```

### Border Radius
```scss
// ✅ Good - use radius tokens
border-radius: $radius-md;
border-radius: $radius-full;

// ❌ Bad - hardcoded values
border-radius: 12px;
border-radius: 9999px;
```

### Typography
```scss
// ✅ Good - use font tokens
font-family: $font-family-display;
font-size: $font-size-lg;
font-weight: $font-weight-semibold;
letter-spacing: $letter-spacing-wider;

// ❌ Bad - hardcoded values
font-family: 'Tiny5', sans-serif;
font-size: 1.25rem;
font-weight: 600;
letter-spacing: 0.1em;
```

---

## Component Categories

### 1. Primitives (Basic Components)
- `Button`
- `IconButton`
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `Switch`

### 2. Layout Components
- `Card`
- `Panel`
- `PageLayout`
- `StatsGrid`

### 3. Feedback Components
- `Modal`
- `Popup`
- `ProgressBar`
- `StatusIndicator`
- `StatsCard`

### 4. Navigation Components
- `Tabs`
- `VinylTabs`

---

## Export Pattern

All components must be exported from `src/index.ts`:

```typescript
// Components
export { Button } from './components/button';
export { Card } from './components/card';
// ... etc

// Types
export type { ButtonProps } from './components/button';
export type { CardProps } from './components/card';
// ... etc

// Utilities
export type { Size, Variant } from './utils/style-helpers';
```

---

## TypeScript Standards

### 1. Props Interface
- Always export props interface
- Extend HTML element props when applicable
- Use optional props with default values

```typescript
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: 'small' | 'medium' | 'large';  // Optional with default
  label?: string;                        // Optional
  error?: string;                        // Optional
}
```

### 2. Forward Refs
Components that need ref forwarding:

```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'medium', ...props }, ref) => {
    return <input ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';
```

---

## Documentation Standards

Every component should have:

1. **JSDoc comments** for props interface
2. **Usage examples** in Storybook
3. **Clear description** of component purpose

```typescript
/**
 * Input component for text entry
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Username" 
 *   placeholder="Enter username"
 *   error={errors.username}
 * />
 * ```
 */
export interface InputProps {
  /** Label text displayed above input */
  label?: string;
  /** Error message displayed below input */
  error?: string;
}
```

---

## Migration Checklist

When creating or updating a component:

- [ ] Uses design tokens exclusively (no hardcoded values)
- [ ] Follows directory structure convention
- [ ] Exports component and props from index.ts
- [ ] Exports from main src/index.ts
- [ ] Uses semantic naming for CSS classes
- [ ] Has displayName for debugging
- [ ] Follows TypeScript standards
- [ ] Uses clsx for conditional classes
- [ ] Props interface is exported
- [ ] Component is documented
