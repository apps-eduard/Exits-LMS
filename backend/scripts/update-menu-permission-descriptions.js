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

async function updateMenuPermissionDescriptions() {
  try {
    console.log('📝 Updating menu permission descriptions...\n');

    // Update manage_menus description
    await pool.query(`
      UPDATE permissions 
      SET description = 'Full menu management access (parent permission)'
      WHERE name = 'manage_menus'
    `);
    console.log('✅ Updated manage_menus');

    // Update view_menus description
    await pool.query(`
      UPDATE permissions 
      SET description = 'View menu configuration (child of manage_menus)'
      WHERE name = 'view_menus'
    `);
    console.log('✅ Updated view_menus');

    // Update edit_menus description
    await pool.query(`
      UPDATE permissions 
      SET description = 'Edit menu properties: name, icon, parent/root, order, status (child of manage_menus)'
      WHERE name = 'edit_menus'
    `);
    console.log('✅ Updated edit_menus');

    // Verify updates
    const result = await pool.query(`
      SELECT name, description 
      FROM permissions 
      WHERE resource = 'menus' 
      ORDER BY name
    `);

    console.log(`\n📊 Updated menu permissions:\n`);
    result.rows.forEach(row => {
      console.log(`  📌 ${row.name}`);
      console.log(`     ${row.description}\n`);
    });

    await pool.end();
    console.log('✅ Update complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

updateMenuPermissionDescriptions();
