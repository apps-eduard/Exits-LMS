const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const { checkScope, checkPermission } = require('../middleware/rbac.middleware');
const tenantIsolation = require('../middleware/tenant-isolation.middleware');

// Get roles - accessible to all authenticated users
router.get('/roles/list', authenticate, userController.getRoles);

// Super Admin routes (platform scope)
router.get('/', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.getAllUsers);
router.post('/', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.createUser);
router.get('/:id', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.getUserById);
router.put('/:id', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.updateUser);
router.patch('/:id/status', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.toggleUserStatus);
router.delete('/:id', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.deleteUser);
router.post('/:id/reset-password', authenticate, checkScope('platform'), checkPermission('manage_users'), userController.resetPassword);

// Tenant routes - for tenant admins to manage their own users
router.get('/tenant/me', authenticate, tenantIsolation, userController.getCurrentUserProfile);
router.get('/tenant/users', authenticate, tenantIsolation, checkPermission('manage_users'), userController.getTenantUsers);
router.post('/tenant/users', authenticate, tenantIsolation, checkPermission('manage_users'), userController.createTenantUser);
router.get('/tenant/users/:id', authenticate, tenantIsolation, checkPermission('manage_users'), userController.getTenantUserById);
router.put('/tenant/users/:id', authenticate, tenantIsolation, checkPermission('manage_users'), userController.updateTenantUser);
router.patch('/tenant/users/:id/status', authenticate, tenantIsolation, checkPermission('manage_users'), userController.toggleTenantUserStatus);
router.delete('/tenant/users/:id', authenticate, tenantIsolation, checkPermission('manage_users'), userController.deleteTenantUser);

module.exports = router;
