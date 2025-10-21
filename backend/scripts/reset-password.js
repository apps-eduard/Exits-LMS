const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Reset test user passwords to known values for testing
 * This script runs at the end of setup.ps1 to ensure test users have working credentials
 */

async function resetTestUserPasswords() {
  try {
    console.log('[RESET_PASSWORD] Starting test user password reset...\n');

    // Super Admin user
    const adminEmail = 'admin@exits-lms.com';
    const adminPassword = 'admin123';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log(`[RESET_PASSWORD] Resetting super admin: ${adminEmail}`);
    const adminResult = await db.query(
      `UPDATE users 
       SET password = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE email = $2 
       RETURNING id, email, first_name`,
      [adminHashedPassword, adminEmail]
    );

    if (adminResult.rows.length > 0) {
      console.log(`✓ Super admin password reset successfully`);
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}\n`);
    } else {
      console.log(`⚠ Super admin user not found: ${adminEmail}\n`);
    }

    // Demo Tenant user
    const demoEmail = 'demo@exits-lms.com';
    const demoPassword = 'demo123';
    const demoHashedPassword = await bcrypt.hash(demoPassword, 10);

    console.log(`[RESET_PASSWORD] Resetting demo tenant user: ${demoEmail}`);
    const demoResult = await db.query(
      `UPDATE users 
       SET password = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE email = $2 
       RETURNING id, email, first_name`,
      [demoHashedPassword, demoEmail]
    );

    if (demoResult.rows.length > 0) {
      console.log(`✓ Demo user password reset successfully`);
      console.log(`  Email: ${demoEmail}`);
      console.log(`  Password: ${demoPassword}\n`);
    } else {
      console.log(`⚠ Demo user not found: ${demoEmail}\n`);
    }

    console.log('[RESET_PASSWORD] ✅ Test user password reset complete!\n');
    console.log('You can now login with these credentials:');
    console.log(`  Super Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`  Demo User:   ${demoEmail} / ${demoPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error('[RESET_PASSWORD] ❌ Error resetting passwords:', error);
    process.exit(1);
  }
}

// Run the reset
resetTestUserPasswords();
