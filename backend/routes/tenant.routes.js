const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkScope, checkPermission } = require('../middleware/rbac.middleware');

// Public signup endpoint - NO AUTHENTICATION REQUIRED
console.log('📝 [ROUTES] Registering PUBLIC POST /api/tenants for signup/registration');
router.post('/', (req, res, next) => {
  console.log('🔓 [PUBLIC_ENDPOINT] POST /api/tenants - Signup request (no auth required)');
  console.log('   IP:', req.ip);
  console.log('   Body keys:', Object.keys(req.body));
  next();
}, tenantController.createTenant);

// All other tenant routes require authentication
console.log('🔐 [ROUTES] Registering PROTECTED tenant routes (require auth)');
router.use(authMiddleware);

// Routes that require platform scope (Super Admin only)
router.get('/', checkScope('platform'), checkPermission('manage_tenants'), tenantController.getAllTenants);

// Routes that allow both Super Admin AND tenant users accessing their own tenant
const allowOwnTenantAccess = (req, res, next) => {
  const { id } = req.params;
  // Super Admin with platform scope can access any tenant
  if (req.user.roleScope === 'platform') {
    return next();
  }
  // Tenant users can only access their own tenant
  if (req.user.tenantId && req.user.tenantId === id) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Cannot access other tenants' });
};

router.get('/:id', allowOwnTenantAccess, tenantController.getTenantById);
router.put('/:id', checkScope('platform'), checkPermission('manage_tenants'), tenantController.updateTenant);
router.post('/:id/modules', checkScope('platform'), checkPermission('manage_tenants'), tenantController.toggleTenantModule);
router.get('/:id/users', allowOwnTenantAccess, tenantController.getTenantUsers);

module.exports = router;
