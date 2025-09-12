# Material Design 3 App Bar, Carousel, Badge, Checkbox & Divider Components

Uma implementação completa dos componentes fundamentais seguindo as especificações do Material Design 3, oferecendo funcionalidade essencial para interfaces modernas.

## Visão Geral

Esta implementação inclui cinco componentes essenciais do Material Design 3:

### App Bar

- **Top App Bar**: Small, Center-aligned, Medium, Large variants
- **Bottom App Bar**: Navigation e FAB integration
- **Actions**: Menu, Back, Search, More buttons pré-configurados

### Carousel

- **Multi-browse**: Mostra itens large, medium e small
- **Uncontained**: Itens que sangram nas bordas
- **Hero**: Um item large e items small
- **Center-aligned Hero**: Item large centralizado com small items
- **Full-screen**: Item edge-to-edge

### Badge

- **Large Badge**: 16dp height com text/números
- **Small Badge**: 6dp height dot indicator
- **Numbered Badge**: Com contadores e "99+" overflow

### Checkbox

- **Standard**: Estados checked, unchecked, indeterminate
- **Error State**: Visual feedback para validação
- **With Label**: Checkbox com label integrado

### Divider

- **Full-width**: Span completo do container
- **Inset**: Indentado da borda esquerda
- **Middle**: Indentado de ambas as bordas

## Especificações Material Design 3

### App Bar Specifications

#### Top App Bar Sizes

- **Small**: 64dp height, single-line title
- **Center-aligned**: 64dp height, centered title
- **Medium**: 112dp height, larger title
- **Large**: 152dp height, prominent title

#### Bottom App Bar

- **Height**: 80dp standard
- **FAB Integration**: 56dp FAB positioned above center
- **Actions**: Up to 5 action buttons

#### Colors & Elevation

- **Surface**: Surface container color
- **Elevation**: Level 0 default, Level 2 when scrolled
- **Actions**: 48dp touch targets with state layers

### Carousel Specifications

#### Layout Types

- **Multi-browse**: 16dp side padding, 8dp item gaps
- **Uncontained**: Items bleed to edges
- **Hero**: Large + small items combination
- **Full-screen**: 0dp padding, edge-to-edge

#### Item Sizes

- **Small**: 40-56dp width, dynamic height
- **Medium**: Flexible width, responsive
- **Large**: Max 300dp width, customizable

### Badge Specifications

#### Badge Types

- **Large**: 16dp height, 8dp padding, rounded-full
- **Small**: 6dp circular dot
- **Numbered**: Text content with 99+ overflow

#### Colors

- **Default**: Error color (red) for notifications
- **Custom**: Support for primary, secondary variants

### Checkbox Specifications

#### Measurements

- **Container**: 18dp × 18dp
- **State Layer**: 40dp × 40dp touch target
- **Border**: 2dp stroke width
- **Corner Radius**: Small (2dp)

#### States

- **Unselected**: Outline border, transparent fill
- **Selected**: Primary color fill with checkmark
- **Indeterminate**: Primary color fill with minus
- **Error**: Error color variants of all states

### Divider Specifications

#### Types

- **Full-width**: Spans entire container width
- **Inset**: 16dp margin from leading edge
- **Middle**: 16dp margins on both sides

#### Appearance

- **Thickness**: 1dp stroke
- **Color**: Outline variant token
- **Orientation**: Horizontal or vertical

## Uso Básico

### App Bar Usage

#### Small Top App Bar

```tsx
import { AppBar, AppBarLeading, AppBarTitle, AppBarTrailing, AppBarMenuButton, AppBarSearchButton } from "@/components/md3/app-bar";

<AppBar variant="top" size="small">
  <AppBarLeading>
    <AppBarMenuButton onClick={() => console.log('Menu')} />
  </AppBarLeading>
  <AppBarTitle>Page Title</AppBarTitle>
  <AppBarTrailing>
    <AppBarSearchButton onClick={() => console.log('Search')} />
  </AppBarTrailing>
</AppBar>
```

