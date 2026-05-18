# SIG-IMEL - Sistema Interno de Gestão Escolar

Frontend em React + Backend Node.js (Express/SQLite) com armazenamento em `localStorage` para modo offline.

---

## Arquitetura

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS + Recharts
- Deploy: Netlify

### Backend
- Node.js + Express
- SQLite (desenvolvimento) / PostgreSQL (produção)
- API RESTful em `/api/*`
- Autenticação JWT

---

## Checklist do Sistema

### Autenticação e Perfis
- [x] Login com palavra-passe e conta ativa
- [x] Criação de conta (ativa utilizador e grava e-mail/palavra-passe/telemóvel)
- [x] Recuperação de palavra-passe (código local + atualização)
- [x] Troca de palavra-passe no perfil com validação

### Comunicação e Mensagens
- [x] Mensagens persistentes (API ou localStorage)
- [x] Mensagens aparecem no destinatário após logout/login
- [x] Filtro de destinatários: não mostra o logado
- [x] Filtro por turma: só mesma turma aparece

### Biblioteca Digital
- [x] Upload real de arquivo (armazenamento local via backend)
- [x] Download real de arquivo
- [x] Contador de downloads

### Notas e Pautas
- [x] Lançamento de notas com cálculo de média
- [x] Boletim com download (arquivo local ou API)

### Auditoria e Logs
- [x] Logs de ações (criar/alterar utilizador, notas, mensagens, biblioteca)

### IA e Interação
- [x] Insight automático no dashboard
- [x] Perguntas à IA sobre o sistema (botão global - Gemini API)

### Suporte
- [x] WhatsApp abre diretamente: `+244 938 229 459`

### Ano Lectivo
- [x] Atualizado para `2025/2026`

### Funcionalidades Adicionais
- [x] Tema claro/escuro (toggle)
- [x] Idioma PT/EN (i18n)
- [x] Notificações de browser
- [x] Netlify Functions para envio de emails (SMTP)

---

## Credenciais de Acesso

### Admin
- Processo: `admin123`
- Palavra-passe: `admin123`
- Nome: Ebenezer Vilola

### Professor
- Processo: `professor123`
- Palavra-passe: `professor123`
- Nome: Eduardo Zamith

### Diretor
- Processo: `diretor123`
- Palavra-passe: `diretor123`
- Nome: Lizandro Sony

### Encarregado
- Processo: `encarregado123`
- Palavra-passe: `encarregado123`
- Nome: Rita José

### Secretaria Académica
- Processo: `secretaria123`
- Palavra-passe: `secretaria123`
- Nome: António Quissanga

### Alunos
- Processos: `aluno1`...`aluno35` com padrão `alunoN123`
- Palavra-passe: igual ao processo (ex: `aluno1123`)
- Estado: inativos até "Criar conta"

---

## Execução Local

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

O backend roda em `http://localhost:5000`

---

## Deploy no Netlify

Arquivo `netlify.toml` configurado:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  VITE_GEMINI_API_KEY = "REPLACE_ME"
```

Configurar no painel do Netlify:
- `VITE_GEMINI_API_KEY` - API key do Google Gemini

### Envio de Boas-Vindas (SMTP)
Configurar no painel do Netlify:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

---

## Estrutura do Projeto

```
/
├── pages/           # Páginas da aplicação
├── components/      # Componentes reutilizáveis
├── backend/         # API Node.js/Express
│   ├── src/routes/  # Rotas da API
│   ├── src/controllers/
│   └── server.js
├── netlify/functions/ # Netlify Functions (send-welcome.js)
└── types.ts         # Tipos TypeScript
```

---

## Observação Técnica

Os dados podem ser armazenados localmente no navegador (`localStorage`) para ambiente offline ou via API com backend SQLite/PostgreSQL para ambiente multiutilizador. O sistema detecta automaticamente a disponibilidade da API e faz fallback para localStorage quando offline.

---

## Funcionalidades Detalhadas por Perfil

### 1. Aluno
*   **Dashboard:** Visão geral com Média Global, Taxa de Presença, Faltas Totais e Provas Agendadas.
*   **Minhas Notas:** Visualização da Mini-Pauta com notas de MAC, NPP, NPT e Média por disciplina. Opção de baixar boletim em HTML.
*   **Assiduidade:** Relatório detalhado de faltas por disciplina e gráfico de aproveitamento de presença. Botão para justificar faltas via WhatsApp.
*   **Horário:** Grade horária semanal da turma.
*   **Biblioteca:** Acesso para baixar manuais, fichas e pautas.
*   **Mensagens:** Comunicação com colegas da turma e professores.
*   **Avisos:** Recebimento de comunicados da Direção e Professores.

### 2. Professor
*   **Dashboard:** Resumo das turmas e atalhos rápidos.
*   **Lançamento de Notas:** Interface para inserir e editar notas (MAC, NPP, NPT) e faltas dos alunos vinculados às suas disciplinas. Cálculo automático de médias.
*   **Horário:** Visualização da carga horária docente.
*   **Biblioteca:** Upload de materiais didáticos (PDF, DOC, ZIP) para os alunos.
*   **Avisos:** Criação de avisos para os alunos.
*   **Coordenação (se atribuído):**
    *   **Coordenador de Curso:** Visão geral estatística do curso, total de alunos/turmas e envio de mensagens em massa (Comunicado Geral).
    *   **Coordenador de Turma:** Lista de estudantes da turma coordenada, status da conta e médias gerais.

### 3. Encarregado de Educação
*   **Dashboard:** Seleção do educando (caso tenha mais de um) para visualizar os dados.
*   **Acompanhamento:** Acesso espelhado às Notas, Assiduidade e Horário do educando selecionado.
*   **Comunicação:** Canal direto para mensagens com a escola.

### 4. Diretor
*   **Dashboard Estratégico:** KPIs institucionais (Matrículas, Aprovação, Abandono).
*   **Estatísticas Académicas:** Gráficos de aprovação por classe e ranking de cursos.
*   **Monitorização Docente:** Acompanhamento do lançamento de notas e pontualidade dos professores.
*   **Institucional:** Visão da estrutura escolar (Cursos, Turmas, Salas) e Organograma.
*   **Auditoria:** Acesso aos logs de segurança do sistema.
*   **Avisos:** Criação de avisos globais para Professores e Alunos.

### 5. Administrador
*   **Gestão de Usuários:** Criação, edição e remoção de contas. Definição de perfis, atribuição de coordenações e reset de senhas.
*   **Configuração do Sistema (Branding):** Personalização do nome da escola, sigla e cores do sistema.
*   **Auditoria:** Visualização e exportação (CSV) de todos os registros de atividades do sistema.
*   **Gestão de Dados:** Opção para resetar o banco de dados local (localStorage).