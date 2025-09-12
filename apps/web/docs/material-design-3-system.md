# Material Design 3 Implementation

Este projeto implementa um sistema completo de Material Design 3 seguindo as especificações oficiais do Google.

## 📁 Estrutura do Sistema

### `/src/lib/material-design.ts`

Arquivo principal contendo todo o sistema M3:

- **Tokens de Design**: Cores, tipografia, espaçamento, elevação, shapes
- **Componentes M3**: Utilitários para criar componentes compatíveis com M3
- **Sistema de Motion**: Animações e transições seguindo especificações M3
- **Sistema de Ícones**: Integração com FontAwesome seguindo padrões M3

### `/src/components/examples/m3-examples.tsx`

Exemplos práticos demonstrando o uso do sistema M3:

- Botões com diferentes variants e tamanhos
- Cards com diferentes níveis de elevação
- Inputs com estilo M3
- Demonstrações de tipografia
- Exemplos de animações e motion

## 🎨 Componentes do Sistema

### 1. **Material Elevation**

Sistema de elevação tonal seguindo M3:

- 6 níveis de elevação (`level0` a `level5`)
- Mapeamento de cores de superfície
- Especificações de sombra oficiais
- Função utilitária `getSurfaceElevation()`

```typescript
// Uso
const cardClasses = getSurfaceElevation(2); // nível 2 de elevação
```

### 2. **Material Shapes**

Sistema de formas com corner radius tokens:

- Shapes básicos: `xs`, `sm`, `md`, `lg`, `xl`, `full`
- Shapes específicos por componente (button, card, textField, etc.)
- Suporte a animações de morph
- Função utilitária `getShape()`

```typescript
// Uso
const buttonShape = getShape('md'); // shape médio
```

### 3. **Material Typography**

Sistema completo de tipografia M3:

- **Display**: `displayLarge`, `displayMedium`, `displaySmall`
- **Headlines**: `headlineLarge`, `headlineMedium`, `headlineSmall`
- **Titles**: `titleLarge`, `titleMedium`, `titleSmall`
- **Body**: `bodyLarge`, `bodyMedium`, `bodySmall`
- **Labels**: `labelLarge`, `labelMedium`, `labelSmall`
- **Editorial**: Tratamentos especiais para conteúdo editorial

```typescript
// Uso
const styles = applyTypography('headlineMedium');
```

### 4. **Material Motion**

Sistema de animações e transições:

- **Durations**: Tokens de duração para diferentes tipos de animação
- **Easing Curves**: Curvas oficiais M3 (standard, emphasized, etc.)
- **Transitions**: Propriedades de transição pré-configuradas
- **Classes**: Classes CSS pré-definidas para animações comuns

```typescript
// Uso
const transition = applyMotion('elevation');
```

### 5. **Material Icons**

Sistema de ícones integrado com FontAwesome:

- Especificações de tamanho oficiais M3
- Estados de ícone (enabled, disabled, etc.)
- Configurações para botões de ícone
- Mapeamento semântico

## 🛠️ Funções Utilitárias

### Criação de Componentes M3

#### `createM3ButtonClasses(variant, size)`

Cria classes para botões seguindo M3:

- **Variants**: `filled`, `outlined`, `text`
- **Sizes**: `sm`, `md`, `lg`

```typescript
const buttonClasses = createM3ButtonClasses('filled', 'md');
```

#### `createM3CardClasses(elevation)`

Cria classes para cards com elevação M3:

```typescript
const cardClasses = createM3CardClasses('level2');
```

#### `createM3InputClasses()`

Cria classes para inputs seguindo M3:

```typescript
const inputClasses = createM3InputClasses();
```

#### `createM3IconButtonClasses(size)`

Cria classes para botões de ícone:

```typescript
const iconButtonClasses = createM3IconButtonClasses('medium');
```

### Aplicação de Estilos

#### `applyElevation(level)`

Aplica estilos de elevação:

```typescript
const elevationStyles = applyElevation('level3');
```

#### `applyTypography(variant)`

Aplica estilos tipográficos:

```typescript
const typographyStyles = applyTypography('headlineLarge');
```

#### `applyMotion(transitionType)`

Aplica transições de movimento:

```typescript
const motionStyles = applyMotion('color');
```

## 🎯 Como Usar

### 1. Importar o Sistema

```typescript
import {
    cn,
    createM3ButtonClasses,
    createM3CardClasses,
    createM3InputClasses,
    materialMotion,
} from '@/lib/material-design';
```

### 2. Criar Componentes

```jsx
// Botão M3
<button className={createM3ButtonClasses('filled', 'md')}>
    Click me
</button>

// Card M3
<div className={createM3CardClasses('level1')}>
    <h3 className="text-title-medium">Card Title</h3>
    <p className="text-body-medium">Card content</p>
</div>

// Input M3
<input
    className={createM3InputClasses()}
    placeholder="Enter text"
/>
```

### 3. Usar Classes Tailwind M3

O sistema define classes Tailwind personalizadas:

```jsx
<h1 className="text-display-large text-on-surface">
    Large Display Text
</h1>

<p className="text-body-medium text-on-surface-variant">
    Body text with variant color
</p>
```

## 📚 Especificações Seguidas

Este sistema implementa as especificações oficiais do Material Design 3:

1. **[Elevation](https://m3.material.io/styles/elevation/overview)**: Sistema tonal de elevação
2. **[Shape](https://m3.material.io/styles/shape/overview)**: Corner radius e formas de componentes
3. **[Typography](https://m3.material.io/styles/typography/overview)**: Escala tipográfica completa
4. **[Motion](https://m3.material.io/styles/motion/overview)**: Transições e animações
5. **[Color](https://m3.material.io/styles/color/overview)**: Sistema de cores dinâmico

## ✅ Status da Implementação

- ✅ Sistema de elevação tonal completo
- ✅ Sistema de shapes com corner radius tokens
- ✅ Tipografia completa seguindo M3
- ✅ Sistema de motion com easing curves oficiais
- ✅ Integração de ícones com FontAwesome
- ✅ Funções utilitárias para criação de componentes
- ✅ Compatibilidade com Tailwind CSS
- ✅ Exemplos práticos de uso
- ✅ Documentação completa

## 🔄 Migração

Para usar o novo sistema M3 em componentes existentes:

1. Importe as funções necessárias
2. Substitua classes manuais pelas funções M3
3. Use as novas classes Tailwind tipográficas
4. Aplique elevação usando `getSurfaceElevation()`
5. Use motion tokens para transições consistentes

## 📖 Exemplos Completos

Veja `/src/components/examples/m3-examples.tsx` para exemplos detalhados de todos os componentes e funcionalidades do sistema M3.

## 🎨 Personalização

O sistema é extensível e permite personalização mantendo compatibilidade com M3:

- Modifique tokens de cor no Tailwind config
- Adicione novos variants de componentes
- Estenda o sistema de shapes conforme necessário
- Customize durações e easing curves

---

**Resultado**: Sistema Material Design 3 completo e pronto para uso, seguindo todas as especificações oficiais do Google.
