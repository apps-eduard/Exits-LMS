const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function removeMenuCreateDeletePermissions() {
  try {
    console.log('🗑️  Removing create_menus and delete_menus permissions...\n');

    // First, remove from role_permissions
    const removeRolePerms = await pool.query(`
      DELETE FROM role_permissions 
      WHERE permission_id IN (
        SELECT id FROM permissions 
        WHERE name IN ('create_menus', 'delete_menus')
      )
    `);
    console.log(`✅ Removed ${removeRolePerms.rowCount} role-permission assignments`);

    // Then, remove the permissions themselves
    const removePerms = await pool.query(`
      DELETE FROM permissions 
      WHERE name IN ('create_menus', 'delete_menus')
      RETURNING name
    `);
    
    console.log(`✅ Removed ${removePerms.rowCount} permissions:`);
    removePerms.rows.forEach(row => console.log(`   - ${row.name}`));

    // Verify remaining menu permissions
    const remaining = await pool.query(`
      SELECT name, description 
      FROM permissions 
      WHERE resource = 'menus' 
      ORDER BY name
    `);

    console.log(`\n📊 Remaining menu permissions (${remaining.rows.length}):`);
    remaining.rows.forEach(row => {
      console.log(`   ✓ ${row.name} - ${row.description}`);
    });

    await pool.end();
    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

removeMenuCreateDeletePermissions();
