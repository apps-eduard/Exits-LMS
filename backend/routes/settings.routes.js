const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkScope } = require('../middleware/rbac.middleware');
const tenantIsolation = require('../middleware/tenant-isolation.middleware');

// ============ PLATFORM SETTINGS (Super Admin Only) ============
// All platform settings routes require super-admin authentication
router.use(authMiddleware);

// Platform settings routes (require platform scope)
router.get('/', checkScope('platform'), settingsController.getSettings);
router.get('/:key', checkScope('platform'), settingsController.getSetting);
router.put('/', checkScope('platform'), settingsController.updateSettings);
router.put('/:key', checkScope('platform'), settingsController.updateSetting);
router.post('/email/test', checkScope('platform'), settingsController.testEmailConnection);

// ============ TENANT SETTINGS (Tenant Admin Only) ============
// Tenant-specific settings routes (require tenant context)
router.get('/tenant/settings', tenantIsolation, settingsController.getTenantSettings);
router.put('/tenant/settings', tenantIsolation, settingsController.updateTenantSettings);
router.get('/tenant/branding', tenantIsolation, settingsController.getTenantBranding);
router.put('/tenant/branding', tenantIsolation, settingsController.updateTenantBranding);

module.exports = router;
