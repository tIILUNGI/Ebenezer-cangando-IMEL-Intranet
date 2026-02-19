# SIG-IMEL - Sistema Interno de Gestão Escolar

Frontend em React com persistência em `localStorage`. Sem backend.

---

## Checklist do Sistema

### Autenticação e Perfis
- [x] Login com palavra-passe e conta ativa
- [x] Criação de conta (ativa utilizador e grava e-mail/palavra-passe/telemóvel)
- [x] Recuperação de palavra-passe (código local + atualização)
- [x] Troca de palavra-passe no perfil com validação

### Comunicação e Mensagens
- [x] Mensagens persistentes no `localStorage`
- [x] Mensagens aparecem no destinatário após logout/login
- [x] Filtro de destinatários: não mostra o logado
- [x] Filtro por turma: só mesma turma aparece

### Biblioteca Digital
- [x] Upload real de arquivo (base64 no `localStorage`)
- [x] Download real de arquivo
- [x] Contador de downloads

### Notas e Pautas
- [x] Lançamento de notas com cálculo de média
- [x] Boletim com download (arquivo local)

### Auditoria e Logs
- [x] Logs de ações (criar/alterar utilizador, notas, mensagens, biblioteca)

### IA e Interação
- [x] Insight automático no dashboard
- [x] Perguntas à IA sobre o sistema (botão global)

### Suporte
- [x] WhatsApp abre diretamente: `+244 938 229 459`

### Ano Lectivo
- [x] Atualizado para `2025/2026`

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

```bash
npm install
npm run dev
```

---

## Deploy no Netlify

Arquivo `netlify.toml` já configurado:

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
- `VITE_GEMINI_API_KEY`

### Envio de Boas-Vindas (SMTP)
Configurar no painel do Netlify:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

---

## Observação Técnica
Os dados são armazenados localmente no navegador (`localStorage`). Para um ambiente multiutilizador real, é necessário backend e base de dados.
