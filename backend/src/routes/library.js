const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  getLibrary,
  uploadResource,
  incrementDownload,
  deleteResource,
} = require('../controllers/libraryController');
const upload = require('../middleware/upload');

router.use(authMiddleware);

router.get('/', getLibrary);
router.get('/:id/download', incrementDownload);
router.post(
  '/',
  roleMiddleware('Professor', 'Administrador'),
  upload.single('file'),
  uploadResource
);
router.delete('/:id', roleMiddleware('Professor', 'Administrador'), deleteResource);

module.exports = router;
