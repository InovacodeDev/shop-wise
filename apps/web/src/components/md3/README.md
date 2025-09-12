# Material Design 3 Components

Esta pasta contém todos os componentes que seguem as especificações do **Material Design 3** (MD3).

## 📁 Estrutura

```
src/components/md3/
├── index.tsx                  # Exportações centralizadas
├── tooltip.tsx                # MD3 Tooltip - Plain & Rich variants
├── switch.tsx                 # MD3 Switch - Toggle controls
├── slider.tsx                 # MD3 Slider - Range & Discrete variants
├── search.tsx                 # MD3 Search - SearchBar, SearchView, Compact
├── menu.tsx                   # MD3 Menu - Dropdown menus & context menus
├── list.tsx                   # MD3 Lists - One/Two/Three line items
├── input.tsx                  # MD3 Text Fields - Filled & Outlined variants
├── navigation-bar.tsx         # MD3 Bottom Navigation Bar
├── navigation-drawer.tsx      # MD3 Navigation Drawer (legacy)
├── navigation-rail.tsx        # MD3 Navigation Rail - Standard & Expanded
├── app-bar.tsx                # MD3 Top App Bar - Small, Medium, Large
├── button-group.tsx           # MD3 Button Groups - Connected & Standard
├── carousel.tsx               # MD3 Carousel - Multi-browse, Hero variants
├── pickers.tsx                # MD3 Date/Time Pickers - Docked & Modal
├── snackbar.tsx               # MD3 Snackbar - Toast notifications
├── segmented-buttons.tsx      # MD3 Segmented Button controls
├── fab.tsx                    # MD3 Floating Action Button variants
├── loading-indicator.tsx      # MD3 Loading indicators with animations
└── README.md                  # Este arquivo
```

## 🎯 Componentes Disponíveis

### Core Interactive Components

#### Tooltip (`tooltip.tsx`)

- **Plain Tooltip**: Tooltips simples para labels
- **Rich Tooltip**: Tooltips com título, conteúdo e actions
- **TooltipIconButton**: Helper component com botão + tooltip

#### Switch (`switch.tsx`)

- **Switch**: Toggle control com variants default/error
- **IconSwitch**: Switch com ícones posicionáveis

#### Slider (`slider.tsx`)

- **Slider**: Slider simples com labels e formatação
- **RangeSlider**: Slider com dois handles para range
- **DiscreteSlider**: Slider com steps visuais

### Search & Menu Components

#### Search (`search.tsx`)

- **SearchBar**: Barra de busca com suggestions
- **SearchView**: Interface full-screen de busca
- **CompactSearch**: Busca compacta expansível

#### Menu (`menu.tsx`)

- **DropdownMenu**: Menu contextual com items, separators
- **DropdownMenuCheckboxItem**: Items com checkbox
- **DropdownMenuRadioItem**: Items com radio selection
- **DropdownMenuSub**: Submenus aninhados

### Input & Form Components

#### Input (`input.tsx`)

- **Input**: Text field com variants filled/outlined
- **SearchInput**: Input otimizado para busca
- **PasswordInput**: Input com toggle de visibilidade
- **Textarea**: Área de texto multi-linha

#### Pickers (`pickers.tsx`)

- **DatePicker**: Seletor de data - Docked/Modal variants
- **TimePicker**: Seletor de tempo - Dial/Input modes
- **DatePickerInput**: Input field com date picker integrado
- **TimePickerInput**: Input field com time picker integrado

### Navigation Components

#### Navigation Bar (`navigation-bar.tsx`)

- **NavigationBar**: Bottom navigation com ícones + labels
- **NavigationBarItem**: Items individuais da navigation
- **NavigationBarWithFAB**: Navigation bar com FAB integrado
- **AdaptiveNavigationBar**: Navigation responsiva

#### Navigation Rail (`navigation-rail.tsx`)

- **NavigationRail**: Side navigation - Standard/Expanded variants
- **NavigationRailItem**: Items da navigation rail
- **ResponsiveNavigationRail**: Rail com breakpoints responsivos

#### Navigation Drawer (`navigation-drawer.tsx`)

- **NavigationDrawer**: Side drawer - Standard/Modal variants ⚠️ **Deprecated**
- **NavigationDrawerItem**: Items do drawer
- **NavigationDrawerSection**: Seções organizacionais

#### App Bar (`app-bar.tsx`)

- **AppBar**: Top app bar - Small/Center-aligned/Medium/Large
- **AppBarLeading**: Área de navegação (menu, back button)
- **AppBarTitle**: Título da app bar
- **AppBarTrailing**: Ações no final da app bar
- **BottomAppBar**: App bar posicionada na parte inferior

