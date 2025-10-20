const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all roles
 */
exports.getAllRoles = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        r.id,
        r.name,
        r.scope,
        r.description,
        r.created_at,
        json_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.scope, r.description, r.created_at
      ORDER BY r.name ASC
    `);

    const roles = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      scope: row.scope,
      description: row.description || '',
      createdAt: row.created_at,
      permissions: (row.permissions || []).filter(p => p !== null).map(name => ({
        name,
        resource: 'general',
        action: 'read'
      }))
    }));

    logger.success('All roles retrieved', {
      count: roles.length,
      userId: req.user?.id
    });

    res.json({
      success: true,
      roles
    });
  } catch (error) {
    logger.error('Failed to get all roles', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve roles'
    });
  }
};

/**
 * Get role by ID
 */
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        r.id,
        r.name,
        r.scope,
        r.description,
        r.created_at,
        json_agg(json_build_object('id', p.id, 'name', p.name, 'resource', p.resource, 'action', p.action)) FILTER (WHERE p.id IS NOT NULL) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.scope, r.description, r.created_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    const row = result.rows[0];
    const role = {
      id: row.id,
      name: row.name,
      scope: row.scope,
      description: row.description || '',
      createdAt: row.created_at,
      permissions: (row.permissions || []).filter(p => p && p.id)
    };

    logger.success('Role retrieved', { roleId: id });

    res.json({
      success: true,
      role
    });
  } catch (error) {
    logger.error('Failed to get role', {
      message: error.message,
      roleId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve role'
    });
  }
};

/**
 * Create new role
 */
exports.createRole = async (req, res) => {
  try {
    const { name, scope, description } = req.body;

    // Validation
    if (!name || !scope || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name, scope, and description are required'
      });
    }

    if (!['platform', 'tenant'].includes(scope)) {
      return res.status(400).json({
        success: false,
        error: 'Scope must be either platform or tenant'
      });
    }

    // Check if role already exists
    const existingRole = await db.query(
      'SELECT id FROM roles WHERE name = $1 AND scope = $2',
      [name, scope]
    );

    if (existingRole.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Role already exists'
      });
    }

    const result = await db.query(
      `INSERT INTO roles (name, scope, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, scope, description, created_at`,
      [name, scope, description]
    );

    const role = result.rows[0];

    logger.success('Role created', {
      roleId: role.id,
      name: role.name,
      scope: role.scope
    });

    res.status(201).json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        scope: role.scope,
        description: role.description,
        createdAt: role.created_at,
        permissions: []
      }
    });
  } catch (error) {
    logger.error('Failed to create role', {
      message: error.message,
      body: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    });
  }
};

/**
 * Update role
 */
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, scope, description } = req.body;

    // Check if role exists
    const existingRole = await db.query('SELECT id FROM roles WHERE id = $1', [id]);

    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    const result = await db.query(
      `UPDATE roles 
       SET name = COALESCE($1, name),
           scope = COALESCE($2, scope),
           description = COALESCE($3, description)
       WHERE id = $4
       RETURNING id, name, scope, description, created_at`,
      [name || null, scope || null, description || null, id]
    );

    const updatedRole = result.rows[0];

    logger.success('Role updated', {
      roleId: id,
      updates: { name, scope, description }
    });

    res.json({
      success: true,
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        scope: updatedRole.scope,
        description: updatedRole.description,
        createdAt: updatedRole.created_at
      }
    });
  } catch (error) {
    logger.error('Failed to update role', {
      message: error.message,
      roleId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
};

/**
 * Delete role
 */
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await db.query('SELECT id, name FROM roles WHERE id = $1', [id]);

    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    const roleName = existingRole.rows[0].name;

    // Check if role is system role (Super Admin, etc.)
    const systemRoles = ['Super Admin', 'Support Staff', 'Developer', 'Loan Officer', 'Cashier', 'tenant-admin'];
    if (systemRoles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system roles'
      });
    }

    // Delete from role_permissions first
    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Delete role
    await db.query('DELETE FROM roles WHERE id = $1', [id]);

    logger.success('Role deleted', { roleId: id, name: roleName });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete role', {
      message: error.message,
      roleId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete role'
    });
  }
};

/**
 * Assign permissions to role
 */
exports.assignPermissionsToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        error: 'permissionIds array is required'
      });
    }

    // Check if role exists
    const roleExists = await db.query('SELECT id FROM roles WHERE id = $1', [id]);
    if (roleExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Clear existing permissions
    await db.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

    // Add new permissions
    for (const permissionId of permissionIds) {
      await db.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [id, permissionId]
      );
    }

    logger.success('Permissions assigned to role', {
      roleId: id,
      permissionCount: permissionIds.length
    });

    res.json({
      success: true,
      message: 'Permissions assigned successfully'
    });
  } catch (error) {
    logger.error('Failed to assign permissions', {
      message: error.message,
      roleId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to assign permissions'
    });
  }
};

/**
 * Get all permissions
 * Query params:
 *   - scope: 'platform' or 'tenant' (default: return all)
 */
exports.getAllPermissions = async (req, res) => {
  try {
    const { scope } = req.query;

    // Define which resources belong to platform vs tenant scope
    const platformResources = ['tenants', 'audit_logs', 'settings'];
    const tenantResources = ['users', 'customers', 'loans', 'payments', 'loan_products', 'bnpl_merchants', 'bnpl_orders', 'reports'];

    let query = `
      SELECT id, name, resource, action, description
      FROM permissions
    `;

    // Filter by scope if provided
    if (scope === 'platform') {
      const placeholders = platformResources.map((_, i) => `$${i + 1}`).join(',');
      query += ` WHERE resource IN (${placeholders})`;
      query += ` ORDER BY resource ASC, action ASC, name ASC`;
      
      const result = await db.query(query, platformResources);
      const permissions = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        resource: row.resource,
        action: row.action,
        description: row.description || ''
      }));

      logger.success('Platform permissions retrieved', { count: permissions.length });

      return res.json({
        success: true,
        permissions
      });
    } else if (scope === 'tenant') {
      const placeholders = tenantResources.map((_, i) => `$${i + 1}`).join(',');
      query += ` WHERE resource IN (${placeholders})`;
      query += ` ORDER BY resource ASC, action ASC, name ASC`;
      
      const result = await db.query(query, tenantResources);
      const permissions = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        resource: row.resource,
        action: row.action,
        description: row.description || ''
      }));

      logger.success('Tenant permissions retrieved', { count: permissions.length });

      return res.json({
        success: true,
        permissions
      });
    } else {
      // Return all permissions if no scope specified
      query += ` ORDER BY resource ASC, action ASC, name ASC`;
      
      const result = await db.query(query);
      const permissions = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        resource: row.resource,
        action: row.action,
        description: row.description || ''
      }));

      logger.success('All permissions retrieved', { count: permissions.length });

      return res.json({
        success: true,
        permissions
      });
    }
  } catch (error) {
    logger.error('Failed to get permissions', {
      message: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve permissions'
    });
  }
};
