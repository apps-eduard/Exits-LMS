const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rbacMiddleware = require('../middleware/rbac.middleware');

// All role routes require authentication
router.use(authMiddleware);

// Get all permissions (accessible directly)
router.get('/permissions', roleController.getAllPermissions);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get role by ID
router.get('/:id', roleController.getRoleById);

// Create new role (requires manage_platform_settings permission)
router.post('/', 
  rbacMiddleware.checkPermission('manage_platform_settings'),
  roleController.createRole
);

// Update role (requires manage_platform_settings permission)
router.put('/:id',
  rbacMiddleware.checkPermission('manage_platform_settings'),
  roleController.updateRole
);

// Delete role (requires manage_platform_settings permission)
router.delete('/:id',
  rbacMiddleware.checkPermission('manage_platform_settings'),
  roleController.deleteRole
);

// Assign permissions to role (requires manage_platform_settings permission)
router.post('/:id/permissions',
  rbacMiddleware.checkPermission('manage_platform_settings'),
  roleController.assignPermissionsToRole
);

module.exports = router;
