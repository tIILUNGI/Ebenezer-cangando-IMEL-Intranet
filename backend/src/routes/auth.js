const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { body, validationResult } = require('express-validator');

const csrfProtection = csrf({ cookie: false });

// Auth controllers
const {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  createAccount,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Validation middleware for auth
const validateLogin = [
  body('processNumber').trim().notEmpty().withMessage('Número de processo é obrigatório'),
  body('password').trim().notEmpty().withMessage('Palavra-passe é obrigatória'),
];

const validateResetPassword = [
  body('newPassword').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.newPassword) throw new Error('Palavras-passe não coincidem');
    return true;
  }),
];

const validateCreateAccount = [
  body('processNumber').trim().notEmpty().withMessage('Número de processo obrigatório'),
  body('bi').trim().notEmpty().withMessage('BI obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').trim().notEmpty().withMessage('Telemóvel obrigatório'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Palavras-passe não coincidem');
    return true;
  }),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Public routes
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);
router.post('/register', validateCreateAccount, handleValidationErrors, createAccount);
router.post('/logout', authMiddleware, logout);

// Protected routes
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
