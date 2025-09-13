# MongoDB Update Operations Optimization

## ✅ Implementações Realizadas

### 1. Users Service (`/apps/api/src/users/users.service.ts`)

#### Otimizações Aplicadas:

**Substituição de `doc.save()` por `updateOne()`:**

- ❌ **Antes**: `Object.assign(doc, updateUserDto); await doc.save()`
- ✅ **Agora**: `await this.userModel.updateOne({ _id: id }, { $set: updateData })`

**Benefícios:**

- 🚀 **Performance**: Envia apenas os campos modificados ao MongoDB
- 📦 **Menos Dados**: Reduz o tráfego de rede
- ⚡ **Menos Processamento**: MongoDB processa apenas updates específicos

#### Sanitização de Dados Sensíveis:

**Campos Removidos das Respostas:**

```typescript
const sensitiveFields = [
    'passwordHash',
    'totpSecret',
    'totpTempSecret',
    'refreshTokenHash',
    'emailVerificationTokenHash',
    'emailVerificationTokenHmacPrefix',
    'passwordResetTokenHash',
    'passwordResetTokenHmacPrefix',
];
```

**Controle de Acesso ao Email:**

- ✅ **Próprio usuário**: Pode ver seu próprio email
- ❌ **Outros usuários**: Email não é retornado para outros usuários

#### Métodos Atualizados:

```typescript
// Todos os métodos agora aceitam requestingUserId para controle de acesso
async findAll(requestingUserId?: string)
async findOne(id: string, requestingUserId?: string)
async update(id: string, updateUserDto: UpdateUserDto, requestingUserId?: string)
async remove(id: string, requestingUserId?: string)
```

### 2. Families Service (`/apps/api/src/families/families.service.ts`)

#### Otimização Aplicada:

**Substituição de `doc.save()` por `updateOne()`:**

- ❌ **Antes**: `Object.assign(existing, updateData); await existing.save()`
- ✅ **Agora**: `await this.familyModel.updateOne({ _id: id }, { $set: updateData })`

**Nota**: Family model não possui dados sensíveis, então apenas a otimização de performance foi aplicada.

### 3. Users Controller (`/apps/api/src/users/users.controller.ts`)

#### Atualização para Suporte à Sanitização:

Todos os endpoints agora passam o `requestingUserId` extraído do token JWT:

```typescript
@Get()
findAll(@Req() req: AuthenticatedRequest) {
    const requestingUserId = req.user?.uid;
    return this.usersService.findAll(requestingUserId);
}

@Get(':id')
findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const requestingUserId = req.user?.uid;
    return this.usersService.findOne(id, requestingUserId);
}
```

## 🎯 Benefícios Alcançados

### Performance

- **Menos Dados Transferidos**: Apenas campos modificados são enviados
- **Operações Atômicas**: `updateOne()` é uma operação atômica no MongoDB
- **Menos Processamento**: Server-side processa apenas updates específicos

### Segurança

- **Dados Sensíveis Protegidos**: Passwords e tokens nunca retornados na API
- **Controle Granular**: Email visível apenas para o próprio usuário
- **Sanitização Automática**: Todos os retornos são automaticamente limpos

### Manutenibilidade

- **Código Mais Limpo**: Lógica de sanitização centralizada
- **Fácil Expansão**: Novos campos sensíveis facilmente adicionados
- **Padrão Consistente**: Mesma abordagem em todos os services

## 🔄 Padrão Implementado

### Para Novos Services:

```typescript
// 1. Use updateOne() ao invés de save()
async update(id: string, updateDto: UpdateDto) {
    const existingDoc = await this.model.findById(id).lean().exec();
    if (!existingDoc) throw new NotFoundException(`Not found`);

    const updateData = { ...updateDto, updatedAt: new Date() };
    await this.model.updateOne({ _id: id }, { $set: updateData }).exec();

    return (await this.model.findById(id).lean().exec()) as unknown as Entity;
}

// 2. Implemente sanitização para dados sensíveis
private sanitizeEntity(entity: Entity, requestingUserId?: string): Partial<Entity> {
    const sensitiveFields = ['password', 'secret', 'token'];
    const sanitized = { ...entity };

    sensitiveFields.forEach((field) => {
        delete sanitized[field];
    });

    return sanitized;
}
```

## 📊 Comparação: Antes vs Depois

### Operação de Update - Antes:

1. `findOne()` - Busca documento completo
2. `Object.assign()` - Modifica objeto em memória
3. `doc.save()` - Envia documento completo para MongoDB
4. MongoDB processa documento inteiro

### Operação de Update - Depois:

1. `findOne().lean()` - Busca apenas para validação
2. `updateOne({ $set: updateData })` - Envia apenas campos modificados
3. MongoDB processa apenas os campos alterados
4. `sanitizeUser()` - Remove dados sensíveis do retorno

### Benefício de Performance:

- **Exemplo**: Update de `displayName` em usuário com 20 campos
- **Antes**: ~2KB de dados enviados (documento completo)
- **Depois**: ~50 bytes (apenas o campo alterado + metadata)
- **Redução**: ~97% menos dados transferidos

## 🚀 Próximos Passos

### Services que Ainda Podem ser Otimizados:

1. **categories.service.ts** - Se usar padrão `Object.assign + save()`
2. **pantry-items.service.ts** - Verificar padrões de update
3. **shopping-lists.service.ts** - Potencial para otimização
4. **products.service.ts** - Verificar implementação atual

### Validação de Implementação:

1. ✅ **Users Service** - Completo
2. ✅ **Families Service** - Completo
3. 🔄 **Auth Service** - Já usa `updateOne()` (não precisa mudança)
4. ⏳ **Outros Services** - Pendente análise

As otimizações implementadas seguem as melhores práticas do MongoDB e garantem melhor performance, segurança e manutenibilidade do código.
