#!/usr/bin/env node

const http = require('http');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

async function testSystemLogsAPI() {
  console.log('\n=== Testing System Logs API ===\n');

  try {
    // 1. Check if audit_logs table has data
    console.log('1. Checking audit_logs table...');
    const auditLogsResult = await db.query('SELECT COUNT(*) as total FROM audit_logs');
    console.log(`   ✓ audit_logs table has ${auditLogsResult.rows[0].total} records\n`);

    // 2. Check if view_audit_logs permission exists
    console.log('2. Checking view_audit_logs permission...');
    const permResult = await db.query('SELECT id, name FROM permissions WHERE name = $1', ['view_audit_logs']);
    if (permResult.rows.length > 0) {
      console.log(`   ✓ Permission exists (ID: ${permResult.rows[0].id})\n`);
    } else {
      console.log('   ✗ Permission does not exist\n');
    }

    // 3. Get a Super Admin user to generate valid JWT
    console.log('3. Getting Super Admin user...');
    const userResult = await db.query(`
      SELECT u.id, u.email, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'Super Admin' AND u.is_active = true
      LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('   ✗ No Super Admin users found\n');
      process.exit(1);
    }

    const superAdminUser = userResult.rows[0];
    console.log(`   ✓ Found Super Admin: ${superAdminUser.email}\n`);

    // 4. Generate JWT token
    console.log('4. Generating JWT token...');
    const token = jwt.sign(
      { userId: superAdminUser.id },
      process.env.JWT_SECRET || 'your-secret-key-development-only'
    );
    console.log(`   ✓ Token generated\n`);

    // 5. Test API endpoint
    console.log('5. Testing /api/users/system-logs endpoint...');
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users/system-logs?days=7&limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          try {
            const response = JSON.parse(data);
            console.log(`   Response:`, JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 && response.systemLogs) {
              console.log(`\n✅ SUCCESS! API returned ${response.systemLogs.length} logs\n`);
            } else {
              console.log(`\n❌ FAILED with status ${res.statusCode}\n`);
            }
          } catch (e) {
            console.log(`   Body: ${data}\n`);
          }
          resolve();
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        console.log(`   ✗ Request timed out\n`);
        resolve();
      });

      req.on('error', (error) => {
        console.log(`   ✗ Request failed: ${error.message}\n`);
        reject(error);
      });

      req.end();
    });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testSystemLogsAPI();
