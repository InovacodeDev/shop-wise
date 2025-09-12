# Material Design 3 Snackbar

This document provides comprehensive documentation for the Material Design 3 snackbar component implemented in this project.

## Overview

The snackbar system includes components following Material Design 3 specifications for showing brief messages and notifications at the bottom of the screen without interrupting the user experience.

## Components

### 1. Snackbar (`snackbar.tsx`)

Material Design 3 compliant snackbar with proper positioning, animations, and accessibility.

#### Variants

- `default`: Standard snackbar with inverse surface colors
- `error`: Error snackbar with destructive accent
- `success`: Success snackbar with green accent
- `warning`: Warning snackbar with yellow accent
- `info`: Info snackbar with blue accent

#### Positions

- `bottom-left`: Left corner of screen bottom
- `bottom-right`: Right corner of screen bottom
- `bottom-center`: Center of screen bottom (default, recommended)
- `top-left`: Left corner of screen top
- `top-right`: Right corner of screen top
- `top-center`: Center of screen top

#### Sizes

- `default`: 48dp minimum height (single line)
- `compact`: 40dp minimum height (compact layouts)
- `expanded`: 64dp minimum height (two lines of text)

#### Features

- **Auto-dismiss**: Configurable duration (4-10s recommended)
- **Action button**: Single action with proper styling
- **Close button**: Optional explicit dismiss control
- **Animation**: Smooth slide in/out animations
- **Accessibility**: ARIA live regions and proper semantics

#### Example Usage

```tsx
import { Snackbar } from "@/components/md3/snackbar";

// Basic snackbar
<Snackbar
  open={isOpen}
  onClose={() => setIsOpen(false)}
  duration={4000}
>
  Email sent successfully
</Snackbar>

// With action button
<Snackbar
  open={isOpen}
  onClose={() => setIsOpen(false)}
  variant="error"
  action={{
    label: "Retry",
    onClick: handleRetry,
  }}
>
  Failed to send email
</Snackbar>

// Two-line content
<Snackbar
  open={isOpen}
  onClose={() => setIsOpen(false)}
  allowTwoLines
  size="expanded"
  showClose
>
  Your message has been sent to the selected recipients.
  They will receive it shortly.
</Snackbar>
```

### 2. Snackbar Provider (`SnackbarProvider`)

Context provider for managing multiple snackbars globally across the application.

#### Features

- **Queue management**: Handles multiple snackbars with limit
- **Global state**: Centralized snackbar management
- **Stacking**: Automatic positioning for multiple snackbars
- **Customizable defaults**: Position, duration, and limit settings

#### Example Usage

```tsx
import { SnackbarProvider } from "@/components/md3/snackbar";

// Wrap your app
function App() {
  return (
    <SnackbarProvider
      limit={3}
      position="bottom-center"
      defaultDuration={5000}
    >
      <YourAppContent />
    </SnackbarProvider>
  );
}
```

### 3. useSnackbar & useToast Hooks

React hooks for programmatically triggering snackbars.

#### useSnackbar Hook

```tsx
import { useSnackbar } from "@/components/md3/snackbar";

function MyComponent() {
  const { addSnackbar, removeSnackbar, clearAll } = useSnackbar();

  const showMessage = () => {
    addSnackbar({
      message: "Operation completed",
      variant: "success",
      duration: 3000,
      action: {
        label: "View",
        onClick: handleView,
      },
    });
  };

  return <button onClick={showMessage}>Show Success</button>;
}
```

#### useToast Hook (Convenience)

```tsx
import { useToast } from "@/components/md3/snackbar";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => toast.success("Saved successfully!");
  const handleError = () => toast.error("Something went wrong");
  const handleWarning = () => toast.warning("Check your input");
  const handleInfo = () => toast.info("New update available");

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleWarning}>Warning</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}
```

### 4. SnackbarTrigger

Declarative component for triggering snackbars on interaction.

```tsx
import { SnackbarTrigger } from "@/components/md3/snackbar";

<SnackbarTrigger
  message="File deleted successfully"
  variant="success"
  action={{
    label: "Undo",
    onClick: handleUndo,
  }}
>
  <button>Delete File</button>
</SnackbarTrigger>
```

## Design Specifications

### Material Design 3 Measurements

- **Container Height**:
    - Single line: 48dp minimum
    - Two lines: 68dp minimum
- **Container Width**:
    - Mobile: Spans screen width with margins
    - Tablet/Desktop: Maximum 568dp, flexible width
- **Padding**: 16dp horizontal, 12dp vertical
- **Border Radius**: Extra small (4dp)
- **Elevation**: Level 3 shadow

### Color Tokens (Material Design 3)

- **Container**: `inverse-surface`
- **Text**: `inverse-on-surface`
- **Action Button**: `inverse-primary`
- **Close Button**: `inverse-on-surface` with opacity
- **Variants**:
    - Error: Border with `destructive` accent
    - Success: Border with green accent
    - Warning: Border with yellow accent
    - Info: Border with blue accent

