const db = require('./config/database');

async function cleanupNavbarMenus() {
  try {
    console.log('\n📋 Current platform menus:\n');
    
    // Get all platform menus
    const current = await db.query(
      `SELECT id, name, route, parent_menu_id, scope 
       FROM menus 
       WHERE scope = 'platform' 
       ORDER BY name`
    );
    
    console.log(JSON.stringify(current.rows, null, 2));
    
    console.log('\n🔄 Starting menu cleanup...\n');
    
    // 1. Delete duplicate menus (already in System Settings)
    const menusToDelete = [
      'System Roles',
      'Menu Management',
      'Email Templates',
      'Email Configurations'
    ];
    
    for (const menuName of menusToDelete) {
      const result = await db.query(
        `DELETE FROM menus WHERE name = $1 AND scope = 'platform' RETURNING name`,
        [menuName]
      );
      if (result.rows.length > 0) {
        console.log(`✅ Deleted: ${menuName}`);
      } else {
        console.log(`⚠️  Not found: ${menuName}`);
      }
    }
    
    // 2. Rename menus
    const renameMap = {
      'Health Check': 'Health and Logs',
      'All Tenants': 'Tenants',
      'All Subscriptions': 'Subscriptions',
      'System Notifications': 'Notifications'
    };
    
    for (const [oldName, newName] of Object.entries(renameMap)) {
      const result = await db.query(
        `UPDATE menus 
         SET name = $1 
         WHERE name = $2 AND scope = 'platform'
         RETURNING name`,
        [newName, oldName]
      );
      if (result.rows.length > 0) {
        console.log(`✅ Renamed: ${oldName} → ${newName}`);
      } else {
        console.log(`⚠️  Not found: ${oldName}`);
      }
    }
    
    // 3. Combine Audit Logs and System Logs under Health and Logs
    console.log('\n🔄 Combining Audit Logs and System Logs...\n');
    
    // Get Health and Logs menu
    const healthLogs = await db.query(
      `SELECT id FROM menus WHERE name = 'Health and Logs' AND scope = 'platform'`
    );
    
    if (healthLogs.rows.length > 0) {
      const healthLogsId = healthLogs.rows[0].id;
      
      // Update Audit Logs to be child of Health and Logs
      await db.query(
        `UPDATE menus 
         SET parent_menu_id = $1 
         WHERE name = 'Audit Logs' AND scope = 'platform'`,
        [healthLogsId]
      );
      console.log('✅ Audit Logs moved under Health and Logs');
      
      // Update System Logs to be child of Health and Logs
      await db.query(
        `UPDATE menus 
         SET parent_menu_id = $1 
         WHERE name = 'System Logs' AND scope = 'platform'`,
        [healthLogsId]
      );
      console.log('✅ System Logs moved under Health and Logs');
    }
    
    // 4. Show updated menu structure
    console.log('\n📊 Updated menu structure:\n');
    const updated = await db.query(
      `SELECT id, name, route, parent_menu_id, scope 
       FROM menus 
       WHERE scope = 'platform' 
       ORDER BY name`
    );
    
    console.log(JSON.stringify(updated.rows, null, 2));
    
    console.log('\n✨ Menu cleanup complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupNavbarMenus();
