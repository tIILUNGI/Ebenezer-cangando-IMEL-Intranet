const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all users (admin/director only)
const getAllUsers = async (req, res) => {
  try {
    const users = await all(`SELECT id, nome, processo, role, email, turma, avatar_url, 
      status, coordinator_type, coordinated_entity, is_active, created_at 
      FROM usuarios ORDER BY nome`);
    const safeUsers = users.map((u) => ({
      ...u,
      isActive: u.is_active === 1,
    }));
    res.json(safeUsers);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Erro ao buscar utilizadores' });
  }
};

// Get single user by id
const getUserById = async (req, res) => {
  try {
    const user = await get(
      'SELECT id, nome, processo, role, email, turma, avatar_url, telefone, bi, coordinator_type, coordinated_entity, is_active FROM usuarios WHERE id = ?',
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json({ ...user, isActive: user.is_active === 1 });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar utilizador' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);
    const {
      nome,
      processNumber: processo,
      bi,
      role,
      email,
      telefone,
      turma,
      password,
      isActive,
      coordinatorType,
      coordinatedEntity,
    } = data;

    if (!nome || !processo || !role) {
      return res.status(400).json({ error: 'Nome, processo e papel são obrigatórios' });
    }

    const existing = await get('SELECT id FROM usuarios WHERE processo = ?', [processo]);
    if (existing) return res.status(409).json({ error: 'Número de processo já existe' });

    if (email) {
      const emailExists = await get('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (emailExists) return res.status(409).json({ error: 'Email já existe' });
    }

    const hash = password
      ? await require('bcrypt').hash(password, 12)
      : await require('bcrypt').hash('123456', 12);
    const id = uuidv4();

    await run(
      `INSERT INTO usuarios (id, nome, processo, role, email, senha_hash, turma, bi, telefone, status, is_active, coordinator_type, coordinated_entity) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ativo', ?, ?, ?)`,
      [
        id,
        nome,
        processo,
        role,
        email,
        hash,
        turma,
        bi,
        telefone,
        isActive ? 1 : 0,
        coordinatorType || null,
        coordinatedEntity || null,
      ]
    );

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'CRIOU_USUARIO',
        `Criou utilizador: ${nome} (${processo})`,
        req.ip,
      ]
    );

    const newUser = await get('SELECT * FROM usuarios WHERE id = ?', [id]);
    res.status(201).json({ ...newUser, isActive: newUser.is_active === 1 });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Erro ao criar utilizador' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);
    const { id } = req.params;

    const user = await get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });

    const allowedFields = [
      'nome',
      'processo',
      'role',
      'email',
      'turma',
      'bi',
      'telefone',
      'avatar_url',
      'is_active',
      'coordinator_type',
      'coordinated_entity',
    ];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(new Date().toISOString(), id);
    await run(`UPDATE usuarios SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`, values);

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'ALTEROU_USUARIO',
        `Atualizou utilizador: ${user.nome} - Campos: ${updates.map((u, i) => `${updates[i].split('=')[0].trim()}`).join(', ')}`,
        req.ip,
      ]
    );

    const updatedUser = await get('SELECT * FROM usuarios WHERE id = ?', [id]);
    res.json({ ...updatedUser, isActive: updatedUser.is_active === 1 });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Erro ao atualizar utilizador' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });

    if (user.role === 'Administrador') {
      const adminCount = await get(
        'SELECT COUNT(*) as count FROM usuarios WHERE role = "Administrador"'
      );
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Não pode remover o último administrador' });
      }
    }

    await run('DELETE FROM usuarios WHERE id = ?', [id]);
    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'REMOVEU_USUARIO',
        `Removeu utilizador: ${user.nome} (${user.processo})`,
        req.ip,
      ]
    );
    res.json({ message: 'Utilizador removido com sucesso' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Erro ao remover utilizador' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = sanitizeInput(req.body);
    const userId = req.userId;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'As palavras-passe não coincidem' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mínimo 6 caracteres' });
    }

    const user = await get('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const validPassword = await require('bcrypt').compare(currentPassword, user.senha_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Palavra-passe atual incorreta' });
    }
    if (newPassword === user.processo) {
      return res.status(400).json({ error: 'Palavra-passe não pode ser igual ao nº de processo' });
    }

    const hash = await require('bcrypt').hash(newPassword, 12);
    await run('UPDATE usuarios SET senha_hash = ?, updated_at = ? WHERE id = ?', [
      hash,
      new Date().toISOString(),
      userId,
    ]);
    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        'ALTEROU_SENHA',
        'Alterou palavra-passe',
        req.ip,
      ]
    );
    res.json({ message: 'Palavra-passe atualizada com sucesso' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Erro ao alterar palavra-passe' });
  }
};

// Export users CSV
const exportUsersCSV = async (req, res) => {
  try {
    const users = await all(
      'SELECT id, nome, processo, role, email, turma, is_active, created_at FROM usuarios'
    );
    const header = 'ID;Nome;Processo;Papel;Email;Turma;Ativo;Criado Em\n';
    const rows = users
      .map((u) =>
        [
          u.id,
          u.nome,
          u.processo,
          u.role,
          u.email || '',
          u.turma || '',
          u.is_active ? 'Sim' : 'Não',
          u.created_at,
        ].join(';')
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=utilizadores_imel.csv');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao exportar' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  exportUsersCSV,
};
