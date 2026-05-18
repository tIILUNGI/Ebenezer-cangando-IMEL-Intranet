const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');

const getProfile = async (req, res) => {
  try {
    const user = await get(
      'SELECT id, nome, processo, role, email, turma, avatar_url, telefone, bi, coordinator_type, coordinated_entity FROM usuarios WHERE id = ?',
      [req.user.userId]
    );
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);
    const userId = req.user.userId;

    const allowedFields = ['nome', 'email', 'telefone', 'bi'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    // Check email uniqueness if email is being updated
    if (data.email) {
      const existing = await get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [
        data.email,
        userId,
      ]);
      if (existing) return res.status(409).json({ error: 'Email já está em uso' });
    }

    values.push(userId);
    await run(`UPDATE usuarios SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`, [
      ...values,
      new Date().toISOString(),
    ]);

    const updated = await get(
      'SELECT id, nome, processo, role, email, turma, avatar_url, telefone, bi FROM usuarios WHERE id = ?',
      [userId]
    );
    res.json(updated);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const exportProfileData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const grades = await all('SELECT * FROM pautas WHERE aluno_id = ?', [userId]);
    const auditLogs = await all('SELECT * FROM logs_auditoria WHERE usuario_id = ?', [userId]);

    const data = {
      user_info: user,
      academic_records: grades,
      audit_logs: auditLogs,
      export_date: new Date().toISOString(),
      school: 'IMEL',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dados_pessoais_${user.processo}_${new Date().toISOString().split('T')[0]}.json`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
};

module.exports = { getProfile, updateProfile, exportProfileData };
