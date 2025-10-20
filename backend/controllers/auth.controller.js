const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (userId, tenantId, roleId, roleScope) => {
  return jwt.sign(
    { userId, tenantId, roleId, roleScope },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const userResult = await db.query(
      `SELECT u.*, r.name as role_name, r.scope as role_scope
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For tenant users, check if tenant is active
    if (user.tenant_id) {
      const tenantResult = await db.query(
        'SELECT status FROM tenants WHERE id = $1',
        [user.tenant_id]
      );
      
      if (tenantResult.rows.length === 0 || tenantResult.rows[0].status !== 'active') {
        return res.status(403).json({ error: 'Tenant account is inactive' });
      }
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateToken(user.id, user.tenant_id, user.role_id, user.role_scope);
    const refreshToken = generateRefreshToken(user.id);

    // Get enabled modules for tenant users
    let enabledModules = [];
    if (user.tenant_id) {
      const modulesResult = await db.query(
        'SELECT module_name FROM tenant_features WHERE tenant_id = $1 AND is_enabled = true',
        [user.tenant_id]
      );
      enabledModules = modulesResult.rows.map(row => row.module_name);
    }

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name,
        roleScope: user.role_scope,
        tenantId: user.tenant_id,
        enabledModules,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const userResult = await db.query(
      `SELECT u.*, r.scope as role_scope
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = userResult.rows[0];
    const newToken = generateToken(user.id, user.tenant_id, user.role_id, user.role_scope);

    res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.tenant_id,
              r.name as role_name, r.scope as role_scope, u.last_login
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get tenant info for tenant users
    let tenantInfo = null;
    if (user.tenant_id) {
      const tenantResult = await db.query(
        'SELECT name, subdomain, status FROM tenants WHERE id = $1',
        [user.tenant_id]
      );
      if (tenantResult.rows.length > 0) {
        tenantInfo = tenantResult.rows[0];
      }

      // Get enabled modules
      const modulesResult = await db.query(
        'SELECT module_name FROM tenant_features WHERE tenant_id = $1 AND is_enabled = true',
        [user.tenant_id]
      );
      tenantInfo.enabledModules = modulesResult.rows.map(row => row.module_name);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role_name,
        roleScope: user.role_scope,
        lastLogin: user.last_login,
        tenant: tenantInfo,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, email } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUserResult = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), userId]
      );

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user profile
    const updateResult = await db.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, email = COALESCE($4, email)
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, tenant_id`,
      [firstName, lastName, phone || null, email ? email.toLowerCase() : null, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = updateResult.rows[0];

    // Log audit action
    if (req.auditLog) {
      req.auditLog('UPDATE', 'USER_PROFILE', userId, {
        firstName,
        lastName,
        phone,
        emailChanged: !!email,
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Get current user with password hash
    const userResult = await db.query(
      'SELECT id, password_hash, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Log audit action
    if (req.auditLog) {
      req.auditLog('UPDATE', 'USER_PASSWORD', userId, {
        email: user.email,
        action: 'password_changed',
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  login,
  refreshTokenHandler,
  getProfile,
  updateProfile,
  changePassword,
};
