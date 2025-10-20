const bcrypt = require('bcryptjs');
const db = require('../config/database');
const logger = require('../utils/logger');

// Get all users (platform-wide - super admin only)
const getAllUsers = async (req, res) => {
  try {
    logger.trace('getAllUsers', 'ENTER', { query: req.query, userId: req.user?.id });
    const { search, role, status } = req.query;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
             u.created_at, u.last_login, u.tenant_id,
             r.name as role_name,
             t.name as tenant_name,
             COALESCE(addr.street_address || ', ' || addr.barangay || ', ' || addr.city || ', ' || addr.province, '') as address
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN tenants t ON u.tenant_id = t.id
      LEFT JOIN addresses addr ON u.address_id = addr.id AND addr.is_primary = true
      WHERE u.tenant_id IS NULL
    `;

    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.email ILIKE $${params.length} OR u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length})`;
    }

    if (role && role !== 'all') {
      params.push(role);
      query += ` AND r.name = $${params.length}`;
    }

    if (status === 'active') {
      query += ` AND u.is_active = true`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = false`;
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await db.query(query, params);

    logger.success('Fetched all platform users', {
      count: result.rows.length,
      filters: { search: !!search, role: !!role, status },
    });

    logger.apiResponse('getAllUsers', 200, {
      success: true,
      count: result.rows.length,
    });

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    logger.error('Failed to fetch users', {
      message: error.message,
      code: error.code,
      userId: req.user?.id,
    });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.trace('getUserById', 'ENTER', { userId: id, requestedBy: req.user?.id });

    const userResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
              u.created_at, u.last_login, u.tenant_id, u.address_id,
              r.name as role_name, r.id as role_id,
              t.name as tenant_name,
              a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN addresses a ON u.address_id = a.id
       WHERE u.id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      logger.warn('User not found', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.success('User fetched successfully', {
      userId: id,
      email: userResult.rows[0].email,
      role: userResult.rows[0].role_name,
    });

    res.json({
      success: true,
      user: userResult.rows[0],
    });
  } catch (error) {
    logger.error('Failed to fetch user', {
      userId: req.params.id,
      message: error.message,
      code: error.code,
    });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create user
const createUser = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { email, firstName, lastName, phone, password, roleName, tenantId, 
            street_address, barangay, city, province, region, postal_code, country } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password || !roleName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get role ID
    const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const roleId = roleResult.rows[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, first_name, last_name, phone, password_hash, role_id, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [email.toLowerCase(), firstName, lastName, phone || null, hashedPassword, roleId, tenantId || null]
    );

    const user = userResult.rows[0];

    // Create address if provided
    if (street_address || barangay || city) {
      const addrResult = await client.query(
        `INSERT INTO addresses (tenant_id, entity_type, entity_id, street_address, barangay, city, province, region, postal_code, country, is_primary)
         VALUES ($1, 'user', $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING id`,
        [tenantId || null, user.id, street_address || null, barangay || null, city || null, province || null, region || null, postal_code || null, country || 'Philippines']
      );

      // Link address to user
      await client.query(
        'UPDATE users SET address_id = $1 WHERE id = $2',
        [addrResult.rows[0].id, user.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        roleName,
        tenantId: user.tenant_id,
        isActive: user.is_active,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    client.release();
  }
};

// Update user
const updateUser = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { firstName, lastName, phone, email, password, 
            street_address, barangay, city, province, region, postal_code, country } = req.body;

    // Update user
    let updateQuery = `
      UPDATE users SET
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const params = [email || null, firstName || null, lastName || null, phone || null];
    let paramCount = 4;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      params.push(hashedPassword);
      paramCount++;
      updateQuery += `, password_hash = $${paramCount}`;
    }

    params.push(id);
    paramCount++;
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;

    const userResult = await client.query(updateQuery, params);

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Update or create address if provided
    if (street_address || barangay || city || province) {
      let addressId = user.address_id;

      if (addressId) {
        // Update existing address
        await client.query(
          `UPDATE addresses SET
            street_address = COALESCE($1, street_address),
            barangay = COALESCE($2, barangay),
            city = COALESCE($3, city),
            province = COALESCE($4, province),
            region = COALESCE($5, region),
            postal_code = COALESCE($6, postal_code),
            country = COALESCE($7, country),
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $8`,
          [street_address || null, barangay || null, city || null, province || null, region || null, postal_code || null, country || null, addressId]
        );
      } else {
        // Create new address
        const addrResult = await client.query(
          `INSERT INTO addresses (tenant_id, entity_type, entity_id, street_address, barangay, city, province, region, postal_code, country, is_primary)
           VALUES ($1, 'user', $2, $3, $4, $5, $6, $7, $8, $9, true)
           RETURNING id`,
          [user.tenant_id, user.id, street_address || null, barangay || null, city || null, province || null, region || null, postal_code || null, country || 'Philippines']
        );

        addressId = addrResult.rows[0].id;

        // Link address to user
        await client.query(
          'UPDATE users SET address_id = $1 WHERE id = $2',
          [addressId, user.id]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    client.release();
  }
};

// Toggle user status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await db.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Get roles
const getRoles = async (req, res) => {
  try {
    // Super Admin sees all roles, Tenant users see only tenant roles
    let query = 'SELECT id, name, scope, description FROM roles';
    let params = [];

    if (req.user?.roleScope === 'tenant') {
      query += ' WHERE scope = $1 ORDER BY name';
      params = ['tenant'];
    } else {
      query += ' ORDER BY name';
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      roles: result.rows,
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// ============ TENANT-SPECIFIC USER MANAGEMENT ============

// Get current user profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenantId;

    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
              u.created_at, u.last_login, u.tenant_id,
              r.name as role_name, r.id as role_id,
              t.name as tenant_name,
              a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN addresses a ON u.address_id = a.id
       WHERE u.id = $1 AND u.tenant_id = $2`,
      [userId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get all users for a specific tenant
const getTenantUsers = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search, role, status } = req.query;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
             u.created_at, u.last_login,
             r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.tenant_id = $1
    `;

    const params = [tenantId];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.email ILIKE $${params.length} OR u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length})`;
    }

    if (role && role !== 'all') {
      params.push(role);
      query += ` AND r.name = $${params.length}`;
    }

    if (status === 'active') {
      query += ` AND u.is_active = true`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = false`;
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error('Get tenant users error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant users' });
  }
};

// Get specific tenant user by ID
const getTenantUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
              u.created_at, u.last_login, u.tenant_id, u.address_id,
              r.name as role_name, r.id as role_id,
              a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN addresses a ON u.address_id = a.id
       WHERE u.id = $1 AND u.tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Get tenant user error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant user' });
  }
};

