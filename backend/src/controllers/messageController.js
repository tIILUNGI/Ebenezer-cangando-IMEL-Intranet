const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await all(
      `SELECT m.*, u.nome as sender_name, u2.nome as receiver_name 
       FROM mensagens m 
       JOIN usuarios u ON m.remetente_id = u.id 
       JOIN usuarios u2 ON m.destinatario_id = u2.id 
       WHERE m.remetente_id = ? OR m.destinatario_id = ? 
       ORDER BY m.enviada_em DESC`,
      [userId, userId]
    );
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
};

const getInbox = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inbox = await all(
      `SELECT m.*, u.nome as sender_name FROM mensagens m 
       JOIN usuarios u ON m.remetente_id = u.id 
       WHERE m.destinatario_id = ? ORDER BY m.enviada_em DESC`,
      [userId]
    );
    res.json(inbox);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar caixa de entrada' });
  }
};

const getAvailableContacts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [userId]);
    let contacts;
    if (user.turma) {
      contacts = await all(
        `SELECT id, nome, role, turma FROM usuarios WHERE id != ? AND turma = ? AND is_active = 1`,
        [userId, user.turma]
      );
    } else {
      contacts = await all(
        `SELECT id, nome, role, turma FROM usuarios WHERE id != ? AND is_active = 1`,
        [userId]
      );
    }
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar contactos' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);
    const { toId, content, assunto } = data;
    const fromId = req.user.userId;

    if (!toId || !content) {
      return res.status(400).json({ error: 'Destinatário e conteúdo são obrigatórios' });
    }

    const target = await get('SELECT id FROM usuarios WHERE id = ?', [toId]);
    if (!target) return res.status(404).json({ error: 'Destinatário não encontrado' });

    const id = uuidv4();
    await run(
      `INSERT INTO mensagens (id, remetente_id, destinatario_id, assunto, conteudo) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, fromId, toId, assunto || '', content]
    );

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fromId,
        'ENVIOU_MENSAGEM',
        `Enviou mensagem para utilizador ${toId}`,
        req.ip,
      ]
    );

    // Create notification for recipient
    const sender = await get('SELECT nome FROM usuarios WHERE id = ?', [fromId]);
    await run(
      `INSERT INTO notificacoes (id, usuario_id, titulo, mensagem, tipo, target_audience, author_name) 
       VALUES (?, ?, ?, ?, 'Mensagem', ?, ?)`,
      [
        `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        toId,
        'Nova mensagem',
        `${sender.nome} enviou uma mensagem para si.`,
        toId,
        sender.nome,
      ]
    );

    const message = await get('SELECT * FROM mensagens WHERE id = ?', [id]);
    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await run('UPDATE mensagens SET lida = 1 WHERE id = ?', [id]);
    res.json({ message: 'Marcada como lida' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar mensagem' });
  }
};

module.exports = { getConversations, getInbox, getAvailableContacts, sendMessage, markAsRead };
