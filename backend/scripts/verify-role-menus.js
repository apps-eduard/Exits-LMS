const { pool } = require('../config/database');

async function verifyRoleMenus() {
  try {
    const result = await pool.query(`
      SELECT r.name as role_name, COUNT(rm.menu_id) as menu_count 
      FROM roles r 
      LEFT JOIN role_menus rm ON r.id = rm.role_id 
      WHERE r.scope = 'platform' 
      GROUP BY r.id, r.name 
      ORDER BY r.name
    `);
    
    console.log('\n📋 Platform Roles and Menu Assignments:\n');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.role_name}: ${row.menu_count} menus`);
    });
    console.log('');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

verifyRoleMenus();
