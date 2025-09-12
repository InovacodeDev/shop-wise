# Material Design 3 Radio Button

This document provides comprehensive documentation for the Material Design 3 radio button component implemented in this project.

## Overview

The radio button system includes components following Material Design 3 specifications for single-option selection from a set of mutually exclusive options.

## Components

### 1. Radio Button (`radio-button.tsx`)

Material Design 3 compliant radio button with proper states, interactions, and accessibility.

#### Sizes

- `default`: 20dp icon size (Material Design 3 standard)
- `large`: 24dp icon size for better accessibility or prominent selections

#### Features

- **48dp minimum touch target** for accessibility compliance
- **State layers** for hover, focus, and pressed interactions
- **Proper color tokens** following Material Design 3 specifications
- **Label positioning** (left or right of the radio button)
- **Disabled state** with 38% opacity as per MD3 guidelines

#### Example Usage

```tsx
import { RadioButton } from "@/components/md3/radio-button";

// Basic radio button
<RadioButton
  checked={isSelected}
  onCheckedChange={setIsSelected}
  label="Option 1"
/>

// Large size with left label
<RadioButton
  size="large"
  checked={isSelected}
  onCheckedChange={setIsSelected}
  label="Important Option"
  labelPosition="left"
/>

// Disabled radio button
<RadioButton
  checked={false}
  disabled
  label="Disabled Option"
/>
```

### 2. Radio Group (`RadioGroup` & `RadioGroupItem`)

Complete radio group implementation for managing multiple radio buttons with single selection.

#### Features

- **Single selection enforcement** - only one option can be selected
- **Controlled and uncontrolled** modes
- **Horizontal and vertical** orientations
- **Group-level disabled state**
- **Automatic name assignment** for proper radio button grouping
- **Keyboard navigation** support

#### Example Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/md3/radio-button";

// Basic radio group
<RadioGroup
  value={selectedValue}
  onValueChange={setSelectedValue}
  orientation="vertical"
>
  <RadioGroupItem value="option1">Option 1</RadioGroupItem>
  <RadioGroupItem value="option2">Option 2</RadioGroupItem>
  <RadioGroupItem value="option3">Option 3</RadioGroupItem>
</RadioGroup>

// Horizontal layout with custom props
<RadioGroup
  defaultValue="medium"
  onValueChange={handleSizeChange}
  orientation="horizontal"
  size="large"
  name="size-selection"
>
  <RadioGroupItem value="small" label="Small" />
  <RadioGroupItem value="medium" label="Medium" />
  <RadioGroupItem value="large" label="Large" />
</RadioGroup>

// Disabled group
<RadioGroup
  value={selectedOption}
  onValueChange={setSelectedOption}
  disabled
>
  <RadioGroupItem value="opt1">Disabled Option 1</RadioGroupItem>
  <RadioGroupItem value="opt2">Disabled Option 2</RadioGroupItem>
</RadioGroup>
```

### 3. Controlled Radio Group

Explicit controlled component for scenarios requiring strict controlled state management.

```tsx
import { ControlledRadioGroup, RadioGroupItem } from "@/components/md3/radio-button";

// Controlled radio group (value and onValueChange required)
<ControlledRadioGroup
  value={currentSelection}
  onValueChange={handleSelectionChange}
  orientation="horizontal"
>
  <RadioGroupItem value="yes">Yes</RadioGroupItem>
  <RadioGroupItem value="no">No</RadioGroupItem>
  <RadioGroupItem value="maybe">Maybe</RadioGroupItem>