// Create a new user for the tenant
const createTenantUser = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tenantId = req.tenantId;
    const { email, firstName, lastName, phone, password, roleName, 
            street_address, barangay, city, province, region, postal_code, country } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !password || !roleName) {
      return res.status(400).json({ error: 'Missing required fields: email, firstName, lastName, password, roleName' });
    }

    // Get role ID - ensure it's a tenant role
    const roleResult = await client.query(
      'SELECT id FROM roles WHERE name = $1 AND scope = $2',
      [roleName, 'tenant']
    );
    if (roleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid tenant role' });
    }
    const roleId = roleResult.rows[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, first_name, last_name, phone, password_hash, role_id, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [email.toLowerCase(), firstName, lastName, phone || null, hashedPassword, roleId, tenantId]
    );

    const user = userResult.rows[0];

    // Create address if provided
    if (street_address || barangay || city) {
      const addrResult = await client.query(
        `INSERT INTO addresses (tenant_id, entity_type, entity_id, street_address, barangay, city, province, region, postal_code, country, is_primary)
         VALUES ($1, 'user', $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING id`,
        [tenantId, user.id, street_address || null, barangay || null, city || null, province || null, region || null, postal_code || null, country || 'Philippines']
      );

      // Link address to user
      await client.query(
        'UPDATE users SET address_id = $1 WHERE id = $2',
        [addrResult.rows[0].id, user.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        roleName,
        isActive: user.is_active,
      },
      message: 'Tenant user created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create tenant user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists in this tenant' });
    }
    res.status(500).json({ error: 'Failed to create tenant user' });
  } finally {
    client.release();
  }
};

