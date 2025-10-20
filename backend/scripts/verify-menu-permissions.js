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

async function verifyMenuPermissions() {
  try {
    console.log('🔍 Verifying menu permissions...\n');

    // Get all menu permissions
    const result = await pool.query(`
      SELECT name, resource, action, description 
      FROM permissions 
      WHERE resource = 'menus' 
      ORDER BY name
    `);

    console.log(`✅ Found ${result.rows.length} menu permissions:\n`);
    result.rows.forEach(perm => {
      console.log(`  📌 ${perm.name}`);
      console.log(`     Resource: ${perm.resource}`);
      console.log(`     Action: ${perm.action}`);
      console.log(`     Description: ${perm.description}\n`);
    });

    // Check total permissions
    const totalResult = await pool.query('SELECT COUNT(*) FROM permissions');
    console.log(`📊 Total permissions in database: ${totalResult.rows[0].count}`);

    // Check if super admin has all permissions
    const superAdminPerms = await pool.query(`
      SELECT COUNT(*) 
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'Super Admin'
    `);
    console.log(`🔐 Super Admin has ${superAdminPerms.rows[0].count} permissions assigned`);

    await pool.end();
    console.log('\n✅ Verification complete');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

verifyMenuPermissions();
