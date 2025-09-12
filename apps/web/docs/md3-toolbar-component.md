# Material Design 3 Toolbar Component

Um sistema completo de toolbars que segue as especificações do Material Design 3, fornecendo containers flexíveis para ações e controles relacionados à página atual.

## Visão Geral

O sistema de Toolbar do MD3 oferece duas variantes principais:

- **Docked Toolbar**: Toolbar fixo que ocupa toda a largura da tela, ideal para ações globais
- **Floating Toolbar**: Toolbar flutuante e compacto, ideal para ações contextuais

## Componentes Disponíveis

### Componentes Base

- `Toolbar` - Container principal configurável
- `ToolbarItem` - Item individual do toolbar
- `ToolbarGroup` - Agrupamento lógico de itens
- `ToolbarSeparator` - Separador visual entre grupos
- `ToolbarAction` - Wrapper para ações (botões)
- `ToolbarSpacer` - Espaçamento flexível

### Componentes Pré-configurados

- `DockedToolbar` - Toolbar docked pré-configurado
- `FloatingToolbar` - Toolbar floating pré-configurado
- `ControlledToolbar` - Toolbar com gerenciamento de estado

## Especificações Técnicas

### Dimensões

#### Docked Toolbar

- **Altura padrão**: 80px (20 units)
- **Altura compacta**: 64px (16 units)
- **Largura**: 100% da tela
- **Padding horizontal**: 16px (padrão) / 12px (compacto)

#### Floating Toolbar

- **Altura horizontal**: 56px (14 units) / 48px (12 units compacto)
- **Largura vertical**: 56px (14 units) / 48px (12 units compacto)
- **Padding**: 16px (padrão) / 12px (compacto)
- **Border radius**: Fully rounded (28px/24px)
- **Margem mínima**: 16dp das bordas (horizontal) / 24dp (vertical)

### Área de Toque

- **Mínimo**: 48x48px para acessibilidade
- **Compacto**: 40x40px (apenas quando necessário)

### Elevação

- **Docked**: Sem elevação (border superior)
- **Floating**: Elevação 3 (shadow-lg)
- **Floating sem elevação**: Opcional quando background é distinto

## API dos Componentes

### Toolbar (Base)

```typescript
interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'docked' | 'floating';
    colorScheme?: 'standard' | 'vibrant';
    size?: 'default' | 'compact';
    orientation?: 'horizontal' | 'vertical';
    withElevation?: boolean;
    position?: {
        bottom?: number;
        top?: number;
        left?: number;
        right?: number;
    };
}
```

### ToolbarAction

```typescript
interface ToolbarActionProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
    emphasis?: 'low' | 'medium' | 'high';
    disabled?: boolean;
}
```

### ControlledToolbar

```typescript
interface ControlledToolbarProps extends ToolbarProps {
    actions?: Array<{
        id: string;
        icon?: React.ReactNode;
        label?: string;
        onClick?: () => void;
        emphasis?: 'low' | 'medium' | 'high';
        disabled?: boolean;
        hidden?: boolean;
    }>;
    onActionClick?: (actionId: string) => void;
    maxVisibleActions?: number;
    overflowIcon?: React.ReactNode;
}
```

## Esquemas de Cores

### Standard (Padrão)

- **Docked**: `surface-container` com border `outline-variant`
- **Floating**: `surface-container-high`
- **Uso**: Baixa ênfase, foco no conteúdo da página

### Vibrant (Vibrante)

- **Docked**: `primary-container` com border `primary`
- **Floating**: `primary-container`
- **Uso**: Alta ênfase, destaque para controles ou modo temporário

## Padrões de Uso

### Posicionamento

#### Docked Toolbar

- **Posição**: Sempre na parte inferior da tela
- **Conflitos**: Não usar com navigation bar simultaneamente
- **Responsivo**: Largura total em todas as telas

#### Floating Toolbar

- **Horizontal**: Margem mínima de 16dp das bordas
- **Vertical**: Margem mínima de 24dp das bordas
- **Telas grandes**: Pode ser posicionado em bordas opostas
- **Telas pequenas**: Não recomendado toolbar vertical

### Organização de Ações

#### Hierarquia de Ênfase

- **Alta**: Uma ação principal (filled button ou FAB)
- **Média**: Ações secundárias (tonal buttons)
- **Baixa**: Ações terciárias (icon buttons padrão)

#### Agrupamento

- **Relacionadas**: Usar `ToolbarGroup` com espaçamento adequado
- **Separadas**: Usar `ToolbarSeparator` entre grupos
- **Overflow**: Menu para ações que não cabem na tela

### Design Adaptativo

#### Telas Pequenas (Compact)

