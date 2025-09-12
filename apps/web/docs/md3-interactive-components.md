# Material Design 3 Tooltip, Switch, Slider & Search Components

Uma implementação completa dos componentes interativos seguindo as especificações do Material Design 3, oferecendo controles e feedback essenciais para interfaces modernas.

## Visão Geral

Esta implementação inclui quatro componentes interativos essenciais do Material Design 3:

### Tooltip

- **Plain Tooltip**: Labels breves para botões/ícones
- **Rich Tooltip**: Conteúdo detalhado com título, texto e actions
- **Posicionamento**: Top, bottom, left, right com animações suaves

### Switch

- **Binary Control**: On/Off states com feedback visual
- **Touch Target**: 48dp minimum com state layers
- **Handle Animation**: Smooth transitions e pressed states

### Slider

- **Single Value**: Range slider com handle único
- **Range Slider**: Dual handles para min/max values
- **Discrete Slider**: Steps definidos com indicators opcionais

### Search

- **Search Bar**: Input com sugestões e actions
- **Search View**: Full-screen search experience
- **Compact Search**: Expandable search para toolbars

## Especificações Material Design 3

### Tooltip Specifications

#### Plain Tooltip

- **Container**: Inverse surface background
- **Text**: Inverse on-surface color
- **Padding**: 8dp horizontal, 4dp vertical
- **Min Height**: 24dp
- **Corner Radius**: Small (4dp)

#### Rich Tooltip

- **Container**: Surface container background
- **Max Width**: 280dp
- **Padding**: 12dp all sides
- **Corner Radius**: Medium (12dp)
- **Components**: Optional title, body text, up to 2 action buttons

#### Positioning

- **Offset**: 8dp from trigger element
- **Arrow**: Optional pointer to reference element
- **Viewport**: Auto-positioning to stay in bounds

### Switch Specifications

#### Measurements

- **Track**: 52dp width × 32dp height
- **Handle**: 24dp diameter (grows to 28dp when pressed)
- **Touch Target**: 48dp × 48dp minimum
- **State Layer**: 40dp × 40dp hover area

#### States & Colors

- **Unchecked**: Outline track, outline handle
- **Checked**: Primary track, on-primary handle
- **Disabled**: 38% opacity on all elements
- **Error**: Error color variants

### Slider Specifications

#### Measurements

- **Track**: 4dp height, full width
- **Handle**: 20dp diameter
- **Touch Target**: 48dp × 48dp
- **State Layer**: 40dp hover, 44dp pressed

#### Interaction

- **Drag**: Smooth handle movement
- **Keyboard**: Arrow keys for value changes
- **Touch**: Direct manipulation with haptic feedback

### Search Specifications

#### Search Bar

- **Height**: 56dp standard
- **Corner Radius**: Full (28dp)
- **Background**: Surface container highest
- **Border**: Outline color, primary when focused

#### Search View

- **Header**: 56dp height with back button
- **Background**: Surface color
- **Content**: Scrollable suggestions/results area

#### Input States

- **Rest**: Outline border
- **Focused**: Primary border with ring
- **Error**: Error border with ring

## Uso Básico

### Tooltip Usage

#### Plain Tooltip

```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/md3";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <FontAwesomeIcon icon={faInfo} />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      More information
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Rich Tooltip

```tsx
import { RichTooltip, TooltipAction } from "@/components/md3";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Feature Button</Button>
    </TooltipTrigger>
    <RichTooltip
      title="New Feature"
      actions={
        <>
          <TooltipAction>Learn More</TooltipAction>
          <TooltipAction variant="default">Try It</TooltipAction>
        </>
      }
    >
      This feature helps you manage your data more efficiently with advanced filtering and sorting options.
    </RichTooltip>
  </Tooltip>
</TooltipProvider>
```

#### Tooltip with Icon Button Helper

```tsx
import { TooltipIconButton } from "@/components/md3";

<TooltipIconButton
  tooltip="Delete item"
  icon={<FontAwesomeIcon icon={faTrash} />}
  onClick={() => deleteItem()}
  side="top"
/>
```

### Switch Usage

#### Basic Switch

```tsx
import { Switch } from "@/components/md3";

const [enabled, setEnabled] = useState(false);

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

#### Switch with Label

```tsx
<Switch
  label="Enable notifications"
  description="Receive push notifications for updates"
  checked={notificationsEnabled}
  onCheckedChange={setNotificationsEnabled}
/>
```

