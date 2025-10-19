const db = require('../config/database');

const reactivateSuperAdmin = async () => {
  try {
    console.log('🔄 Reactivating Super Admin user...\n');

    const result = await db.query(
      `UPDATE users SET is_active = true 
       WHERE email = 'admin@exits-lms.com'
       RETURNING id, email, is_active, created_at`
    );

    if (result.rows.length === 0) {
      console.log('⚠️  Super admin user not found');
    } else {
      const user = result.rows[0];
      console.log('✅ Super Admin Reactivated Successfully!\n');
      console.log('📧 Email:', user.email);
      console.log('✓ Status: ACTIVE');
      console.log('📅 Created:', new Date(user.created_at).toLocaleString());
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error reactivating super admin:', error.message);
    process.exit(1);
  }
};

reactivateSuperAdmin();