- **Docked**: Itens espaçados uniformemente
- **Floating**: Apenas ações essenciais, overflow menu
- **Vertical**: Evitar ou usar apenas com poucas ações

#### Telas Grandes (Medium+)

- **Docked**: Centralizar itens ou alinhar nas bordas
- **Floating**: Múltiplos toolbars possíveis
- **Vertical**: Recomendado oposto ao navigation rail

## Acessibilidade

### Atributos ARIA

- `role="toolbar"` no container principal
- `aria-label="Toolbar"` para identificação
- `role="group"` para agrupamentos lógicos
- `role="separator"` para separadores
- `aria-disabled="true"` para ações desabilitadas

### Navegação por Teclado

- **Tab**: Navega entre ações focalizáveis
- **Enter/Space**: Ativa a ação selecionada
- **Arrow keys**: Navegação dentro do toolbar (recomendado)

### Suporte a Screen Readers

- Labels descritivos para todas as ações
- Estados de ação comunicados adequadamente
- Estrutura semântica clara

## Comportamento de Scroll

### Opções Disponíveis

1. **Fixo**: Permanece visível durante scroll
2. **Hide on Scroll**: Anima para fora da tela
3. **Collapse to FAB**: Colapsa em uma única ação

### Implementação

```typescript
// Comportamento personalizado pode ser implementado
// através de event listeners de scroll
```

## Casos de Uso Comuns

### 1. Editor de Texto

```typescript
<FloatingToolbar colorScheme="standard">
  <ToolbarGroup>
    <ToolbarAction emphasis="low">
      <BoldIcon />
    </ToolbarAction>
    <ToolbarAction emphasis="low">
      <ItalicIcon />
    </ToolbarAction>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <ToolbarAction emphasis="medium">
      <SaveIcon />
    </ToolbarAction>
  </ToolbarGroup>
</FloatingToolbar>
```

### 2. Navigation Local

```typescript
<DockedToolbar>
  <ToolbarAction emphasis="low">
    <BackIcon />
  </ToolbarAction>
  <ToolbarSpacer />
  <ToolbarGroup>
    <ToolbarAction>Tab 1</ToolbarAction>
    <ToolbarAction>Tab 2</ToolbarAction>
  </ToolbarGroup>
  <ToolbarSpacer />
  <ToolbarAction emphasis="high">
    <SaveIcon />
  </ToolbarAction>
</DockedToolbar>
```

### 3. Ações Contextuais

```typescript
<ControlledToolbar
  variant="floating"
  actions={[
    { id: "edit", icon: <EditIcon />, emphasis: "medium" },
    { id: "delete", icon: <DeleteIcon />, emphasis: "low" },
    { id: "share", icon: <ShareIcon />, emphasis: "low" }
  ]}
  onActionClick={(id) => handleAction(id)}
  maxVisibleActions={3}
/>
```

## Integração com FAB

O Floating Toolbar pode ser combinado com um FAB para destacar a ação mais importante:

```typescript
<div className="relative">
  <FloatingToolbar position={{ bottom: 80 }}>
    {/* Ações secundárias */}
  </FloatingToolbar>
  <Fab
    variant="primary"
    position={{ bottom: 20, right: 20 }}
  >
    <AddIcon />
  </Fab>
</div>
```

## Temas e Customização

### Variáveis CSS Customizáveis

```css
--toolbar-docked-height: 80px;
--toolbar-floating-border-radius: 28px;
--toolbar-item-min-size: 48px;
--toolbar-spacing: 8px;
--toolbar-margin-horizontal: 16px;
--toolbar-margin-vertical: 24px;
```

### Classes Utilitárias

- `.toolbar-glass`: Efeito de vidro (backdrop-blur)
- `.toolbar-sticky`: Posicionamento sticky
- `.toolbar-shadow-none`: Remove elevação

## Considerações de Performance

- Use `asChild` quando possível para evitar elementos DOM extras
- Implemente virtualização para toolbars com muitas ações
- Use `React.memo` para ações que não mudam frequentemente
- Considere lazy loading para menus de overflow

## Migração de Versões Anteriores

### Do Bottom App Bar

- Substitua por `DockedToolbar`
- Ajuste ações para usar `ToolbarAction`
- Considere migrar para `FloatingToolbar` se apropriado

### De Implementações Customizadas

- Use `Toolbar` base para máxima flexibilidade
- Migre estilos customizados para variantes do sistema
- Aproveite o sistema de context para consistência

Este sistema de Toolbar fornece uma base sólida e flexível para implementar toolbars que seguem as especificações do Material Design 3, com foco em acessibilidade, performance e experiência do usuário.
