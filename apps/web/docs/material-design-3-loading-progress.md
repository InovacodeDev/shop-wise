# Material Design 3 Loading & Progress Indicators

This document provides comprehensive documentation for the Material Design 3 loading and progress indicator components implemented in this project.

## Overview

The loading and progress system includes components following Material Design 3 specifications:

- **Loading Indicator**: For short processes (200ms - 5s) with unknown duration
- **Linear Progress**: For long processes (5s+) with known progress
- **Circular Progress**: For determinate and indeterminate progress visualization
- **Step Progress**: For multi-step processes with clear stages

## Components

### 1. Loading Indicator (`loading-indicator.tsx`)

Material Design 3 loading indicator with shape morphing animation, recommended replacement for indeterminate circular progress indicators.

#### Variants

- `default`: Active indicator without container (primary color)
- `contained`: Active indicator with container background (primary container)

#### Sizes

- `xs`: 24dp (minimum size)
- `sm`: 32dp
- `default`: 48dp (Material Design 3 standard)
- `lg`: 64dp
- `xl`: 80dp
- `2xl`: 96dp
- `3xl`: 128dp
- `max`: 240dp (maximum size)

#### Features

- Material Design 3 shape morphing animation (7 unique shapes)
- Proper accessibility with ARIA attributes
- Container option for better contrast over content
- Responsive sizing from 24dp to 240dp

#### Example Usage

```tsx
import {
  LoadingIndicator,
  PullToRefreshIndicator,
  ButtonLoadingIndicator,
  PageLoadingIndicator
} from "@/components/md3/loading-indicator";

// Basic loading indicator
<LoadingIndicator variant="default" size="default" />

// With label
<LoadingIndicator
  variant="contained"
  size="lg"
  showLabel
  label="Loading content..."
/>

// In button (inline usage)
<Button disabled>
  <ButtonLoadingIndicator size="sm" />
  Loading...
</Button>

// Full page loading
<PageLoadingIndicator
  backdrop
  centered
  size="lg"
  label="Preparing your data..."
  showLabel
/>

// Pull-to-refresh
<PullToRefreshIndicator
  visible={isPulling}
  progress={pullProgress}
  thresholdReached={canRefresh}
  variant="contained"
/>
```

### 2. Progress Indicators (`progress-indicator.tsx`)

Complete progress indicator system for determinate and indeterminate progress visualization.

#### Linear Progress

Linear progress bar for horizontal progress display.

**Sizes**

- `xs`: 4dp height
- `sm`: 6dp height
- `default`: 8dp height (Material Design 3 standard)
- `lg`: 12dp height
- `xl`: 16dp height

**Features**

- Determinate and indeterminate variants
- Buffer progress support
- Accessibility labels and ARIA attributes
- Smooth animations and transitions

#### Circular Progress

Circular progress indicator for compact progress display.

**Sizes**

- `xs`: 16dp
- `sm`: 24dp
- `default`: 32dp
- `lg`: 48dp
- `xl`: 64dp
- `2xl`: 80dp

**Features**

- Configurable stroke width
- Center value display option
- Smooth progress transitions
- Indeterminate spinning animation

#### Step Progress

Multi-step progress indicator for wizards and multi-stage processes.

**Variants**

- `default`: Full step display with labels and indicators
- `compact`: Minimal progress bar only

**Features**

- Visual step indicators
- Current step highlighting
- Step labels and descriptions
- Progress percentage calculation

#### Example Usage

```tsx
import {
  LinearProgress,
  CircularProgress,
  StepProgress
} from "@/components/md3/progress-indicator";

// Linear progress - determinate
<LinearProgress
  value={65}
  label="Uploading file..."
  showValue
  size="default"
/>

// Linear progress - indeterminate
<LinearProgress
  indeterminate
  label="Processing..."
  size="sm"
/>

// Linear progress with buffer
<LinearProgress
  value={40}
  buffer={70}
  label="Video buffering"
  showValue
/>

// Circular progress
<CircularProgress
  value={75}
  showValue
  size="lg"
  strokeWidth={3}
/>

// Circular progress - indeterminate
<CircularProgress
  indeterminate
  size="default"
  label="Loading..."
/>

// Step progress
<StepProgress
  currentStep={1}
  totalSteps={4}
  steps={["Personal Info", "Address", "Payment", "Confirmation"]}
  label="Registration Progress"
  variant="default"
/>
```

## Design Specifications

