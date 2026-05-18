const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  exportProfileData,
} = require('../controllers/profileController');

router.use(authMiddleware);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/me/export', exportProfileData);

module.exports = router;
