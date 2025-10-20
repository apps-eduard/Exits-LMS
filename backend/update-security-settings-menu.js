const db = require('./config/database');

async function updateSecuritySettingsMenu() {
  try {
    console.log('\n🔄 Updating Security Settings menu to System Settings...\n');
    
    // Find Security Settings menu
    const menu = await db.query(
      `SELECT id, name, route, scope FROM menus WHERE name LIKE '%Security%Settings%'`
    );
    
    if (menu.rows.length === 0) {
      console.log('⚠️  Security Settings menu not found. Searching for all settings menus...');
      
      const allSettings = await db.query(
        `SELECT id, name, route, scope FROM menus WHERE name LIKE '%Settings%' ORDER BY name`
      );
      
      console.log('\nAll Settings menus:');
      console.log(JSON.stringify(allSettings.rows, null, 2));
      
      process.exit(0);
    }
    
    console.log('Found menu:');
    console.log(JSON.stringify(menu.rows[0], null, 2));
    
    // Update the menu name and route
    await db.query(
      `UPDATE menus 
       SET name = 'System Settings', 
           route = '/super-admin/settings'
       WHERE id = $1`,
      [menu.rows[0].id]
    );
    
    console.log('\n✅ Menu updated successfully!');
    console.log('   Old Name: Security Settings');
    console.log('   New Name: System Settings');
    console.log('   Route: /super-admin/settings\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

updateSecuritySettingsMenu();
