# Material Design 3 Button System

This document provides comprehensive documentation for the Material Design 3 button component system implemented in this project.

## Overview

The button system includes 8 main components following Material Design 3 specifications:

- **Button**: Standard buttons with 5 variants and 5 sizes
- **FAB (Floating Action Button)**: FAB, Extended FAB, and FAB Menu system
- **Icon Button**: Icon-only buttons with toggle functionality
- **Button Group**: Grouped buttons with selection states
- **Segmented Buttons**: Connected button segments with single/multi-select
- **Split Button**: Two-part buttons with dropdown functionality

## Components

### 1. Button (`button.tsx`)

Material Design 3 compliant button with comprehensive variants.

#### Variants

- `filled`: High emphasis (default)
- `elevated`: Medium emphasis with elevation
- `tonal`: Medium emphasis with tonal colors
- `outlined`: Medium emphasis with outline
- `text`: Low emphasis, text only
- `destructive`: For destructive actions

#### Sizes

- `xs`: 32dp height (extra small)
- `sm`: 40dp height (small)
- `default`: 44dp height (medium)
- `lg`: 48dp height (large)
- `xl`: 56dp height (extra large)

#### Features

- Shape morphing (round to square on press)
- Proper state management (hover, focus, pressed, disabled)
- ToggleButton component for selection states
- Full accessibility support

#### Example Usage

```tsx
import { Button, ToggleButton } from "@/components/md3/button";

// Basic button
<Button variant="filled" size="default">
  Click me
</Button>

// Toggle button
<ToggleButton
  selected={isSelected}
  onSelectedChange={setIsSelected}
>
  Toggle me
</ToggleButton>
```

### 2. FAB System (`fab.tsx`)

Complete Floating Action Button system with menu functionality.

#### Components

- `FAB`: Standard floating action button
- `ExtendedFAB`: FAB with text label
- `FABMenu`: FAB with expandable menu
- `FABMenuItem`: Menu item for FAB menu

#### Sizes

- `small`: 40dp (deprecated but available)
- `medium`: 56dp (default)
- `large`: 64dp

#### Colors

- `primary`: Primary color (default)
- `secondary`: Secondary color
- `tertiary`: Tertiary color

#### Example Usage

```tsx
import { FAB, ExtendedFAB, FABMenu, FABMenuItem } from "@/components/md3/fab";
import { PlusIcon, EditIcon, DeleteIcon } from "your-icons";

// Standard FAB
<FAB>
  <PlusIcon />
</FAB>

// Extended FAB
<ExtendedFAB icon={<PlusIcon />}>
  Create
</ExtendedFAB>

// FAB Menu
<FABMenu>
  <FABMenuItem label="Edit" icon={<EditIcon />} onClick={handleEdit} />
  <FABMenuItem label="Delete" icon={<DeleteIcon />} onClick={handleDelete} />
</FABMenu>
```

### 3. Icon Button (`icon-button.tsx`)

Icon-only buttons with proper accessibility and toggle functionality.

#### Variants

- `standard`: Default transparent background
- `filled`: Filled background
- `tonal`: Tonal background
- `outlined`: Outlined border

#### Sizes

- `xs`: 24dp (minimum 48dp touch target)
- `sm`: 32dp (minimum 48dp touch target)
- `default`: 40dp
- `lg`: 48dp
- `xl`: 56dp

#### Features

- Automatic minimum touch target for accessibility
- ToggleIconButton for selection states
- Proper ARIA attributes

#### Example Usage

```tsx
import { IconButton, ToggleIconButton } from "@/components/md3/icon-button";
import { HeartIcon, HeartFilledIcon } from "your-icons";

// Standard icon button
<IconButton variant="standard" size="default">
  <HeartIcon />
</IconButton>

// Toggle icon button with different icons
<ToggleIconButton
  selected={isFavorite}
  onSelectedChange={setIsFavorite}
  unpressedIcon={<HeartIcon />}
  pressedIcon={<HeartFilledIcon />}
/>
```

### 4. Button Group (`button-group.tsx`)

Grouped buttons with various selection modes.

#### Variants

- `standard`: Separated buttons with gaps
- `connected`: Connected buttons without gaps

#### Orientations

- `horizontal`: Side-by-side layout
- `vertical`: Stacked layout

#### Selection Modes

- `ButtonGroup`: Basic grouping without selection
- `ControlledButtonGroup`: Single selection
- `MultiSelectButtonGroup`: Multiple selection

#### Example Usage

```tsx
import {
  ButtonGroup,
  ButtonGroupItem,
  ControlledButtonGroup,
  ControlledButtonGroupItem
} from "@/components/md3/button-group";

// Standard button group
<ButtonGroup variant="connected">
  <ButtonGroupItem>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>

// Controlled single selection
<ControlledButtonGroup
  value={selectedValue}
  onValueChange={setSelectedValue}
>
  <ControlledButtonGroupItem value="option1">Option 1</ControlledButtonGroupItem>
  <ControlledButtonGroupItem value="option2">Option 2</ControlledButtonGroupItem>
</ControlledButtonGroup>
```

