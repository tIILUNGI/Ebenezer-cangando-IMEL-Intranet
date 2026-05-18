const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getSchedule,
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
  getAvailableSubjects,
} = require('../controllers/scheduleController');

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

router.use(authMiddleware);

router.get('/', getSchedule);
router.get('/subjects', getAvailableSubjects);
router.post(
  '/',
  roleMiddleware('Administrador', 'Diretor'),
  [
    body('dia_semana')
      .isIn(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'])
      .withMessage('Dia inválido'),
    body('tempo_ordem').isInt({ min: 1, max: 5 }).withMessage('Tempo de ordem inválido'),
    body('hora_inicio')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora de início inválida'),
    body('hora_fim')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora de fim inválida'),
    handleValidationErrors,
  ],
  createScheduleEntry
);
router.put('/:id', roleMiddleware('Administrador', 'Diretor'), updateScheduleEntry);
router.delete('/:id', roleMiddleware('Administrador', 'Diretor'), deleteScheduleEntry);

module.exports = router;
