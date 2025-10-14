# Study App Backend API

Backend API para a aplicação de estudos, construído com Node.js, Express, TypeScript e MongoDB.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem tipada
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança
- **cors** - CORS
- **morgan** - Logging
- **compression** - Compressão de resposta
- **nodemailer** - Envio de emails
- **node-cron** - Agendamento de tarefas
- **multer** - Upload de arquivos

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB (local ou Atlas)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd study/backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/study-app
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # File Upload
   UPLOAD_PATH=uploads
   MAX_FILE_SIZE=52428800
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## 📚 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuração do MongoDB
│   ├── controllers/
│   │   ├── authController.ts     # Controllers de autenticação
│   │   ├── taskController.ts     # Controllers de tarefas
│   │   ├── studySessionController.ts # Controllers de sessões
│   │   ├── notificationController.ts # Controllers de notificações
│   │   ├── flashcardController.ts # Controllers de flashcards
│   │   ├── studyMaterialController.ts # Controllers de materiais
│   │   ├── reportController.ts   # Controllers de relatórios
│   │   └── gamificationController.ts # Controllers de gamificação
│   ├── middleware/
│   │   ├── auth.ts              # Middleware de autenticação
│   │   └── errorHandler.ts      # Tratamento de erros
│   ├── models/
│   │   ├── User.ts              # Modelo de usuário
│   │   ├── Task.ts              # Modelo de tarefa
│   │   ├── StudySession.ts      # Modelo de sessão
│   │   ├── Notification.ts      # Modelo de notificação
│   │   ├── Flashcard.ts         # Modelo de flashcard
│   │   ├── StudyMaterial.ts     # Modelo de material
│   │   ├── Badge.ts             # Modelo de badge
│   │   ├── Achievement.ts       # Modelo de conquista
│   │   └── UserPoints.ts        # Modelo de pontos do usuário
│   ├── routes/
│   │   ├── auth.ts              # Rotas de autenticação
│   │   ├── tasks.ts             # Rotas de tarefas
│   │   ├── studySessions.ts     # Rotas de sessões
│   │   ├── notifications.ts     # Rotas de notificações
│   │   ├── flashcards.ts        # Rotas de flashcards
│   │   ├── studyMaterials.ts    # Rotas de materiais
│   │   ├── reports.ts           # Rotas de relatórios
│   │   └── gamification.ts      # Rotas de gamificação
│   ├── services/
│   │   ├── notificationService.ts # Serviço de notificações
│   │   ├── reportService.ts     # Serviço de relatórios
│   │   ├── schedulerService.ts  # Serviço de agendamento
│   │   └── gamificationService.ts # Serviço de gamificação
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   ├── app.ts                   # Configuração do Express
│   └── index.ts                 # Arquivo principal
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <token>
```

### Endpoints de Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/profile` - Obter perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil

## 📝 Endpoints da API

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Tarefas
```
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/stats
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/toggle
```

### Sessões de Estudo
```
POST   /api/study-sessions
GET    /api/study-sessions
GET    /api/study-sessions/stats
GET    /api/study-sessions/:id
PUT    /api/study-sessions/:id
DELETE /api/study-sessions/:id
PATCH  /api/study-sessions/:id/end
```

### Notificações
```
GET    /api/notifications
GET    /api/notifications/stats
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
POST   /api/notifications/scheduled
```

### Flashcards
```
POST   /api/flashcards
GET    /api/flashcards
GET    /api/flashcards/stats
GET    /api/flashcards/:id
PUT    /api/flashcards/:id
DELETE /api/flashcards/:id
POST   /api/flashcards/:id/review
POST   /api/flashcards/:id/reset-review
```

### Materiais de Estudo
```
POST   /api/study-materials/upload
GET    /api/study-materials
GET    /api/study-materials/stats
GET    /api/study-materials/:id
PUT    /api/study-materials/:id
DELETE /api/study-materials/:id
GET    /api/study-materials/:id/download
```

### Relatórios
```
GET    /api/reports/user
GET    /api/reports/progress
GET    /api/reports/flashcards
GET    /api/reports/materials
GET    /api/reports/notifications
GET    /api/reports/comparative
GET    /api/reports/dashboard
```

### Gamificação
```
GET    /api/gamification/stats
GET    /api/gamification/leaderboard
GET    /api/gamification/top-level
GET    /api/gamification/recent-achievements
GET    /api/gamification/badges
GET    /api/gamification/achievements
GET    /api/gamification/points-history
GET    /api/gamification/rank
GET    /api/gamification/dashboard
GET    /api/gamification/config
POST   /api/gamification/init-badges
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Compila o TypeScript
npm run start        # Inicia o servidor de produção
npm run test         # Executa os testes
npm run lint         # Executa o linter
npm run lint:fix     # Corrige problemas do linter
```

## 🧪 Testes

```bash
npm test
```

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **CORS** - Controle de origem
- **Rate Limiting** - Limitação de requisições
- **bcryptjs** - Hash seguro de senhas
- **JWT** - Tokens seguros
- **express-validator** - Validação de entrada

## 📊 Monitoramento

- **Morgan** - Logs de requisições
- **Health Check** - `/health` endpoint
- **Error Handling** - Tratamento centralizado de erros

## 🚀 Deploy

### Produção
```bash
npm run build
npm start
```

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 Licença

MIT License 