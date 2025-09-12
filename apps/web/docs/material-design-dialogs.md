# Material Design 3 Dialogs - Guia de Uso

Este documento demonstra como usar os novos componentes Dialog seguindo as especificações do Material Design 3.

## Tipos de Dialog

### 1. Basic Dialog

Diálogos básicos interrompem usuários com informações urgentes, detalhes ou ações. Casos de uso comuns incluem alertas, seleção rápida e confirmação.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/md3/dialog";
import { Button } from "@/components/md3/button";

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent variant="basic">
    <DialogHeader>
      <DialogTitle>Confirmar ação</DialogTitle>
      <DialogDescription>
        Esta ação não pode ser desfeita. Deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="text">Cancelar</Button>
      </DialogClose>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 2. Full-screen Dialog

Diálogos de tela cheia preenchem toda a tela, contendo ações que requerem uma série de tarefas para completar. Apenas para telas pequenas (mobile).

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Criar Evento</Button>
  </DialogTrigger>
  <DialogContent variant="fullscreen" showCloseButton={false}>
    <DialogFullscreenHeader>
      <DialogTitle>Criar Novo Evento</DialogTitle>
      <DialogClose asChild>
        <Button variant="text" size="icon">
          <FontAwesomeIcon icon={faXmark} />
        </Button>
      </DialogClose>
    </DialogFullscreenHeader>
    <DialogBody>
      {/* Conteúdo do formulário */}
    </DialogBody>
    <DialogFooter>
      <Button variant="text">Cancelar</Button>
      <Button>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Componentes Disponíveis

### Componentes Principais

- `Dialog`: Container raiz
- `DialogTrigger`: Elemento que abre o dialog
- `DialogContent`: Conteúdo principal do dialog
- `DialogClose`: Elemento que fecha o dialog
- `DialogOverlay`: Overlay de fundo (scrim)

### Componentes de Layout

- `DialogHeader`: Área do cabeçalho (título + descrição)
- `DialogTitle`: Título principal (headline)
- `DialogDescription`: Texto de apoio
- `DialogFooter`: Área de ações (botões)
- `DialogBody`: Corpo scrollável do dialog
- `DialogFullscreenHeader`: Cabeçalho para dialogs full-screen

### Componentes Opcionais

- `DialogIcon`: Ícone acima do título
- `DialogDivider`: Separador visual

## Especificações Material Design 3

### Basic Dialog

- **Largura**: Min 280px, Max 560px
- **Border radius**: 28dp (extra-large)
- **Elevation**: Level 3
- **Padding**: 24dp nas laterais
- **Scrim**: 40% opacidade com blur

### Full-screen Dialog

- **Tamanho**: Tela completa
- **Border radius**: 0dp
- **Header height**: 56dp
- **Elevation**: Nenhuma

### Tipografia

- **Title**: headline-small (24px)
- **Description**: body-medium (14px)
- **Buttons**: label-large (14px)

### Cores

Seguem o sistema de tokens Material Design 3:

- **Container**: surface-container-high
- **Text**: on-surface
- **Supporting text**: on-surface-variant
- **Scrim**: scrim/40

## Exemplos Avançados

### Dialog com Ícone

```tsx
<DialogContent variant="basic">
  <DialogHeader>
    <DialogIcon>
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />
    </DialogIcon>
    <DialogTitle>Atenção</DialogTitle>
    <DialogDescription>
      Esta ação removerá permanentemente todos os dados.
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <DialogClose asChild>
      <Button variant="text">Cancelar</Button>
    </DialogClose>
    <Button variant="filled" className="bg-error text-on-error">
      Remover
    </Button>
  </DialogFooter>
</DialogContent>
```

### Dialog com Conteúdo Scrollável

```tsx
<DialogContent variant="basic">
  <DialogHeader>
    <DialogTitle>Termos de Uso</DialogTitle>
    <DialogDescription>
      Leia os termos antes de aceitar
    </DialogDescription>
  </DialogHeader>
  <DialogBody>
    <div className="space-y-4">
      {/* Conteúdo longo aqui */}
    </div>
  </DialogBody>
  <DialogDivider />
  <DialogFooter>
    <DialogClose asChild>
      <Button variant="text">Recusar</Button>
    </DialogClose>
    <Button>Aceitar</Button>
  </DialogFooter>
</DialogContent>
```

### Dialog Responsivo

```tsx
// Em telas pequenas usa full-screen, em telas maiores usa basic
<DialogContent
  variant="basic"
  className="sm:max-w-[560px] max-sm:w-screen max-sm:h-screen max-sm:max-w-none"
>
  {/* conteúdo */}
</DialogContent>
```

## Propriedades

### DialogContent

- `variant`: "basic" | "fullscreen" (padrão: "basic")
- `showCloseButton`: boolean (padrão: true para basic)

### Acessibilidade

- Suporte completo a leitores de tela
- Navegação por teclado (Tab, Escape)
- Foco automaticamente movido para o dialog quando aberto
- Foco retornado ao trigger quando fechado
- ARIA labels e descriptions aplicados automaticamente

## Diretrizes de Uso

### Quando usar Basic Dialog

- Confirmações simples
- Alertas urgentes
- Seleção rápida de opções
- Formulários curtos (poucos campos)

### Quando usar Full-screen Dialog

- Formulários complexos com muitos campos
- Tarefas que requerem múltiplas etapas
- Apenas em dispositivos móveis
- Quando outras dialogs podem aparecer sobre ele

### Boas Práticas

- Máximo de 2 ações por dialog
- Ação confirmatória sempre à direita
- Use headlines claros e específicos
- Evite texto longo - prefira conteúdo scrollável
- Para errors de rede, use basic dialog
- Para errors de campo, use validação inline

### O que evitar

- Não use para informações de baixa prioridade (use snackbar)
- Não coloque ação dismissiva à direita da confirmatória
- Não use headlines ambíguas como "Tem certeza?"
- Não desabilite ações dismissivas (apenas confirmatórias)
- Não adicione terceira ação como "Saiba mais"
