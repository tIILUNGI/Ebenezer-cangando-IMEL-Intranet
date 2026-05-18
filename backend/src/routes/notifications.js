const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationRead,
  clearNotifications,
  createAnnouncement,
} = require('../controllers/notificationController');

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

router.use(authMiddleware);

router.get('/', getNotifications);
router.post(
  '/announcement',
  roleMiddleware('Diretor', 'Administrador'),
  [
    body('title').trim().notEmpty().withMessage('Título obrigatório'),
    body('message').trim().notEmpty().withMessage('Mensagem obrigatória'),
    handleValidationErrors,
  ],
  createAnnouncement
);
router.patch('/:id/read', markNotificationRead);
router.delete('/clear', clearNotifications);

module.exports = router;
