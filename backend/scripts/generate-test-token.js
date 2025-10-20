#!/usr/bin/env node

/**
 * Test script to verify system-logs API endpoint
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');

async function generateAndTestToken() {
  try {
    console.log('\n=== Generating Valid JWT Token for Testing ===\n');

    // Get a Super Admin user
    const userResult = await db.query(`
      SELECT u.id, u.email, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'Super Admin' AND u.is_active = true
      LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ No Super Admin users found');
      process.exit(1);
    }

    const superAdminUser = userResult.rows[0];
    console.log(`✓ Found Super Admin: ${superAdminUser.email}`);
    console.log(`  Role: ${superAdminUser.role_name}`);
    console.log(`  ID: ${superAdminUser.id}\n`);

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key-development-only';
    const token = jwt.sign(
      { userId: superAdminUser.id },
      secret,
      { expiresIn: '24h' }
    );

    console.log(`✓ JWT Token generated successfully`);
    console.log(`\nToken (copy and paste in curl):`);
    console.log(`\n${token}\n`);

    console.log(`To test the API, run:`);
    console.log(`\ncurl -X GET "http://localhost:3000/api/users/system-logs?days=7&limit=10" \\`);
    console.log(`  -H "Authorization: Bearer ${token}"\n`);

    // Also check permissions
    console.log(`=== Checking Permissions ===\n`);
    
    const permResult = await db.query(`
      SELECT p.name 
      FROM permissions p
      WHERE p.name = 'view_audit_logs'
    `);

    if (permResult.rows.length > 0) {
      console.log(`✓ view_audit_logs permission exists`);
    } else {
      console.log(`❌ view_audit_logs permission NOT found`);
    }

    // Check if Super Admin role has this permission
    const rolePermResult = await db.query(`
      SELECT p.name 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = 'Super Admin' AND p.name = 'view_audit_logs'
    `);

    if (rolePermResult.rows.length > 0) {
      console.log(`✓ Super Admin role has view_audit_logs permission`);
    } else {
      console.log(`❌ Super Admin role does NOT have view_audit_logs permission`);
    }

    // Check audit_logs data
    console.log(`\n=== Checking Data ===\n`);
    
    const auditLogsResult = await db.query(`
      SELECT COUNT(*) as total FROM audit_logs
    `);
    console.log(`✓ audit_logs table has ${auditLogsResult.rows[0].total} records`);

    if (auditLogsResult.rows[0].total === 0) {
      console.log(`⚠️  No audit logs available. The API will return an empty array.`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAndTestToken();