#### Large Top App Bar with Scroll

```tsx
<AppBar variant="top" size="large" scrolled={isScrolled}>
  <AppBarLeading>
    <AppBarBackButton onClick={() => navigate(-1)} />
  </AppBarLeading>
  <AppBarTitle>Large Title</AppBarTitle>
  <AppBarTrailing>
    <AppBarMoreButton onClick={() => setMenuOpen(true)} />
  </AppBarTrailing>
</AppBar>
```

#### Bottom App Bar with FAB

```tsx
import { BottomAppBar, AppBarTrailing, AppBarFAB } from "@/components/md3/app-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faHome, faSearch } from "@fortawesome/free-solid-svg-icons";

<BottomAppBar>
  <AppBarTrailing className="flex-row justify-around w-full">
    <AppBarAction icon={<FontAwesomeIcon icon={faHome} />} label="Home" />
    <AppBarAction icon={<FontAwesomeIcon icon={faSearch} />} label="Search" />
  </AppBarTrailing>
  <AppBarFAB icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => createNew()} />
</BottomAppBar>
```

### Carousel Usage

#### Multi-browse Carousel

```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/md3/carousel";

<Carousel layout="multi-browse">
  <CarouselContent>
    <CarouselItem size="large">
      <img src="/image1.jpg" alt="Large item" />
    </CarouselItem>
    <CarouselItem size="medium">
      <img src="/image2.jpg" alt="Medium item" />
    </CarouselItem>
    <CarouselItem size="small">
      <img src="/image3.jpg" alt="Small item" />
    </CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

#### Hero Carousel

```tsx
<Carousel layout="hero" className="w-full">
  <CarouselContent>
    <CarouselItem size="large">
      <div className="bg-primary-container p-8 rounded-lg">
        <h3>Featured Content</h3>
        <p>Hero item description</p>
      </div>
    </CarouselItem>
    <CarouselItem size="small">
      <div className="bg-surface-variant p-4 rounded">Small 1</div>
    </CarouselItem>
    <CarouselItem size="small">
      <div className="bg-surface-variant p-4 rounded">Small 2</div>
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

### Badge Usage

#### Numbered Badge

```tsx
import { Badge } from "@/components/md3/badge";

<div className="relative">
  <Button>Messages</Button>
  <Badge variant="numbered" content={5} className="absolute -top-2 -right-2" />
</div>

// With overflow
<Badge variant="numbered" content={150} max={99} /> // Shows "99+"
```

#### Small Dot Badge

```tsx
<div className="relative">
  <Avatar src="/user.jpg" />
  <Badge variant="small" className="absolute -top-1 -right-1" />
</div>
```

#### Large Badge with Content

```tsx
<Badge variant="large" content="New" />
<Badge variant="large" content={3} />
<Badge variant="large">Custom</Badge>
```

### Checkbox Usage

#### Basic Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<Checkbox
  checked={isChecked}
  onCheckedChange={setIsChecked}
/>
```

#### Checkbox with Label

```tsx
<Checkbox
  label="Accept terms and conditions"
  checked={acceptTerms}
  onCheckedChange={setAcceptTerms}
/>
```

#### Error State Checkbox

```tsx
<Checkbox
  label="Required field"
  error={hasError}
  checked={value}
  onCheckedChange={setValue}
/>
```

#### Indeterminate Checkbox

```tsx
<Checkbox
  checked="indeterminate"
  label="Select all items"
  onCheckedChange={handleSelectAll}
/>
```

### Divider Usage

#### Basic Dividers

```tsx
import { Divider } from "@/components/ui/separator";

// Full-width divider
<Divider variant="full-width" />

// Inset divider (16dp from left)
<Divider variant="inset" />

