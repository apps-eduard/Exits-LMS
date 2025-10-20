const db = require('../config/database');

// Protected system roles that automatically have all permissions
const PROTECTED_ROLES = ['Super Admin'];

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`[RBAC] Checking permission: ${requiredPermission} for user: ${req.user.email}, role: ${req.user.roleName}`);

      // Only protected system roles with platform scope get automatic all-permissions
      if (PROTECTED_ROLES.includes(req.user.roleName) && req.user.roleScope === 'platform') {
        console.log('[RBAC] ✅ Protected system role - all permissions granted');
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

/**
 * Check if user has ANY of the required permissions (OR logic)
 * Useful for backward compatibility during permission migration
 * @param {string[]} requiredPermissions - Array of permission names (checks if user has ANY)
 */
const checkPermissionOr = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Ensure requiredPermissions is an array
      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      console.log(`[RBAC] Checking permissions (OR): ${permissions.join(' OR ')} for user: ${req.user.email}, role: ${req.user.roleName}`);

      // Only protected system roles with platform scope get automatic all-permissions
      if (PROTECTED_ROLES.includes(req.user.roleName) && req.user.roleScope === 'platform') {
        console.log('[RBAC] ✅ Protected system role - all permissions granted');
        return next();
      }

      // Check if user's role has ANY of the required permissions
      const permissionCheck = await db.query(
        `SELECT p.name 
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = $1 AND p.name = ANY($2)`,
        [req.user.roleId, permissions]
      );

      if (permissionCheck.rows.length === 0) {
        console.log(`[RBAC] ❌ Permission denied: None of [${permissions.join(', ')}] granted for user role ID: ${req.user.roleId}`);
        return res.status(403).json({ 
          error: `Insufficient permissions. Required one of: ${permissions.join(', ')}` 
        });
      }

      console.log(`[RBAC] ✅ Permission granted: ${permissionCheck.rows[0].name} (matched from [${permissions.join(', ')}])`);
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
  checkPermissionOr,
  checkScope,
};
