/**
 * Assign All Platform Menus to Super Admin Role
 * This script assigns all platform menus to the Super Admin role
 * Run: node scripts/assign-menus-to-super-admin.js
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function assignMenusToSuperAdmin() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('\n🔐 Assigning all platform menus to Super Admin role...\n');
    
    // Step 1: Find Super Admin role
    const roleResult = await client.query(
      `SELECT id, name FROM roles WHERE name = 'Super Admin' AND scope = 'platform' LIMIT 1`
    );
    
    if (roleResult.rows.length === 0) {
      console.error('❌ Super Admin role not found!');
      console.log('💡 Please run: node scripts/seed-roles.js first');
      process.exit(1);
    }
    
    const superAdminRole = roleResult.rows[0];
    console.log(`✅ Found Super Admin role: ${superAdminRole.name} (${superAdminRole.id})`);
    
    // Step 2: Get all platform menus
    const menusResult = await client.query(
      `SELECT id, name, slug, scope FROM menus WHERE scope = 'platform' AND is_active = true ORDER BY order_index`
    );
    
    console.log(`📋 Found ${menusResult.rows.length} active platform menus`);
    
    // Step 3: Clear existing assignments for Super Admin
    const deleteResult = await client.query(
      `DELETE FROM role_menus WHERE role_id = $1`,
      [superAdminRole.id]
    );
    
    console.log(`🗑️  Cleared ${deleteResult.rowCount} existing menu assignments`);
    
    // Step 4: Assign all platform menus to Super Admin
    let assignedCount = 0;
    for (const menu of menusResult.rows) {
      const assignmentId = uuidv4();
      await client.query(
        `INSERT INTO role_menus (id, role_id, menu_id, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (role_id, menu_id) DO NOTHING`,
        [assignmentId, superAdminRole.id, menu.id]
      );
      assignedCount++;
      console.log(`  ✓ ${assignedCount}. ${menu.name} (${menu.slug})`);
    }
    
    await client.query('COMMIT');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Menu assignment completed successfully!');
    console.log('='.repeat(60));
    console.log(`🔐 Role: ${superAdminRole.name}`);
    console.log(`📋 Menus Assigned: ${assignedCount}`);
    console.log('='.repeat(60));
    
    console.log('\n🚀 Next steps:');
    console.log('  1. Refresh your browser to see all menus in the sidenav');
    console.log('  2. Login again if needed to reload user permissions');
    console.log('\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error assigning menus:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the script
assignMenusToSuperAdmin().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
