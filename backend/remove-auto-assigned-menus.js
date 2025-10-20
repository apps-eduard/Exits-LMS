const db = require('./config/database');

async function removeAutoAssignedMenus() {
  try {
    console.log('\n🔄 Removing auto-assigned menus from Support Staff and Developer roles...\n');
    
    // Find Support Staff and Developer roles
    const roles = await db.query(`
      SELECT id, name FROM roles 
      WHERE name IN ('Support Staff', 'Developer', 'IT Support')
      AND scope = 'platform'
    `);
    
    if (roles.rows.length === 0) {
      console.log('⚠️  No Support Staff, Developer, or IT Support roles found!');
      process.exit(0);
    }
    
    console.log(`Found ${roles.rows.length} roles:\n`);
    
    for (const role of roles.rows) {
      // Get current menu count
      const currentMenus = await db.query(
        'SELECT COUNT(*) as count FROM role_menus WHERE role_id = $1',
        [role.id]
      );
      
      console.log(`📋 ${role.name} (${role.id})`);
      console.log(`   Current menus: ${currentMenus.rows[0].count}`);
      
      // Clear all menu assignments
      await db.query('DELETE FROM role_menus WHERE role_id = $1', [role.id]);
      
      console.log(`   ✅ Menus cleared - ready for manual assignment\n`);
    }
    
    console.log('✨ Complete! You can now manually assign menus to these roles via the Permission Matrix.\n');
    console.log('💡 Steps:');
    console.log('   1. Login as Super Admin');
    console.log('   2. Go to Settings → Permission Matrix');
    console.log('   3. Check the menus you want for Support Staff, Developer, and IT Support');
    console.log('   4. Click "Save All Changes"\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

removeAutoAssignedMenus();
