# Material Design 3 Carousel - Guia de Uso

Este documento demonstra como usar o novo componente Carousel seguindo as especificações do Material Design 3.

## Layouts de Carousel

### 1. Multi-browse

Layout ideal para navegar por muitos itens visuais de uma só vez, como fotos ou feeds de eventos.

```tsx
import { Carousel, CarouselContent, CarouselItem } from "@/components/md3/carousel";

<Carousel
  layout="multi-browse"
  scrollBehavior="snap"
  header="Produtos em Destaque"
  showAllButton={true}
  onShowAll={() => navigateToAllProducts()}
>
  <CarouselContent>
    <CarouselItem size="large">
      <img src="product1.jpg" alt="Produto 1" />
    </CarouselItem>
    <CarouselItem size="medium">
      <img src="product2.jpg" alt="Produto 2" />
    </CarouselItem>
    <CarouselItem size="small">
      <img src="product3.jpg" alt="Produto 3" />
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

### 2. Uncontained (Padrão)

Layout mais similar ao carousel tradicional, onde os itens têm tamanho único e fluem além da borda da tela.

```tsx
<Carousel layout="uncontained" scrollBehavior="default">
  <CarouselContent>
    <CarouselItem>
      <div className="bg-card rounded-lg p-4">
        <h3>Item 1</h3>
        <p>Descrição do item...</p>
      </div>
    </CarouselItem>
    <CarouselItem>
      <div className="bg-card rounded-lg p-4">
        <h3>Item 2</h3>
        <p>Descrição do item...</p>
      </div>
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

### 3. Hero

Layout ideal para destacar conteúdo que precisa de mais atenção, como miniaturas de filmes, shows ou outros meios.

```tsx
<Carousel
  layout="hero"
  scrollBehavior="snap"
  header="Filmes Recomendados"
>
  <CarouselContent>
    <CarouselItem size="large">
      <div className="relative aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
        <img src="movie1.jpg" alt="Filme 1" className="w-full h-full object-cover" />
        <CarouselText
          title="Avatar: O Caminho da Água"
          description="Uma épica aventura submarina"
          label="Ação"
        />
      </div>
    </CarouselItem>
    <CarouselItem size="small">
      <img src="movie2.jpg" alt="Filme 2" className="w-full h-full object-cover rounded-lg" />
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

### 4. Center-aligned Hero

Quando o layout hero é centralizado, adiciona um item de visualização adicional na borda inicial.

```tsx
<Carousel
  layout="center-aligned-hero"
  scrollBehavior="snap"
>
  <CarouselContent>
    <CarouselItem size="small">
      <img src="preview1.jpg" alt="Preview 1" />
    </CarouselItem>
    <CarouselItem size="large">
      <div className="relative">
        <img src="featured.jpg" alt="Item em Destaque" />
        <CarouselText title="Item Central" />
      </div>
    </CarouselItem>
    <CarouselItem size="small">
      <img src="preview2.jpg" alt="Preview 2" />
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

### 5. Full-screen

Layout ideal para experiências imersivas como artigos de vídeo, manchetes em destaque ou itens visualmente ricos.

```tsx
<Carousel
  layout="full-screen"
  scrollBehavior="snap"
  className="h-screen"
>
  <CarouselContent>
    <CarouselItem>
      <div className="relative h-full bg-cover bg-center" style={{backgroundImage: 'url("hero1.jpg")'}}>
        <CarouselText
          title="Experiência Imersiva"
          description="Conteúdo em tela cheia com texto sobreposto"
          adaptive={true}
        />
      </div>
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

## Componentes Especializados

### CarouselText

Componente para adicionar texto sobre itens do carousel com adaptação responsiva.

```tsx
import { CarouselText } from "@/components/md3/carousel";

<CarouselItem>
  <div className="relative">
    <img src="image.jpg" alt="Imagem" />
    <CarouselText
      title="Título Principal"
      description="Descrição detalhada do item"
      label="Categoria"
      adaptive={true} // Adapta o texto baseado no tamanho da tela
    />
  </div>
</CarouselItem>
```

### CarouselIndicators

Indicadores de pontos opcionais para navegação visual.

```tsx
import { CarouselIndicators } from "@/components/md3/carousel";

<Carousel>
  <CarouselContent>
    {/* Seus itens */}
  </CarouselContent>
  <CarouselIndicators />
</Carousel>
```

## Acessibilidade Material Design 3

### Botão "Ver Todos" (Recomendado)

Para páginas com rolagem vertical, é obrigatório fornecer uma maneira acessível de visualizar todos os itens.

```tsx
// Carousel sem cabeçalho - usa botão "Ver todos" abaixo
<Carousel
  showAllButton={true}
  onShowAll={() => router.push('/todos-os-itens')}
>
  <CarouselContent>
    {/* Itens do carousel */}
  </CarouselContent>
</Carousel>

// Carousel com cabeçalho - usa ícone de seta
<Carousel
  header="Minha Coleção"
  showAllButton={true}
  onShowAll={() => router.push('/colecao-completa')}
>
  <CarouselContent>
    {/* Itens do carousel */}
  </CarouselContent>
