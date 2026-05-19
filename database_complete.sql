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
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_processo (processo),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- 2. Tabela de Encarregados (Mapeamento de Filhos)
CREATE TABLE IF NOT EXISTS encarregado_alunos (
    encarregado_id INT NOT NULL,
    aluno_id INT NOT NULL,
    parentesco VARCHAR(50),
    PRIMARY KEY (encarregado_id, aluno_id),
    FOREIGN KEY (encarregado_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_encarregado (encarregado_id),
    INDEX idx_aluno (aluno_id)
);

-- 3. Tabela de Disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    codigo_mec VARCHAR(20) UNIQUE,
    ano_curricular INT,
    tipo ENUM('Técnica', 'Geral', 'Complementar') DEFAULT 'Técnica',
    INDEX idx_nome (nome),
    INDEX idx_abreviatura (abreviatura),
    INDEX idx_tipo (tipo)
);

-- 4. Tabela de Pautas (Notas Trimestrais)
CREATE TABLE IF NOT EXISTS pautas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    professor_id INT NOT NULL,
    trimestre INT NOT NULL CHECK (trimestre IN (1, 2, 3)), -- 1, 2 ou 3
    mac DECIMAL(4,2), -- Média Avaliação Contínua
    npp DECIMAL(4,2), -- Nota Prova Professor
    npt DECIMAL(4,2), -- Nota Prova Trimestral
    media DECIMAL(4,2) AS ((mac + npp + npt) / 3) STORED, -- Média calculada e armazenada
    faltas INT DEFAULT 0,
    data_lancamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_edicao_por INT,
    UNIQUE KEY unique_aluno_disciplina_trimestre (aluno_id, disciplina_id, trimestre),
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    FOREIGN KEY (ultima_edicao_por) REFERENCES usuarios(id),
    INDEX idx_aluno (aluno_id),
    INDEX idx_disciplina (disciplina_id),
    INDEX idx_professor (professor_id),
    INDEX idx_trimestre (trimestre)
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
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    INDEX idx_dia_semana (dia_semana),
    INDEX idx_tempo_ordem (tempo_ordem),
    INDEX idx_disciplina (disciplina_id),
    INDEX idx_professor (professor_id),
    INDEX idx_turma (turma)
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
    downloads INT DEFAULT 0,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (autor_id) REFERENCES usuarios(id),
    INDEX idx_disciplina (disciplina_id),
    INDEX idx_autor (autor_id),
    INDEX idx_tipo (tipo),
    INDEX idx_data_upload (data_upload)
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
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    INDEX idx_remetente (remetente_id),
    INDEX idx_destinatario (destinatario_id),
    INDEX idx_lida (lida),
    INDEX idx_enviada_em (enviada_em)
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
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_modulo (modulo),
    INDEX idx_timestamp (timestamp)
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
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_lida (lida),
    INDEX idx_criada_em (criada_em)
);

-- 10. Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descricao VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    atualizado_por INT,
    FOREIGN KEY (atualizado_por) REFERENCES usuarios(id),
    INDEX idx_chave (chave)
);

-- 11. Tabela de Turmas (para melhor gestão)
CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    curso VARCHAR(100),
    ano_letivo VARCHAR(20),
    ativa BOOLEAN DEFAULT TRUE,
    INDEX idx_nome (nome),
    INDEX idx_curso (curso),
    INDEX idx_ano_letivo (ano_letivo),
    INDEX idx_ativa (ativa)
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
('Educação Física', 'EF', 'Geral')
ON DUPLICATE KEY UPDATE nome=VALUES(nome), abreviatura=VALUES(abreviatura), tipo=VALUES(tipo);

-- SEED DATA: Turmas
INSERT INTO turmas (nome, curso, ano_letivo) VALUES 
('I12B (Inf. Gestão)', 'Informática de Gestão', '2025/2026'),
('C12A (Contabilidade)', 'Contabilidade', '2025/2026'),
('C12B (Comunicação Social)', 'Comunicação Social', '2025/2026')
ON DUPLICATE KEY UPDATE nome=VALUES(nome), curso=VALUES(curso), ano_letivo=VALUES(ano_letivo);

-- SEED DATA: Administrador Padrão
INSERT INTO usuarios (nome, processo, role, email, senha_hash) 
VALUES ('Administrador Geral', '999000', 'Administrador', 'admin@imel.edu.ao', '$2y$10$EXAMPLE_HASH')
ON DUPLICATE KEY UPDATE nome=VALUES(nome), role=VALUES(role), email=VALUES(email);

