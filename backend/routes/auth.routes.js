const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { auditLoggerMiddleware } = require('../middleware/audit-logger');

router.post('/login', authController.login);
router.post('/refresh', authController.refreshTokenHandler);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, auditLoggerMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, auditLoggerMiddleware, authController.changePassword);

module.exports = router;
