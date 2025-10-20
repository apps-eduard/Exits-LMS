const db = require('./config/database');

async function checkPeterAccounts() {
  try {
    const users = await db.query(
      `SELECT u.id, u.email, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email LIKE '%peter%'`
    );
    
    console.log('\nAll users with "peter" in email:');
    console.log(JSON.stringify(users.rows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPeterAccounts();