</ControlledRadioGroup>
```

## Design Specifications

### Material Design 3 Measurements

- **Radio Icon**: 20dp (default) or 24dp (large)
- **Border Width**: 2dp for both selected and unselected states
- **Inner Dot**: 10dp (default) or 12dp (large) when selected
- **Touch Target**: 48dp minimum (invisible overlay)
- **State Layer**: 40dp for visual feedback

### Color Tokens (Material Design 3)

- **Selected Border & Inner Dot**: `primary`
- **Unselected Border**: `on-surface-variant`
- **Unselected Hover Border**: `on-surface`
- **Label Text**: `on-surface`
- **Disabled**: 38% opacity of normal colors
- **State Layers**:
    - Hover: `primary/8%`
    - Focus: `primary/12%`
    - Pressed: `primary/12%`

### Interaction States

1. **Enabled**: Default appearance with proper color contrast
2. **Hover**: Border color changes, state layer appears
3. **Focus**: Focus ring and state layer for keyboard navigation
4. **Pressed**: Active state layer during touch/click
5. **Disabled**: 38% opacity, no pointer events

## Accessibility

### ARIA and Semantic HTML

- Uses native `<input type="radio">` for proper screen reader support
- `role="radiogroup"` on containers
- Proper `name` attribute for grouping
- Labels associated with `htmlFor` and `id`
- `aria-disabled` for disabled states

### Keyboard Navigation

- **Arrow keys**: Navigate between options in a group
- **Tab**: Move to/from radio group
- **Space**: Select focused radio button
- **Enter**: Submit forms with radio selection

### Touch Accessibility

- **Minimum 48dp touch targets** for all interactive elements
- **Large size variant** for users who need bigger targets
- **Label clicking** selects the associated radio button

### Screen Reader Support

- Native radio button semantics preserved
- Group announcements with total options
- State announcements (selected/unselected)
- Label reading with proper association

## Advanced Usage

### Custom Styling

```tsx
// Custom container and label styling
<RadioButton
  checked={isChecked}
  onCheckedChange={setIsChecked}
  label="Custom Styled"
  containerClassName="p-2 border rounded-md"
  labelClassName="font-bold text-lg"
/>
```

### Form Integration

```tsx
// With React Hook Form
import { useController } from "react-hook-form";

function FormRadioGroup({ control, name, options }) {
  const { field } = useController({
    name,
    control,
    defaultValue: "",
  });

  return (
    <RadioGroup
      value={field.value}
      onValueChange={field.onChange}
      name={field.name}
    >
      {options.map((option) => (
        <RadioGroupItem key={option.value} value={option.value}>
          {option.label}
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}
```

### Validation States

```tsx
// With validation feedback
<div className="space-y-2">
  <RadioGroup
    value={selectedValue}
    onValueChange={setSelectedValue}
    className={cn(hasError && "border-destructive")}
  >
    <RadioGroupItem value="option1">Option 1</RadioGroupItem>
    <RadioGroupItem value="option2">Option 2</RadioGroupItem>
  </RadioGroup>
  {hasError && (
    <p className="text-sm text-destructive">Please select an option</p>
  )}
</div>
```

## Best Practices

### When to Use Radio Buttons

1. **Mutually exclusive options** (only one can be selected)
2. **2-7 options** in a set (use dropdown for more options)
3. **All options should be visible** at once
4. **Clear, distinct choices** that users need to compare

### When NOT to Use Radio Buttons

1. **Multiple selections allowed** (use checkboxes instead)
2. **Single on/off toggle** (use switch or checkbox)
3. **Too many options** (use select dropdown)
4. **Binary yes/no choices** (consider using buttons or switches)

### Layout Guidelines

1. **Vertical layout** is generally preferred for better scanability
2. **Horizontal layout** for space-constrained designs or related options
3. **Consistent spacing** between options (16dp recommended)
4. **Group related options** visually and semantically

### Label Guidelines

1. **Use clear, descriptive labels** that explain the choice
2. **Keep labels short** but descriptive
3. **Use parallel structure** for all options in a group
4. **Consider label length** in responsive layouts

## TypeScript Support

All components are fully typed with:

- Comprehensive prop interfaces extending HTML input attributes
- Proper event handler types
- Size and orientation variant types
- Forward ref support for DOM access
- Generic support for value types

## Performance Considerations

1. **Minimal re-renders** with proper memoization
2. **CSS-based animations** for smooth state transitions
3. **Native input elements** for optimal accessibility
4. **Efficient state management** in groups
5. **Touch target optimization** for mobile performance

This radio button system provides a complete, accessible, and Material Design 3 compliant foundation for all single-selection scenarios in your application.
