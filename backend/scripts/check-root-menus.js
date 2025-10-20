const { pool } = require('../config/database');

async function checkRootMenus() {
  try {
    const result = await pool.query(`
      SELECT id, name, slug, parent_menu_id, order_index 
      FROM menus 
      WHERE scope = 'platform' AND parent_menu_id IS NULL 
      ORDER BY order_index
    `);
    
    console.log('\n📋 Root Platform Menus:\n');
    result.rows.forEach(menu => {
      console.log(`  ${menu.order_index}. ${menu.name} (${menu.slug})`);
    });
    console.log(`\n✅ Total: ${result.rows.length} root menus\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRootMenus();
