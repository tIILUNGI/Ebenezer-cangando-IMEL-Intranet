const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  exportUsersCSV,
} = require('../controllers/userController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

router.use(authMiddleware);

router.get('/', roleMiddleware('Administrador', 'Diretor'), getAllUsers);
router.get('/export', roleMiddleware('Administrador', 'Diretor'), exportUsersCSV);
router.get('/:id', authMiddleware, getUserById);
router.post(
  '/',
  roleMiddleware('Administrador', 'Diretor'),
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório'),
    body('processNumber').trim().notEmpty().withMessage('Processo obrigatório'),
    body('role')
      .isIn(['Aluno', 'Professor', 'Administrador', 'Diretor', 'Encarregado'])
      .withMessage('Papel inválido'),
    handleValidationErrors,
  ],
  createUser
);
router.put('/:id', roleMiddleware('Administrador', 'Diretor'), updateUser);
router.delete('/:id', roleMiddleware('Administrador'), deleteUser);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
