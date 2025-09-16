# Correção do Erro de Produção no Vercel

## ❌ Problema Identificado

O erro `ERR_CONNECTION_REFUSED` no endpoint `http://localhost:3001/api/auth/me` estava ocorrendo porque:

1. **Frontend** estava usando `localhost:3001` em produção
2. **Variável de ambiente** `VITE_API_URL` não estava configurada no Vercel
3. **Configuração serverless** não estava redirecionando corretamente

## ✅ Soluções Implementadas

### 1. Frontend - API Service (`apps/web/src/services/api.ts`)

**Antes:**

```typescript
const configured = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";
```

**Depois:**

```typescript
const configured = (import.meta.env.VITE_API_URL as string) || "";

// In production (when no VITE_API_URL is set), use relative paths
if (!configured) return "/api";
```

### 2. Vercel Configuration (`vercel.json`)

**Mudanças principais:**

-   ✅ **Build Command**: Atualizado para usar build testado anteriormente
-   ✅ **Output Directory**: Corrigido para `.` (raiz)
-   ✅ **Node.js Runtime**: Atualizado para `nodejs20.x`
-   ✅ **Rewrites**: Corrigido para apontar para a função serverless correta

```json
{
    "version": 2,
    "buildCommand": "pnpm turbo run build --filter=@shop-wise/web && cp -r apps/web/dist/* ./",
    "outputDirectory": ".",
    "functions": {
        "apps/api/api/index.js": {
            "runtime": "nodejs20.x"
        }
    },
    "rewrites": [
        {
            "source": "/api/(.*)",
            "destination": "/apps/api/api/index.js"
        }
    ]
}
```

## 🔄 Como Funciona Agora

### Desenvolvimento (Local)

-   `VITE_API_URL=http://localhost:3001` → Usa servidor local da API
-   Frontend faz requisições para `http://localhost:3001/api/*`

### Produção (Vercel)

-   `VITE_API_URL` não definida → Usa URLs relativas `/api/*`
-   Frontend faz requisições para `/api/*`
-   Vercel redireciona `/api/*` para função serverless em `apps/api/api/index.js`

## 🚀 Próximos Passos

1. **Commit e Push**:

    ```bash
    git add .
    git commit -m "fix: corrigir conexão da API em produção no Vercel"
    git push
    ```

2. **Redeploy no Vercel**:

    - O deploy automático será disparado
    - Aguarde a conclusão do build

3. **Verificar Funcionamento**:
    - Acesse a aplicação no Vercel
    - Teste o login/autenticação
    - Verifique se as requisições API funcionam

## 🔍 Pontos de Verificação

-   ✅ Build local funciona
-   ✅ URLs relativas em produção
-   ✅ Função serverless configurada
-   ✅ Rewrites corretos no Vercel
-   ✅ Runtime Node.js atualizado

## 🎯 Resultado Esperado

Após o redeploy, a aplicação deve:

-   ✅ Fazer requisições para `/api/*` em produção
-   ✅ Conectar corretamente com a função serverless
-   ✅ Resolver o erro `ERR_CONNECTION_REFUSED`
-   ✅ Permitir login e navegação normal
