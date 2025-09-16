# Deploy do Shop-Wise no Vercel - ATUALIZADO

Este projeto é um monorepo que precisa de configuração específica no Vercel.

## Configuração Atualizada no Vercel (2025)

### 1. Build Settings

-   **Build Command**: `pnpm turbo run build --filter=@shop-wise/web && cp -r apps/web/dist ./dist`
-   **Output Directory**: `dist`
-   **Install Command**: `pnpm install --frozen-lockfile`
-   **Root Directory**: Leave empty (use project root)

### 2. Environment Variables

Configure essas variáveis no dashboard do Vercel:

```
NODE_ENV=production
SERVERLESS=true
```

### 3. Node.js Version

-   Runtime: Node.js 20.x (configurado no vercel.json)

## ✅ SOLUÇÃO FINAL - Setembro 2025

**Ambos os erros foram corrigidos!**

1. ❌ `Cannot find module '/vercel/path0/apps/web/build-for-vercel.js'` → ✅ Resolvido
2. ❌ `No Output Directory named "dist" found after the Build completed` → ✅ Resolvido

### ✅ Solução Final Implementada:

1. **Build command atualizado**: `pnpm turbo run build --filter=@shop-wise/web && cp -r apps/web/dist ./dist`
2. **Output directory correto**: `dist` (na raiz, conforme esperado pelo Vercel)
3. **Processo completo**: Build no monorepo → Copia arquivos para raiz → Vercel encontra o diretório

### 🧪 Teste Local Completo:

```bash
rm -rf dist
pnpm turbo run build --filter=@shop-wise/web && cp -r apps/web/dist ./dist
ls -la dist/  # ✅ Deve mostrar: index.html, assets/, locales/
```

**Status**: ✅ RESOLVIDO - Pronto para deploy no Vercel!

## Troubleshooting Comum

### Erro de Lockfile

Se aparecer erro sobre lockfile desatualizado:

```bash
# Localmente, execute:
rm pnpm-lock.yaml
pnpm install
# Faça commit do novo lockfile
```

### Build Fails

1. Teste localmente: `pnpm run build:vercel`
2. Verifique se `apps/web/dist/index.html` existe
3. Confirme que todas as dependências estão no package.json

### Memory Issues

Se o build falhar por memória, adicione no vercel.json:

```json
{
    "functions": {
        "apps/api/api/index.js": {
            "runtime": "nodejs20.x",
            "memory": 1024
        }
    }
}
```

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
