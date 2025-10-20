const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auditController = require('../controllers/audit.controller');
const systemLogsController = require('../controllers/system-logs.controller');
const authenticate = require('../middleware/auth.middleware');
const { checkScope, checkPermission } = require('../middleware/rbac.middleware');
const tenantIsolation = require('../middleware/tenant-isolation.middleware');
const { auditLoggerMiddleware } = require('../middleware/audit-logger');

// Get roles - accessible to all authenticated users
router.get('/roles/list', authenticate, userController.getRoles);

// Apply audit logging middleware after authentication for all subsequent routes
router.use(authenticate);
router.use(auditLoggerMiddleware);

// Super Admin routes (platform scope)
router.get('/', checkScope('platform'), checkPermission('manage_users'), userController.getAllUsers);
router.post('/', checkScope('platform'), checkPermission('manage_users'), userController.createUser);

// Activity logs route (must be before /:id to avoid route collision)
router.get('/activity', checkScope('platform'), checkPermission('manage_users'), userController.getActivityLogs);

// Audit logs route (must be before /:id to avoid route collision)
router.get('/audit', checkScope('platform'), checkPermission('view_audit_logs'), auditController.getAuditLogs);

// System logs route (must be before /:id to avoid route collision)
router.get('/system-logs', checkScope('platform'), checkPermission('view_audit_logs'), systemLogsController.getSystemLogs);
router.get('/system-logs/summary', checkScope('platform'), checkPermission('view_audit_logs'), systemLogsController.getSystemLogsSummary);

router.get('/:id', checkScope('platform'), checkPermission('manage_users'), userController.getUserById);
router.put('/:id', checkScope('platform'), checkPermission('manage_users'), userController.updateUser);
router.patch('/:id/status', checkScope('platform'), checkPermission('manage_users'), userController.toggleUserStatus);
router.delete('/:id', checkScope('platform'), checkPermission('manage_users'), userController.deleteUser);
router.post('/:id/reset-password', checkScope('platform'), checkPermission('manage_users'), userController.resetPassword);

// Tenant routes - for tenant admins to manage their own users
router.get('/tenant/me', tenantIsolation, userController.getCurrentUserProfile);
router.get('/tenant/users', tenantIsolation, checkPermission('manage_users'), userController.getTenantUsers);
router.post('/tenant/users', tenantIsolation, checkPermission('manage_users'), userController.createTenantUser);
router.get('/tenant/users/:id', tenantIsolation, checkPermission('manage_users'), userController.getTenantUserById);
router.put('/tenant/users/:id', tenantIsolation, checkPermission('manage_users'), userController.updateTenantUser);
router.patch('/tenant/users/:id/status', tenantIsolation, checkPermission('manage_users'), userController.toggleTenantUserStatus);
router.delete('/tenant/users/:id', tenantIsolation, checkPermission('manage_users'), userController.deleteTenantUser);

module.exports = router;
