# Material Design 3 Bottom Sheets & Side Sheets Components

Sistema completo de sheets que segue as especificações do Material Design 3, fornecendo containers deslizantes para conteúdo secundário e ações contextuais.

## Visão Geral

O sistema de Sheets do MD3 oferece duas variantes principais:

- **Bottom Sheets**: Deslizam da parte inferior da tela, ideais para ações contextuais e conteúdo suplementar
- **Side Sheets**: Deslizam das laterais da tela, ideais para navegação secundária e painéis de configuração

## Componentes Disponíveis

### Componentes Base

- `Sheet` - Container root baseado em Radix Dialog
- `SheetTrigger` - Elemento que abre o sheet
- `SheetContent` - Container principal do conteúdo
- `SheetOverlay` - Overlay de background (modal)
- `SheetClose` - Elemento que fecha o sheet

### Componentes de Estrutura

- `SheetHeader` - Cabeçalho com título e descrição
- `SheetBody` - Área principal de conteúdo com scroll
- `SheetFooter` - Rodapé com ações
- `SheetTitle` - Título do sheet
- `SheetDescription` - Descrição/subtítulo do sheet

### Componentes Especializados

- `SheetDragHandle` - Alça de arraste para sheets inferiores
- `SheetCloseButton` - Botão de fechamento integrado
- `BottomSheet` - Bottom sheet pré-configurado
- `SideSheet` - Side sheet pré-configurado

## Especificações Técnicas

### Bottom Sheets

#### Dimensões

- **Altura mínima**: 56dp (14 units)
- **Altura máxima padrão**: 80% da viewport
- **Altura compacta**: 50% da viewport
- **Altura expandida**: 95% da viewport
- **Border radius**: 28dp (superior)
- **Drag handle**: 32dp largura x 4dp altura

#### Comportamentos

- **Modal**: Com overlay, bloqueia interação com conteúdo de fundo
- **Standard**: Sem overlay, permite interação simultânea
- **Draggable**: Arraste para redimensionar ou fechar
- **Snap points**: Posições predefinidas de altura

### Side Sheets

#### Dimensões

- **Largura padrão**: 360dp (max-w-sm)
- **Largura compacta**: 320dp (max-w-xs)
- **Largura expandida**: 400dp (max-w-md)
- **Altura**: 100% da viewport
- **Border radius**: 28dp (lateral externa)
- **Posicionamento**: Esquerda ou direita

#### Comportamentos

- **Modal**: Com overlay, experiência focada
- **Standard**: Sem overlay, funciona como painel lateral
- **Push content**: Empurra conteúdo principal (não implementado por padrão)

## API dos Componentes

### Sheet (Base)

```typescript
interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
}
```

### SheetContent (Principal)

```typescript
interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    side?: 'bottom' | 'left' | 'right' | 'top';
    variant?: 'modal' | 'standard';
    size?: 'default' | 'compact' | 'expanded';
    dragEnabled?: boolean;
    snapPoints?: number[];
    onSnapPointChange?: (snapPoint: number) => void;
    dragHandle?: boolean;
    closeButton?: boolean;
}
```

### BottomSheet (Pré-configurado)

```typescript
interface BottomSheetProps extends Omit<SheetContentProps, 'side'> {
    modal?: boolean;
}
```

### SideSheet (Pré-configurado)

```typescript
interface SideSheetProps extends Omit<SheetContentProps, 'side'> {
    side?: 'left' | 'right';
    modal?: boolean;
}
```

## Variantes e Estados

### Bottom Sheet Variants

#### Modal Bottom Sheet

- **Uso**: Ações focadas, formulários, confirmações
- **Comportamento**: Overlay, drag-to-dismiss, backdrop click to close
- **Elevação**: Nível 3 (shadow-lg)

#### Standard Bottom Sheet

- **Uso**: Controles persistentes, player de mídia, mini-map
- **Comportamento**: Sem overlay, sempre visível, drag para redimensionar
- **Elevação**: Nível 1 (border superior)

### Side Sheet Variants

#### Modal Side Sheet

- **Uso**: Navegação temporária, filtros, configurações
- **Comportamento**: Overlay, slide-in/out, focus trap
- **Elevação**: Nível 3 (shadow-lg)

#### Standard Side Sheet

