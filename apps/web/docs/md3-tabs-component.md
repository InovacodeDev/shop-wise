# Material Design 3 Tabs Component

Este documento apresenta uma implementação completa do componente Tabs do Material Design 3, seguindo as especificações oficiais do Google.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Componentes Disponíveis](#componentes-disponíveis)
- [Tipos de Tabs](#tipos-de-tabs)
- [Props e Interfaces](#props-e-interfaces)
- [Exemplos de Uso](#exemplos-de-uso)
- [Variantes e Estados](#variantes-e-estados)
- [Acessibilidade](#acessibilidade)
- [Guias de Implementação](#guias-de-implementação)

## Visão Geral

O componente Tabs organiza conteúdo em diferentes telas e visualizações relacionadas. No Material Design 3, existem dois tipos principais:

- **Primary Tabs**: Para navegação principal no topo do conteúdo
- **Secondary Tabs**: Para sub-navegação dentro de uma área de conteúdo

### Características Principais

- ✅ **Duas variantes**: Primary e Secondary tabs
- ✅ **Layout flexível**: Fixed ou scrollable
- ✅ **Suporte a ícones**: Com ou sem ícones
- ✅ **Badge support**: Notificações e contadores
- ✅ **Acessibilidade completa**: ARIA, keyboard navigation
- ✅ **Estados interativos**: Hover, focus, pressed, active
- ✅ **Responsivo**: Adapta a diferentes tamanhos de tela

## Componentes Disponíveis

### Componentes Base

- `Tabs` - Container principal
- `TabsList` - Lista de triggers
- `TabsTrigger` - Botão individual do tab
- `TabsContent` - Conteúdo do tab

### Componentes Especializados

- `ControlledTabs` - Versão explicitamente controlada
- `SecondaryTabs` - Tabs secundários

## Tipos de Tabs

### Primary Tabs

Para navegação principal, posicionados no topo do conteúdo sob uma app bar.

```tsx
<Tabs variant="primary" defaultValue="flights">
  <TabsList>
    <TabsTrigger value="flights">Flights</TabsTrigger>
    <TabsTrigger value="trips">Trips</TabsTrigger>
    <TabsTrigger value="explore">Explore</TabsTrigger>
  </TabsList>
  <TabsContent value="flights">Flight content</TabsContent>
  <TabsContent value="trips">Trips content</TabsContent>
  <TabsContent value="explore">Explore content</TabsContent>
</Tabs>
```

### Secondary Tabs

Para sub-navegação dentro de uma área de conteúdo.

```tsx
<SecondaryTabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="specs">Specifications</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="specs">Specs content</TabsContent>
</SecondaryTabs>
```

## Props e Interfaces

### TabsProps

```typescript
interface TabsProps {
    /** Currently active tab value */
    value?: string;
    /** Default active tab value (uncontrolled) */
    defaultValue?: string;
    /** Callback when active tab changes */
    onValueChange?: (value: string) => void;
    /** Tab variant */
    variant?: 'primary' | 'primary-with-icon' | 'secondary';
    /** Layout type */
    type?: 'fixed' | 'scrollable';
    /** Alignment */
    alignment?: 'start' | 'center' | 'fill';
    /** Tabs orientation */
    orientation?: 'horizontal' | 'vertical';
    /** Activation mode */
    activationMode?: 'automatic' | 'manual';
    children: React.ReactNode;
}
```

### TabsTriggerProps

```typescript
interface TabsTriggerProps {
    /** Unique value for this tab */
    value: string;
    /** Icon element (24dp recommended) */
    icon?: React.ReactNode;
    /** Tab label text */
    children: React.ReactNode;
    /** Badge content (number or text) */
    badge?: string | number;
    /** Whether to show a dot badge instead of text/number */
    dotBadge?: boolean;
    /** Whether this tab is disabled */
    disabled?: boolean;
}
```

## Exemplos de Uso

### Exemplo Básico

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/md3/tabs";

export function BasicTabsExample() {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-4">
        <h3 className="text-lg font-semibold">Account</h3>
        <p>Manage your account settings and preferences.</p>
      </TabsContent>
      <TabsContent value="password" className="mt-4">
        <h3 className="text-lg font-semibold">Password</h3>
        <p>Update your password and security settings.</p>
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <p>Configure your application settings.</p>
      </TabsContent>
    </Tabs>
  );
}
```

### Tabs com Ícones

```tsx
import { Home, User, Settings, Mail } from "@/components/icons";

export function IconTabsExample() {
  return (
    <Tabs defaultValue="home" variant="primary-with-icon">
      <TabsList>
        <TabsTrigger value="home" icon={<Home />}>
          Home
        </TabsTrigger>
        <TabsTrigger value="profile" icon={<User />}>
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings" icon={<Settings />}>
          Settings
        </TabsTrigger>
        <TabsTrigger value="messages" icon={<Mail />} badge={3}>
          Messages
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        {/* Home content */}
      </TabsContent>
      <TabsContent value="profile">
        {/* Profile content */}
      </TabsContent>
      <TabsContent value="settings">
        {/* Settings content */}
      </TabsContent>
      <TabsContent value="messages">
        {/* Messages content */}
      </TabsContent>
    </Tabs>
  );
}
```

### Tabs com Badges

```tsx
export function BadgedTabsExample() {
  return (
    <Tabs defaultValue="inbox">
      <TabsList>
        <TabsTrigger value="inbox" badge={12}>
          Inbox
        </TabsTrigger>
        <TabsTrigger value="sent">
          Sent
        </TabsTrigger>
        <TabsTrigger value="drafts" badge={3}>
          Drafts
        </TabsTrigger>
        <TabsTrigger value="spam" dotBadge>
          Spam
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inbox">
        <h3>Inbox (12 messages)</h3>
        {/* Inbox content */}
      </TabsContent>
      <TabsContent value="sent">
        <h3>Sent Messages</h3>
        {/* Sent content */}
      </TabsContent>
      <TabsContent value="drafts">
        <h3>Drafts (3 unsaved)</h3>
        {/* Drafts content */}
      </TabsContent>
      <TabsContent value="spam">
        <h3>Spam (has new)</h3>
        {/* Spam content */}
      </TabsContent>
    </Tabs>
  );
}
```

### Tabs Scrollable

```tsx
export function ScrollableTabsExample() {
  return (
    <Tabs defaultValue="australia" type="scrollable">
      <TabsList>
        <TabsTrigger value="australia">Australia</TabsTrigger>
        <TabsTrigger value="brazil">Brazil</TabsTrigger>
        <TabsTrigger value="canada">Canada</TabsTrigger>
        <TabsTrigger value="denmark">Denmark</TabsTrigger>
        <TabsTrigger value="egypt">Egypt</TabsTrigger>
        <TabsTrigger value="france">France</TabsTrigger>
        <TabsTrigger value="germany">Germany</TabsTrigger>
        <TabsTrigger value="hungary">Hungary</TabsTrigger>
      </TabsList>
      <TabsContent value="australia">
        {/* Australia content */}
      </TabsContent>
      {/* Other contents... */}
    </Tabs>
  );
}
```

### Tabs Controlados

```tsx
export function ControlledTabsExample() {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <ControlledTabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <h3>Product Overview</h3>
        <p>Current tab: {activeTab}</p>
      </TabsContent>
      <TabsContent value="details">
        <h3>Product Details</h3>
        <p>Current tab: {activeTab}</p>
      </TabsContent>
      <TabsContent value="reviews">
        <h3>Customer Reviews</h3>
        <p>Current tab: {activeTab}</p>
      </TabsContent>
    </ControlledTabs>
  );
}
```

### Tabs Aninhados (Primary + Secondary)

```tsx
export function NestedTabsExample() {
  return (
    <div className="space-y-4">
      {/* Primary Tabs */}
      <Tabs defaultValue="products" variant="primary">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {/* Secondary Tabs within Products */}
          <SecondaryTabs defaultValue="electronics">
            <TabsList>
              <TabsTrigger value="electronics">Electronics</TabsTrigger>
              <TabsTrigger value="clothing">Clothing</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
            </TabsList>
            <TabsContent value="electronics">
              Electronics products content
            </TabsContent>
            <TabsContent value="clothing">
              Clothing products content
            </TabsContent>
            <TabsContent value="books">
              Books products content
            </TabsContent>
          </SecondaryTabs>
        </TabsContent>

        <TabsContent value="services">
          Services content
        </TabsContent>

        <TabsContent value="support">
          Support content
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Variantes e Estados

### Dimensões (Material Design 3 Specs)

| Elemento                          | Medida |
| --------------------------------- | ------ |
| Container height (text only)      | 48dp   |
| Container height (icon + text)    | 64dp   |
| Icon size                         | 24dp   |
| Divider height                    | 1dp    |
| Primary active indicator height   | 3dp    |
| Secondary active indicator height | 2dp    |
| Active indicator minimum length   | 24dp   |
| Padding between icon and text     | 8dp    |
| Badge overlap on icon             | 6dp    |

### Estados dos Tabs

1. **Enabled (inactive)**: Estado padrão
2. **Hover**: Ao passar o mouse
3. **Focus**: Quando focado via teclado
4. **Pressed**: Durante o clique/toque
5. **Active**: Tab atualmente selecionado
6. **Disabled**: Tab desabilitado

### Cores (Design Tokens)

```css
/* Primary Tabs */
--primary-tab-container: var(--md-sys-color-surface);
--primary-tab-text: var(--md-sys-color-on-surface-variant);
--primary-tab-text-active: var(--md-sys-color-primary);
--primary-tab-indicator: var(--md-sys-color-primary);
--primary-tab-divider: var(--md-sys-color-outline-variant);

/* Secondary Tabs */
--secondary-tab-container: var(--md-sys-color-surface);
--secondary-tab-text: var(--md-sys-color-on-surface-variant);
--secondary-tab-text-active: var(--md-sys-color-on-surface);
--secondary-tab-indicator: var(--md-sys-color-primary);
```

## Acessibilidade

### Recursos Implementados

- **ARIA Roles**: `tablist`, `tab`, `tabpanel`
- **ARIA Properties**: `aria-selected`, `aria-controls`, `aria-labelledby`
- **Keyboard Navigation**: Tab, Arrow keys, Enter, Space
- **Focus Management**: Foco visível e gerenciamento adequado
- **Screen Reader Support**: Anúncios apropriados

### Navegação por Teclado

| Tecla              | Ação                                      |
| ------------------ | ----------------------------------------- |
| `Tab`              | Move foco para o próximo elemento focável |
| `Shift + Tab`      | Move foco para o elemento anterior        |
| `Arrow Left/Right` | Navega entre tabs (quando suportado)      |
| `Enter/Space`      | Ativa o tab focado                        |
| `Home`             | Move para o primeiro tab                  |
| `End`              | Move para o último tab                    |

### Exemplo com Acessibilidade Aprimorada

```tsx
export function AccessibleTabsExample() {
  return (
    <Tabs
      defaultValue="personal"
      aria-label="User information sections"
    >
      <TabsList role="tablist">
        <TabsTrigger
          value="personal"
          aria-describedby="personal-desc"
        >
          Personal Info
        </TabsTrigger>
        <TabsTrigger
          value="security"
          aria-describedby="security-desc"
        >
          Security
        </TabsTrigger>
        <TabsTrigger
          value="preferences"
          aria-describedby="preferences-desc"
        >
          Preferences
        </TabsTrigger>
      </TabsList>

      <div id="personal-desc" className="sr-only">
        Manage your personal information and profile details
      </div>
      <div id="security-desc" className="sr-only">
        Update password and security settings
      </div>
      <div id="preferences-desc" className="sr-only">
        Configure application preferences and notifications
      </div>

      <TabsContent value="personal">
        <h2 className="sr-only">Personal Information</h2>
        {/* Personal info form */}
      </TabsContent>

      <TabsContent value="security">
        <h2 className="sr-only">Security Settings</h2>
        {/* Security form */}
      </TabsContent>

      <TabsContent value="preferences">
        <h2 className="sr-only">User Preferences</h2>
        {/* Preferences form */}
      </TabsContent>
    </Tabs>
  );
}
```

## Guias de Implementação

### Quando Usar Tabs

✅ **Use tabs quando:**

- Agrupar conteúdo relacionado em categorias distintas
- Usuários precisam alternar rapidamente entre visualizações
- Conteúdo está no mesmo nível hierárquico
- Há 2-7 categorias de conteúdo

❌ **Não use tabs para:**

- Conteúdo sequencial que deve ser lido em ordem
- Processos com etapas obrigatórias (use Stepper)
- Navegação principal do app (use Navigation)
- Apenas uma categoria de conteúdo

### Boas Práticas

1. **Labels claros**: Use textos curtos e descritivos
2. **Consistência**: Mantenha o mesmo padrão (todos com ícones ou todos sem)
3. **Hierarquia**: Primary tabs no topo, Secondary tabs abaixo
4. **Responsividade**: Use scrollable tabs quando necessário
5. **Performance**: Use `forceMount={false}` para conteúdo pesado
6. **Acessibilidade**: Sempre inclua labels e ARIA adequados

### Layout Responsivo

```tsx
export function ResponsiveTabsExample() {
  return (
    <div className="w-full">
      {/* Mobile: Scrollable tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="home" type="scrollable">
          <TabsList>
            <TabsTrigger value="home" icon={<Home />}>Home</TabsTrigger>
            <TabsTrigger value="search" icon={<Search />}>Search</TabsTrigger>
            <TabsTrigger value="favorites" icon={<Heart />}>Favorites</TabsTrigger>
            <TabsTrigger value="profile" icon={<User />}>Profile</TabsTrigger>
            <TabsTrigger value="settings" icon={<Settings />}>Settings</TabsTrigger>
          </TabsList>
          {/* Content */}
        </Tabs>
      </div>

      {/* Desktop: Fixed tabs */}
      <div className="hidden md:block">
        <Tabs defaultValue="home" type="fixed">
          <TabsList>
            <TabsTrigger value="home" icon={<Home />}>Home</TabsTrigger>
            <TabsTrigger value="search" icon={<Search />}>Search</TabsTrigger>
            <TabsTrigger value="favorites" icon={<Heart />}>Favorites</TabsTrigger>
            <TabsTrigger value="profile" icon={<User />}>Profile</TabsTrigger>
          </TabsList>
          {/* Content */}
        </Tabs>
      </div>
    </div>
  );
}
```

### Integração com Roteamento

```tsx
import { useRouter } from "next/router";

export function RouteTabsExample() {
  const router = useRouter();
  const activeTab = router.query.tab as string || "overview";

  const handleTabChange = (value: string) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: value },
    });
  };

  return (
    <ControlledTabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{/* Overview */}</TabsContent>
      <TabsContent value="features">{/* Features */}</TabsContent>
      <TabsContent value="pricing">{/* Pricing */}</TabsContent>
    </ControlledTabs>
  );
}
```

### Customização de Tema

```tsx
// Exemplo de customização com Tailwind
export function CustomTabsExample() {
  return (
    <Tabs defaultValue="custom" className="w-full">
      <TabsList className="bg-purple-100 border-purple-200">
        <TabsTrigger
          value="custom"
          className="data-[active]:bg-purple-500 data-[active]:text-white"
        >
          Custom Tab
        </TabsTrigger>
        <TabsTrigger value="themed">
          Themed Tab
        </TabsTrigger>
      </TabsList>
      <TabsContent value="custom">
        Custom styled content
      </TabsContent>
      <TabsContent value="themed">
        Themed content
      </TabsContent>
    </Tabs>
  );
}
```

---

## Resumo de Recursos

- ✅ **Material Design 3 compliant**
- ✅ **TypeScript nativo**
- ✅ **Acessibilidade completa**
- ✅ **Variantes Primary e Secondary**
- ✅ **Layout Fixed e Scrollable**
- ✅ **Suporte a ícones e badges**
- ✅ **Estados interativos**
- ✅ **Responsivo**
- ✅ **Customização flexível**

O componente Tabs oferece uma solução completa para navegação por abas, seguindo rigorosamente as especificações do Material Design 3 e oferecendo uma experiência de usuário moderna e acessível.
