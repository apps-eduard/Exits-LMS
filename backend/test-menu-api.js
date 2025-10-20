const db = require('./config/database');
const jwt = require('jsonwebtoken');

// Get a tenant user token first
async function testMenuAPI() {
  try {
    // Get tenant user
    const userResult = await db.query(`
      SELECT u.*, r.scope 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = 'admin@demo.com' 
      LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.error('❌ Tenant user not found');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('\n✅ Found tenant user:', user.email);
    console.log('   Role scope:', user.scope);

    // Create a token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleScope: user.scope || 'tenant',
        tenantId: user.tenant_id
      },
      process.env.JWT_SECRET || 'test-secret-key'
    );

    console.log('\n✅ Generated token');

    // Now test the menu endpoint
    const fetch = (await import('node-fetch')).default;
    
    console.log('\n📥 Testing GET /api/menus/tenant...');
    const response = await fetch('http://localhost:3000/api/menus/tenant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📤 Response status:', response.status);
    
    const data = await response.json();
    console.log('\n📋 Menu Response:');
    console.log(JSON.stringify(data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMenuAPI();
