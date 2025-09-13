# Deploy do Shop-Wise no Vercel

Este projeto é um monorepo que precisa de configuração específica no Vercel.

## Configuração Necessária no Vercel

### 1. Root Directory

Configure o **Root Directory** para: `apps/web`

### 2. Build Command

Configure o **Build Command** para: `turbo run build --filter=@shop-wise/web`

### 3. Output Directory

Configure o **Output Directory** para: `dist`

### 4. Install Command

Configure o **Install Command** para: `pnpm install`

### 5. Node.js Version

Configure o **Node.js Version** para: `18.x`

## Estrutura do Projeto

```
shop-wise/
├── apps/
│   ├── web/          <- Root Directory do Vercel
│   │   ├── dist/     <- Output Directory
│   │   └── ...
│   └── api/
├── packages/
├── vercel.json
└── turbo.json
```

## Resolução de Problemas

### Erro: "No Output Directory named 'dist' found"

1. Verifique se o **Root Directory** está configurado como `apps/web`
2. Verifique se o **Output Directory** está configurado como `dist` (não `apps/web/dist`)
3. Certifique-se de que o build command está correto: `turbo run build --filter=@shop-wise/web`

### Alternativas se o problema persistir:

Se ainda assim houver problemas, você pode:

1. **Opção 1**: Usar o script customizado

    - Build Command: `node build-for-vercel.js`
    - Output Directory: `apps/web/dist`
    - Root Directory: (vazio/root)

2. **Opção 2**: Build direto no diretório web
    - Root Directory: `apps/web`
    - Build Command: `pnpm run build`
    - Output Directory: `dist`

## Dependências

O projeto usa:

-   **pnpm** como package manager
-   **Turbo** para builds
-   **Vite** como bundler
-   **React + TypeScript** como framework

## API Backend

A API backend está configurada como função serverless no Vercel através do arquivo `apps/api/api/index.js`.
