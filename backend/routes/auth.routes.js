const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshTokenHandler);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
