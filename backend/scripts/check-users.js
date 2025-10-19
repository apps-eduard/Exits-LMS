const db = require('../config/database');

const checkRoles = async () => {
  try {
    console.log('🔍 Checking available roles...\n');

    const roles = await db.query(
      `SELECT id, name, scope FROM roles ORDER BY name`
    );

    if (roles.rows.length === 0) {
      console.log('⚠️  No roles found in database');
    } else {
      console.log('📋 Available Roles:');
      roles.rows.forEach(role => {
        console.log(`   🔹 ${role.name} (${role.scope})`);
      });
    }

    console.log('\n🔍 Checking all users...\n');

    const users = await db.query(
      `SELECT u.id, u.email, u.is_active, r.name as role_name, r.scope
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );

    console.log('👥 All Users:');
    users.rows.forEach(user => {
      const status = user.is_active ? '✅ ACTIVE' : '❌ INACTIVE';
      console.log(`   ${status} - ${user.email} (${user.role_name || 'NO ROLE'} / ${user.scope || 'N/A'})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkRoles();
