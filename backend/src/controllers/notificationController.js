const { run, get, all } = require('../database');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifs = await all(
      `SELECT * FROM notificacoes WHERE usuario_id = ? OR target_audience IS NULL OR target_audience = ?
       ORDER BY criada_em DESC LIMIT 50`,
      [userId, req.userRole]
    );
    res.json(notifs);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await run('UPDATE notificacoes SET lida = 1 WHERE id = ?', [id]);
    res.json({ message: 'Notificação marcada como lida' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
};

const clearNotifications = async (req, res) => {
  try {
    await run('DELETE FROM notificacoes WHERE usuario_id = ?', [req.userId]);
    res.json({ message: 'Notificações limpas' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao limpar notificações' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
    }

    const allowedAudiences = ['Aluno', 'Professor', 'Todos'];
    const audience = allowedAudiences.includes(targetAudience) ? targetAudience : 'Todos';

    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await run(
      `INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, tipo, target_audience, author_name)
       VALUES (?, ?, ?, ?, 'Aviso', ?, ?)`,
      [id, req.userId, title, message, audience, req.userName]
    );

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'CRIOU_AVISO',
        `Criou aviso: ${title}`,
        req.ip,
      ]
    );

    res.status(201).json({ id, message: 'Aviso criado com sucesso' });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: 'Erro ao criar aviso' });
  }
};

module.exports = { getNotifications, markNotificationRead, clearNotifications, createAnnouncement };