- **Uso**: Navegação persistente, painel de propriedades
- **Comportamento**: Sem overlay, empurra conteúdo, sempre acessível
- **Elevação**: Nível 1 (border lateral)

## Padrões de Uso

### Bottom Sheets

#### Quando Usar

- **Ações contextuais**: Compartilhar, editar, excluir
- **Formulários curtos**: Filtros, configurações rápidas
- **Conteúdo suplementar**: Detalhes, informações extras
- **Confirmações**: Ações destrutivas ou importantes

#### Estrutura Recomendada

```typescript
<Sheet>
  <SheetTrigger>Abrir ações</SheetTrigger>
  <BottomSheet>
    <SheetHeader>
      <SheetTitle>Ações do item</SheetTitle>
      <SheetDescription>Escolha uma ação para continuar</SheetDescription>
    </SheetHeader>
    <SheetBody>
      {/* Lista de ações ou conteúdo */}
    </SheetBody>
    <SheetFooter>
      {/* Ações primárias */}
    </SheetFooter>
  </BottomSheet>
</Sheet>
```

### Side Sheets

#### Quando Usar

- **Navegação secundária**: Menus, filtros avançados
- **Painéis de detalhes**: Propriedades, configurações
- **Conteúdo relacionado**: Chat, comentários, histórico
- **Formulários longos**: Multi-step, configurações complexas

#### Estrutura Recomendada

```typescript
<Sheet>
  <SheetTrigger>Abrir painel</SheetTrigger>
  <SideSheet side="right">
    <SheetHeader>
      <SheetTitle>Configurações</SheetTitle>
    </SheetHeader>
    <SheetBody>
      {/* Formulários ou navegação */}
    </SheetBody>
    <SheetFooter>
      {/* Botões de ação */}
    </SheetFooter>
  </SideSheet>
</Sheet>
```

## Snap Points (Bottom Sheets)

### Configuração

```typescript
<BottomSheet
  snapPoints={[0.25, 0.5, 0.8]} // 25%, 50%, 80% da altura
  onSnapPointChange={(point) => console.log('Snap:', point)}
>
  {/* Conteúdo */}
</BottomSheet>
```

### Comportamentos

- **Drag para snap**: Arraste para a posição mais próxima
- **Swipe to dismiss**: Arraste para baixo para fechar
- **Momentum**: Animação suave entre posições

## Design Responsivo

### Breakpoints

#### Mobile (< 768px)

- **Bottom Sheets**: Largura total, altura até 95%
- **Side Sheets**: Largura total em modal, sobrepõe conteúdo

#### Tablet (768px - 1024px)

- **Bottom Sheets**: Largura total, altura até 80%
- **Side Sheets**: Largura fixa (360dp), pode ser standard

#### Desktop (> 1024px)

- **Bottom Sheets**: Largura máxima 600dp, centralizado
- **Side Sheets**: Largura fixa, integrado ao layout

### Adaptações

```typescript
// Responsivo baseado em breakpoint
const useResponsiveSheet = () => {
    const [isMobile] = useState(window.innerWidth < 768);

    return {
        variant: isMobile ? 'modal' : 'standard',
        size: isMobile ? 'expanded' : 'default',
    };
};
```

## Acessibilidade

### Atributos ARIA

- `role="dialog"` no container principal
- `aria-modal="true"` para sheets modais
- `aria-labelledby` conectando ao título
- `aria-describedby` conectando à descrição
- `aria-expanded` no trigger

### Navegação por Teclado

- **Escape**: Fecha sheet modal
- **Tab**: Navegação interna (focus trap em modais)
- **Enter/Space**: Ativa trigger
- **Arrow keys**: Navegação em listas internas

### Screen Readers

- Anúncio de abertura/fechamento
- Contexto claro do conteúdo
- Estados de loading/erro comunicados
- Instruções de interação quando necessário

## Animações e Transições

### Timing

- **Entrada**: 300ms ease-out
- **Saída**: 250ms ease-in
- **Drag**: Follow touch com spring physics
- **Snap**: 200ms ease-out

### Propriedades Animadas

- **Transform**: translateX/Y para slide
- **Opacity**: backdrop fade in/out
- **Height**: bottom sheet resize (se configurado)
- **Filter**: backdrop blur effect

## Performance

### Otimizações

- **Lazy content**: Carrega conteúdo apenas quando aberto
- **Virtual scrolling**: Para listas longas
- **Portal rendering**: Evita reflows desnecessários
- **Gesture optimization**: Throttle de eventos drag

