// ========================
// ROTAS PRINCIPAIS DA API
// ========================
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getConversations,
  getInbox,
  getAvailableContacts,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.get('/inbox', getInbox);
router.get('/contacts', getAvailableContacts);
router.post(
  '/',
  [
    body('toId').trim().notEmpty().withMessage('Destinatário obrigatório'),
    body('content').trim().notEmpty().withMessage('Conteúdo obrigatório'),
    handleValidationErrors,
  ],
  sendMessage
);
router.patch('/:id/read', markAsRead);
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.userId;
    if (!q || q.length < 2) return res.json([]);
    const results = await require('../database').all(
      `SELECT m.*, u.nome as sender_name FROM mensagens m 
       JOIN usuarios u ON m.remetente_id = u.id 
       WHERE (m.remetente_id = ? OR m.destinatario_id = ?) 
       AND m.conteudo LIKE ? ORDER BY m.enviada_em DESC LIMIT 20`,
      [userId, userId, `%${q}%`]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

module.exports = router;