-- SEED DATA: Configurações Padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('school_name', 'Instituto Médio de Economia de Luanda', 'Nome da instituição'),
('school_acronym', 'Intra IMEL', 'Sigla da instituição'),
('primary_color', '#003366', 'Cor primária da identidade visual'),
('secondary_color', '#FFD700', 'Cor secundária da identidade visual'),
('academic_year', '2025/2026', 'Ano letivo atual'),
('grading_period', 'trimestral', 'Tipo de período de avaliação')
ON DUPLICATE KEY UPDATE valor=VALUES(valor), descricao=VALUES(descricao);

-- ==========================================================
-- VIEWS PARA RELATÓRIOS E ESTATÍSTICAS
-- ==========================================================

-- View para médias dos alunos por disciplina
CREATE OR REPLACE VIEW vw_medias_alunos AS
SELECT 
    u.id as aluno_id,
    u.nome as aluno_nome,
    u.processo as aluno_processo,
    u.turma as aluno_turma,
    d.id as disciplina_id,
    d.nome as disciplina_nome,
    d.abreviatura as disciplina_abreviatura,
    p.trimestre,
    p.mac,
    p.npp,
    p.npt,
    p.media,
    p.faltas
FROM pautas p
JOIN usuarios u ON p.aluno_id = u.id
JOIN disciplinas d ON p.disciplina_id = d.id
WHERE u.role = 'Aluno';

-- View para horários por turma
CREATE OR REPLACE VIEW vw_horarios_turma AS
SELECT 
    h.id,
    h.dia_semana,
    h.tempo_ordem,
    h.hora_inicio,
    h.hora_fim,
    d.nome as disciplina_nome,
    d.abreviatura as disciplina_abreviatura,
    CONCAT(u.nome) as professor_nome,
    h.sala,
    h.turma
FROM horarios h
LEFT JOIN disciplinas d ON h.disciplina_id = d.id
LEFT JOIN usuarios u ON h.professor_id = u.id
ORDER BY h.dia_semana, h.tempo_ordem;

-- View para contagem de mensagens não lidas
CREATE OR REPLACE VIEW vw_mensagens_nao_lidas AS
SELECT 
    destinatario_id,
    COUNT(*) as total_nao_lidas
FROM mensagens
WHERE lida = FALSE
GROUP BY destinatario_id;

-- View para contagem de notificações não lidas
CREATE OR REPLACE VIEW vw_notificacoes_nao_lidas AS
SELECT 
    usuario_id,
    COUNT(*) as total_nao_lidas
FROM notificacoes
WHERE lida = FALSE
GROUP BY usuario_id;

-- ==========================================================
-- PROCEDURES ARMAZENADAS
-- ==========================================================

-- Procedure para calcular média trimestral de um aluno em uma disciplina
DELIMITER //
CREATE PROCEDURE sp_calcular_media_trimestral(
    IN p_aluno_id INT,
    IN p_disciplina_id INT,
    IN p_trimestre INT
)
BEGIN
    SELECT 
        mac,
        npp,
        npt,
        (mac + npp + npt) / 3 as media_calculada
    FROM pautas
    WHERE aluno_id = p_aluno_id
    AND disciplina_id = p_disciplina_id
    AND trimestre = p_trimestre;
END //
DELIMITER ;

-- Procedure para lançar ou atualizar notas
DELIMITER //
CREATE PROCEDURE sp_lancar_notas(
    IN p_aluno_id INT,
    IN p_disciplina_id INT,
    IN p_professor_id INT,
    IN p_trimestre INT,
    IN p_mac DECIMAL(4,2),
    IN p_npp DECIMAL(4,2),
    IN p_npt DECIMAL(4,2),
    IN p_usuario_edicao INT
)
BEGIN
    INSERT INTO pautas (aluno_id, disciplina_id, professor_id, trimestre, mac, npp, npt, ultima_edicao_por)
    VALUES (p_aluno_id, p_disciplina_id, p_professor_id, p_trimestre, p_mac, p_npp, p_npt, p_usuario_edicao)
    ON DUPLICATE KEY UPDATE
        mac = p_mac,
        npp = p_npp,
        npt = p_npt,
        ultima_edicao_por = p_usuario_edicao,
        data_lancamento = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- ==========================================================
-- TRIGGERS
-- ==========================================================

-- Trigger para atualizar timestamp de atualização dos usuários
CREATE TRIGGER trg_usuarios_atualizacao
BEFORE UPDATE ON usuarios
FOR EACH ROW
SET NEW.atualizado_em = CURRENT_TIMESTAMP;

-- ==========================================================
-- FIM DO SCRIPT
-- ==========================================================