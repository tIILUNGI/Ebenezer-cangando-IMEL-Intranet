const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { getGrades, updateGrade, getStudentGrades } = require('../controllers/gradeController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

router.use(authMiddleware);

router.get('/', getGrades);
router.get(
  '/student/:studentId',
  roleMiddleware('Professor', 'Administrador', 'Diretor'),
  getStudentGrades
);
router.put(
  '/:id',
  roleMiddleware('Professor', 'Administrador'),
  [
    body('mac').optional().isFloat({ min: 0, max: 20 }).withMessage('MAC deve estar entre 0 e 20'),
    body('npp').optional().isFloat({ min: 0, max: 20 }).withMessage('NPP deve estar entre 0 e 20'),
    body('npt').optional().isFloat({ min: 0, max: 20 }).withMessage('NPT deve estar entre 0 e 20'),
    body('faltas').optional().isInt({ min: 0 }).withMessage('Faltas deve ser um número positivo'),
    handleValidationErrors,
  ],
  updateGrade
);

module.exports = router;
