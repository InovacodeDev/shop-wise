# Sistema de Senha Experimental

Este sistema permite que administradores definam senhas temporárias que são armazenadas com prefixo "EXP-" no banco de dados para facilitar o acesso durante testes ou situações específicas.

## Como funciona

1. **Definindo uma senha experimental**: Use o endpoint administrativo para armazenar uma senha com prefixo "EXP-" no banco
2. **Login com senha experimental**: O usuário faz login usando apenas a senha (sem prefixo)
3. **Normalização automática**: No primeiro login, a senha é automaticamente hasheada e armazenada de forma segura

## Endpoints

### Definir Senha Experimental (Admin)

```http
POST /auth/admin/set-experimental-password
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "minhasenha123"
}
```

### Login com Senha Experimental

```http
POST /auth/signin
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "minhasenha123"
}
```

## Comportamento

- Quando o admin define uma senha experimental, ela é armazenada como `EXP-{senha}` no banco
- No login, o sistema detecta se a senha no banco tem prefixo "EXP-":
    1. Remove o prefixo "EXP-" da senha armazenada
    2. Compara diretamente com a senha enviada pelo usuário
    3. Se válida, gera o hash Argon2 da senha e atualiza no banco
    4. Retorna o token de autenticação normalmente

- Em logins subsequentes, a senha já estará hasheada e funcionará normalmente

## Segurança

- Este sistema deve ser usado apenas em ambientes de desenvolvimento/teste
- A senha experimental é armazenada temporariamente como `EXP-{senha}` em texto simples
- Após o primeiro login, a senha é automaticamente protegida com hash Argon2
- O endpoint administrativo não possui autenticação - implemente conforme necessário

## Exemplo de Uso

```bash
# 1. Admin define senha experimental (será armazenada como "EXP-senha123" no banco)
curl -X POST http://localhost:3000/auth/admin/set-experimental-password \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'

# 2. Usuário faz login usando apenas a senha (sem prefixo)
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'

# 3. Próximos logins continuam usando a mesma senha (agora hasheada no banco)
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```