// Update a tenant user
const updateTenantUser = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const tenantId = req.tenantId;
    const { firstName, lastName, phone, email, password, roleName,
            street_address, barangay, city, province, region, postal_code, country } = req.body;

    // Build update query
    let updateQuery = `
      UPDATE users SET
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const params = [email || null, firstName || null, lastName || null, phone || null];
    let paramCount = 4;

    if (roleName) {
      // Verify role exists and is a tenant role
      const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1 AND scope = $2',
        [roleName, 'tenant']
      );
      if (roleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid tenant role' });
      }
      params.push(roleResult.rows[0].id);
      paramCount++;
      updateQuery += `, role_id = $${paramCount}`;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      params.push(hashedPassword);
      paramCount++;
      updateQuery += `, password_hash = $${paramCount}`;
    }

    params.push(id);
    paramCount++;
    params.push(tenantId);
    paramCount++;
    updateQuery += ` WHERE id = $${paramCount - 1} AND tenant_id = $${paramCount} RETURNING *`;

    const userResult = await client.query(updateQuery, params);

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tenant user not found' });
    }

    const user = userResult.rows[0];

    // Update or create address if provided
    if (street_address || barangay || city || province) {
      let addressId = user.address_id;

      if (addressId) {
        // Update existing address
        await client.query(
          `UPDATE addresses SET
            street_address = COALESCE($1, street_address),
            barangay = COALESCE($2, barangay),
            city = COALESCE($3, city),
            province = COALESCE($4, province),
            region = COALESCE($5, region),
            postal_code = COALESCE($6, postal_code),
            country = COALESCE($7, country),
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $8`,
          [street_address || null, barangay || null, city || null, province || null, region || null, postal_code || null, country || null, addressId]
        );
      } else {
        // Create new address
        const addrResult = await client.query(
          `INSERT INTO addresses (tenant_id, entity_type, entity_id, street_address, barangay, city, province, region, postal_code, country, is_primary)
           VALUES ($1, 'user', $2, $3, $4, $5, $6, $7, $8, $9, true)
           RETURNING id`,
          [tenantId, user.id, street_address || null, barangay || null, city || null, province || null, region || null, postal_code || null, country || 'Philippines']
        );

        addressId = addrResult.rows[0].id;

        // Link address to user
        await client.query(
          'UPDATE users SET address_id = $1 WHERE id = $2',
          [addressId, user.id]
        );
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
      message: 'Tenant user updated successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update tenant user error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists in this tenant' });
    }
    res.status(500).json({ error: 'Failed to update tenant user' });
  } finally {
    client.release();
  }
};

// Toggle tenant user status
const toggleTenantUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive status required' });
    }

    const result = await db.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3 RETURNING *',
      [isActive, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant user not found' });
    }

    res.json({
      success: true,
      user: result.rows[0],
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle tenant user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Delete a tenant user
const deleteTenantUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Prevent deleting the only tenant admin
    const adminCount = await db.query(
      `SELECT COUNT(*) as count FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.tenant_id = $1 AND r.name = 'tenant-admin' AND u.is_active = true`,
      [tenantId]
    );

    if (parseInt(adminCount.rows[0].count) === 1) {
      // Check if this is the admin being deleted
      const userRole = await db.query(
        `SELECT r.name FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 AND u.tenant_id = $2`,
        [id, tenantId]
      );

      if (userRole.rows.length > 0 && userRole.rows[0].name === 'tenant-admin') {
        return res.status(400).json({ error: 'Cannot delete the only tenant admin' });
      }
    }

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant user not found' });
    }

    res.json({
      success: true,
      message: 'Tenant user deleted successfully',
    });
  } catch (error) {
    console.error('Delete tenant user error:', error);
    res.status(500).json({ error: 'Failed to delete tenant user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  resetPassword,
  getRoles,
  getCurrentUserProfile,
  getTenantUsers,
  getTenantUserById,
  createTenantUser,
  updateTenantUser,
  toggleTenantUserStatus,
  deleteTenantUser,
};
