const db = require('../config/database');

const checkModuleAccess = (moduleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Super Admin has access to all modules
      if (req.user.roleScope === 'platform') {
        return next();
      }

      // Check if tenant has module enabled
      if (!req.user.tenantId) {
        return res.status(403).json({ error: 'No tenant association' });
      }

      const moduleCheck = await db.query(
        `SELECT is_enabled 
         FROM tenant_features 
         WHERE tenant_id = $1 AND module_name = $2`,
        [req.user.tenantId, moduleName]
      );

      if (moduleCheck.rows.length === 0 || !moduleCheck.rows[0].is_enabled) {
        return res.status(403).json({ 
          error: `Module '${moduleName}' is not enabled for your tenant` 
        });
      }

      next();
    } catch (error) {
      console.error('Module access check error:', error);
      res.status(500).json({ error: 'Module access check failed' });
    }
  };
};

module.exports = checkModuleAccess;
