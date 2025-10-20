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
 * Get all role-menu assignments
 * GET /api/roles/menus/all
 */
exports.getAllRoleMenus = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT rm.role_id, rm.menu_id, rm.created_at
       FROM role_menus rm
       ORDER BY rm.role_id ASC, rm.menu_id ASC`
    );

    logger.success('All role-menu assignments retrieved', {
      assignmentCount: result.rows.length
    });

    res.json({
      success: true,
      roleMenus: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    logger.error('Failed to get all role-menu assignments', {
      message: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve role-menu assignments'
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
 * Returns menus in TREE structure with parent-child relationships
 */
exports.getUserMenus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 1: Get all menu IDs assigned to this role
    const roleMenuResult = await db.query(
      `SELECT DISTINCT rm.menu_id FROM role_menus rm
       WHERE rm.role_id = $1`,
      [req.user.roleId]
    );

    const assignedMenuIds = roleMenuResult.rows.map(r => r.menu_id);
    
    logger.success('User role menu assignments retrieved', {
      userId: req.user.id,
      roleId: req.user.roleId,
      assignedMenuCount: assignedMenuIds.length
    });

    // If no menus assigned, return empty array
    if (assignedMenuIds.length === 0) {
      logger.success('User has no menus assigned', {
        userId: req.user.id,
        roleId: req.user.roleId
      });
      return res.json({
        success: true,
        menus: [],
        count: 0
      });
    }

    // Step 2: Get all menus with parent-child relationships
    const allMenusResult = await db.query(
      `SELECT id, name, slug, icon, route, scope, is_active, order_index, parent_menu_id, tenant_id
       FROM menus 
       WHERE is_active = true
       ORDER BY scope ASC, order_index ASC, name ASC`
    );

    const allMenus = allMenusResult.rows.map(menu => ({
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      icon: menu.icon,
      route: menu.route,
      scope: menu.scope,
      isActive: menu.is_active,
      orderIndex: menu.order_index,
      parentMenuId: menu.parent_menu_id,
      tenantId: menu.tenant_id
    }));

    // Step 3: Build tree structure INCLUDING parent menus if child is assigned
    // This ensures parent menus are always shown if any child is assigned
    const menuIdsToInclude = new Set(assignedMenuIds);

    // Add parent menus recursively
    const addParents = (menuId) => {
      const menu = allMenus.find(m => m.id === menuId);
      if (menu && menu.parentMenuId) {
        menuIdsToInclude.add(menu.parentMenuId);
        addParents(menu.parentMenuId);
      }
    };

    assignedMenuIds.forEach(menuId => addParents(menuId));

    // Step 4: Filter menus and build tree
    const filteredMenus = allMenus.filter(m => menuIdsToInclude.has(m.id));

    const buildTree = (parentId = null) => {
      return filteredMenus
        .filter(m => m.parentMenuId === parentId)
        .map(menu => ({
          ...menu,
          children: buildTree(menu.id)
        }));
    };

    const tree = buildTree(null);

    logger.success('User menus tree built', {
      userId: req.user.id,
      roleId: req.user.roleId,
      rootMenuCount: tree.length,
      totalMenuCount: filteredMenus.length,
      assignedMenuCount: assignedMenuIds.length
    });

    res.json({
      success: true,
      menus: tree,
      count: filteredMenus.length
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