// Middle divider (16dp from both sides)
<Divider variant="middle" />
```

#### Vertical Divider

```tsx
<div className="flex items-center gap-4">
  <span>Item 1</span>
  <Divider orientation="vertical" className="h-6" />
  <span>Item 2</span>
  <Divider orientation="vertical" className="h-6" />
  <span>Item 3</span>
</div>
```

## Variantes e Opções

### App Bar Props

```typescript
interface AppBarProps {
    variant?: 'top' | 'bottom'; // App bar position
    size?: 'small' | 'center-aligned' | 'medium' | 'large'; // Top app bar sizes
    elevation?: 'none' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
    scrolled?: boolean; // Elevated appearance when scrolled
    prominent?: boolean; // Expand when scrolled up
    asChild?: boolean; // Render as child element
}
```

### Badge Props

```typescript
interface BadgeProps {
    variant?: 'large' | 'small' | 'numbered'; // Badge type
    content?: React.ReactNode; // Badge content (text/number)
    max?: number; // Maximum number (default: 99)
    showZero?: boolean; // Show badge when content is 0
}
```

### Checkbox Props

```typescript
interface CheckboxProps {
    variant?: 'default' | 'error'; // Visual variant
    error?: boolean; // Error state shorthand
    label?: string; // Adjacent label text
    checked?: boolean | 'indeterminate'; // Checkbox state
    onCheckedChange?: (checked: boolean) => void; // Change handler
}
```

### Divider Props

```typescript
interface DividerProps {
    variant?: 'full-width' | 'inset' | 'middle'; // Divider type
    orientation?: 'horizontal' | 'vertical'; // Divider direction
    thickness?: 'thin' | 'thick'; // Line thickness
}
```

## Exemplos Avançados

### App Bar com Search Integration

```tsx
const [searchMode, setSearchMode] = useState(false);

<AppBar variant="top" size="small">
  <AppBarLeading>
    {searchMode ? (
      <AppBarBackButton onClick={() => setSearchMode(false)} />
    ) : (
      <AppBarMenuButton onClick={() => setDrawerOpen(true)} />
    )}
  </AppBarLeading>

  <AppBarTitle>
    {searchMode ? (
      <Input placeholder="Search..." autoFocus />
    ) : (
      "App Title"
    )}
  </AppBarTitle>

  <AppBarTrailing>
    {!searchMode && (
      <AppBarSearchButton onClick={() => setSearchMode(true)} />
    )}
  </AppBarTrailing>
</AppBar>
```

### Responsive Carousel

```tsx
const [layout, setLayout] = useState<"uncontained" | "hero">("uncontained");

useEffect(() => {
  const updateLayout = () => {
    setLayout(window.innerWidth < 768 ? "uncontained" : "hero");
  };

  window.addEventListener('resize', updateLayout);
  updateLayout();

  return () => window.removeEventListener('resize', updateLayout);
}, []);