### Loading Indicator Specifications

#### Timing Guidelines (Material Design 3)

- **Instant (< 200ms)**: No indicator needed
- **Short (200ms - 5s)**: Use Loading Indicator
- **Long (> 5s)**: Use Progress Indicator

#### Shape Morphing

Loading indicators implement the Material Design 3 shape morphing sequence:

- 7 unique Material shapes in looping sequence
- 2-second morph cycle with ease-in-out timing
- Combined with rotation animation for attention

#### Container Usage

- **Without Container**: Use on surfaces with sufficient contrast
- **With Container**: Use over content or with pull-to-refresh
- Container provides primary-container background
- Active indicator changes from primary to on-primary-container

### Progress Indicator Specifications

#### Linear Progress Heights

- **4dp (xs)**: Minimal, unobtrusive progress
- **6dp (sm)**: Compact progress bars
- **8dp (default)**: Material Design 3 standard
- **12dp (lg)**: Prominent progress display
- **16dp (xl)**: High visibility progress

#### Circular Progress Sizing

- **16dp-24dp**: Inline with text or small components
- **32dp**: Default size for most use cases
- **48dp-64dp**: Prominent loading states
- **80dp**: Large progress displays

#### Step Progress Layout

- Visual step indicators with completion states
- Connecting progress bar showing overall completion
- Step labels with truncation for long text
- Responsive layout for different screen sizes

## Color Tokens (Material Design 3)

### Loading Indicator Colors

- **Default Variant**: `primary` (active indicator)
- **Contained Variant**:
    - Container: `primary-container`
    - Active indicator: `on-primary-container`

### Progress Colors

- **Track/Background**: `secondary-container`
- **Progress/Active**: `primary`
- **Buffer**: `secondary-container` with opacity
- **Step Indicators**: `primary` (active), `secondary-container` (inactive)

## Accessibility

### Loading Indicators

- `role="progressbar"` for screen readers
- `aria-label` describing the loading process
- `aria-valuetext="Loading..."` for indeterminate states
- Sufficient color contrast (3:1 minimum)
- No reliance on motion for critical information

### Progress Indicators

- `role="progressbar"` with proper ARIA attributes
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for determinate progress
- `aria-label` describing the process
- Visual and text progress indicators
- Keyboard accessible when interactive

### Best Practices

1. **Provide alternative refresh methods** for pull-to-refresh (not just gestures)
2. **Use descriptive labels** that explain what's loading/processing
3. **Maintain 3:1 color contrast** with background
4. **Don't rely solely on color** to convey progress state
5. **Provide text alternatives** for progress percentages

## Usage Guidelines

### When to Use Loading Indicators

- **Short processes** (200ms to 5s)
- **Unknown duration** or progress
- **Pull-to-refresh** functionality
- **Button actions** that take time to complete
- **Page/content loading** states

### When to Use Progress Indicators

- **Long processes** (over 5s)
- **Known progress** or measurable completion
- **File uploads/downloads** with progress tracking
- **Multi-step processes** with clear stages
- **Data processing** with quantifiable steps

### Sizing Recommendations

- **Mobile**: 24dp-48dp for most use cases
- **Tablet**: 32dp-64dp for comfortable viewing
- **Desktop**: 48dp-96dp for appropriate scale
- **Large displays**: Up to 240dp for loading indicators

### Performance Considerations

1. **Use GPU acceleration** with `transform-gpu` class
2. **Limit simultaneous animations** to avoid performance issues
3. **Pause animations** when component is not visible
4. **Use CSS transforms** instead of changing layout properties
5. **Debounce progress updates** to avoid excessive re-renders

## TypeScript Support

All components are fully typed with:

- Comprehensive prop interfaces extending HTML attributes
- Variant props using `class-variance-authority`
- Proper event handler types
- Accessibility-focused prop requirements
- Forward ref support for DOM access

## Animation Details

### Loading Indicator Animation

- **Rotation**: 1s linear infinite spin
- **Shape Morph**: 2s ease-in-out infinite morphing through 7 shapes
- **Combined Effect**: Creates attention-grabbing organic motion

### Progress Animation

- **Linear**: Smooth width transitions with 300ms duration
- **Circular**: Stroke-dashoffset animation with easing
- **Indeterminate**: Continuous motion indicating ongoing process

This loading and progress system provides a complete, accessible, and Material Design 3 compliant foundation for all loading and progress states in your application.
