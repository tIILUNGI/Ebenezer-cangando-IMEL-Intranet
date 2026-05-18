const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db, run, get, all } = require('../database');

const sanitizeInput = (obj) => {
  if (!obj) return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.nome,
      role: user.role,
      processNumber: user.processo,
      turma: user.turma,
      coordinatorType: user.coordinator_type,
      coordinatedEntity: user.coordinated_entity,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const login = async (req, res) => {
  try {
    const { processNumber, password } = sanitizeInput(req.body);
    if (!processNumber || !password) {
      return res.status(400).json({ error: 'Número de processo e palavra-passe são obrigatórios' });
    }
    const user = await get('SELECT * FROM usuarios WHERE processo = ?', [processNumber]);
    if (!user) {
      await run(
        'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
        [
          `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          null,
          'LOGIN_FALHOU',
          `Tentativa falhada para processo: ${processNumber}`,
          req.ip,
        ]
      );
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    if (user.status === 'Inativo' || user.is_active === 0) {
      return res.status(403).json({ error: 'Conta inativa. Contacte a administração.' });
    }
    const validPassword = await bcrypt.compare(password, user.senha_hash);
    if (!validPassword) {
      await run(
        'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
        [
          `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user.id,
          'LOGIN_FALHOU',
          'Senha incorreta',
          req.ip,
        ]
      );
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    await run('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user.id,
        'LOGIN',
        'Login bem-sucedido',
        req.ip,
      ]
    );
    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.nome,
        role: user.role,
        processNumber: user.processo,
        email: user.email,
        phone: user.telefone,
        turma: user.turma,
        avatar: user.avatar_url,
        isActive: user.is_active === 1,
        coordinatorType: user.coordinator_type,
        coordinatedEntity: user.coordinated_entity,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno no login' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token não fornecido' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [decoded.id]);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token inválido' });
  }
};

const logout = async (req, res) => {
  try {
    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'LOGOUT',
        'Logout manual',
        req.ip,
      ]
    );
    res.json({ message: 'Logout efetuado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro no logout' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { processNumber, bi } = sanitizeInput(req.body);
    const user = await get('SELECT * FROM usuarios WHERE processo = ?', [processNumber]);
    if (!user || user.bi !== bi) {
      return res.status(404).json({ error: 'Número de processo ou BI inválido' });
    }
    const resetToken = jwt.sign({ id: user.id, type: 'password_reset' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ message: 'Identidade verificada. Pode redefinir a sua senha.', resetToken });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Erro ao processar pedido' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = sanitizeInput(req.body);
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'As palavras-passe não coincidem' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mínimo 6 caracteres' });
    }
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Token de reset inválido' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [hash, decoded.id]);
    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        decoded.id,
        'RESET_SENHA',
        'Palavra-passe redefinida',
        req.ip,
      ]
    );
    res.json({ message: 'Palavra-passe redefinida com sucesso' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expirado' });
    }
    res.status(500).json({ error: 'Erro ao redefinir palavra-passe' });
  }
};

const createAccount = async (req, res) => {
  try {
    const { processNumber, bi, email, phone, password, confirmPassword } = sanitizeInput(req.body);
    if (!processNumber || !bi || !email || !phone || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As palavras-passe não coincidem' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mínimo 6 caracteres' });
    }
    if (password === processNumber) {
      return res.status(400).json({ error: 'Palavra-passe não pode ser igual ao nº de processo' });
    }
    const existingUser = await get('SELECT id, bi, is_active FROM usuarios WHERE processo = ?', [
      processNumber,
    ]);
    if (!existingUser) {
      return res.status(404).json({ error: 'Número de processo não encontrado' });
    }
    if (existingUser.is_active === 1) {
      return res.status(400).json({ error: 'Conta já ativada' });
    }
    if (existingUser.bi !== bi) {
      return res.status(400).json({ error: 'BI não corresponde ao registado' });
    }
    const hash = await bcrypt.hash(password, 12);
    await run(
      `UPDATE usuarios SET email = ?, telefone = ?, senha_hash = ?, is_active = 1, updated_at = ? WHERE id = ?`,
      [email, phone, hash, new Date().toISOString(), existingUser.id]
    );
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [existingUser.id]);
    const token = generateToken(user);
    res.json({
      message: 'Conta criada com sucesso',
      token,
      user: {
        id: user.id,
        name: user.nome,
        role: user.role,
        processNumber: user.processo,
        email: user.email,
        turma: user.turma,
        isActive: true,
        coordinatorType: user.coordinator_type,
        coordinatedEntity: user.coordinated_entity,
      },
    });
  } catch (err) {
    console.error('Create account error:', err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
};

module.exports = { login, logout, refreshToken, forgotPassword, resetPassword, createAccount };