### Bundle Splitting

```typescript
// Lazy loading de sheets complexos
const AdvancedBottomSheet = lazy(() => import('./AdvancedBottomSheet'));
```

## Estados de Erro e Loading

### Loading States

```typescript
<BottomSheet>
  <SheetBody>
    {loading ? (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    ) : (
      <Content />
    )}
  </SheetBody>
</BottomSheet>
```

### Error States

```typescript
<BottomSheet>
  <SheetBody>
    {error ? (
      <div className="text-center p-8">
        <p className="text-error">Erro ao carregar conteúdo</p>
        <Button onClick={retry}>Tentar novamente</Button>
      </div>
    ) : (
      <Content />
    )}
  </SheetBody>
</BottomSheet>
```

## Integração com Formulários

### Validação

```typescript
<BottomSheet>
  <form onSubmit={handleSubmit}>
    <SheetBody>
      <FormFields />
    </SheetBody>
    <SheetFooter>
      <Button type="submit" disabled={!isValid}>
        Salvar
      </Button>
    </SheetFooter>
  </form>
</BottomSheet>
```

### Multi-step

```typescript
<BottomSheet>
  <SheetHeader>
    <SheetTitle>Passo {currentStep} de {totalSteps}</SheetTitle>
  </SheetHeader>
  <SheetBody>
    <StepContent step={currentStep} />
  </SheetBody>
  <SheetFooter>
    <Button onClick={previousStep} disabled={isFirstStep}>
      Anterior
    </Button>
    <Button onClick={nextStep} disabled={isLastStep}>
      Próximo
    </Button>
  </SheetFooter>
</BottomSheet>
```

## Temas e Customização

### Variáveis CSS

```css
--sheet-border-radius: 28px;
--sheet-max-width: 360px;
--sheet-backdrop-color: rgba(0, 0, 0, 0.32);
--sheet-drag-handle-width: 32px;
--sheet-drag-handle-height: 4px;
--sheet-animation-duration: 300ms;
--sheet-elevation-modal: 0 8px 32px rgba(0, 0, 0, 0.12);
--sheet-elevation-standard: 0 1px 8px rgba(0, 0, 0, 0.08);
```

### Classes Customizadas

```typescript
<BottomSheet className="custom-sheet">
  {/* Conteúdo customizado */}
</BottomSheet>
```

```css
.custom-sheet {
    --sheet-border-radius: 16px;
    background: linear-gradient(135deg, ...);
}
```

## Casos de Uso Comuns

### 1. Action Sheet

```typescript
<Sheet>
  <SheetTrigger>⋯</SheetTrigger>
  <BottomSheet size="compact">
    <SheetBody className="p-0">
      <div className="space-y-0">
        <ActionItem icon="share">Compartilhar</ActionItem>
        <ActionItem icon="edit">Editar</ActionItem>
        <ActionItem icon="delete" destructive>Excluir</ActionItem>
      </div>
    </SheetBody>
  </BottomSheet>
</Sheet>
```

### 2. Filter Panel

```typescript
<Sheet>
  <SheetTrigger>Filtros</SheetTrigger>
  <SideSheet side="right">
    <SheetHeader>
      <SheetTitle>Filtrar resultados</SheetTitle>
    </SheetHeader>
    <SheetBody>
      <FilterForm />
    </SheetBody>
    <SheetFooter>
      <Button variant="outline" onClick={clearFilters}>
        Limpar
      </Button>
      <Button onClick={applyFilters}>
        Aplicar
      </Button>
    </SheetFooter>
  </SideSheet>
</Sheet>
```

### 3. Details Panel

```typescript
<Sheet>
  <SheetTrigger>Ver detalhes</SheetTrigger>
  <SideSheet side="right" size="expanded">
    <SheetHeader>
      <SheetTitle>{item.name}</SheetTitle>
      <SheetDescription>Informações detalhadas</SheetDescription>
    </SheetHeader>
    <SheetBody>
      <ItemDetails item={item} />
    </SheetBody>
  </SideSheet>
</Sheet>
```

Este sistema de Sheets fornece uma base robusta e flexível para implementar bottom sheets e side sheets que seguem as especificações do Material Design 3, com foco em acessibilidade, performance e experiência do usuário superior.
