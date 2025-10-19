const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user details
    const userResult = await db.query(
      `SELECT u.*, r.name as role_name, r.scope as role_scope
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token or inactive user' });
    }

    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      tenantId: userResult.rows[0].tenant_id,
      roleId: userResult.rows[0].role_id,
      roleName: userResult.rows[0].role_name,
      roleScope: userResult.rows[0].role_scope,
      firstName: userResult.rows[0].first_name,
      lastName: userResult.rows[0].last_name,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
