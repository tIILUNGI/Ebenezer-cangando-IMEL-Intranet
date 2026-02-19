
-- ==========================================================
-- SCRIPT SQL: SIG-IMEL INTRANET v3.0 (COMPLETE SCHEMA)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS imel_intranet_db;
USE imel_intranet_db;

-- 1. Tabela de Utilizadores (Core)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    processo VARCHAR(20) UNIQUE NOT NULL,
    role ENUM('Aluno', 'Professor', 'Administrador', 'Diretor', 'Encarregado') NOT NULL,
    email VARCHAR(100) UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    turma VARCHAR(50),
    avatar_url VARCHAR(255),
    status ENUM('Ativo', 'Inativo', 'Suspenso') DEFAULT 'Ativo',
    ultimo_login TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabela de Encarregados (Mapeamento de Filhos)
CREATE TABLE IF NOT EXISTS encarregado_alunos (
    encarregado_id INT NOT NULL,
    aluno_id INT NOT NULL,
    parentesco VARCHAR(50),
    PRIMARY KEY (encarregado_id, aluno_id),
    FOREIGN KEY (encarregado_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. Tabela de Disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    codigo_mec VARCHAR(20) UNIQUE,
    ano_curricular INT,
    tipo ENUM('Técnica', 'Geral', 'Complementar') DEFAULT 'Técnica'
);

-- 4. Tabela de Pautas (Notas Trimestrais)
CREATE TABLE IF NOT EXISTS pautas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    professor_id INT NOT NULL,
    trimestre INT NOT NULL, -- 1, 2 ou 3
    mac DECIMAL(4,2), -- Média Avaliação Contínua
    npp DECIMAL(4,2), -- Nota Prova Professor
    npt DECIMAL(4,2), -- Nota Prova Trimestral
    media DECIMAL(4,2),
    faltas INT DEFAULT 0,
    data_lancamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_edicao_por INT,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    FOREIGN KEY (ultima_edicao_por) REFERENCES usuarios(id)
);

-- 5. Tabela de Horários
CREATE TABLE IF NOT EXISTS horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado') NOT NULL,
    tempo_ordem INT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    disciplina_id INT,
    professor_id INT,
    sala VARCHAR(20),
    turma VARCHAR(50),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
);

-- 6. Biblioteca Digital (Recursos)
CREATE TABLE IF NOT EXISTS biblioteca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    disciplina_id INT,
    tipo ENUM('PDF', 'DOC', 'VIDEO', 'ZIP') NOT NULL,
    url_ficheiro VARCHAR(255) NOT NULL,
    autor_id INT,
    tamanho VARCHAR(20),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);

-- 7. Sistema de Mensagens Internas
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    assunto VARCHAR(150),
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)
);

-- 8. Auditoria (Logs de Segurança)
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    modulo VARCHAR(50),
    alvo_id VARCHAR(50),
    detalhes TEXT,
    ip_endereco VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 9. Notificações do Sistema
CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo ENUM('Aviso', 'Nota', 'Mensagem', 'Sistema') DEFAULT 'Aviso',
    lida BOOLEAN DEFAULT FALSE,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- SEED DATA: Disciplinas Obrigatórias
INSERT INTO disciplinas (nome, abreviatura, tipo) VALUES 
('Técnicas de Linguagem de Programação', 'TLP', 'Técnica'),
('Técnicas de Redes de Computadores', 'TRECE', 'Técnica'),
('Matemática', 'MAT', 'Geral'),
('Sistemas de Informação', 'SI', 'Técnica'),
('Língua Portuguesa', 'LP', 'Geral'),
('Organização e Gestão de Empresas', 'OGE', 'Técnica'),
('Empreendedorismo', 'EMP', 'Geral'),
('Inglês Técnico', 'ING', 'Geral'),
('Projecto Tecnológico', 'PAPE', 'Técnica'),
('Educação Física', 'EF', 'Geral');

-- SEED DATA: Administrador Padrão
INSERT INTO usuarios (nome, processo, role, email, senha_hash) 
VALUES ('Administrador Geral', '999000', 'Administrador', 'admin@imel.edu.ao', '$2y$10$EXAMPLE_HASH');
