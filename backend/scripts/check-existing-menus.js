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

async function checkExistingMenus() {
  try {
    console.log('📋 Checking existing menus in database...\n');

    // Get all menus
    const result = await pool.query(`
      SELECT 
        m.id,
        m.name,
        m.slug,
        m.icon,
        m.route,
        m.scope,
        m.parent_menu_id,
        m.order_index,
        m.is_active,
        parent.name as parent_name
      FROM menus m
      LEFT JOIN menus parent ON m.parent_menu_id = parent.id
      ORDER BY m.scope, m.order_index, m.name
    `);

    if (result.rows.length === 0) {
      console.log('⚠️  No menus found in database!');
      console.log('\n💡 Recommendation: You need to seed initial menus based on the static menu configuration.');
      await pool.end();
      return;
    }

    console.log(`✅ Found ${result.rows.length} menus\n`);

    // Group by scope
    const platform = result.rows.filter(m => m.scope === 'platform');
    const tenant = result.rows.filter(m => m.scope === 'tenant');

    console.log('🔹 PLATFORM MENUS (' + platform.length + '):');
    console.log('═'.repeat(80));
    platform.forEach(menu => {
      const indent = menu.parent_menu_id ? '  └─ ' : '📍 ';
      const parent = menu.parent_name ? ` (child of: ${menu.parent_name})` : '';
      const status = menu.is_active ? '✅' : '❌';
      console.log(`${indent}${menu.icon || '📋'} ${menu.name} ${status}`);
      console.log(`     Slug: ${menu.slug}`);
      console.log(`     Route: ${menu.route || 'N/A'}`);
      console.log(`     Order: ${menu.order_index}${parent}`);
      console.log('');
    });

    console.log('\n🔹 TENANT MENUS (' + tenant.length + '):');
    console.log('═'.repeat(80));
    tenant.forEach(menu => {
      const indent = menu.parent_menu_id ? '  └─ ' : '📍 ';
      const parent = menu.parent_name ? ` (child of: ${menu.parent_name})` : '';
      const status = menu.is_active ? '✅' : '❌';
      console.log(`${indent}${menu.icon || '📋'} ${menu.name} ${status}`);
      console.log(`     Slug: ${menu.slug}`);
      console.log(`     Route: ${menu.route || 'N/A'}`);
      console.log(`     Order: ${menu.order_index}${parent}`);
      console.log('');
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkExistingMenus();
