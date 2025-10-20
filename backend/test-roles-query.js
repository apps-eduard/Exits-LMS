const db = require('./config/database');

async function testRolesQuery() {
  try {
    console.log('\n📝 Testing roles query...\n');
    
    const result = await db.query(`
      SELECT 
        r.id,
        r.name,
        r.scope,
        r.description,
        r.created_at,
        json_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.scope, r.description, r.created_at
      ORDER BY r.name ASC
    `);

    console.log('✅ Query successful!');
    console.log(`📊 Found ${result.rows.length} roles:\n`);
    
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.name} (${row.scope})`);
      console.log(`   Description: ${row.description || 'N/A'}`);
      console.log(`   Permissions: ${row.permissions.filter(p => p).join(', ') || 'None'}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRolesQuery();