#### Error State Switch

```tsx
<Switch
  label="Required setting"
  description="This setting must be enabled to continue"
  checked={requiredSetting}
  onCheckedChange={setRequiredSetting}
  error={!requiredSetting}
/>
```

#### Switch with Icon

```tsx
import { IconSwitch } from "@/components/md3";

<IconSwitch
  icon={<FontAwesomeIcon icon={faWifi} />}
  label="Wi-Fi"
  checked={wifiEnabled}
  onCheckedChange={setWifiEnabled}
  iconPosition="start"
/>
```

### Slider Usage

#### Basic Slider

```tsx
import { Slider } from "@/components/md3";

const [volume, setVolume] = useState([50]);

<Slider
  value={volume}
  onValueChange={setVolume}
  max={100}
  step={1}
/>
```

#### Slider with Label and Value Display

```tsx
<Slider
  label="Volume"
  showValue
  value={volume}
  onValueChange={setVolume}
  min={0}
  max={100}
  step={5}
  valueFormatter={(val) => `${val}%`}
/>
```

#### Range Slider

```tsx
import { RangeSlider } from "@/components/md3";

const [priceRange, setPriceRange] = useState([20, 80]);

<RangeSlider
  label="Price Range"
  showValue
  value={priceRange}
  onValueChange={setPriceRange}
  min={0}
  max={100}
  step={1}
  formatRange={(min, max) => `$${min} - $${max}`}
/>
```

#### Discrete Slider with Steps

```tsx
import { DiscreteSlider } from "@/components/md3";

<DiscreteSlider
  label="Quality"
  value={[2]}
  onValueChange={setQuality}
  min={0}
  max={4}
  step={1}
  showSteps
  stepLabels={["Low", "Medium", "High", "Ultra", "Max"]}
/>
```

### Search Usage

#### Basic Search Bar

```tsx
import { SearchBar } from "@/components/md3";

const [searchQuery, setSearchQuery] = useState("");

<SearchBar
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onSearch={(query) => handleSearch(query)}
/>
```

#### Search Bar with Suggestions

```tsx
const suggestions = ["iPhone", "iPad", "MacBook", "Apple Watch"];

<SearchBar
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  suggestions={suggestions.filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  )}
  onSuggestionClick={(suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  }}
  showMic
  showCamera
/>
```

#### Full Search View

```tsx
import { SearchView } from "@/components/md3";

const [showSearchView, setShowSearchView] = useState(false);

{showSearchView && (
  <SearchView
    value={searchQuery}
    onChange={setSearchQuery}
    onBack={() => setShowSearchView(false)}
    onSearch={handleSearch}
    suggestions={suggestions}
    recentSearches={recentSearches}
    onSuggestionClick={(suggestion) => {
      setSearchQuery(suggestion);
      handleSearch(suggestion);
    }}
    onRecentSearchClick={(search) => {
      setSearchQuery(search);
      handleSearch(search);
    }}
    onRecentSearchDelete={removeRecentSearch}
  />
)}
```

#### Compact Expandable Search

```tsx
import { CompactSearch } from "@/components/md3";

const [searchExpanded, setSearchExpanded] = useState(false);

<CompactSearch
  expanded={searchExpanded}
  onToggle={() => setSearchExpanded(!searchExpanded)}
  placeholder="Search..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onSearch={handleSearch}
/>
```

## Variantes e Opções

### Tooltip Props

```typescript
interface TooltipProps {
    variant?: 'plain' | 'rich'; // Tooltip type
    side?: 'top' | 'bottom' | 'left' | 'right'; // Positioning
    sideOffset?: number; // Distance from trigger (default: 8dp)
}

interface RichTooltipProps {
    title?: string; // Optional headline
    children: React.ReactNode; // Body content
    actions?: React.ReactNode; // Up to 2 action buttons
}
```

### Switch Props

```typescript
interface SwitchProps {
    size?: 'default' | 'sm'; // Switch size (52dp / 44dp)
    variant?: 'default' | 'error'; // Visual variant
    label?: string; // Adjacent label text
    description?: string; // Helper text below label
    error?: boolean; // Error state shorthand
}
```

### Slider Props