### 5. Segmented Buttons (`segmented-buttons.tsx`)

Connected button segments with selection states, commonly used for filtering or view switching.

#### Sizes

- `default`: 40dp height
- `large`: 48dp height

#### Selection Modes

- Single selection (default)
- Multi-selection with `multiSelect` prop

#### Button Types

- `SegmentedButton`: Text only
- `IconSegmentedButton`: Icon only
- `TextIconSegmentedButton`: Text with icon

#### Example Usage

```tsx
import {
  SegmentedButtons,
  SegmentedButton,
  IconSegmentedButton
} from "@/components/md3/segmented-buttons";
import { GridIcon, ListIcon } from "your-icons";

// Text segments
<SegmentedButtons value={view} onValueChange={setView}>
  <SegmentedButton value="list">List</SegmentedButton>
  <SegmentedButton value="grid">Grid</SegmentedButton>
</SegmentedButtons>

// Icon segments
<SegmentedButtons value={view} onValueChange={setView}>
  <IconSegmentedButton value="list" icon={<ListIcon />} label="List view" />
  <IconSegmentedButton value="grid" icon={<GridIcon />} label="Grid view" />
</SegmentedButtons>

// Multi-select
<SegmentedButtons
  multiSelect
  multiValue={selectedFilters}
  onMultiValueChange={setSelectedFilters}
>
  <SegmentedButton value="new">New</SegmentedButton>
  <SegmentedButton value="popular">Popular</SegmentedButton>
  <SegmentedButton value="featured">Featured</SegmentedButton>
</SegmentedButtons>
```

### 6. Split Button (`split-button.tsx`)

Two-part button with main action and dropdown menu.

#### Variants

All standard button variants: `elevated`, `filled`, `tonal`, `outlined`, `text`

#### Components

- `SplitButton`: Basic split button
- `EnhancedSplitButton`: Split button with built-in menu
- `SplitIconButton`: Icon-only version

#### Example Usage

```tsx
import {
  SplitButton,
  EnhancedSplitButton,
  type SplitButtonMenuItem
} from "@/components/md3/split-button";
import { SaveIcon, DownloadIcon, ShareIcon } from "your-icons";

// Basic split button
<SplitButton
  variant="filled"
  onClick={handleSave}
  onDropdownClick={handleDropdownClick}
  open={isOpen}
  onOpenChange={setIsOpen}
>
  Save
</SplitButton>

// Enhanced with built-in menu
const menuItems: SplitButtonMenuItem[] = [
  { id: 'download', label: 'Download', icon: <DownloadIcon /> },
  { id: 'share', label: 'Share', icon: <ShareIcon /> },
];

<EnhancedSplitButton
  variant="filled"
  onClick={handleSave}
  items={menuItems}
  onItemSelect={handleMenuSelect}
>
  <SaveIcon />
  Save
</EnhancedSplitButton>
```

## Design Specifications

### Heights (Material Design 3)

- **32dp**: Extra small buttons, compact interfaces
- **40dp**: Small buttons, dense layouts
- **44dp**: Default medium buttons
- **48dp**: Large buttons, comfortable touch targets
- **56dp**: Extra large buttons, prominent actions

### Shape Morphing

All buttons implement shape morphing where the border radius transitions from round to more square when pressed, following Material Design 3 specifications.

### Color Tokens

All components use proper Material Design 3 color tokens:

- `primary`, `on-primary`
- `secondary`, `on-secondary`
- `tertiary`, `on-tertiary`
- `surface`, `on-surface`
- `outline`, `outline-variant`

### States

All components handle the full range of interaction states:

- **Enabled**: Default state
- **Hover**: 8% opacity overlay
- **Focus**: Ring indicator
- **Pressed**: 12% opacity overlay + shape morph
- **Disabled**: 38% opacity, no pointer events

## Accessibility

All button components include:

- Proper ARIA attributes (`aria-pressed`, `aria-expanded`, `aria-label`)
- Keyboard navigation support
- Minimum 48dp touch targets (with invisible overlays for smaller buttons)
- Screen reader compatibility
- Focus management for menus and dropdowns

## TypeScript Support

All components are fully typed with:

- Comprehensive prop interfaces
- Variant props using `class-variance-authority`
- Proper event handler types
- Generic types where appropriate
- Forward ref support

## Usage Guidelines

1. **Choose the right button type** based on emphasis level and use case
2. **Use consistent sizing** throughout your application
3. **Follow Material Design 3 color guidelines** for proper contrast
4. **Implement proper loading states** for async actions
5. **Use appropriate icons** that clearly communicate the action
6. **Test with screen readers** to ensure accessibility
7. **Consider touch targets** on mobile devices

This button system provides a complete, accessible, and Material Design 3 compliant foundation for all button interactions in your application.
