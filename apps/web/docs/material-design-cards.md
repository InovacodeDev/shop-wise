# Material Design 3 Cards - Guia de Uso

Este documento demonstra como usar os novos componentes Card seguindo as especificações do Material Design 3.

## Variantes de Card

### 1. Elevated Card (Padrão)

Cards elevados têm sombra, proporcionando mais separação do fundo.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/md3/card";

<Card variant="elevated" interactive={true}>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card elevado.</p>
  </CardContent>
</Card>
```

### 2. Filled Card

Cards preenchidos fornecem separação sutil do fundo.

```tsx
<Card variant="filled" interactive={true}>
  <CardHeader>
    <CardTitle>Card Preenchido</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card preenchido.</p>
  </CardContent>
</Card>
```

### 3. Outlined Card

Cards delineados têm uma borda visual ao redor do container.

```tsx
<Card variant="outlined">
  <CardHeader>
    <CardTitle>Card Delineado</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card delineado.</p>
  </CardContent>
</Card>
```

## Componentes de Conteúdo

### Estrutura Completa do Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardSubhead,
  CardContent,
  CardSupportingText,
  CardMedia,
  CardFooter
} from "@/components/md3/card";

<Card variant="elevated" interactive={true}>
  <CardMedia>
    <img src="/image.jpg" alt="Descrição" />
  </CardMedia>

  <CardHeader>
    <CardTitle>Título Principal</CardTitle>
    <CardSubhead>Subtítulo menor</CardSubhead>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>

  <CardContent>
    <CardSupportingText>
      <p>Texto de apoio com conteúdo detalhado...</p>
    </CardSupportingText>
  </CardContent>

  <CardFooter>
    <Button>Ação Principal</Button>
    <Button variant="text">Ação Secundária</Button>
  </CardFooter>
</Card>
```

## Propriedades

### Card

- `variant`: "elevated" | "filled" | "outlined" (padrão: "elevated")
- `interactive`: boolean - adiciona efeitos hover e escala quando true

### Componentes de Texto

Todos os componentes seguem as especificações de tipografia Material Design 3:

- `CardTitle`: usa headline-small (24px)
- `CardDescription`: usa body-medium (14px)
- `CardSubhead`: usa body-small (12px)
- `CardSupportingText`: usa body-medium (14px)

## Especificações Material Design 3

### Espaçamento

- Padding interno: 16px (materialSpacing.md)
- Gap entre ações: 8px (materialSpacing.sm)
- Border radius: 12px (materialShapes.components.card)

### Elevação

- Elevated: Level 1 shadow
- Filled: Nenhuma sombra
- Outlined: Nenhuma sombra, apenas borda

### Cores

Seguem o sistema de tokens de cor Material Design 3:

- Elevated: surface/on-surface
- Filled: surface-variant/on-surface-variant
- Outlined: surface/on-surface com borda outline

## Casos de Uso

### Cards Interativos (Clicáveis)

Use `interactive={true}` para cards que respondem a interação:

```tsx
<Card variant="elevated" interactive={true} onClick={handleClick}>
  {/* conteúdo */}
</Card>
```

### Cards de Informação Estática

Para cards apenas informativos, omita `interactive`:

```tsx
<Card variant="outlined">
  {/* conteúdo */}
</Card>
```

### Cards com Mídia

Use `CardMedia` para imagens, vídeos ou thumbnails:

```tsx
<Card variant="filled">
  <CardMedia>
    <img src="/thumbnail.jpg" alt="Preview" className="w-full h-48 object-cover" />
  </CardMedia>
  <CardHeader>
    <CardTitle>Card com Mídia</CardTitle>
  </CardHeader>
</Card>
```

## Diretrizes de Acessibilidade

- Cards interativos devem ter foco visível
- Textos devem atender aos padrões de contraste WCAG
- Use textos alternativos em imagens dentro de CardMedia
- Estruture o conteúdo hierarquicamente usando os componentes apropriados
