# Material Design 3 Text Fields (Inputs) - Guia de Uso

Este documento demonstra como usar os novos componentes de Text Field seguindo as especificações do Material Design 3.

## Tipos de Text Field

### 1. Outlined Text Field (Padrão)

Text fields delineados têm menos ênfase visual e são ideais para formulários simples.

```tsx
import { Input } from "@/components/md3/input";

<Input
  variant="outlined"
  label="Nome"
  placeholder="Digite seu nome"
  helperText="Como você gostaria de ser chamado"
/>
```

### 2. Filled Text Field

Text fields preenchidos têm mais ênfase visual e são ideais para formulários principais.

```tsx
<Input
  variant="filled"
  label="Email"
  type="email"
  placeholder="seu@email.com"
  helperText="Usaremos para enviar notificações"
/>
```

## Componentes Especializados

### SearchInput

Campo de busca com ícone de pesquisa e botão de limpar.

```tsx
import { SearchInput } from "@/components/md3/input";

<SearchInput
  variant="outlined"
  placeholder="Buscar produtos..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onClear={() => setSearchTerm("")}
/>
```

### PasswordInput

Campo de senha com funcionalidade mostrar/ocultar.

```tsx
import { PasswordInput } from "@/components/md3/input";

<PasswordInput
  variant="outlined"
  label="Senha"
  placeholder="Digite sua senha"
  helperText="Mínimo 8 caracteres"
/>
```

### Textarea

Área de texto multi-linha seguindo Material Design 3.

```tsx
import { Textarea } from "@/components/md3/input";

<Textarea
  variant="outlined"
  label="Comentários"
  placeholder="Deixe seus comentários aqui..."
  rows={4}
  helperText="Máximo 500 caracteres"
/>
```

## Estados de Validação

### Estado de Erro

```tsx
<Input
  variant="outlined"
  label="Email"
  type="email"
  error={true}
  helperText="Email inválido"
  value="email-invalido"
/>
```

### Estado de Sucesso

```tsx
<Input
  variant="outlined"
  label="Email"
  type="email"
  success={true}
  helperText="Email válido"
  value="usuario@exemplo.com"
/>
```

### Estado Desabilitado

```tsx
<Input
  variant="outlined"
  label="Campo Desabilitado"
  disabled={true}
  value="Não editável"
  helperText="Este campo está desabilitado"
/>
```

## Text Fields com Ícones

### Ícone à Esquerda

```tsx
<Input
  variant="outlined"
  label="Telefone"
  placeholder="(11) 99999-9999"
  leadingIcon={
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  }
/>
```

### Ícone à Direita com Ação

```tsx
<Input
  variant="outlined"
  label="Website"
  placeholder="https://exemplo.com"
  trailingIcon={
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
    </svg>
  }
  onTrailingIconClick={() => window.open(value, '_blank')}
/>
```

## Especificações Material Design 3

### Dimensões

- **Altura**: 56px (tanto filled quanto outlined)
- **Border radius**: 4px (extra-small)
- **Padding horizontal**: 16px (sem ícones), 52px (com ícones)
- **Filled padding vertical**: 28px top (com label), 8px bottom
- **Outlined padding vertical**: Centrado verticalmente

### Tipografia

- **Input text**: body-large (16px)
- **Label**: body-small (12px)
- **Helper text**: body-small (12px)

### Estados de Hover e Focus

- **Hover**: Bordas mais escuras, background hover (filled)
- **Focus**: Borda primary (2px para outlined), background focus (filled)
- **Error**: Cores error aplicadas em bordas e textos
- **Disabled**: Opacidade 38%, cores desabilitadas

### Cores (seguem tokens Material Design 3)

- **Outlined**: surface/on-surface com borda outline
- **Filled**: surface-variant com borda outline
- **Labels**: on-surface-variant
- **Placeholders**: on-surface-variant
- **Error**: error/on-error
- **Focus**: primary

## Exemplos Avançados

### Formulário Completo

```tsx
<form className="space-y-6">
  <Input
    variant="filled"
    label="Nome completo"
    placeholder="Digite seu nome"
    required
  />

  <Input
    variant="filled"
    label="Email"
    type="email"
    placeholder="seu@email.com"
    helperText="Nunca compartilharemos seu email"
  />

  <PasswordInput
    variant="filled"
    label="Senha"
    placeholder="Mínimo 8 caracteres"
    helperText="Use letras, números e símbolos"
  />

  <Textarea
    variant="filled"
    label="Bio"
    placeholder="Conte um pouco sobre você..."
    rows={3}
    helperText="Máximo 160 caracteres"
  />

  <SearchInput
    variant="outlined"
    placeholder="Buscar interesses..."
  />
</form>
```

### Validação em Tempo Real

```tsx
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");

const validateEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    setEmailError("Email é obrigatório");
    return false;
  } else if (!emailRegex.test(value)) {
    setEmailError("Email inválido");
    return false;
  } else {
    setEmailError("");
    return true;
  }
};

<Input
  variant="outlined"
  label="Email"
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  error={!!emailError}
  success={email && !emailError}
  helperText={emailError || "Email válido"}
/>
```

## Propriedades Disponíveis

### Input Base

- `variant`: "outlined" | "filled" (padrão: "outlined")
- `state`: "default" | "error" | "success"
- `size`: "default" | "small" | "large"
- `label`: string - Label flutuante
- `helperText`: string - Texto de ajuda/erro
- `error`: boolean - Estado de erro
- `success`: boolean - Estado de sucesso
- `leadingIcon`: ReactNode - Ícone à esquerda
- `trailingIcon`: ReactNode - Ícone à direita
- `onTrailingIconClick`: () => void - Ação do ícone à direita

### SearchInput Específico

- `onClear`: () => void - Função para limpar o campo

### Textarea Específico

- `rows`: number - Número de linhas (padrão: 3)

## Acessibilidade

### Recursos Implementados

- Labels associados corretamente via `htmlFor` e `id`
- Descrições via `aria-describedby` para helper text
- Estado de erro via `aria-invalid`
- IDs únicos gerados automaticamente se não fornecidos
- Suporte completo a leitores de tela
- Navegação por teclado funcional
- Estados visuais claros para focus/hover

### Boas Práticas

- Sempre forneça labels descritivos
- Use helper text para orientação adicional
- Implemente validação em tempo real quando apropriado
- Mantenha placeholders concisos
- Use estados visuais consistentes
- Teste com leitores de tela

## Diretrizes de Uso

### Quando usar Filled vs Outlined

- **Filled**: Formulários principais, campos importantes, mais ênfase visual
- **Outlined**: Formulários secundários, campos opcionais, menos ênfase visual

### Melhores Práticas

- Agrupe campos relacionados visualmente
- Use helper text para orientação e validação
- Mantenha labels concisos mas descritivos
- Implemente estados de erro informativos
- Considere o contraste e legibilidade
- Teste em diferentes tamanhos de tela
