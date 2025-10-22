# Guia de Migração: Mongoose para Prisma + PostgreSQL

## Resumo das Alterações

Esta migração converteu completamente o backend de Mongoose (MongoDB) para Prisma (PostgreSQL).

## Alterações Realizadas

### 1. Modelos
- ✅ Removidos todos os arquivos de modelos Mongoose individuais
- ✅ Atualizado `src/models/index.ts` para usar Prisma
- ✅ Schema Prisma já estava configurado com PostgreSQL

### 2. Controllers
- ✅ `focusToolsController.ts` - Convertido para Prisma
- ✅ `advancedFeaturesController.ts` - Convertido para Prisma  
- ✅ `studyPlanController.ts` - Convertido para Prisma
- ✅ `simulatedExamController.ts` - Convertido para Prisma
- ✅ `authController.ts` - Já estava usando Prisma

### 3. Services
- ✅ `reportService.ts` - Convertido para Prisma
- ✅ `gamificationService.ts` - Convertido para Prisma
- ✅ `notificationService.ts` - Convertido para Prisma
- ✅ `schedulerService.ts` - Convertido para Prisma

### 4. Configuração
- ✅ Criado `src/config/database.ts` com configuração Prisma
- ✅ Atualizado `src/test/setup.ts` para usar Prisma
- ✅ Atualizado `package.json` (keywords)
- ✅ Schema Prisma atualizado com campo `category` em `BlockedSite`

## Próximos Passos

### 1. Configurar Banco de Dados
```bash
# Configurar variável de ambiente
echo "DATABASE_URL=postgresql://usuario:senha@localhost:5432/study_app" > .env

# Executar migrações
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar Aplicação
```bash
npm run dev
```

### 4. Verificar Banco de Dados
```bash
npx prisma studio
```

## Estrutura do Banco de Dados

O banco PostgreSQL terá as seguintes tabelas:
- `users` - Usuários
- `study_sessions` - Sessões de estudo
- `flashcards` - Flashcards
- `tasks` - Tarefas
- `notifications` - Notificações
- `study_materials` - Materiais de estudo
- `simulated_exams` - Simulados
- `appointments` - Compromissos
- `achievements` - Conquistas
- `user_points` - Pontos do usuário
- `badges` - Badges
- `blocked_sites` - Sites bloqueados
- `app_settings` - Configurações
- `study_reports` - Relatórios
- `focus_tools` - Ferramentas de foco
- `spaced_repetitions` - Repetições espaçadas

## Benefícios da Migração

1. **Type Safety**: Prisma oferece tipagem forte em tempo de compilação
2. **Performance**: PostgreSQL é mais rápido para consultas complexas
3. **Relacionamentos**: Melhor suporte a relacionamentos entre tabelas
4. **Migrações**: Sistema de migrações mais robusto
5. **Query Builder**: Interface mais intuitiva para consultas

## Arquivos Removidos

- `src/models/User.ts`
- `src/models/Flashcard.ts`
- `src/models/Task.ts`
- `src/models/StudyMaterial.ts`

## Arquivos Criados/Modificados

- `src/config/database.ts` (novo)
- `src/models/index.ts` (atualizado)
- `src/controllers/*.ts` (atualizados)
- `src/services/*.ts` (atualizados)
- `src/test/setup.ts` (atualizado)
- `package.json` (atualizado)
- `prisma/schema.prisma` (atualizado)

## Testes

Para executar os testes:
```bash
npm test
```

Os testes agora usam Prisma em vez de Mongoose e limpam o banco PostgreSQL entre os testes.