### Typography

- **Body Text**: Small (14sp) medium weight
- **Action Button**: Caption (12sp) medium weight
- **Line Height**: 20sp for optimal readability
- **Max Lines**: 2 lines for compact windows, 1 line preferred

## Positioning Guidelines

### Material Design 3 Positioning Rules

1. **Bottom Placement** (Recommended)
    - Default position following MD3 guidelines
    - Doesn't interfere with navigation
    - Natural reading flow

2. **Avoid Navigation Overlap**
    - Don't place over bottom navigation
    - Don't block FABs (push FAB up instead)
    - Maintain touch target accessibility

3. **Responsive Behavior**
    - **Mobile**: Full width with margins
    - **Tablet**: Centered or left-aligned
    - **Desktop**: Fixed maximum width, positioned consistently

4. **Multiple Snackbars**
    - Only one visible at a time (recommended)
    - Queue additional snackbars
    - Never stack side by side

## Behavior Guidelines

### Auto-Dismiss Timing

- **No Action**: 4-10 seconds (4s default)
- **With Action**: Persist until user interaction
- **Web Accessibility**: Provide alternative feedback method

### Animation Specifications

- **Enter**: Slide up from bottom (300ms ease-in-out)
- **Exit**: Slide down and fade out (300ms ease-in-out)
- **Consecutive**: Wait for previous to exit before showing next

### Interaction States

- **Action Button**: Hover and focus states
- **Close Button**: Hover with backdrop
- **Container**: No interaction (allows background interaction)

## Accessibility

### ARIA and Semantic HTML

- `role="alert"` for immediate announcements
- `aria-live="assertive"` for screen reader priority
- `aria-atomic="true"` for complete message reading
- `aria-describedby` for additional context
- Proper focus management for actions

### Screen Reader Support

- Automatic announcement when snackbar appears
- Action button accessibility labels
- Close button with "Close" label
- Full message reading before actions

### Keyboard Navigation

- **Tab**: Focus action/close buttons
- **Enter/Space**: Activate focused button
- **Escape**: Dismiss snackbar (if close button present)

### Web Accessibility Requirements

1. **Persistent alternative**: Also show feedback inline
2. **Extended duration**: For users needing more time
3. **High contrast**: Proper color contrast ratios
4. **Reduced motion**: Respect motion preferences

## Advanced Usage

### Custom Snackbar Variants

```tsx
// Custom success snackbar
const SuccessSnackbar = ({ message, action }: { message: string; action?: any }) => (
  <Snackbar
    open={true}
    variant="success"
    duration={3000}
    action={action}
    className="border-green-500"
  >
    <div className="flex items-center gap-2">
      <CheckIcon className="h-4 w-4 text-green-500" />
      {message}
    </div>
  </Snackbar>
);
```

### Form Integration

```tsx
// With form validation
function FormWithSnackbar() {
  const toast = useToast();

  const handleSubmit = async (data: FormData) => {
    try {
      await submitForm(data);
      toast.success("Form submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit form", {
        label: "Retry",
        onClick: () => handleSubmit(data),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Persistent Notifications

```tsx
// For critical actions that need confirmation
<Snackbar
  open={showUndoNotification}
  variant="warning"
  duration={0} // No auto-dismiss
  action={{
    label: "Undo",
    onClick: handleUndo,
  }}
  showClose={true}
>
  5 items moved to trash
</Snackbar>
```

## Best Practices

### When to Use Snackbars

1. **Brief confirmations** (save, send, delete)
2. **Background process updates** (sync, upload)
3. **Undo opportunities** for reversible actions
4. **Non-critical errors** that don't block workflow
5. **Connection status** changes

### When NOT to Use Snackbars

1. **Critical errors** requiring immediate attention (use dialog)
2. **Complex information** that needs explanation
3. **Primary navigation** or core functionality access
4. **Multiple simultaneous messages** (use notification center)
5. **Permanent status** indicators

### Content Guidelines

1. **Be concise**: 1-2 lines maximum
2. **Use active voice**: "Email sent" not "Your email has been sent"
3. **Provide context**: Include relevant details
4. **Clear actions**: Use specific action labels ("Undo", "View", "Retry")
5. **No formatting**: Avoid bold, italic, or links in content

### Technical Best Practices

1. **Limit concurrent snackbars**: 1-3 maximum
2. **Queue overflow**: Replace oldest with newest
3. **Cleanup timers**: Clear on component unmount
4. **Memory management**: Remove from state after animation
5. **Performance**: Use CSS transforms for animations

## TypeScript Support

All components are fully typed with:

- Comprehensive prop interfaces
- Variant and position union types
- Action button configuration types
- Context value types for hooks
- Generic support for custom variants

This snackbar system provides a complete, accessible, and Material Design 3 compliant foundation for all notification and feedback scenarios in your application.
