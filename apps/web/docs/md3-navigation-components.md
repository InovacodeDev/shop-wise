# Material Design 3 Navigation Components

Este documento apresenta uma implementação completa dos componentes de navegação do Material Design 3, incluindo Navigation Bar, Navigation Rail e Navigation Drawer (deprecated).

## 📋 Índice

- [Navigation Bar](#navigation-bar)
- [Navigation Rail](#navigation-rail)
- [Navigation Drawer (Deprecated)](#navigation-drawer-deprecated)
- [Guia de Migração](#guia-de-migração)
- [Exemplos de Uso](#exemplos-de-uso)
- [Acessibilidade](#acessibilidade)

## Navigation Bar

O Navigation Bar é ideal para navegação principal em dispositivos móveis e telas compactas. Suporta 3-5 destinos principais.

### Componentes Disponíveis

- `NavigationBar` - Componente principal
- `NavigationBarItem` - Item individual de navegação
- `ControlledNavigationBar` - Versão controlada explícita
- `NavigationBarWithFAB` - Com Floating Action Button
- `AdaptiveNavigationBar` - Esconde durante scroll

### Props Principais

```typescript
interface NavigationBarProps {
    value?: string; // Item ativo atual
    onValueChange?: (value: string) => void; // Callback de mudança
    showLabels?: boolean; // Mostrar labels
    size?: 'default' | 'compact'; // Tamanho
    children: React.ReactElement<NavigationBarItemProps>[];
}

interface NavigationBarItemProps {
    icon: React.ReactNode; // Ícone (24dp recomendado)
    activeIcon?: React.ReactNode; // Ícone ativo (opcional)
    label: string; // Texto do label
    value?: string; // Valor único do item
    active?: boolean; // Estado ativo
    badge?: string | number; // Conteúdo do badge
    dotBadge?: boolean; // Badge de ponto
    showLabel?: boolean; // Mostrar label individual
}
```

### Exemplo Básico

```tsx
import { NavigationBar, NavigationBarItem } from "@/components/md3/navigation-bar";
import { Home, Search, Favorites, Profile } from "@/components/icons";

export function AppNavigationBar() {
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <NavigationBar
      value={activeTab}
      onValueChange={setActiveTab}
      className="fixed bottom-0 left-0 right-0"
    >
      <NavigationBarItem
        value="home"
        icon={<Home />}
        activeIcon={<Home className="fill-current" />}
        label="Home"
      />
      <NavigationBarItem
        value="search"
        icon={<Search />}
        label="Search"
      />
      <NavigationBarItem
        value="favorites"
        icon={<Favorites />}
        label="Favorites"
        badge={3}
      />
      <NavigationBarItem
        value="profile"
        icon={<Profile />}
        label="Profile"
        dotBadge
      />
    </NavigationBar>
  );
}
```

### Com FAB

```tsx
import { NavigationBarWithFAB } from "@/components/md3/navigation-bar";
import { FAB } from "@/components/md3/fab";
import { Add } from "@/components/icons";

export function NavigationWithFAB() {
  return (
    <NavigationBarWithFAB
      fab={
        <FAB>
          <Add />
        </FAB>
      }
      fabPosition="center"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      {/* Itens de navegação */}
    </NavigationBarWithFAB>
  );
}
```

### Adaptativo (esconde no scroll)

```tsx
import { AdaptiveNavigationBar } from "@/components/md3/navigation-bar";

export function AdaptiveNav() {
  return (
    <AdaptiveNavigationBar
      hideOnScroll
      scrollThreshold={100}
      value={activeTab}
      onValueChange={setActiveTab}
    >
      {/* Itens de navegação */}
    </AdaptiveNavigationBar>
  );
}
```

## Navigation Rail

**⭐ Recomendado**: O Navigation Rail é o componente de navegação principal para telas médias e grandes no Material Design 3.

### Componentes Disponíveis

- `NavigationRail` - Componente principal
- `NavigationRailItem` - Item individual
- `ControlledNavigationRail` - Versão controlada
- `ResponsiveNavigationRail` - Adaptativo por breakpoint
- `NavigationRailWithMenu` - Com botão de menu

### Variantes

- **Standard** (80dp) - Para telas médias
- **Expanded** (320dp) - Para telas grandes, substitui o Navigation Drawer

### Props Principais

```typescript
interface NavigationRailProps {
    variant?: 'standard' | 'expanded'; // Variante do rail
    alignment?: 'top' | 'center' | 'bottom'; // Alinhamento dos itens
    value?: string; // Item ativo
    onValueChange?: (value: string) => void; // Callback
    header?: React.ReactNode; // Conteúdo do cabeçalho
    footer?: React.ReactNode; // Conteúdo do rodapé
    expandable?: boolean; // Pode expandir/colapsar
    expanded?: boolean; // Estado expandido
    onExpandedChange?: (expanded: boolean) => void;
    children: React.ReactElement<NavigationRailItemProps>[];
}
```

### Exemplo Standard

```tsx
import { NavigationRail, NavigationRailItem } from "@/components/md3/navigation-rail";
import { FAB } from "@/components/md3/fab";

export function AppNavigationRail() {
  const [activeItem, setActiveItem] = React.useState("dashboard");

  return (
    <NavigationRail
      variant="standard"
      value={activeItem}
      onValueChange={setActiveItem}
      header={
        <FAB size="default">
          <Add />
        </FAB>
      }
    >
      <NavigationRailItem
        value="dashboard"
        icon={<Dashboard />}
        label="Dashboard"
      />
      <NavigationRailItem
        value="analytics"
        icon={<Analytics />}
        label="Analytics"
        badge={5}
      />
      <NavigationRailItem
        value="reports"
        icon={<Reports />}
        label="Reports"
      />
      <NavigationRailItem
        value="settings"
        icon={<Settings />}
        label="Settings"
        dotBadge
      />
    </NavigationRail>
  );
}
```

### Exemplo Expanded

```tsx
export function ExpandedNavigationRail() {
  return (
    <NavigationRail
      variant="expanded"
      value={activeItem}
      onValueChange={setActiveItem}
      header={
        <div className="flex items-center gap-3">
          <Avatar src="/logo.png" />
          <div>
            <h3 className="text-sm font-medium">Minha App</h3>
            <p className="text-xs text-on-surface-variant">v1.0.0</p>
          </div>
        </div>
      }
    >
      {/* Mesmos itens do exemplo anterior */}
    </NavigationRail>
  );
}
```

### Rail Expansível

```tsx
export function ExpandableRail() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <NavigationRail
      expandable
      expanded={expanded}
      onExpandedChange={setExpanded}
      header={
        <button onClick={() => setExpanded(!expanded)}>
          <Menu />
        </button>
      }
      value={activeItem}
      onValueChange={setActiveItem}
    >
      {/* Itens */}
    </NavigationRail>
  );
}
```

### Rail Responsivo

```tsx
import { ResponsiveNavigationRail } from "@/components/md3/navigation-rail";

export function ResponsiveRail() {
  return (
    <ResponsiveNavigationRail
      expandBreakpoint="lg"  // Expande em telas lg+
      hideOnMobile          // Esconde em mobile
      value={activeItem}
      onValueChange={setActiveItem}
    >
      {/* Itens */}
    </ResponsiveNavigationRail>
  );
}
```

## Navigation Drawer (Deprecated)

> ⚠️ **Aviso de Depreciação**: O Navigation Drawer foi descontinuado no Material Design 3 (Maio 2025). Use `NavigationRail` com variante `expanded` em seu lugar.

### Por que foi Depreciado?

1. **Melhor UX**: Navigation Rail oferece acesso mais rápido
2. **Consistência**: Evita sobreposição de conteúdo
3. **Responsividade**: Melhor adaptação a diferentes tamanhos de tela
4. **Performance**: Menos animações complexas

### Componentes (Legacy)

- `NavigationDrawer` - Componente principal
- `NavigationDrawerItem` - Item individual
- `NavigationDrawerSection` - Seção de agrupamento
- `ResponsiveNavigationDrawer` - Versão responsiva
- `useNavigationDrawer` - Hook para gerenciamento de estado

### Exemplo de Uso (Legacy)

```tsx
import {
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerSection,
  useNavigationDrawer
} from "@/components/md3/navigation-drawer";

export function LegacyDrawer() {
  const { open, openDrawer, closeDrawer } = useNavigationDrawer();
  const [activeItem, setActiveItem] = React.useState("home");

  return (
    <>
      <button onClick={openDrawer}>
        <Menu />
      </button>

      <NavigationDrawer
        open={open}
        onClose={closeDrawer}
        variant="modal"
        value={activeItem}
        onValueChange={setActiveItem}
        header={
          <div className="flex items-center gap-3">
            <Avatar />
            <div>
              <h3>John Doe</h3>
              <p>john@example.com</p>
            </div>
          </div>
        }
      >
        <NavigationDrawerSection title="Principal">
          <NavigationDrawerItem
            value="home"
            icon={<Home />}
            label="Início"
          />
          <NavigationDrawerItem
            value="search"
            icon={<Search />}
            label="Pesquisar"
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection title="Configurações" showDivider>
          <NavigationDrawerItem
            value="settings"
            icon={<Settings />}
            label="Configurações"
          />
          <NavigationDrawerItem
            value="help"
            icon={<Help />}
            label="Ajuda"
          />
        </NavigationDrawerSection>
      </NavigationDrawer>
    </>
  );
}
```

## Guia de Migração

### De Navigation Drawer para Navigation Rail

```tsx
// ❌ Antigo (Navigation Drawer)
<NavigationDrawer
  open={drawerOpen}
  onClose={closeDrawer}
  variant="standard"
>
  {items}
</NavigationDrawer>

// ✅ Novo (Navigation Rail Expanded)
<NavigationRail
  variant="expanded"
  value={activeItem}
  onValueChange={setActiveItem}
>
  {items}
</NavigationRail>
```

### Sistema de Navegação Responsivo Recomendado

```tsx
export function ResponsiveNavigation() {
  const [activeItem, setActiveItem] = React.useState("home");

  return (
    <>
      {/* Mobile: Navigation Bar */}
      <div className="md:hidden">
        <NavigationBar
          value={activeItem}
          onValueChange={setActiveItem}
          className="fixed bottom-0"
        >
          {mobileItems}
        </NavigationBar>
      </div>

      {/* Desktop: Navigation Rail */}
      <div className="hidden md:block">
        <NavigationRail
          variant="standard"
          className="lg:w-80" // Expande em lg+
          value={activeItem}
          onValueChange={setActiveItem}
        >
          {desktopItems}
        </NavigationRail>
      </div>
    </>
  );
}
```

## Padrões de Layout

### Layout Híbrido (Recomendado)

```tsx
export function HybridLayout() {
  return (
    <div className="min-h-screen">
      {/* Navigation Rail para desktop */}
      <ResponsiveNavigationRail
        expandBreakpoint="lg"
        hideOnMobile
        className="fixed left-0 top-0 h-full"
      >
        {navigationItems}
      </ResponsiveNavigationRail>

      {/* Conteúdo principal */}
      <main className="md:ml-20 lg:ml-80 pb-20 md:pb-0">
        {children}
      </main>

      {/* Navigation Bar para mobile */}
      <AdaptiveNavigationBar
        className="md:hidden"
        hideOnScroll
      >
        {mobileNavigationItems}
      </AdaptiveNavigationBar>
    </div>
  );
}
```

## Exemplos de Uso Avançado

### Navegação com Context

```tsx
const NavigationContext = React.createContext();

export function NavigationProvider({ children }) {
  const [activeItem, setActiveItem] = React.useState("home");
  const [railExpanded, setRailExpanded] = React.useState(false);

  return (
    <NavigationContext.Provider value={{
      activeItem,
      setActiveItem,
      railExpanded,
      setRailExpanded,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return React.useContext(NavigationContext);
}
```

### Badge Dinâmico

```tsx
function NavigationWithDynamicBadges() {
  const { notifications, messages } = useNotifications();

  return (
    <NavigationBar value={active} onValueChange={setActive}>
      <NavigationBarItem
        value="inbox"
        icon={<Inbox />}
        label="Inbox"
        badge={messages.unread}
      />
      <NavigationBarItem
        value="notifications"
        icon={<Notifications />}
        label="Notificações"
        dotBadge={notifications.hasNew}
      />
    </NavigationBar>
  );
}
```

### Navegação com Roteamento

```tsx
import { useRouter } from "next/router";

export function RouterNavigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <NavigationRail
      value={currentPath}
      onValueChange={handleNavigation}
    >
      <NavigationRailItem
        value="/dashboard"
        icon={<Dashboard />}
        label="Dashboard"
      />
      <NavigationRailItem
        value="/analytics"
        icon={<Analytics />}
        label="Analytics"
      />
    </NavigationRail>
  );
}
```

## Acessibilidade

### Recursos Implementados

- **ARIA Labels**: `aria-label`, `aria-current`, `aria-selected`
- **Keyboard Navigation**: Suporte completo ao teclado
- **Screen Reader**: Anúncios apropriados de estado
- **Focus Management**: Foco visível e lógico
- **Semantic HTML**: Uso de elementos `nav`, `button`, etc.

### Exemplo com Acessibilidade Aprimorada

```tsx
<NavigationRail
  aria-label="Navegação principal"
  value={activeItem}
  onValueChange={setActiveItem}
>
  <NavigationRailItem
    value="home"
    icon={<Home />}
    label="Página inicial"
    aria-describedby="home-description"
  />
  <div id="home-description" className="sr-only">
    Navegar para a página inicial da aplicação
  </div>
</NavigationRail>
```

## Customização de Tema

### CSS Variables Utilizadas

```css
:root {
    --surface: /* Cor de fundo */;
    --surface-container: /* Container de superfície */;
    --surface-container-low: /* Container baixo */;
    --surface-variant: /* Variante de superfície */;
    --on-surface: /* Texto em superfície */;
    --on-surface-variant: /* Texto variante */;
    --secondary-container: /* Container secundário */;
    --on-secondary-container: /* Texto em container secundário */;
    --outline-variant: /* Borda variante */;
    --error: /* Cor de erro */;
    --on-error: /* Texto em erro */;
}
```

### Customização com Tailwind

```tsx
<NavigationBar
  className="bg-purple-100 border-purple-200"
>
  <NavigationBarItem
    className="hover:bg-purple-50 data-[active]:bg-purple-200"
    // ...props
  />
</NavigationBar>
```

---

## Resumo de Recomendações

1. **Mobile**: Use `NavigationBar` na parte inferior
2. **Desktop**: Use `NavigationRail` (standard ou expanded)
3. **Responsive**: Combine ambos com breakpoints apropriados
4. **Evite**: `NavigationDrawer` (deprecated)
5. **Performance**: Use `AdaptiveNavigationBar` para auto-hide
6. **UX**: Máximo 5 itens no Navigation Bar
7. **Acessibilidade**: Sempre inclua labels e ARIA attributes

Este sistema de navegação oferece uma experiência consistente e moderna seguindo as diretrizes mais recentes do Material Design 3.
