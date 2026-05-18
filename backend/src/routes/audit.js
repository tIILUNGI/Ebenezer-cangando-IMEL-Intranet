const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { getAuditLogs, exportAuditLogs } = require('../controllers/auditController');

router.use(authMiddleware);

router.get('/', roleMiddleware('Administrador', 'Diretor'), getAuditLogs);
router.get('/export', roleMiddleware('Administrador', 'Diretor'), exportAuditLogs);

module.exports = router;
