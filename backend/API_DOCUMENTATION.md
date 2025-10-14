# Study App API Documentation

## Base URL
```
http://localhost:3001/api
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para rotas protegidas, inclua o header:
```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 Autenticação

#### POST /auth/register
Registra um novo usuário.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Faz login do usuário.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### GET /auth/profile
Obtém o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile retrieved successfully"
}
```

#### PUT /auth/profile
Atualiza o perfil do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "email": "user@example.com",
    "name": "John Updated",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

### 📝 Tarefas

#### POST /tasks
Cria uma nova tarefa.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Estudar React",
  "description": "Revisar hooks e context",
  "priority": "high",
  "dueDate": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Estudar React",
    "description": "Revisar hooks e context",
    "completed": false,
    "priority": "high",
    "dueDate": "2024-01-15",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Task created successfully"
}
```

#### GET /tasks
Lista todas as tarefas do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 20)
- `sortBy` (string): Campo para ordenação (padrão: createdAt)
- `sortOrder` (string): Ordem (asc/desc, padrão: desc)
- `completed` (boolean): Filtrar por status
- `priority` (string): Filtrar por prioridade
- `dueDate` (string): Filtrar por data de vencimento

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Estudar React",
        "description": "Revisar hooks e context",
        "completed": false,
        "priority": "high",
        "dueDate": "2024-01-15",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### GET /tasks/stats
Obtém estatísticas das tarefas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 5,
    "pending": 5,
    "overdue": 2,
    "completionRate": 50
  }
}
```

#### GET /tasks/:id
Obtém uma tarefa específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Estudar React",
    "description": "Revisar hooks e context",
    "completed": false,
    "priority": "high",
    "dueDate": "2024-01-15",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /tasks/:id
Atualiza uma tarefa.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Estudar React Hooks",
  "completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Estudar React Hooks",
    "description": "Revisar hooks e context",
    "completed": true,
    "priority": "high",
    "dueDate": "2024-01-15",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

#### DELETE /tasks/:id
Remove uma tarefa.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### PATCH /tasks/:id/toggle
Alterna o status de conclusão da tarefa.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Estudar React",
    "description": "Revisar hooks e context",
    "completed": true,
    "priority": "high",
    "dueDate": "2024-01-15",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Task completed successfully"
}
```

### ⏱️ Sessões de Estudo

#### POST /study-sessions
Inicia uma nova sessão de estudo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mode": "pomodoro",
  "subject": "React",
  "duration": 25
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "mode": "pomodoro",
    "subject": "React",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": null,
    "duration": 25,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Study session started successfully"
}
```

#### GET /study-sessions
Lista todas as sessões de estudo do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 20)
- `sortBy` (string): Campo para ordenação (padrão: createdAt)
- `sortOrder` (string): Ordem (asc/desc, padrão: desc)
- `mode` (string): Filtrar por modo
- `isActive` (boolean): Filtrar por status ativo
- `startDate` (string): Filtrar por data de início
- `endDate` (string): Filtrar por data de fim

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "mode": "pomodoro",
        "subject": "React",
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-01T00:25:00.000Z",
        "duration": 25,
        "isActive": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### GET /study-sessions/stats
Obtém estatísticas das sessões de estudo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (string): Período (today/week/month/all, padrão: all)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSessions": 10,
    "totalDuration": 250,
    "averageSessionDuration": 25,
    "sessionsByMode": [
      {
        "_id": "pomodoro",
        "count": 8,
        "totalDuration": 200
      },
      {
        "_id": "flowtime",
        "count": 2,
        "totalDuration": 50
      }
    ],
    "period": "all"
  }
}
```

#### GET /study-sessions/:id
Obtém uma sessão específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "mode": "pomodoro",
    "subject": "React",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T00:25:00.000Z",
    "duration": 25,
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /study-sessions/:id
Atualiza uma sessão de estudo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subject": "React Hooks",
  "duration": 30
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "mode": "pomodoro",
    "subject": "React Hooks",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": null,
    "duration": 30,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Study session updated successfully"
}
```

#### DELETE /study-sessions/:id
Remove uma sessão de estudo.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Study session deleted successfully"
}
```

#### PATCH /study-sessions/:id/end
Finaliza uma sessão de estudo ativa.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "mode": "pomodoro",
    "subject": "React",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T00:25:00.000Z",
    "duration": 25,
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Study session ended successfully"
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Tratamento de Erros

Todos os erros retornam no formato:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva"
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:
- 100 requisições por IP a cada 15 minutos
- Headers de resposta incluem informações sobre limites

## Segurança

- **CORS**: Configurado para permitir apenas origens específicas
- **Helmet**: Headers de segurança implementados
- **JWT**: Tokens seguros com expiração configurável
- **bcryptjs**: Hash seguro de senhas
- **express-validator**: Validação rigorosa de entrada 