```typescript
interface SliderProps {
    size?: 'default' | 'sm'; // Slider size (48dp / 40dp)
    variant?: 'default' | 'error'; // Visual variant
    label?: string; // Slider label
    showValue?: boolean; // Display current value
    valueFormatter?: (value: number) => string; // Custom value formatting
    min?: number; // Minimum value
    max?: number; // Maximum value
    step?: number; // Step increment
}
```

### Search Props

```typescript
interface SearchBarProps {
    variant?: 'bar' | 'view' | 'compact'; // Search type
    showMic?: boolean; // Show microphone button
    showCamera?: boolean; // Show camera button
    suggestions?: string[]; // Search suggestions
    onSuggestionClick?: (suggestion: string) => void; // Suggestion handler
    loading?: boolean; // Loading state
}
```

## Exemplos Avançados

### Interactive Tooltip System

```tsx
const [tooltipConfig, setTooltipConfig] = useState({
  variant: 'plain',
  side: 'top',
  showActions: false
});

<div className="space-y-4">
  <div className="flex gap-4">
    <TooltipIconButton
      tooltip="This is a plain tooltip"
      icon={<FontAwesomeIcon icon={faInfo} />}
    />

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Rich Tooltip</Button>
        </TooltipTrigger>
        <RichTooltip
          title="Feature Overview"
          actions={
            <>
              <TooltipAction onClick={() => console.log('Dismissed')}>
                Dismiss
              </TooltipAction>
              <TooltipAction variant="default" onClick={() => console.log('Activated')}>
                Activate
              </TooltipAction>
            </>
          }
        >
          This feature provides advanced functionality with multiple configuration options and real-time updates.
        </RichTooltip>
      </Tooltip>
    </TooltipProvider>
  </div>
</div>
```

### Settings Panel with Switches

```tsx
const [settings, setSettings] = useState({
  notifications: true,
  darkMode: false,
  autoSync: true,
  locationAccess: false
});

const updateSetting = (key: string, value: boolean) => {
  setSettings(prev => ({ ...prev, [key]: value }));
};

<div className="space-y-6 p-6">
  <h3 className="text-lg font-semibold">App Settings</h3>

  <div className="space-y-4">
    <IconSwitch
      icon={<FontAwesomeIcon icon={faBell} />}
      label="Push Notifications"
      description="Receive notifications for new messages and updates"
      checked={settings.notifications}
      onCheckedChange={(checked) => updateSetting('notifications', checked)}
    />

    <IconSwitch
      icon={<FontAwesomeIcon icon={faMoon} />}
      label="Dark Mode"
      description="Use dark theme throughout the app"
      checked={settings.darkMode}
      onCheckedChange={(checked) => updateSetting('darkMode', checked)}
    />

    <Switch
      label="Auto Sync"
      description="Automatically sync data when connected to Wi-Fi"
      checked={settings.autoSync}
      onCheckedChange={(checked) => updateSetting('autoSync', checked)}
    />

    <Switch
      label="Location Access"
      description="Allow app to access your location for personalized features"
      checked={settings.locationAccess}
      error={!settings.locationAccess && isLocationRequired}
      onCheckedChange={(checked) => updateSetting('locationAccess', checked)}
    />
  </div>
</div>
```

### Audio Control Panel with Sliders

```tsx
const [audioSettings, setAudioSettings] = useState({
  masterVolume: [75],
  musicVolume: [60],
  effectsVolume: [80],
  balance: [0], // -100 to 100
  equalizer: [0, 0, 0, 0, 0] // 5-band EQ
});

<div className="p-6 bg-surface-container rounded-lg space-y-6">
  <h3 className="text-lg font-semibold">Audio Settings</h3>

  <Slider
    label="Master Volume"
    showValue
    value={audioSettings.masterVolume}
    onValueChange={(value) => setAudioSettings(prev => ({
      ...prev, masterVolume: value
    }))}
    max={100}
    valueFormatter={(val) => `${val}%`}
  />

  <RangeSlider
    label="Dynamic Range"
    showValue
    value={[20, 90]}
    onValueChange={(value) => console.log('Range:', value)}
    formatRange={(min, max) => `${min}dB - ${max}dB`}
  />

  <DiscreteSlider
    label="Audio Quality"
    value={[2]}
    onValueChange={(value) => console.log('Quality:', value)}
    min={0}
    max={4}
    step={1}
    stepLabels={["Low", "Medium", "High", "Lossless", "Hi-Res"]}
    showSteps
  />

  <div className="grid grid-cols-5 gap-2">
    <span className="text-sm font-medium col-span-5 mb-2">5-Band Equalizer</span>
    {['60Hz', '170Hz', '310Hz', '600Hz', '1kHz'].map((band, index) => (
      <div key={band} className="text-center">
        <Slider
          orientation="vertical"
          value={[audioSettings.equalizer[index]]}
          onValueChange={(value) => {
            const newEQ = [...audioSettings.equalizer];
            newEQ[index] = value[0];
            setAudioSettings(prev => ({ ...prev, equalizer: newEQ }));
          }}
          min={-12}
          max={12}
          step={1}
          className="h-24 mx-auto"
        />
        <span className="text-xs text-on-surface-variant">{band}</span>
      </div>
    ))}
  </div>
</div>
```

