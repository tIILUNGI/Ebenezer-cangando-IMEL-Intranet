# SIG-IMEL Intranet v3.1.0
# Plano de Ação - Implementação Completa
# Status: Backend completo, Frontend atualizado, Segurança reforçada

## 📁 ESTRUTURA DO PROJETO FINAL

```
imel-intranet/
├── backend/
│   ├── data/                    # Banco SQLite
│   │   └── imel.db
│   ├── migrations/              # Scripts de migração
│   │   └── migrate.js
│   ├── src/
│   │   ├── controllers/         # Lógica de negócio
│   │   │   ├── authController.js    # Login, logout, register, forgot/reset
│   │   │   ├── userController.js   # CRUD de utilizadores
│   │   │   ├── gradeController.js   # Gestão de notas
│   │   │   ├── scheduleController.js # Gestão de horários
│   │   │   ├── libraryController.js  # Gestão de biblioteca
│   │   │   ├── messageController.js  # Sistema de mensagens
│   │   │   ├── notificationController.js # Avisos e notificações
│   │   │   ├── auditController.js   # Logs de auditoria
│   │   │   ├── statsController.js   # Estatísticas e KPIs
│   │   │   └── profileController.js # Perfil e exportação de dados
│   │   ├── middleware/           # Segurança e validação
│   │   │   ├── auth.js              # JWT auth, RBAC, sanitização
│   │   │   └── upload.js            # Configuração multer
│   │   ├── routes/               # Rotas da API RESTful
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── grades.js
│   │   │   ├── schedule.js
│   │   │   ├── library.js
│   │   │   ├── messages.js
│   │   │   ├── notifications.js
│   │   │   ├── audit.js
│   │   │   ├── stats.js
│   │   │   ├── profile.js
│   │   │   └── settings.js
│   │   └── database.js          # Conexão SQLite + seed
│   ├── uploads/                 # Armazenamento de arquivos
│   ├── .env                     # Variáveis de ambiente
│   ├── package.json
│   └── server.js                # Servidor Express
├── src/
│   ├── api/                     # Cliente API Axios
│   │   ├── client.js            # Instância Axios com interceptors
│   │   ├── auth.js              # Serviços de autenticação
│   │   └── index.js             # Todos os serviços da API
│   └── ... (páginas e componentes atualizados)
├── backend/                     # Backend Node.js
├── database.sql                 # Schema SQL (referencial)
├── vite.config.ts               # Com proxy para API
└── package.json
```

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. BACKEND - API REST (Node.js/Express/SQLite)

| Módulo | Endpoints | Métodos | Status |
|--------|-----------|---------|--------|
| **Auth** | /api/auth | POST login, logout, refresh, register, forgot, reset | ✅ |
| **Usuários** | /api/users | GET, POST, PUT, DELETE | ✅ |
| **Notas** | /api/grades | GET, PUT (por turma/professor) | ✅ |
| **Horários** | /api/schedule | GET, POST, PUT, DELETE | ✅ |
| **Biblioteca** | /api/library | GET, POST (upload), PATCH (download), DELETE | ✅ |
| **Mensagens** | /api/messages | GET conversations/inbox/contacts, POST, PATCH | ✅ |
| **Notificações** | /api/notifications | GET, POST (avisos), PATCH, DELETE | ✅ |
| **Auditoria** | /api/audit | GET, GET export CSV | ✅ |
| **Estatísticas** | /api/stats | GET academic, GET KPIs | ✅ |
| **Perfil** | /api/profile | GET me, PUT me, GET export | ✅ |
| **Configurações** | /api/settings | GET, PUT | ✅ |

### 2. SEGURANÇA

| Medida | Implementação | Status |
|--------|---------------|--------|
| Hash de senhas | bcrypt (12 rounds) | ✅ |
| JWT | Access token (15min) + Refresh token (7 dias) | ✅ |
| Rate limiting | 100 req/15 min por IP | ✅ |
| Helmet | Headers de segurança HTTP | ✅ |
| CORS | Configurável via env | ✅ |
| Validação | express-validator em todas as rotas | ✅ |
| Sanitização | Entrada limpa antes de processar | ✅ |
| Auditing | Todas as ações registradas | ✅ |
| RBAC | Middleware por papel | ✅ |
| CSRF token | csurf middleware | ✅ |
| Limite de upload | 10MB max | ✅ |

### 3. FRONTEND - MELHORIAS

| Melhoria | Status |
|----------|--------|
| Cliente API com Axios | ✅ |
| Interceptors (auto-refresh token) | ✅ |
| Modo offline (fallback localStorage) | ✅ |
| Detecção online/offline | ✅ |
| Loading states em todas as páginas | ✅ |
| Botão de sincronizar dados com API | ✅ |
| Página 404 | ✅ |
| Filtros na biblioteca e notificações | ✅ |
| Search em mensagens | ✅ |
| Modal confirmação em ações destrutivas | ✅ |
| Alerta de frequência crítica | ✅ |
| Exportação CSV via API | ✅ |
| Comunique do coordenador via API | ✅ |

### 4. BANCO DE DADOS - Schema Completo

```sql
Tabelas implementadas:
- usuarios (10 campos + coordenador)
- disciplinas
- pautas (notas por trimestre)
- horários
- biblioteca (com uploads)
- mensagens
- logs_auditoria
- notificacoes
- justificacoes
- contact_messages
- settings (nova)
```

## 🚀 COMO EXECUTAR

### Backend:
```bash
cd backend
npm install
cp .env.example .env  # Configurar variáveis
node server.js
```

### Frontend:
```bash
npm install
npm run dev
```

### Banco de dados (produção):
O SQLite é criado automaticamente em `backend/data/imel.db`. Para produção, substituir por PostgreSQL.

## 📊 PROGRESSO

| Categoria | Antes | Depois |
|-----------|-------|--------|
| Backend | 0% | 100% (API REST completa) |
| Segurança | 1/10 | 8/10 |
| Autenticação | plaintext | bcrypt + JWT |
| Comunicação | localStorage | API + fallback local |
| Páginas com API | 0% | 100% |
| Testes | 0% | Estrutura pronta |
| PWA | Não | Pronto para adicionar |
| Mobile App | Não | Pode usar React Native |