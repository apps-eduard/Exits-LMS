const db = require('../config/database');

// Get all menus (with optional scope filtering)
exports.getAllMenus = async (req, res) => {
  try {
    const { scope } = req.query;
    const { tenantId, role } = req.user;
    
    // Check if user is super admin (platform admin)
    const isSuperAdmin = role === 'super_admin' || role === 'platform_admin';

    let query = `
      SELECT * FROM menus 
      WHERE 1=1
    `;
    const params = [];

    // For super admin, show all menus including inactive ones
    if (!isSuperAdmin) {
      query += ` AND is_active = true`;
    }

    if (scope) {
      query += ` AND scope = $${params.length + 1}`;
      params.push(scope);
    }

    // For tenant scope, only show tenant-specific or platform menus
    if (scope === 'tenant' && tenantId) {
      query += ` AND (tenant_id IS NULL OR tenant_id = $${params.length + 1})`;
      params.push(tenantId);
    }

    query += ` ORDER BY order_index ASC, name ASC`;

    const result = await db.query(query, params);
    
    console.log(`[GET_ALL_MENUS] Returning ${result.rows.length} menus for scope: ${scope}, super admin: ${isSuperAdmin}`);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

// Get menu by ID
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

// Get menu children
exports.getMenuChildren = async (req, res) => {
  try {
    const { parentId } = req.params;

    const result = await db.query(
      `SELECT * FROM menus 
       WHERE parent_menu_id = $1 AND is_active = true 
       ORDER BY order_index ASC, name ASC`,
      [parentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu children:', error);
    res.status(500).json({ error: 'Failed to fetch menu children' });
  }
};

// Create new menu
exports.createMenu = async (req, res) => {
  try {
    const { name, slug, parentMenuId, icon, route, scope } = req.body;
    const { tenantId } = req.user;

    // Validate required fields
    if (!name || !slug || !scope) {
      return res.status(400).json({ error: 'Name, slug, and scope are required' });
    }

    // Validate scope
    if (!['platform', 'tenant'].includes(scope)) {
      return res.status(400).json({ error: 'Scope must be platform or tenant' });
    }

    // For tenant scope, include tenant_id
    let query = `
      INSERT INTO menus (name, slug, parent_menu_id, icon, route, scope, order_index, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      name,
      slug,
      parentMenuId || null,
      icon || null,
      route || null,
      scope,
      0,
      scope === 'tenant' ? tenantId : null
    ];

    const result = await db.query(query, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu:', error);
    
    if (error.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Menu slug already exists' });
    }

    res.status(500).json({ error: 'Failed to create menu' });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parentMenuId, icon, route, scope, orderIndex, isActive } = req.body;

    // Get existing menu
    const existing = await db.query('SELECT * FROM menus WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const menu = existing.rows[0];

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (slug !== undefined) {
      updates.push(`slug = $${paramCount}`);
      params.push(slug);
      paramCount++;
    }

    if (parentMenuId !== undefined) {
      updates.push(`parent_menu_id = $${paramCount}`);
      params.push(parentMenuId || null);
      paramCount++;
    }

    if (icon !== undefined) {
      updates.push(`icon = $${paramCount}`);
      params.push(icon || null);
      paramCount++;
    }

    if (route !== undefined) {
      updates.push(`route = $${paramCount}`);
      params.push(route || null);
      paramCount++;
    }

    if (scope !== undefined) {
      updates.push(`scope = $${paramCount}`);
      params.push(scope);
      paramCount++;
    }

    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramCount}`);
      params.push(orderIndex);
      paramCount++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      params.push(isActive);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);

    const query = `UPDATE menus SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await db.query(query, params);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu:', error);
    
    if (error.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Menu slug already exists' });
    }

    res.status(500).json({ error: 'Failed to update menu' });
  }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if menu exists
    const existing = await db.query('SELECT * FROM menus WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Delete menu and all its children
    await db.query(
      `DELETE FROM menus WHERE id = $1 OR parent_menu_id = $1`,
      [id]
    );

    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};

// Reorder menus
exports.reorderMenus = async (req, res) => {
  try {
    const { menus } = req.body;

    if (!Array.isArray(menus)) {
      return res.status(400).json({ error: 'Menus array is required' });
    }

    // Update order for each menu
    for (let i = 0; i < menus.length; i++) {
      await db.query(
        'UPDATE menus SET order_index = $1 WHERE id = $2',
        [i, menus[i].id]
      );
    }

    res.json({ message: 'Menus reordered successfully' });
  } catch (error) {
    console.error('Error reordering menus:', error);
    res.status(500).json({ error: 'Failed to reorder menus' });
  }
};

// Get menu tree (hierarchical structure)
exports.getMenuTree = async (req, res) => {
  try {
    const { scope } = req.query;
    const { tenantId, role } = req.user;
    
    // Check if user is super admin (platform admin)
    const isSuperAdmin = role === 'super_admin' || role === 'platform_admin';

    // Build query for ALL menus (we'll build hierarchy in memory)
    let query = `
      SELECT * FROM menus 
      WHERE 1=1
    `;
    const params = [];

    // For super admin, show all menus including inactive ones
    if (!isSuperAdmin) {
      query += ` AND is_active = true`;
    }

    if (scope) {
      query += ` AND scope = $${params.length + 1}`;
      params.push(scope);
    }

    if (scope === 'tenant' && tenantId) {
      query += ` AND (tenant_id IS NULL OR tenant_id = $${params.length + 1})`;
      params.push(tenantId);
    }

    query += ` ORDER BY order_index ASC, name ASC`;

    const result = await db.query(query, params);
    const allMenus = result.rows;

    // Build hierarchical structure recursively
    const buildTree = (parentId = null) => {
      return allMenus
        .filter(menu => menu.parent_menu_id === parentId)
        .map(menu => ({
          ...menu,
          children: buildTree(menu.id)
        }));
    };

    // Get root menus (menus with no parent)
    const tree = buildTree(null);

    console.log(`[MENU_TREE] Returning ${tree.length} root menus for scope: ${scope}, super admin: ${isSuperAdmin}`);
    
    res.json(tree);
  } catch (error) {
    console.error('Error fetching menu tree:', error);
    res.status(500).json({ error: 'Failed to fetch menu tree' });
  }
};
