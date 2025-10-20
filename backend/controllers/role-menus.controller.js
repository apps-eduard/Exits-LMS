const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Assign menus to a role
 * POST /api/roles/:id/menus
 */
exports.assignMenusToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { menuIds } = req.body;

    if (!menuIds || !Array.isArray(menuIds)) {
      return res.status(400).json({
        success: false,
        error: 'menuIds array is required'
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

    // Clear existing menu assignments
    await db.query('DELETE FROM role_menus WHERE role_id = $1', [id]);

    // Add new menu assignments
    for (const menuId of menuIds) {
      await db.query(
        `INSERT INTO role_menus (role_id, menu_id) 
         VALUES ($1, $2)
         ON CONFLICT (role_id, menu_id) DO NOTHING`,
        [id, menuId]
      );
    }

    logger.success('Menus assigned to role', {
      roleId: id,
      menuCount: menuIds.length
    });

    res.json({
      success: true,
      message: 'Menus assigned successfully',
      menuCount: menuIds.length
    });
  } catch (error) {
    logger.error('Failed to assign menus to role', {
      message: error.message,
      roleId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to assign menus to role'
    });
  }
};

/**
 * Get menus for a specific role
 * GET /api/roles/:id/menus
 */
exports.getRoleMenus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT m.* FROM menus m
       JOIN role_menus rm ON m.id = rm.menu_id
       WHERE rm.role_id = $1
       ORDER BY m.order_index ASC`,
      [id]
    );

    logger.success('Role menus retrieved', {
      roleId: id,
      menuCount: result.rows.length
    });

    res.json({
      success: true,
      menus: result.rows
    });
  } catch (error) {
    logger.error('Failed to get role menus', {
      message: error.message,
      roleId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get role menus'
    });
  }
};

/**
 * Get all menus available for assignment
 * GET /api/menus/available
 */
exports.getAvailableMenus = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, icon, path, parent_id, order_index, scope
       FROM menus
       WHERE is_active = true
       ORDER BY scope ASC, order_index ASC`
    );

    logger.success('Available menus retrieved', {
      menuCount: result.rows.length
    });

    res.json({
      success: true,
      menus: result.rows
    });
  } catch (error) {
    logger.error('Failed to get available menus', {
      message: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get available menus'
    });
  }
};

/**
 * Get user's accessible menus (called on login/profile)
 * GET /api/users/me/menus
 */
exports.getUserMenus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await db.query(
      `SELECT DISTINCT m.* FROM menus m
       JOIN role_menus rm ON m.id = rm.menu_id
       WHERE rm.role_id = $1 AND m.is_active = true
       ORDER BY m.order_index ASC`,
      [req.user.roleId]
    );

    logger.success('User menus retrieved', {
      userId: req.user.id,
      roleId: req.user.roleId,
      menuCount: result.rows.length
    });

    res.json({
      success: true,
      menus: result.rows
    });
  } catch (error) {
    logger.error('Failed to get user menus', {
      message: error.message,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get user menus'
    });
  }
};

/**
 * Remove a menu from a role
 * DELETE /api/roles/:roleId/menus/:menuId
 */
exports.removeMenuFromRole = async (req, res) => {
  try {
    const { roleId, menuId } = req.params;

    await db.query(
      'DELETE FROM role_menus WHERE role_id = $1 AND menu_id = $2',
      [roleId, menuId]
    );

    logger.success('Menu removed from role', {
      roleId,
      menuId
    });

    res.json({
      success: true,
      message: 'Menu removed successfully'
    });
  } catch (error) {
    logger.error('Failed to remove menu from role', {
      message: error.message,
      roleId: req.params.roleId,
      menuId: req.params.menuId
    });
    res.status(500).json({
      success: false,
      error: 'Failed to remove menu'
    });
  }
};
