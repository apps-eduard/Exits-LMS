const db = require('../config/database');

const fixUserRole = async () => {
  try {
    console.log('🔧 Fixing user role to Super Admin...\n');

    // Get Super Admin role
    const roleResult = await db.query(
      `SELECT id FROM roles WHERE name = 'Super Admin' AND scope = 'platform'`
    );

    if (roleResult.rows.length === 0) {
      console.error('❌ Super Admin role not found. Run seed.js first.');
      process.exit(1);
    }

    const superAdminRoleId = roleResult.rows[0].id;
    console.log(`✅ Found Super Admin role: ${superAdminRoleId}\n`);

    // List all non-Super Admin platform users
    const usersResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name, u.tenant_id
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.is_active = true
       ORDER BY u.email`
    );

    console.log(`Found ${usersResult.rows.length} users:\n`);
    usersResult.rows.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.email} (${user.role_name || 'No role'}) [ID: ${user.id}]`);
    });

    if (usersResult.rows.length === 0) {
      console.log('❌ No users found');
      process.exit(1);
    }

    console.log('\n📝 Enter the email of the user to promote to Super Admin:');
    console.log('(Or run with: node fix-user-role.js EMAIL@example.com)\n');

    const email = process.argv[2];
    if (!email) {
      console.error('❌ Please provide email as argument: node fix-user-role.js admin@example.com');
      process.exit(1);
    }

    // Update user role
    const updateResult = await db.query(
      `UPDATE users 
       SET role_id = $1, tenant_id = NULL
       WHERE email = $2 AND is_active = true
       RETURNING id, email, first_name, last_name`,
      [superAdminRoleId, email]
    );

    if (updateResult.rows.length === 0) {
      console.error(`❌ User with email "${email}" not found or inactive`);
      process.exit(1);
    }

    const user = updateResult.rows[0];
    console.log(`\n✅ Successfully updated user to Super Admin:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Role: Super Admin\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixUserRole();
