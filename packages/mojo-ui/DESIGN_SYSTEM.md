# Mojo UI - Design System Documentation

Complete visual reference for the Mojo UI design system.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows & Elevation](#shadows--elevation)
6. [Component Patterns](#component-patterns)
7. [Best Practices](#best-practices)

---

## Color Palette

### Background Colors (Surface Hierarchy)

| Token | Value | Usage |
|-------|-------|-------|
| `$color-bg-base` | `#1e1e1e` | Deepest background, app canvas |
| `$color-bg-surface` | `#2a2a2a` | Component surfaces, cards |
| `$color-bg-elevated` | `#3a3a3a` | Elevated elements, hover states |
| `$color-bg-input` | `#1a1a1a` | Input fields, darker areas |
| `$color-bg-header` | `#141414` | Header sections, navigation |

**Visual:**
```
┌─────────────────────────────────────┐
│  #1e1e1e  (Base/Canvas)             │
│  ┌─────────────────────────────┐    │
│  │  #2a2a2a  (Surface)        │    │
│  │  ┌─────────────────────┐   │    │
│  │  │  #3a3a3a (Elevated)│   │    │
│  │  └─────────────────────┘   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Text Colors

| Token | Value | Usage | Contrast Ratio |
|-------|-------|-------|----------------|
| `$color-text-primary` | `#ffffff` | Primary text, headings | 16.1:1 |
| `$color-text-secondary` | `#a0a0a0` | Secondary text, descriptions | 7.4:1 |
| `$color-text-tertiary` | `#6e6e6e` | Disabled text, hints | 4.3:1 |

### Accent Colors

| Token | Value | Usage | Glow |
|-------|-------|-------|------|
| `$color-accent-success` | `#47f57d` | Success states, active | `rgba(71, 245, 125, 0.4)` |
| `$color-accent-warning` | `#ffbd30` | Warnings, amber indicators | `rgba(255, 189, 48, 0.4)` |
| `$color-accent-error` | `#ff5050` | Errors, danger states | `rgba(255, 80, 80, 0.4)` |

**Color Usage Patterns:**
- **Success (Green)**: Active buttons, ON states, completion indicators
- **Warning (Amber)**: Caution states, pause, medium priority
- **Error (Red)**: Errors, danger actions, stop states

### Border Colors

| Token | Value | Opacity | Usage |
|-------|-------|---------|-------|
| `$color-border-subtle` | `rgba(255,255,255,0.08)` | 8% | Input borders, dividers |
| `$color-border-default` | `rgba(255,255,255,0.1)` | 10% | Card borders, panels |
| `$color-border-strong` | `rgba(255,255,255,0.2)` | 20% | Focus states, emphasized |

---

## Typography

### Font Families

```scss
$font-family-primary: 'KyivType Serif', Georgia, serif;
$font-family-secondary: 'KyivType Sans', system-ui, sans-serif;
$font-family-display: 'Tiny5', sans-serif;
$font-family-mono: 'JetBrains Mono', monospace;
```

| Font | Usage | Character |
|------|-------|-----------|
| **KyivType Serif** | Body text, paragraphs | Elegant, readable |
| **KyivType Sans** | UI elements, buttons, inputs | Clean, modern |
| **Tiny5** | Headlines, display text | Retro, pixelated |
| **JetBrains Mono** | Code, monospace | Technical |

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `$font-size-xs` | 10px (0.625rem) | tight (1) | Labels, captions |
| `$font-size-sm` | 12px (0.75rem) | snug (1.25) | Small text, buttons |
| `$font-size-base` | 14px (0.875rem) | normal (1.5) | Body text |
| `$font-size-md` | 16px (1rem) | normal (1.5) | Subheadings |
| `$font-size-lg` | 20px (1.25rem) | snug (1.25) | Headings |
| `$font-size-xl` | 24px (1.5rem) | snug (1.25) | Large headings |
| `$font-size-2xl` | 32px (2rem) | tight (1) | Display text |

### Typography Patterns

**Headings (Tiny5, Uppercase):**
```
MAIN TITLE      ← $font-size-xl, $font-family-display
Section Title   ← $font-size-lg, $font-family-display
Card Title      ← $font-size-md, $font-family-display
```

**Body (KyivType Serif):**
```
Regular paragraph text uses $font-family-primary
with $font-size-base and comfortable line height.
```

**UI Elements (KyivType Sans):**
```
Button labels, form inputs, and navigation use
$font-family-secondary for clarity.
```

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `$font-weight-normal` | 400 | Body text |
| `$font-weight-medium` | 500 | Emphasis |
| `$font-weight-semibold` | 600 | Headings, buttons |
| `$font-weight-bold` | 700 | Strong emphasis |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `$letter-spacing-tight` | -0.025em | Large headings |
| `$letter-spacing-normal` | 0 | Body text |
| `$letter-spacing-wide` | 0.05em | Small caps |
| `$letter-spacing-wider` | 0.1em | UPPERCASE labels |

---

## Spacing

### 8px Grid System

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `$space-0` | 0 | 0px | None |
| `$space-1` | 0.25rem | 4px | Tight gaps |
| `$space-2` | 0.5rem | 8px | Small gaps |
| `$space-3` | 0.75rem | 12px | Default gaps |
| `$space-4` | 1rem | 16px | Standard padding |
| `$space-5` | 1.25rem | 20px | Medium padding |
| `$space-6` | 1.5rem | 24px | Large padding |
| `$space-8` | 2rem | 32px | Section spacing |
| `$space-10` | 2.5rem | 40px | Large sections |
| `$space-12` | 3rem | 48px | Extra large |

### Spacing Patterns

**Component Padding:**
```
┌────────────────────────────────┐
│  $space-4 (16px)              │  ← padding
│  ┌────────────────────────┐   │
│  │                        │   │
│  │     Content Area       │   │
│  │                        │   │
│  └────────────────────────┘   │
│  $space-4 (16px)              │  ← padding
└────────────────────────────────┘
```

**Gap Spacing:**
- Between buttons: `$space-2` (8px)
- Between form fields: `$space-4` (16px)
- Between sections: `$space-6` (24px)

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `$radius-none` | 0 | Sharp corners |
| `$radius-sm` | 8px | Small elements, tags |
| `$radius-md` | 12px | Panels, sections |
| `$radius-lg` | 16px | Cards, modals |
| `$radius-xl` | 24px | Large cards |
| `$radius-full` | 9999px | Pills, buttons, avatars |

### Radius Patterns

**Buttons:** `$radius-full` (pill shape)
```
┌──────────────────────────────┐
│      BUTTON LABEL            │
└──────────────────────────────┘
```

**Cards:** `$radius-xl` (24px)
```
┌────────────────────────────┐
│╲                          ╱│
│  ╲                      ╱  │
│    ╲                  ╱    │
│      Card Content      │
│    ╱                  ╲    │
│  ╱                      ╲  │
│╱                          ╲│
└────────────────────────────┘
```

**Inputs:** `$radius-xl` (24px) or `$radius-md` (12px)

---

## Shadows & Elevation

### Shadow Scale

| Token | Value | Elevation |
|-------|-------|-----------|
| `$shadow-sm` | `0 2px 4px -1px rgba(0,0,0,0.2)` | Subtle |
| `$shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.3)` | Default |
| `$shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.4)` | Elevated |
| `$shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.5)` | Floating |

### Inner Shadows (Inset)

| Token | Value | Usage |
|-------|-------|-------|
| `$shadow-input` | `inset 3px 3px 6px rgba(0,0,0,0.4)` | Input fields |
| `$shadow-frosted-inner` | Complex inset | Frosted glass effect |

### Elevation Levels

```
Level 0 (Base)
┌─────────┐
│         │  No shadow
└─────────┘

Level 1 ($shadow-sm)
┌─────────┐
│         │  Subtle lift
└────┬────┘
     └── Soft shadow

Level 2 ($shadow-md)
┌─────────┐
│         │  Default elevation
└────┬────┘
     └── Medium shadow

Level 3 ($shadow-lg)
     ┌─────────┐
     │         │  Elevated
     └────┬────┘
          └── Prominent shadow

Level 4 ($shadow-xl)
          ┌─────────┐
          │         │  Floating
          └────┬────┘
               └── Large shadow
```

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `$z-base` | 0 | Normal content |
| `$z-dropdown` | 100 | Dropdown menus |
| `$z-sticky` | 200 | Sticky headers |
| `$z-fixed` | 300 | Fixed navigation |
| `$z-modal-backdrop` | 400 | Modal overlay |
| `$z-modal` | 500 | Modal content |
| `$z-popover` | 600 | Popovers, tooltips |
| `$z-tooltip` | 700 | Tooltips |

---

## Component Patterns

### Button Variants

```
┌──────────────────────────────────────────────────┐
│ Primary (Green)     │ $color-accent-success       │
│ Warning (Amber)     │ $color-accent-warning       │
│ Danger (Red)        │ $color-accent-error         │
│ Neutral (Gray)      │ $color-text-secondary       │
└──────────────────────────────────────────────────┘
```

### Input States

```
Default:
┌─────────────────────────────┐
│                             │  $color-bg-input
│  Placeholder text           │  $color-text-tertiary
│                             │
└─────────────────────────────┘

Focus:
┌─────────────────────────────┐
│                             │  Border: $color-border-focus
│  Input text                 │  Glow: $color-accent-success
│                             │
└─────────────────────────────┘

Error:
┌─────────────────────────────┐
│                             │  Border: $color-border-error
│  Invalid input              │  Shadow: red glow
│                             │
└─────────────────────────────┘
```

### Card Anatomy

```
┌────────────────────────────────────┐
│ ○                              ○   │  ← Pins (corners)
│                                    │
│  ┌──────────────────────────────┐  │
│  │ TITLE                        │  │  ← Header
│  ├──────────────────────────────┤  │
│  │                              │  │
│  │ Content area                 │  │  ← Body
│  │                              │  │
│  ├──────────────────────────────┤  │
│  │                    [Action]  │  │  ← Footer
│  └──────────────────────────────┘  │
│                                    │
│ ○                              ○   │  ← Pins (corners)
└────────────────────────────────────┘
```

---

## Best Practices

### Do's ✅

1. **Always use tokens** - Never hardcode values
   ```scss
   // ✅ Good
   padding: $space-4;
   
   // ❌ Bad
   padding: 16px;
   ```

2. **Use semantic colors** - Choose based on meaning, not appearance
   ```scss
   // ✅ Good
   color: $color-text-secondary;
   
   // ❌ Bad
   color: #a0a0a0;
   ```

3. **Maintain hierarchy** - Use appropriate z-index levels
   ```scss
   z-index: $z-modal;  // Not z-index: 9999
   ```

4. **Consistent spacing** - Use 8px grid multiples
   ```scss
   gap: $space-4;  // 16px = 2 × 8px grid
   ```

### Don'ts ❌

1. **Don't mix units** - Use rem for scalability
   ```scss
   // ❌ Bad
   font-size: 14px;
   
   // ✅ Good
   font-size: $font-size-base;  // 0.875rem
   ```

2. **Don't use arbitrary values** - Stick to the scale
   ```scss
   // ❌ Bad
   border-radius: 13px;
   
   // ✅ Good
   border-radius: $radius-md;  // 12px
   ```

3. **Don't override tokens locally** - Customize at the token level
   ```scss
   // ❌ Bad
   .myComponent {
     color: #custom-color;
   }
   
   // ✅ Good
   // Override $color-text-primary in _tokens.scss if needed
   ```

### Migration Guide

When updating existing components:

1. Replace colors with semantic tokens
2. Replace px values with spacing tokens
3. Replace hardcoded border-radius with radius tokens
4. Add z-index tokens for stacking
5. Use font tokens for typography

---

## Quick Reference

```scss
@use '../../styles' as *;

.component {
  // Colors
  background: $color-bg-surface;
  color: $color-text-primary;
  border-color: $color-border-subtle;
  
  // Typography
  font-family: $font-family-secondary;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  
  // Spacing
  padding: $space-4;
  margin: $space-2;
  gap: $space-3;
  
  // Border & Shadow
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  
  // Position
  z-index: $z-dropdown;
}
```

---

**Last Updated:** April 8, 2026  
**Version:** 1.0
