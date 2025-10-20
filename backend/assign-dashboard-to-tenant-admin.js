const db = require('./config/database');

async function assignDashboardToTenantAdmin() {
  try {
    console.log('\n📋 Assigning Dashboard menu to tenant-admin role...\n');
    
    // Get tenant-admin role
    const role = await db.query(
      `SELECT id, name FROM roles WHERE name = 'tenant-admin'`
    );
    
    if (role.rows.length === 0) {
      console.log('❌ tenant-admin role not found!');
      process.exit(1);
    }
    
    const roleId = role.rows[0].id;
    console.log(`Role: ${role.rows[0].name} (${roleId})`);
    
    // Get Dashboard menu (platform scope)
    const dashboard = await db.query(
      `SELECT id, name, route FROM menus WHERE name = 'Dashboard' AND scope = 'platform'`
    );
    
    if (dashboard.rows.length === 0) {
      console.log('❌ Dashboard menu not found!');
      process.exit(1);
    }
    
    const dashboardId = dashboard.rows[0].id;
    console.log(`Menu: ${dashboard.rows[0].name} (${dashboard.rows[0].route})`);
    
    // Check if already assigned
    const existing = await db.query(
      `SELECT id FROM role_menus WHERE role_id = $1 AND menu_id = $2`,
      [roleId, dashboardId]
    );
    
    if (existing.rows.length > 0) {
      console.log('\n✅ Dashboard already assigned to tenant-admin!');
    } else {
      // Assign the menu
      await db.query(
        `INSERT INTO role_menus (role_id, menu_id) VALUES ($1, $2)`,
        [roleId, dashboardId]
      );
      console.log('\n✅ Dashboard menu assigned successfully!');
    }
    
    // Show all menus for this role
    const roleMenus = await db.query(
      `SELECT m.name, m.route, m.scope
       FROM role_menus rm
       JOIN menus m ON rm.menu_id = m.id
       WHERE rm.role_id = $1
       ORDER BY m.name`,
      [roleId]
    );
    
    console.log(`\n📊 All menus for tenant-admin role (${roleMenus.rows.length}):`);
    roleMenus.rows.forEach(menu => {
      console.log(`  - ${menu.name} (${menu.route}) [${menu.scope}]`);
    });
    
    console.log('\n✨ Done! peter@gmail.com should now see the Dashboard menu.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

assignDashboardToTenantAdmin();
