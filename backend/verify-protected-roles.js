const db = require('./config/database');

async function verifyProtectedRolesUpdate() {
  try {
    console.log('\n📊 Verifying Protected Roles Update\n');
    console.log('═'.repeat(60));
    
    // Get all platform roles with menu counts
    const roles = await db.query(`
      SELECT 
        r.id, 
        r.name, 
        r.scope,
        COUNT(rm.menu_id) as menu_count
      FROM roles r
      LEFT JOIN role_menus rm ON r.id = rm.role_id
      WHERE r.scope = 'platform'
      GROUP BY r.id, r.name, r.scope
      ORDER BY r.name
    `);
    
    console.log('\n🔐 Platform Roles & Menu Assignments:\n');
    
    roles.rows.forEach(role => {
      const icon = role.name === 'Super Admin' ? '👑' : 
                   role.menu_count === 0 ? '⚪' : '✅';
      const status = role.name === 'Super Admin' ? '(AUTO-PROTECTED)' :
                     role.menu_count === 0 ? '(READY FOR MANUAL ASSIGNMENT)' : '';
      
      console.log(`${icon} ${role.name.padEnd(20)} - ${role.menu_count} menus ${status}`);
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✨ Summary:\n');
    
    const autoProtected = roles.rows.filter(r => r.name === 'Super Admin');
    const needsAssignment = roles.rows.filter(r => 
      r.name !== 'Super Admin' && 
      parseInt(r.menu_count) === 0 &&
      ['Support Staff', 'Developer', 'IT Support'].includes(r.name)
    );
    const manuallyAssigned = roles.rows.filter(r => 
      r.name !== 'Super Admin' && parseInt(r.menu_count) > 0
    );
    
    console.log(`   👑 Auto-Protected: ${autoProtected.length} role (Super Admin only)`);
    console.log(`   ⚪ Needs Assignment: ${needsAssignment.length} roles`);
    if (needsAssignment.length > 0) {
      needsAssignment.forEach(r => {
        console.log(`      - ${r.name}`);
      });
    }
    console.log(`   ✅ Manually Assigned: ${manuallyAssigned.length} roles`);
    if (manuallyAssigned.length > 0) {
      manuallyAssigned.forEach(r => {
        console.log(`      - ${r.name} (${r.menu_count} menus)`);
      });
    }
    
    console.log('\n💡 Next Steps:\n');
    console.log('   1. Login as Super Admin');
    console.log('   2. Go to Settings → Permission Matrix');
    console.log('   3. Assign menus to roles that need them');
    console.log('   4. Click "Save All Changes"\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyProtectedRolesUpdate();