### Button & Action Components

#### Button Group (`button-group.tsx`)

- **ButtonGroup**: Agrupamento de botões - Standard/Connected
- **ButtonGroupItem**: Botões individuais em um grupo

#### FAB (`fab.tsx`)

- **FAB**: Floating Action Button - Primary/Secondary/Tertiary
- **ExtendedFAB**: FAB com texto e ícone
- **FABMenu**: Menu de FABs secundários
- **FABMenuItem**: Items do FAB menu

#### Segmented Buttons (`segmented-buttons.tsx`)

- **SegmentedButtons**: Controle de seleção múltipla
- **SegmentedButtonsItem**: Items individuais

### Display & Feedback Components

#### Carousel (`carousel.tsx`)

- **Carousel**: Container principal - Multi-browse/Hero/Full-screen
- **CarouselContent**: Wrapper do conteúdo
- **CarouselItem**: Items individuais do carousel
- **CarouselPrevious/CarouselNext**: Controles de navegação
- **CarouselIndicators**: Indicadores de posição
- **CarouselText**: Componente de texto para carousels

#### Snackbar (`snackbar.tsx`)

- **Snackbar**: Toast notification - Default/Error/Success variants
- **SnackbarProvider**: Provider para gerenciar snackbars
- **SnackbarTrigger**: Helper para disparar snackbars
- **useSnackbar**: Hook para controle programático

#### Loading Indicator (`loading-indicator.tsx`)

- **LoadingIndicator**: Indicadores de carregamento MD3
- **LinearProgress**: Barra de progresso linear
- **CircularProgress**: Indicador circular
- Animações com shape morphing seguindo MD3 specs

### List Components

#### List (`list.tsx`)

- **List**: Container de listas com variants One/Two/Three-line
- **ListItem**: Items básicos de lista
- **ListAvatarItem**: Items com avatar
- **ListCheckboxItem**: Items com checkbox integrado
- **ListSwitchItem**: Items com switch integrado
- **ListImageItem**: Items com imagem
- **DraggableListItem**: Items arrastáveis para reordenação

### List (`list.tsx`)

- **List**: Container de listas com variants
- **ListItem**: Items básicos (one-line/two-line/three-line)
- **ListItemWithAvatar**: Items com avatar
- **ListItemWithCheckbox**: Items selecionáveis
- **ListItemWithSwitch**: Items com toggle switches
- **ListItemWithImage**: Items com imagens/thumbnails
- **DraggableListItem**: Items reordenáveis

## 🚀 Uso

### Import Centralizado

```tsx
import { DropdownMenu, List, SearchBar, Switch, Tooltip } from '@/components/md3';
```

### Import Direto

```tsx
import { Switch } from '@/components/md3/switch';
import { Tooltip } from '@/components/md3/tooltip';
```

## 📐 Especificações MD3

Todos os componentes seguem rigorosamente as especificações do Material Design 3:

- ✅ **Touch Targets**: 48dp mínimo para elementos interativos
- ✅ **Typography Scale**: Correct font sizes e line heights
- ✅ **Color Tokens**: Surface containers, state layers, semantic colors
- ✅ **State Management**: Hover, focus, pressed, disabled states
- ✅ **Accessibility**: WCAG AA, screen reader support, keyboard navigation
- ✅ **Animation**: MD3 motion curves e durations

## 🎨 Tokens de Design

### Measurements

- **One-line List**: 56dp height
- **Two-line List**: 72dp height
- **Three-line List**: 88dp height
- **Touch Target**: 48dp minimum
- **Menu Width**: 128dp - 280dp
- **Switch Track**: 52dp × 32dp

### Colors

- **Surface Containers**: `bg-surface-container`
- **State Layers**: `hover:bg-on-surface/8`, `focus:bg-on-surface/12`
- **Primary Actions**: `text-primary`, `border-primary`
- **Error States**: `text-error`, `border-error`

## 📚 Documentação

Documentação completa disponível em:

- `/docs/md3-interactive-components.md` - Tooltip, Switch, Slider, Search
- `/docs/md3-menu-list-components.md` - Menu, Lists

## 🔄 Migração

Componentes migrados de `/components/ui` para `/components/md3`:

- ✅ `tooltip.tsx` → MD3 compliant
- ✅ `switch.tsx` → MD3 compliant
- ✅ `slider.tsx` → MD3 compliant
- ✅ `search.tsx` → MD3 compliant
- ✅ `menu.tsx` → MD3 compliant
- ✅ `list.tsx` → MD3 compliant

Imports atualizados automaticamente em toda a codebase.
