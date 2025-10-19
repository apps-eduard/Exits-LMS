const tenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Super Admin (platform scope) can bypass tenant isolation
  if (req.user.roleScope === 'platform') {
    return next();
  }

  // Tenant users must have a tenant_id
  if (!req.user.tenantId) {
    return res.status(403).json({ 
      error: 'Access denied. No tenant association' 
    });
  }

  // Attach tenant_id to request for easy filtering
  req.tenantId = req.user.tenantId;
  
  next();
};

module.exports = tenantIsolation;