### Advanced Search with Filters

```tsx
const [searchState, setSearchState] = useState({
  query: "",
  filters: {
    category: "all",
    priceRange: [0, 1000],
    inStock: true,
    rating: [4]
  },
  showFilters: false
});

const [searchResults, setSearchResults] = useState([]);
const [loading, setLoading] = useState(false);

const handleSearch = async (query: string) => {
  setLoading(true);
  try {
    const results = await searchAPI(query, searchState.filters);
    setSearchResults(results);
  } finally {
    setLoading(false);
  }
};

<div className="space-y-4">
  <div className="flex gap-2">
    <SearchBar
      placeholder="Search products, brands, categories..."
      value={searchState.query}
      onChange={(e) => setSearchState(prev => ({
        ...prev, query: e.target.value
      }))}
      onSearch={handleSearch}
      suggestions={searchSuggestions}
      onSuggestionClick={(suggestion) => {
        setSearchState(prev => ({ ...prev, query: suggestion }));
        handleSearch(suggestion);
      }}
      loading={loading}
      showMic
    />

    <Button
      variant="outline"
      onClick={() => setSearchState(prev => ({
        ...prev, showFilters: !prev.showFilters
      }))}
    >
      <FontAwesomeIcon icon={faFilter} className="mr-2" />
      Filters
    </Button>
  </div>

  {searchState.showFilters && (
    <div className="bg-surface-container p-4 rounded-lg space-y-4">
      <h4 className="font-medium">Search Filters</h4>

      <RangeSlider
        label="Price Range"
        showValue
        value={searchState.filters.priceRange}
        onValueChange={(value) => setSearchState(prev => ({
          ...prev,
          filters: { ...prev.filters, priceRange: value }
        }))}
        min={0}
        max={2000}
        step={50}
        formatRange={(min, max) => `$${min} - $${max}`}
      />

      <Slider
        label="Minimum Rating"
        showValue
        value={searchState.filters.rating}
        onValueChange={(value) => setSearchState(prev => ({
          ...prev,
          filters: { ...prev.filters, rating: value }
        }))}
        min={1}
        max={5}
        step={0.5}
        valueFormatter={(val) => `${val}⭐`}
      />

      <Switch
        label="In Stock Only"
        checked={searchState.filters.inStock}
        onCheckedChange={(checked) => setSearchState(prev => ({
          ...prev,
          filters: { ...prev.filters, inStock: checked }
        }))}
      />
    </div>
  )}

  {/* Search Results */}
  <div className="space-y-2">
    {searchResults.map((result, index) => (
      <div key={index} className="p-3 border rounded-lg hover:bg-surface-container">
        {result.title}
      </div>
    ))}
  </div>
</div>
```

## Estados Interativos

### Visual States

- ✅ **Enabled**: Estado padrão interativo
- ✅ **Hover**: State layer overlay (8% opacity)
- ✅ **Focused**: Focus ring indicator
- ✅ **Pressed**: Ripple effect com state layer (12% opacity)
- ✅ **Disabled**: 38% opacity, não-interativo

### Tooltip States

- **Hidden**: Não visível, aguardando trigger
- **Showing**: Fade in animation (200ms)
- **Visible**: Fully opaque, stable positioning
- **Hiding**: Fade out animation (150ms)

### Switch States

- **Unchecked**: Handle à esquerda, track outline
- **Checked**: Handle à direita, track filled
- **Transitioning**: Smooth handle animation (200ms)
- **Pressed**: Handle expanded (24dp → 28dp)

