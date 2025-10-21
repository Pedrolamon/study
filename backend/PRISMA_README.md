# 🗄️ Configuração do Prisma

Este documento explica como configurar e usar o Prisma no projeto Study App.

## 📋 Pré-requisitos

1. **PostgreSQL** instalado e rodando
2. **Node.js** (versão 18 ou superior)
3. **npm** ou **yarn**

## 🚀 Configuração Inicial

### 1. Instalar PostgreSQL

**Windows:**
- Baixe do site oficial: https://www.postgresql.org/download/windows/
- Durante a instalação, anote a senha do usuário `postgres`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Configurar o Banco de Dados

Execute o script de configuração:

```bash
npm run db:setup
```

Este script irá:
- Verificar se o PostgreSQL está instalado
- Solicitar informações de conexão
- Criar o banco de dados `study_app`
- Configurar o arquivo `.env`
- Executar as migrações iniciais

### 3. Executar Migrações

Se preferir fazer manualmente:

```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate
```

### 4. Popular com Dados Iniciais

```bash
npm run db:seed
```

## 📊 Comandos Úteis

### Scripts Disponíveis

```bash
# Configurar banco de dados
npm run db:setup

# Executar migrações
npm run db:migrate

# Gerar cliente Prisma
npm run db:generate

# Abrir Prisma Studio (interface visual)
npm run db:studio

# Popular com dados iniciais
npm run db:seed

# Resetar banco de dados
npm run db:reset
```

### Comandos Prisma Diretos

```bash
# Ver status das migrações
npx prisma migrate status

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Resetar banco (cuidado!)
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Gerar cliente
npx prisma generate
```

## 🏗️ Estrutura do Schema

O schema Prisma inclui os seguintes modelos:

### Modelos Principais
- **User** - Usuários do sistema
- **StudySession** - Sessões de estudo
- **Flashcard** - Cartões de estudo
- **Task** - Tarefas/afazeres
- **Notification** - Notificações

### Modelos de Conteúdo
- **StudyMaterial** - Materiais de estudo
- **SimulatedExam** - Simulados
- **Appointment** - Compromissos/agenda

### Modelos de Gamificação
- **Badge** - Conquistas/badges
- **Achievement** - Conquistas do usuário
- **UserPoints** - Sistema de pontos
- **SpacedRepetition** - Repetição espaçada

### Modelos de Configuração
- **AppSettings** - Configurações do app
- **FocusTools** - Ferramentas de foco
- **BlockedSite** - Sites bloqueados
- **StudyReport** - Relatórios de estudo

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/study_app?schema=public"

# Escolher entre MongoDB ou PostgreSQL
USE_PRISMA=true  # true para PostgreSQL, false para MongoDB
```

### Exemplo de Conexão

```typescript
import { prisma } from './config/database';

// Usar o Prisma
const users = await prisma.user.findMany();
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'João Silva',
    password: 'hashedPassword'
  }
});
```

## 🚨 Migração do MongoDB

O projeto suporta tanto MongoDB (Mongoose) quanto PostgreSQL (Prisma):

### Para usar MongoDB:
```env
USE_PRISMA=false
MONGODB_URI=mongodb://localhost:27017/study-app
```

### Para usar PostgreSQL:
```env
USE_PRISMA=true
DATABASE_URL=postgresql://username:password@localhost:5432/study_app
```

## 🐛 Solução de Problemas

### Erro de Conexão
```
Error: P1001: Can't reach database server
```
**Solução:** Verifique se o PostgreSQL está rodando e se a URL de conexão está correta.

### Erro de Migração
```
Error: P3006: Migration failed
```
**Solução:** 
1. Verifique se o banco existe
2. Execute `npx prisma migrate reset` (cuidado: apaga dados)
3. Execute `npx prisma migrate dev`

### Cliente Prisma não encontrado
```
Error: Cannot find module '@prisma/client'
```
**Solução:** Execute `npm run db:generate`

## 📚 Recursos Adicionais

- [Documentação do Prisma](https://www.prisma.io/docs/)
- [Prisma Studio](https://www.prisma.io/studio)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contribuição

Ao fazer alterações no schema:

1. Modifique o arquivo `prisma/schema.prisma`
2. Execute `npm run db:migrate` para criar a migração
3. Teste as alterações
4. Commit as mudanças

## 📝 Notas Importantes

- **Sempre faça backup** antes de executar migrações em produção
- **Teste as migrações** em ambiente de desenvolvimento primeiro
- **Use transações** para operações críticas
- **Monitore o desempenho** das queries com `prisma.$queryRaw`
