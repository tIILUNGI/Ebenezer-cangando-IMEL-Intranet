const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getAcademicStats, getKPIs } = require('../controllers/statsController');

router.use(authMiddleware);

router.get('/academic', getAcademicStats);
router.get('/kpis', getKPIs);

module.exports = router;