</Carousel>
```

### Navegação por Teclado

```
- Setas Esquerda/Direita: Navega entre itens
- Setas Cima/Baixo: Sai do carousel para próximo elemento da página
- Enter/Espaço: Ativa o item focado
- Tab: Navega pelos elementos focáveis
```

### Labels de Acessibilidade

```tsx
<Carousel aria-label="Galeria de produtos">
  <CarouselContent>
    <CarouselItem aria-label="1 de 5">
      {/* Conteúdo do item */}
    </CarouselItem>
  </CarouselContent>
</Carousel>
```

## Especificações Material Design 3

### Dimensões e Espaçamento

- **Container padding**: 16dp nas laterais (exceto full-screen: 0dp)
- **Gap entre itens**: 8dp
- **Small items**: 40-56dp de largura (dinâmico)
- **Large items**: Largura máxima customizável (padrão: 300px)
- **Full-screen**: Sem espaçamento, borda a borda

### Comportamento de Rolagem

- **Default**: Rolagem padrão, recomendada para layout uncontained
- **Snap**: Itens se alinham ao layout grid, recomendado para multi-browse, hero e full-screen

### Motion Reduzido

O componente detecta automaticamente `prefers-reduced-motion` e:

- Remove efeitos de parallax
- Todos os itens mantêm o mesmo tamanho
- Remove transições de expansão/contração

## Exemplos Avançados

### Carousel de Produtos com Texto Adaptativo

```tsx
<Carousel
  layout="multi-browse"
  scrollBehavior="snap"
  header="Ofertas da Semana"
  showAllButton={true}
  onShowAll={() => router.push('/ofertas')}
>
  <CarouselContent>
    {products.map((product, index) => (
      <CarouselItem
        key={product.id}
        size={index === 0 ? "large" : index === 1 ? "medium" : "small"}
      >
        <div className="relative bg-card rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover"
          />
          <CarouselText
            title={product.name}
            description={`R$ ${product.price.toFixed(2)}`}
            label={product.category}
            adaptive={true}
          />
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselIndicators />
</Carousel>
```

### Carousel Hero para Mídia

```tsx
<Carousel
  layout="hero"
  scrollBehavior="snap"
  className="mb-8"
>
  <CarouselContent>
    {mediaItems.map((item) => (
      <CarouselItem key={item.id} size="large">
        <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay com informações */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <CarouselText
            title={item.title}
            description={item.description}
            label={`${item.duration} • ${item.genre}`}
          />

          {/* Play button */}
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors">
            <FontAwesomeIcon icon={faPlay} className="h-6 w-6 text-black ml-1" />
          </button>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

### Carousel Full-Screen para Histórias

```tsx
<Carousel
  layout="full-screen"
  scrollBehavior="snap"
  className="h-screen"
>
  <CarouselContent>
    {stories.map((story) => (
      <CarouselItem key={story.id}>
        <div
          className="relative h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${story.backgroundImage})` }}
        >
          {/* Overlay escuro para melhor legibilidade */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Conteúdo da história */}
          <div className="relative h-full flex flex-col justify-end p-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                {story.headline}
              </h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                {story.subtitle}
              </p>
              <Button variant="filled" size="large">
                Leia Mais
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute top-4 left-0 right-0 px-8">
            <div className="flex gap-2">
              {stories.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    idx <= stories.indexOf(story)
                      ? "bg-white"
                      : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

## Propriedades Disponíveis

### Carousel

- `layout`: "multi-browse" | "uncontained" | "hero" | "center-aligned-hero" | "full-screen"
- `scrollBehavior`: "default" | "snap"
- `orientation`: "horizontal" | "vertical"
- `header`: string - Cabeçalho do carousel
- `showAllButton`: boolean - Mostra botão "Ver todos"
- `onShowAll`: () => void - Callback para "Ver todos"
- `opts`: EmblaCarouselOptions - Opções do Embla Carousel
- `plugins`: Plugin[] - Plugins do Embla Carousel

### CarouselItem

- `layout`: Layout do item (herda do contexto se não especificado)
- `size`: "large" | "medium" | "small"

### CarouselText

- `title`: string - Título principal
- `description`: string - Descrição
- `label`: string - Label/categoria
- `adaptive`: boolean - Adapta texto ao tamanho da tela

### CarouselIndicators

- Detecta automaticamente número de slides
- Navegação por clique
- Estados visual para slide ativo

## Diretrizes de Uso

### Quando Usar Cada Layout

- **Multi-browse**: Galeria de fotos, feed de eventos, produtos similares
- **Uncontained**: Lista tradicional, itens com muito texto, customização alta
- **Hero**: Filmes, apps em destaque, conteúdo de mídia
- **Center-aligned hero**: Conteúdo centralizado, apresentações
- **Full-screen**: Histórias, artigos imersivos, experiências verticais

### Melhores Práticas

- Use snap-scrolling para multi-browse, hero e full-screen
- Limite texto a 2 linhas em telas compactas
- Sempre forneça botão "Ver todos" em páginas com rolagem vertical
- Teste com leitores de tela e navegação por teclado
- Considere motion reduzido para acessibilidade
- Evite botões de navegação dentro/ao lado do container
- Use indicadores apenas quando necessário

### Acessibilidade

- Labels apropriados para cada item
- Navegação por teclado funcional
- Suporte a leitores de tela
- Botão "Ver todos" obrigatório
- Estados visuais claros
- Suporte a motion reduzido

### Performance

- Imagens otimizadas e lazy loading
- Virtualização para muitos itens
- Debounce em eventos de scroll
- Preload de itens próximos
- Cleanup adequado de event listeners
