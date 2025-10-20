const db = require('./config/database');

async function testMenuAssignment() {
  try {
    console.log('\n🔍 Diagnosing peter@gmail.com role and menu assignments...\n');

    // Find peter@gmail.com
    const peter = await db.query(
      `SELECT id, email, role_id FROM users WHERE email = 'peter@gmail.com'`
    );
    
    if (peter.rows.length === 0) {
      console.log('⚠️  peter@gmail.com not found!');
      process.exit(0);
    }
    
    console.log('👤 Peter User:');
    console.log(JSON.stringify(peter.rows[0], null, 2));
    
    const peterRoleId = peter.rows[0].role_id;
    
    // Get the role details
    const role = await db.query(
      `SELECT id, name, scope, description FROM roles WHERE id = $1`,
      [peterRoleId]
    );
    
    console.log('\n� Peter\'s Role:');
    console.log(JSON.stringify(role.rows[0], null, 2));
    
    // Check menu assignments for this role
    const assignments = await db.query(
      `SELECT rm.*, m.name as menu_name 
       FROM role_menus rm 
       JOIN menus m ON rm.menu_id = m.id 
       WHERE rm.role_id = $1`,
      [peterRoleId]
    );
    
    console.log(`\n� Menu assignments for this role: ${assignments.rows.length}`);
    if (assignments.rows.length > 0) {
      console.log(JSON.stringify(assignments.rows, null, 2));
    } else {
      console.log('  (No menus assigned)');
    }
    
    // Get Dashboard menu ID
    const dashboardMenu = await db.query(
      `SELECT id, name FROM menus WHERE name = 'Dashboard' AND scope = 'platform'`
    );
    
    console.log('\n📊 Platform Dashboard menu:');
    console.log(JSON.stringify(dashboardMenu.rows[0], null, 2));
    
    console.log('\n💡 To assign Dashboard to this role, run:');
    console.log(`   INSERT INTO role_menus (role_id, menu_id) VALUES ('${peterRoleId}', '${dashboardMenu.rows[0].id}');`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMenuAssignment();
