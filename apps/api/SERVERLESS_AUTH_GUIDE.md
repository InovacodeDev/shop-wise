# Guia de Autenticação para Ambiente Serverless

## Problema Identificado

Em ambientes serverless (como Vercel), a persistência de login usando cookies HttpOnly pode falhar devido a:

1. **Instâncias Ephemeral**: Cada requisição é tratada por uma instância diferente
2. **Problemas de CORS**: Cookies não são enviados consistentemente entre diferentes domínios
3. **Cold Starts**: Funções serverless podem perder estado entre invocações

## Solução Implementada

### Backend (API)

O backend agora retorna tokens de duas formas dependendo do ambiente:

#### Desenvolvimento (Local)

```json
{
    "token": "jwt_access_token",
    "uid": "user_id"
}
```

- Refresh token é armazenado em cookie HttpOnly

#### Produção (Serverless)

```json
{
    "token": "jwt_access_token",
    "uid": "user_id",
    "refreshToken": "refresh_token_value"
}
```

- Ambos os tokens são retornados na resposta

### Frontend (Recomendações)

#### 1. Armazenamento de Tokens

```typescript
// Para desenvolvimento
localStorage.setItem('accessToken', response.token);
// refreshToken vem via cookie

// Para produção
localStorage.setItem('accessToken', response.token);
localStorage.setItem('refreshToken', response.refreshToken);
```

#### 2. Interceptor para Refresh Automático

```typescript
// Exemplo usando Axios
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(
                    '/api/auth/refresh',
                    {},
                    {
                        headers: { Authorization: `Bearer ${refreshToken}` },
                    },
                );

                localStorage.setItem('accessToken', response.data.token);
                localStorage.setItem('refreshToken', response.data.refresh);

                // Retry original request
                error.config.headers.Authorization = `Bearer ${response.data.token}`;
                return axios.request(error.config);
            } catch (refreshError) {
                // Redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);
```

#### 3. Headers para Requisições

```typescript
// Sempre enviar access token
const accessToken = localStorage.getItem('accessToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
```

### Endpoints Atualizados

#### POST /api/auth/signin

**Resposta em Produção:**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "uid": "user_uuid",
    "refreshToken": "refresh_token_uuid"
}
```

#### POST /api/auth/refresh

**Request Header:**

```
Authorization: Bearer <refresh_token>
```

**Resposta:**

```json
{
    "token": "new_access_token",
    "refresh": "new_refresh_token"
}
```

### Variáveis de Ambiente Necessárias

```env
# Para identificar ambiente serverless
SERVERLESS=true

# CORS para múltiplos domínios
CORS_ORIGINS=https://your-app.vercel.app,https://*.vercel.app

# Secrets necessários
COOKIE_SECRET=your_cookie_secret
JWT_SECRET=your_jwt_secret
```

## Migração do Frontend

1. **Verificar Ambiente**: Detectar se está em desenvolvimento ou produção
2. **Atualizar Storage**: Modificar como tokens são armazenados
3. **Implementar Refresh**: Adicionar logic para refresh automático
4. **Testar CORS**: Verificar se requisições funcionam entre domínios

## Benefícios

- ✅ Funciona em ambientes serverless
- ✅ Suporte a múltiplos domínios
- ✅ Refresh automático de tokens
- ✅ Fallback para desenvolvimento local
- ✅ Melhor performance (sem dependência de cookies)
