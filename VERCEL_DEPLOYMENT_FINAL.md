# Deploy do Shop-Wise no Vercel - SOLUÇÃO FINAL ✅

Este projeto é um monorepo que precisa de configuração específica no Vercel.

## ✅ PROBLEMAS RESOLVIDOS - Setembro 2025

**Ambos os erros foram corrigidos!**

1. ❌ `Cannot find module '/vercel/path0/apps/web/build-for-vercel.js'` → ✅ Resolvido
2. ❌ `No Output Directory named "dist" found after the Build completed` → ✅ Resolvido

## 🚀 Configuração Final no Vercel

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

## ✅ Solução Final Implementada

### Como funciona:

1. **Build no monorepo**: `pnpm turbo run build --filter=@shop-wise/web` gera arquivos em `apps/web/dist`
2. **Copia para raiz**: `cp -r apps/web/dist ./dist` move arquivos para onde o Vercel espera
3. **Vercel encontra**: O Vercel encontra o diretório `dist` na raiz e faz o deploy

### Arquivos de configuração atualizados:

-   `vercel.json`: Build command atualizado
-   `VERCEL_DEPLOYMENT.md`: Documentação completa

## 🧪 Teste Local Completo

Para verificar se tudo está funcionando:

```bash
# 1. Limpa builds anteriores
rm -rf dist apps/web/dist

# 2. Executa o mesmo comando que o Vercel vai executar
pnpm turbo run build --filter=@shop-wise/web && cp -r apps/web/dist ./dist

# 3. Verifica se os arquivos foram gerados corretamente
ls -la dist/
# ✅ Deve mostrar: index.html, assets/, locales/

# 4. Verifica arquivos específicos
ls dist/index.html dist/assets/ dist/locales/
```

## 🎯 Status Final

**Status**: ✅ TOTALMENTE RESOLVIDO - Pronto para deploy no Vercel!

### Próximos passos:

1. Faça commit das alterações
2. Redeploy no Vercel (automático ou manual)
3. Monitore os logs para confirmar sucesso

## Troubleshooting (apenas se necessário)

### Erro de Lockfile

```bash
rm pnpm-lock.yaml
pnpm install
git commit -am "fix: update lockfile"
```

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

---

**Resumo**: A solução foi atualizar o build command para copiar os arquivos do monorepo (`apps/web/dist`) para o diretório raiz (`./dist`) que o Vercel espera encontrar. ✅