### Slider States

- **Idle**: Handle stable, no interaction
- **Hovered**: State layer visible (40dp)
- **Dragging**: Handle tracking cursor/touch
- **Active**: Pressed handle (20dp → 24dp)

### Search States

- **Empty**: Placeholder visible, no suggestions
- **Typing**: Input active, suggestions appearing
- **Results**: Search completed, results displayed
- **Loading**: Progress indicator, disabled input

## Cores e Temas

### Tooltip Colors

```css
/* Plain tooltips */
--tooltip-plain-container: var(--md-sys-color-inverse-surface);
--tooltip-plain-text: var(--md-sys-color-inverse-on-surface);

/* Rich tooltips */
--tooltip-rich-container: var(--md-sys-color-surface-container);
--tooltip-rich-text: var(--md-sys-color-on-surface-variant);
--tooltip-rich-title: var(--md-sys-color-on-surface);
--tooltip-rich-border: var(--md-sys-color-outline-variant);
```

### Switch Colors

```css
/* Unchecked state */
--switch-track-unchecked: var(--md-sys-color-surface-variant);
--switch-handle-unchecked: var(--md-sys-color-outline);
--switch-border-unchecked: var(--md-sys-color-outline);

/* Checked state */
--switch-track-checked: var(--md-sys-color-primary);
--switch-handle-checked: var(--md-sys-color-on-primary);
--switch-border-checked: var(--md-sys-color-primary);
```

### Slider Colors

```css
/* Track colors */
--slider-track-inactive: var(--md-sys-color-surface-variant);
--slider-track-active: var(--md-sys-color-primary);

/* Handle colors */
--slider-handle-container: var(--md-sys-color-background);
--slider-handle-border: var(--md-sys-color-primary);
--slider-handle-state-layer: var(--md-sys-color-primary);
```

### Search Colors

```css
/* Search bar */
--search-container: var(--md-sys-color-surface-container-highest);
--search-text: var(--md-sys-color-on-surface);
--search-border: var(--md-sys-color-outline);
--search-border-focused: var(--md-sys-color-primary);

/* Suggestions */
--search-suggestion-container: var(--md-sys-color-surface-container);
--search-suggestion-hover: var(--md-sys-color-surface-container-highest);
```

## Responsividade

### Breakpoint Adaptations

- **Mobile**: Touch-optimized targets, simplified layouts
- **Tablet**: Balanced touch/cursor interactions
- **Desktop**: Enhanced hover states, keyboard shortcuts

### Touch Targets

- **All Interactive Elements**: 48dp minimum
- **Switch Handle**: Expands on press for better feedback
- **Slider Handle**: 40dp hover area, 44dp when dragged
- **Search Actions**: 48dp tap targets

## Acessibilidade

### Keyboard Navigation

- **Tooltip**: ESC to dismiss, auto-dismiss on focus loss
- **Switch**: Space/Enter to toggle, arrow keys in groups
- **Slider**: Arrow keys for fine adjustment, Page Up/Down for large steps
- **Search**: Tab through suggestions, Enter to select

### Screen Reader Support

- **Tooltip**: Role tooltip, aria-describedby association
- **Switch**: Role switch, aria-checked state, label association
- **Slider**: Role slider, aria-valuenow/valuemin/valuemax, live regions
- **Search**: Role searchbox, aria-expanded for suggestions, aria-activedescendant

### WCAG Compliance

- ✅ **AA Color Contrast**: 4.5:1 text, 3:1 UI elements
- ✅ **Touch Targets**: 44dp minimum size
- ✅ **Focus Indicators**: 2px visible focus rings
- ✅ **State Communication**: Visual + programmatic feedback

## Performance

### Optimizations

- **Tooltip**: Lazy loading, portal rendering, auto-cleanup
- **Switch**: CSS transitions, hardware acceleration
- **Slider**: Throttled drag events, optimized re-renders
- **Search**: Debounced input, virtual suggestion lists

### Bundle Size

- **Tree Shaking**: Import apenas componentes necessários
- **Icon Optimization**: FontAwesome selective imports
- **Animation**: CSS-based transitions over JS
- **Memory**: Proper cleanup de event listeners

Esta implementação oferece controles interativos robustos e acessíveis, seguindo rigorosamente as especificações do Material Design 3 para criar interfaces intuitivas e responsivas.
