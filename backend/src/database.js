const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'imel.db'), (err) => {
  if (err) console.error('Erro ao conectar ao banco:', err);
  else console.log('✅ Conectado ao banco SQLite');
});

// Serial wrapper para promises
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// Criação das tabelas
const createTables = async () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      processo TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Aluno','Professor','Administrador','Diretor','Encarregado')),
      email TEXT UNIQUE,
      senha_hash TEXT NOT NULL,
      turma TEXT,
      avatar_url TEXT,
      status TEXT DEFAULT 'Ativo' CHECK(status IN ('Ativo','Inativo','Suspenso')),
      ultimo_login TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      bi TEXT,
      telefone TEXT,
      coordinator_type TEXT CHECK(coordinator_type IN ('curso','turma',NULL)),
      coordinated_entity TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS disciplinas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      abreviatura TEXT NOT NULL,
      codigo_mec TEXT UNIQUE,
      ano_curricular INTEGER,
      tipo TEXT DEFAULT 'Técnica' CHECK(tipo IN ('Técnica','Geral','Complementar'))
    )`,

    `CREATE TABLE IF NOT EXISTS pautas (
      id TEXT PRIMARY KEY,
      aluno_id TEXT NOT NULL,
      disciplina_id TEXT NOT NULL,
      professor_id TEXT NOT NULL,
      trimestre INTEGER NOT NULL CHECK(trimestre IN (1,2,3)),
      mac REAL,
      npp REAL,
      npt REAL,
      media REAL,
      faltas INTEGER DEFAULT 0,
      data_lancamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ultima_edicao_por TEXT,
      FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
      FOREIGN KEY (professor_id) REFERENCES usuarios(id),
      FOREIGN KEY (ultima_edicao_por) REFERENCES usuarios(id),
      UNIQUE(aluno_id, disciplina_id, trimestre)
    )`,

    `CREATE TABLE IF NOT EXISTS horarios (
      id TEXT PRIMARY KEY,
      dia_semana TEXT NOT NULL CHECK(dia_semana IN ('Segunda','Terça','Quarta','Quinta','Sexta','Sábado')),
      tempo_ordem INTEGER NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      disciplina_id TEXT,
      professor_id TEXT,
      sala TEXT,
      turma TEXT,
      FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
      FOREIGN KEY (professor_id) REFERENCES usuarios(id)
    )`,

    `CREATE TABLE IF NOT EXISTS biblioteca (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      disciplina_id TEXT,
      tipo TEXT NOT NULL CHECK(tipo IN ('PDF','DOC','VIDEO','ZIP')),
      url_ficheiro TEXT NOT NULL,
      autor_id TEXT,
      tamanho TEXT,
      data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      downloads INTEGER DEFAULT 0,
      turma_target TEXT DEFAULT 'Todas',
      FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
      FOREIGN KEY (autor_id) REFERENCES usuarios(id)
    )`,

    `CREATE TABLE IF NOT EXISTS mensagens (
      id TEXT PRIMARY KEY,
      remetente_id TEXT NOT NULL,
      destinatario_id TEXT NOT NULL,
      assunto TEXT,
      conteudo TEXT NOT NULL,
      lida BOOLEAN DEFAULT 0,
      enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS logs_auditoria (
      id TEXT PRIMARY KEY,
      usuario_id TEXT,
      acao TEXT NOT NULL,
      modulo TEXT,
      alvo_id TEXT,
      detalhes TEXT,
      ip_endereco TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )`,

    `CREATE TABLE IF NOT EXISTS notificacoes (
      id TEXT PRIMARY KEY,
      usuario_id TEXT,
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('Aviso','Nota','Mensagem','Sistema')) DEFAULT 'Aviso',
      lida BOOLEAN DEFAULT 0,
      target_audience TEXT,
      author_name TEXT,
      criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS justificacoes (
      id TEXT PRIMARY KEY,
      aluno_id TEXT NOT NULL,
      aluno_nome TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      schoolName TEXT NOT NULL DEFAULT 'Instituto Médio de Economia de Luanda',
      schoolAcronym TEXT NOT NULL DEFAULT 'Intra IMEL',
      primaryColor TEXT NOT NULL DEFAULT '#003366',
      secondaryColor TEXT NOT NULL DEFAULT '#FFD700',
      version TEXT NOT NULL DEFAULT '3.1.0',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const table of tables) {
    await run(table);
  }
  console.log('✅ Tabelas criadas/verificadas');
  };

  // Seed data inicial
  const seedData = async () => {
    const usersCount = await all('SELECT COUNT(*) as count FROM usuarios');
    if (usersCount[0].count > 0) {
      console.log('⚡ Seed já existente, pulando...');
      return;
    }

    const saltRounds = 12;
    const hash1 = await bcrypt.hash('admin123', saltRounds);
    const hash2 = await bcrypt.hash('professor123', saltRounds);
    const hash3 = await bcrypt.hash('diretor123', saltRounds);
    const hash4 = await bcrypt.hash('encarregado123', saltRounds);
    const hash5 = await bcrypt.hash('secretaria123', saltRounds);

    // Utilizadores base
    const users = [
      {
        id: 'usr-admin-1',
        nome: 'Ebenezer Vilola',
        processo: 'admin123',
        role: 'Administrador',
        email: 'admin@imel.edu.ao',
        hash: hash1,
        role_en: 'admin',
      },
      {
        id: 'usr-prof-1',
        nome: 'Eduardo Zamith',
        processo: 'professor123',
        role: 'Professor',
        email: 'prof@imel.edu.ao',
        hash: hash2,
        role_en: 'professor',
      },
      {
        id: 'usr-dir-1',
        nome: 'Lizandro Sony',
        processo: 'diretor123',
        role: 'Diretor',
        email: 'diretor@imel.edu.ao',
        hash: hash3,
        role_en: 'diretor',
      },
      {
        id: 'usr-enc-1',
        nome: 'Rita José',
        processo: 'encarregado123',
        role: 'Encarregado',
        email: 'enc@imel.edu.ao',
        hash: hash4,
        role_en: 'encarregado',
      },
      {
        id: 'usr-sec-1',
        nome: 'António Quissanga',
        processo: 'secretaria123',
        role: 'Administrador',
        email: 'sec@imel.edu.ao',
        hash: hash5,
        role_en: 'admin',
      },
    ];

    for (const u of users) {
      await run(
        `INSERT INTO usuarios (id, nome, processo, role, email, senha_hash, turma, status, coordinator_type, coordinated_entity) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Ativo', ?, ?)`,
        [
          u.id,
          u.nome,
          u.processo,
          u.role,
          u.email,
          u.hash,
          u.role === 'Aluno' ? 'I12B' : null,
          u.role_en === 'professor' ? 'curso' : null,
          u.role_en === 'professor' ? 'Informática' : null,
        ]
      );
    }

    // Alunos mock
    const studentNames = [
    // I12B — Informática de Gestão (35 alunos)
    'Alexandre Alfredo Tumbo',
    'Antonio Quissanga',
    'Pedro Afonso',
    'Maria Diniz',
    'António Costa',
    'Beatriz Silva',
    'Carlos Jorge',
    'Daniela Bento',
    'Edgar Neto',
    'Feliciana Cruz',
    'Gabriel Luamba',
    'Helena Paulo',
    'Igor Gomes',
    'Janeth Faria',
    'Kevin Santos',
    'Lurdes Mendes',
    'Manuel Diogo',
    'Nádia Rocha',
    'Osvaldo Jamba',
    'Patrícia Lima',
    'Quintino Vaz',
    'Rosa Mateus',
    'Sérgio Vunge',
    'Teresa Gunga',
    'Uíge Manuel',
    'Valter Nery',
    'Wilson Cabaça',
    'Xavier Tchipenda',
    'Yuri Boy',
    'Zuleica Graça',
    'Alberto Kiala',
    'Branca de Neve',
    'Custódio Mateus',
    'Diogo Cão',
    'Evaristo Costa',
    // C12A — Contabilidade (5 alunos)
    'Fernanda Kiala',
    'Gelson Neto',
    'Heloísa Paulo',
    'Ivan Santos',
    'Jéssica Tchipenda',
    // C12B — Comunicação Social (5 alunos)
    'Kélsia Muanda',
    'Lúcio Costa',
    'Márcia Sebastião',
    'Nelo Vunge',
    'Orlando Gunga',
  ];

  // Turmas now include the two new classes
  const turmaList = ['I12A', 'I12B', 'I11A', 'I11B', 'I10A', 'C12A', 'C12B'];
  // Contabilidade and Comunicação Social IDs start where I12B left off (std-36 … std-45)
  const contabStart = 35; // indices 35-39
  const comunicaStart = 40; // indices 40-44

  // Extended + new discipline IDs & names
  const subjectIds = [
    'disc-1',  'disc-2',  'disc-3',  'disc-4',   'disc-5',   'disc-6',   'disc-7',    'disc-8',     'disc-9',   'disc-10',
    'disc-11', 'disc-12', 'disc-13', 'disc-14',   'disc-15',   'disc-16',   'disc-17',   'disc-18',   'disc-19',  'disc-20',
  ];
  const subjectNames = [
    // I12B — Inf. Gestão
    'TLP',
    'TRECE (Redes)',
    'Sistemas de Info.',
    'Matemática',
    'Inglês Técnico',
    'IAG',
    'Empreendedorismo',
    'Inglês Técnico II',
    'OAE',
    'PT',
    // C12A — Contabilidade
    'Contabilidade Geral',
    'Contabilidade Fiscal',
    'Contabilidade de Gestão',
    'Matemática Financeira',
    'Economia',
    'Direito Comercial',
    'Inglês Técnico',
    'Estatística',
    'Empreendedorismo',
    'Informática Aplicada',
  ];
  // C12B (Comunicação Social) subjects re-use disc-1..10 IDs with the same names in the MOCK data;
  // they are differentiated by the teacher id.

  // Second professor id for C12A contabilidade (disc-11 onwards) and third for C12B
  const usersToInsert = [];

  for (let i = 0; i < studentNames.length; i++) {
    let passwordPrefix;
    if (i < 35) {
      passwordPrefix = `aluno${i + 1}123`;
    } else if (i < contabStart + 5) {
      passwordPrefix = `contab${i - contabStart + 1}123`;
    } else {
      passwordPrefix = `comunica${i - comunicaStart + 1}123`;
    }

    let turma, email;
    if (i < 35) {
      turma = turmaList[i % 5];    // original 5 turmas
      email = `${passwordPrefix}@imel.edu.ao`;
    } else if (i < contabStart + 5) {
      const idx = i - contabStart;
      turma = 'C12A (Contabilidade)';
      email = `contab${idx + 1}@imel.edu.ao`;
    } else {
      const idx = i - comunicaStart;
      turma = 'C12B (Comunicação Social)';
      email = `comunica${idx + 1}@imel.edu.ao`;
    }

    const passHash = await bcrypt.hash(`${passwordPrefix}`, saltRounds); // password == processNumber
    const userId = i < 35 ? `std-${i + 1}` : i < contabStart + 5
      ? `std-c12a-${i - contabStart + 1}`
      : `std-c12b-${i - comunicaStart + 1}`;

    usersToInsert.push({ userId, nome: studentNames[i], processo: passwordPrefix, email, passHash, turma });
  }

  // Insert all students
  for (const u of usersToInsert) {
    await run(
      `INSERT INTO usuarios (id, nome, processo, role, email, senha_hash, turma, is_active) 
       VALUES (?, ?, ?, 'Aluno', ?, ?, ?, 1)`,
      [u.userId, u.nome, u.processo, u.email, u.passHash, u.turma]
    );
  }

  // ── Disciplinas ──
  const contabDisc = [
    ['disc-11', 'Contabilidade Geral',    'CONT.GER'],
    ['disc-12', 'Contabilidade Fiscal',   'CONT.FIS'],
    ['disc-13', 'Contabilidade de Gestão','CONT.GES'],
    ['disc-14', 'Matemática Financeira',  'MAT.FIN'],
    ['disc-15', 'Economia',               'ECON'],
    ['disc-16', 'Direito Comercial',      'DIR.COM'],
    ['disc-17', 'Inglês Técnico',         'ING.TEC'],
    ['disc-18', 'Estatística',            'ESTAT'],
    ['disc-19', 'Empreendedorismo',       'EMPRE'],
    ['disc-20', 'Informática Aplicada',   'INF.APL'],
  ];

  for (const [id, nome, abrev] of [...subjectNames.slice(0, 10).map((n, j) => [subjectIds[j], n, n.substring(0, 7).toUpperCase()]), ...contabDisc]) {
    await run(`INSERT INTO disciplinas (id, nome, abreviatura) VALUES (?, ?, ?)`, [id, nome, abrev]);
  }

  // ── Pautas (grades) ──
  // C12A students (indices 35-39) get grades for disc-11..disc-20
  for (let i = 0; i < 5; i++) {
    const studentId = `std-c12a-${i + 1}`;
    for (let j = 0; j < 10; j++) {
      const mac = 10 + Math.floor(Math.random() * 8);
      const npp = 10 + Math.floor(Math.random() * 8);
      const npt = 10 + Math.floor(Math.random() * 8);
      const avg = Math.round((mac + npp + npt) / 3);
      const faltas = Math.floor(Math.random() * 5);
      await run(
        `INSERT INTO pautas (id, aluno_id, disciplina_id, professor_id, trimestre, mac, npp, npt, media, faltas) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`grade-c12a-${i}-${j}`, studentId, subjectIds[10 + j], 'usr-prof-3', 1, mac, npp, npt, avg, faltas]
      );
    }
  }

   // C12B students (indices 40-44) get grades for disc-1..disc-10 (reusing teacher id 7 = usr-prof-7)
  for (let i = 0; i < 5; i++) {
    const studentId = `std-c12b-${i + 1}`;
    for (let j = 0; j < 10; j++) {
      const mac = 10 + Math.floor(Math.random() * 8);
      const npp = 10 + Math.floor(Math.random() * 8);
      const npt = 10 + Math.floor(Math.random() * 8);
      const avg = Math.round((mac + npp + npt) / 3);
      const faltas = Math.floor(Math.random() * 5);
      await run(
        `INSERT INTO pautas (id, aluno_id, disciplina_id, professor_id, trimestre, mac, npp, npt, media, faltas) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`grade-c12b-${i}-${j}`, studentId, subjectIds[j], 'usr-prof-7', 1, mac, npp, npt, avg, faltas]
      );
    }
  }

  // ── Encarregados para as novas turmas ──
  const encHash = '$2b$12$454r2Cb5etZ1dGvba7kWRueXDcdusPkJdeLVVD7GlVen6unV0ClcC';
  await run(
    `INSERT INTO usuarios (id, nome, processo, role, email, senha_hash, turma, is_active) 
     VALUES (?, ?, ?, 'Encarregado', ?, ?, ?, 1)`,
    ['enc-c12a-1', 'Manuel da Conta', 'enc_c12a_1', 'enc_c12a_1@imel.edu.ao', encHash, 'C12A (Contabilidade)']
  );
  await run(
    `INSERT INTO usuarios (id, nome, processo, role, email, senha_hash, turma, is_active) 
     VALUES (?, ?, ?, 'Encarregado', ?, ?, ?, 1)`,
    ['enc-c12b-1', 'Sofia Media', 'enc_c12b_1', 'enc_c12b_1@imel.edu.ao', encHash, 'C12B (Comunicação Social)']
  );

  // ── Encarregado → aluno mappings ──
  await run(`INSERT INTO justificacoes (id, aluno_id, aluno_nome) VALUES (?, ?, ?)`,
    ['enc-c12a-1', 'std-c12a-1', 'Fernanda Kiala']);
  await run(`INSERT INTO justificacoes (id, aluno_id, aluno_nome) VALUES (?, ?, ?)`,
    ['enc-c12b-1', 'std-c12b-1', 'Kélsia Muanda']);

  console.log('✅ Seed data inserido com sucesso');
};

module.exports = { db, run, get, all, createTables, seedData };
