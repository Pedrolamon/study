# EstudaConcurso - Aplicação de Estudos

Uma aplicação completa para gerenciamento de estudos e preparação para concursos, construída com React, TypeScript e Node.js.

## 🚀 Funcionalidades Implementadas

### ✅ **Frontend (React + TypeScript)**
- **Autenticação completa** - Login e registro de usuários
- **Dashboard interativo** - Visão geral com estatísticas e contagem regressiva
- **Timer de estudo** - Múltiplos modos (Pomodoro, Flowtime, Personalizado)
- **Sistema de tarefas** - CRUD completo com prioridades e filtros
- **Agenda/Calendário** - Gerenciamento de compromissos e eventos
- **Página de desempenho** - Gráficos e relatórios detalhados
- **Sistema de simulados** - Criação e gerenciamento de simulados
- **Flashcards** - Sistema de repetição espaçada
- **Gamificação** - Sistema de conquistas, badges e XP
- **Upload de materiais** - Sistema de upload e gerenciamento de arquivos
- **Configurações** - Gerenciamento de perfil, notificações e aparência
- **Notificações push** - Sistema completo de notificações com central de notificações
- **PWA (Progressive Web App)** - Instalação como app nativo com funcionalidades offline
- **Layout responsivo** - Interface moderna com Tailwind CSS
- **Proteção de rotas** - Sistema de autenticação integrado

### ✅ **Backend (Node.js + Express + MongoDB)**
- **API REST completa** - Todos os endpoints necessários
- **Autenticação JWT** - Sistema seguro de login
- **Modelos de dados** - Estrutura completa do banco
- **Serviços especializados** - Gamificação, notificações, relatórios
- **Documentação da API** - Endpoints bem documentados

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Helmet** - Segurança
- **CORS** - Cross-origin requests

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- MongoDB (local ou Atlas)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd study
```

### 2. Configure o Backend
```bash
cd backend
npm install
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/study-app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Configure o Frontend
```bash
cd ../
npm install
```

Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Inicie os servidores

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
npm run dev
```

## 🎯 Funcionalidades Principais

### 🔐 Autenticação
- Registro de novos usuários
- Login com email e senha
- Tokens JWT para sessões
- Proteção de rotas
- Logout automático

### 📊 Dashboard
- Contagem regressiva para provas
- Estatísticas em tempo real
- Progresso de experiência
- Tarefas do dia
- Compromissos agendados
- Controles rápidos do timer

### ⏱️ Timer de Estudo
- **Modo Pomodoro**: 25min estudo, 5min pausa
- **Modo Flowtime**: Estudo contínuo
- **Modo Personalizado**: Configuração livre
- Controles de pausa, retomar e parar
- Configurações personalizáveis
- Registro de disciplinas

### ✅ Sistema de Tarefas
- Criação e edição de tarefas
- Prioridades (Alta, Média, Baixa)
- Datas de vencimento
- Filtros por status
- Busca por texto
- Marcação de conclusão

### 📅 Agenda/Calendário
- Visualização mensal
- Criação de compromissos
- Tipos de eventos (Estudo, Prova, Reunião)
- Horários e localização
- Navegação entre meses
- Lista de eventos do dia

### 📈 Desempenho
- Gráficos de tempo de estudo
- Estatísticas de tarefas
- Distribuição por disciplinas
- Metas semanais
- Insights e recomendações
- Filtros por período

## 🔧 Estrutura do Projeto

```
study/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/           # Contextos React (Auth)
│   ├── hooks/              # Hooks customizados
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de API
│   ├── config/             # Configurações
│   └── types/              # Tipos TypeScript
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── models/         # Modelos do MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços de negócio
│   │   └── middleware/     # Middlewares
│   └── package.json
└── package.json
```

## 🚀 Scripts Disponíveis

### Frontend
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Compila para produção
npm run preview      # Visualiza build de produção
npm run lint         # Executa linter
```

### Backend
```bash
cd backend
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Compila TypeScript
npm run start        # Inicia servidor de produção
npm run test         # Executa testes
```

## 🔒 Segurança

- **JWT Tokens** para autenticação
- **bcryptjs** para hash de senhas
- **Helmet** para headers de segurança
- **CORS** configurado adequadamente
- **Validação** de dados de entrada
- **Rate limiting** para proteção contra spam

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona bem em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Design System

- **Tailwind CSS** para estilos
- **Lucide React** para ícones
- **Cores consistentes** em toda a aplicação
- **Componentes reutilizáveis**
- **Animações suaves**

## 🔄 Próximos Passos

### Funcionalidades Planejadas
- [x] Sistema de Simulados
- [x] Flashcards
- [x] Upload de materiais de estudo
- [x] Sistema de gamificação completo
- [x] Configurações de usuário
- [x] Notificações push
- [x] PWA (Progressive Web App)
- [x] Modo offline
- [ ] Exportação de relatórios
- [ ] Temas (claro/escuro)

### Melhorias Técnicas
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] CI/CD pipeline
- [ ] Docker containerização
- [ ] Monitoramento e logs
- [ ] Otimização de performance

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para suporte@estudaconcurso.com ou abra uma issue no GitHub.
