const db = require('../config/database');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`[RBAC] Checking permission: ${requiredPermission} for user: ${req.user.email}, scope: ${req.user.roleScope}`);

      // Super Admin with platform scope has all permissions
      if (req.user.roleScope === 'platform') {
        console.log('[RBAC] ✅ Platform admin - all permissions granted');
        return next();
      }

      // Check if user's role has the required permission
      const permissionCheck = await db.query(
        `SELECT p.name 
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = $1 AND p.name = $2`,
        [req.user.roleId, requiredPermission]
      );

      if (permissionCheck.rows.length === 0) {
        console.log(`[RBAC] ❌ Permission denied: ${requiredPermission} for user role ID: ${req.user.roleId}`);
        return res.status(403).json({ error: `Insufficient permissions. Required: ${requiredPermission}` });
      }

      console.log(`[RBAC] ✅ Permission granted: ${requiredPermission}`);
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

const checkScope = (requiredScope) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[RBAC] Checking scope: ${requiredScope} for user: ${req.user.email}, current scope: ${req.user.roleScope}`);

    if (req.user.roleScope !== requiredScope) {
      console.log(`[RBAC] ❌ Scope mismatch. Required: ${requiredScope}, Current: ${req.user.roleScope}`);
      return res.status(403).json({ 
        error: `Access denied. Required scope: ${requiredScope}, your scope: ${req.user.roleScope}` 
      });
    }

    console.log(`[RBAC] ✅ Scope check passed: ${requiredScope}`);
    next();
  };
};

module.exports = {
  checkPermission,
  checkScope,
};