<Carousel layout={layout}>
  <CarouselContent>
    {items.map((item, index) => (
      <CarouselItem
        key={index}
        size={index === 0 ? "large" : "small"}
      >
        {item.content}
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

### Badge com Animação

```tsx
const [count, setCount] = useState(0);

<div className="relative">
  <Button onClick={() => setCount(c => c + 1)}>
    Notifications
  </Button>

  {count > 0 && (
    <Badge
      variant="numbered"
      content={count}
      className="absolute -top-2 -right-2 animate-in zoom-in-50 duration-200"
    />
  )}
</div>
```

### Formulário com Checkboxes Validados

```tsx
const [formData, setFormData] = useState({
  terms: false,
  newsletter: false,
  privacy: false
});
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  if (!formData.terms) newErrors.terms = "Terms must be accepted";
  if (!formData.privacy) newErrors.privacy = "Privacy policy must be accepted";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

<div className="space-y-4">
  <Checkbox
    label="I accept the terms and conditions"
    checked={formData.terms}
    error={!!errors.terms}
    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked }))}
  />

  <Checkbox
    label="I agree to the privacy policy"
    checked={formData.privacy}
    error={!!errors.privacy}
    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privacy: checked }))}
  />

  <Checkbox
    label="Subscribe to newsletter (optional)"
    checked={formData.newsletter}
    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
  />

  <Button onClick={validateForm}>Submit</Button>
</div>
```

## Estados Interativos

### Visual States

- ✅ **Enabled**: Estado padrão interativo
- ✅ **Hover**: State layer overlay (8% opacity)
- ✅ **Focused**: Focus ring indicator
- ✅ **Pressed**: Ripple effect com state layer (12% opacity)
- ✅ **Disabled**: 38% opacity, não-interativo

### App Bar States

- **Standard**: Elevation level 0
- **Scrolled**: Elevation level 2, shadow
- **Prominent**: Expands quando scroll up

### Badge States

- **Empty**: Não renderiza (exceto showZero)
- **Overflow**: Mostra "99+" quando > max
- **Small**: Apenas dot visual, sem conteúdo

## Cores e Temas

### App Bar Colors

```css
/* Surface colors */
--app-bar-container: var(--md-sys-color-surface);
--app-bar-text: var(--md-sys-color-on-surface);

/* Action states */
--app-bar-action-hover: var(--md-sys-color-on-surface-8);
--app-bar-action-focus: var(--md-sys-color-on-surface-12);
```

### Badge Colors

```css
/* Large/Numbered badges */
--badge-container: var(--md-sys-color-error);
--badge-text: var(--md-sys-color-on-error);

/* Small badges */
--badge-dot: var(--md-sys-color-error);
```

### Checkbox Colors

```css
/* Unselected state */
--checkbox-outline: var(--md-sys-color-outline);
--checkbox-outline-hover: var(--md-sys-color-on-surface);

/* Selected state */
--checkbox-container: var(--md-sys-color-primary);
--checkbox-checkmark: var(--md-sys-color-on-primary);

/* Error state */
--checkbox-error: var(--md-sys-color-error);
--checkbox-error-text: var(--md-sys-color-on-error);
```

### Divider Colors

```css
--divider-color: var(--md-sys-color-outline-variant);
```

## Responsividade

### Breakpoint Adaptations

- **Mobile**: App bars fixed positioning, carousel uncontained
- **Tablet**: Medium app bars, hero carousel layout
- **Desktop**: Large app bars, multi-browse carousels

### Touch Targets

- **App Bar Actions**: 48dp minimum
- **Checkbox**: 40dp state layer
- **Carousel Navigation**: 44dp minimum

## Acessibilidade

### Keyboard Navigation

- **App Bar**: Tab through action buttons
- **Carousel**: Arrow keys for navigation
- **Checkbox**: Space to toggle, Enter to activate

### Screen Reader Support

- **App Bar**: Proper role="banner", aria-labels
- **Badge**: aria-label com count description
- **Checkbox**: Label association, state announcement
- **Divider**: decorative role, não focável

### WCAG Compliance

- ✅ **AA Color Contrast**: 4.5:1 text, 3:1 UI elements
- ✅ **Touch Targets**: 44dp minimum
- ✅ **Focus Indicators**: 2px ring, high contrast
- ✅ **State Communication**: Visual + programmatic

## Performance

### Optimizations

- **App Bar**: Fixed positioning com transform optimization
- **Carousel**: Virtualized scrolling para grandes listas
- **Badge**: Conditional rendering para performance
- **Checkbox**: Memoized state calculations

### Bundle Size

- **Tree Shaking**: Import apenas componentes necessários
- **Icon Optimization**: FontAwesome selective imports
- **CSS Optimization**: CVA variants com PurgeCSS

Esta implementação oferece componentes fundamentais robustos e acessíveis, seguindo rigorosamente as especificações do Material Design 3 para criar interfaces consistentes e intuitivas.
