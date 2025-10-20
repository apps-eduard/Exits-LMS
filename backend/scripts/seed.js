const db = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create Platform Roles
    const superAdminRole = await db.query(`
      INSERT INTO roles (name, scope, description)
      VALUES ('Super Admin', 'platform', 'Full platform access')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    const supportStaffRole = await db.query(`
      INSERT INTO roles (name, scope, description)
      VALUES ('Support Staff', 'platform', 'Support and customer service')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    const developerRole = await db.query(`
      INSERT INTO roles (name, scope, description)
      VALUES ('Developer', 'platform', 'Development and technical support')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    // Create Tenant Roles
    const tenantAdminRole = await db.query(`
      INSERT INTO roles (name, scope, description)
      VALUES ('tenant-admin', 'tenant', 'Full tenant access')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    const loanOfficerRole = await db.query(`
      INSERT INTO roles (name, scope, description)
      VALUES ('Loan Officer', 'tenant', 'Manage loans and customers')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    const cashierRole = await db.query(`
      INSERT INTO roles (name, scope, description)
      VALUES ('Cashier', 'tenant', 'Process payments')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    console.log('✅ Roles created');

    // Create Permissions
    const permissions = [
      // Platform permissions - Tenant Management (Parent + 4 children)
      { name: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Manage all tenants' },
      { name: 'view_tenants', resource: 'tenants', action: 'view', description: 'View all tenants (child of manage_tenants)' },
      { name: 'create_tenants', resource: 'tenants', action: 'create', description: 'Create new tenants (child of manage_tenants)' },
      { name: 'edit_tenants', resource: 'tenants', action: 'edit', description: 'Edit tenant information (child of manage_tenants)' },
      { name: 'delete_tenants', resource: 'tenants', action: 'delete', description: 'Delete tenants (child of manage_tenants)' },
      
      // Platform permissions - System Team/Users (Parent + 2 children)
      { name: 'manage_users', resource: 'users', action: 'manage', description: 'Manage system users' },
      { name: 'view_users', resource: 'users', action: 'view', description: 'View system users (child of manage_users)' },
      { name: 'edit_users', resource: 'users', action: 'edit', description: 'Edit system user information (child of manage_users)' },
      
      // Platform permissions - System Settings (Parent + 3 children)
      { name: 'manage_platform_settings', resource: 'settings', action: 'manage', description: 'Manage platform settings' },
      { name: 'view_platform_settings', resource: 'settings', action: 'view', description: 'View platform settings (child of manage_platform_settings)' },
      { name: 'edit_platform_settings', resource: 'settings', action: 'edit', description: 'Edit platform settings (child of manage_platform_settings)' },
      { name: 'export_settings', resource: 'settings', action: 'export', description: 'Export settings configuration (child of manage_platform_settings)' },
      
  // Platform permissions - Menu Management (Parent + 2 children only)
  { name: 'manage_menus', resource: 'menus', action: 'manage', description: 'Full menu management access' },
  { name: 'view_menus', resource: 'menus', action: 'view', description: 'View menu configuration (child of manage_menus)' },
  { name: 'edit_menus', resource: 'menus', action: 'edit', description: 'Edit menu properties: name, icon, parent, order, status (child of manage_menus)' },      // Platform permissions - Audit & Compliance (Standalone)
      { name: 'view_audit_logs', resource: 'audit_logs', action: 'view', description: 'View all audit logs' },
      
      // Tenant permissions (Parent -> Child hierarchy)
      { name: 'manage_customers', resource: 'customers', action: 'manage', description: 'Manage customers' },
      { name: 'view_customers', resource: 'customers', action: 'view', description: 'View customers (child of manage_customers)' },
      { name: 'manage_loans', resource: 'loans', action: 'manage', description: 'Manage loans' },
      { name: 'approve_loans', resource: 'loans', action: 'approve', description: 'Approve loans (child of manage_loans)' },
      { name: 'view_loans', resource: 'loans', action: 'view', description: 'View loans (child of manage_loans)' },
      { name: 'process_payments', resource: 'payments', action: 'process', description: 'Process payments' },
      { name: 'view_payments', resource: 'payments', action: 'view', description: 'View payments (child of process_payments)' },
      { name: 'manage_loan_products', resource: 'loan_products', action: 'manage', description: 'Manage loan products' },
      { name: 'manage_bnpl_merchants', resource: 'bnpl_merchants', action: 'manage', description: 'Manage BNPL merchants' },
      { name: 'manage_bnpl_orders', resource: 'bnpl_orders', action: 'manage', description: 'Manage BNPL orders' },
      { name: 'view_bnpl_orders', resource: 'bnpl_orders', action: 'view', description: 'View BNPL orders (child of manage_bnpl_orders)' },
      { name: 'view_reports', resource: 'reports', action: 'view', description: 'View reports' },
    ];

    for (const perm of permissions) {
      await db.query(
        `INSERT INTO permissions (name, resource, action, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING`,
        [perm.name, perm.resource, perm.action, perm.description]
      );
    }

    console.log('✅ Permissions created');

    // ============================================
    // ROLE-PERMISSION ASSIGNMENT LOGIC
    // ============================================
    
    // Helper function to assign permissions by name
    const assignPermissions = async (roleId, permissionNames) => {
      const placeholders = permissionNames.map((_, i) => `$${i + 1}`).join(',');
      const perms = await db.query(
        `SELECT id FROM permissions WHERE name IN (${placeholders})`,
        permissionNames
      );
      
      for (const perm of perms.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [roleId, perm.id]
        );
      }
      return perms.rows.length;
    };

    // ============================================
    // SUPER ADMIN - Platform Scope (All Permissions)
    // ============================================
    if (superAdminRole.rows.length > 0) {
      const allPermissions = await db.query('SELECT id FROM permissions');
      for (const perm of allPermissions.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [superAdminRole.rows[0].id, perm.id]
        );
      }
      console.log(`  ✓ Super Admin: ${allPermissions.rows.length} permissions (FULL ACCESS)`);
    }

    // ============================================
    // SUPPORT STAFF - Platform Scope (Read-Only + User Management)
    // ============================================
    if (supportStaffRole.rows.length > 0) {
      const supportPerms = [
        // Tenant Management - View only
        'view_tenants',
        
        // User Management - View + Edit (can manage support tickets, user issues)
        'view_users',
        'edit_users',
        
        // Audit & Compliance - View only
        'view_audit_logs',
        
        // Platform Settings - View only
        'view_platform_settings',
        
        // Menu Management - View only
        'view_menus',
        
        // Tenant Operations - View only (for support purposes)
        'view_customers',
        'view_loans',
        'view_payments',
        'view_reports'
      ];
      
      const count = await assignPermissions(supportStaffRole.rows[0].id, supportPerms);
      console.log(`  ✓ Support Staff: ${count} permissions (VIEW + USER SUPPORT)`);
    }

    // ============================================
    // DEVELOPER - Platform Scope (Technical Access)
    // ============================================
    if (developerRole.rows.length > 0) {
      const devPerms = [
        // Tenant Management - View only
        'view_tenants',
        
        // User Management - Full (for technical support)
        'manage_users',
        'view_users',
        'edit_users',
        
        // Platform Settings - Full (needs to configure system)
        'manage_platform_settings',
        'view_platform_settings',
        'edit_platform_settings',
        'export_settings',
        
        // Menu Management - Full (for UI configuration)
        'manage_menus',
        'view_menus',
        'edit_menus',
        
        // Audit & Compliance - View only
        'view_audit_logs',
        
        // Tenant Operations - View only (for debugging)
        'view_customers',
        'view_loans',
        'view_payments',
        'view_bnpl_orders',
        'view_reports'
      ];
      
      const count = await assignPermissions(developerRole.rows[0].id, devPerms);
      console.log(`  ✓ Developer: ${count} permissions (TECHNICAL + CONFIG)`);
    }

    // ============================================
    // TENANT ADMIN - Tenant Scope (All Tenant Operations)
    // ============================================
    if (tenantAdminRole.rows.length > 0) {
      const tenantAdminPerms = [
        // Users (within tenant)
        'manage_users',
        'view_users',
        'edit_users',
        
        // Customers - Full
        'manage_customers',
        'view_customers',
        
        // Loans - Full
        'manage_loans',
        'approve_loans',
        'view_loans',
        'manage_loan_products',
        
        // Payments - Full
        'process_payments',
        'view_payments',
        
        // BNPL - Full
        'manage_bnpl_merchants',
        'manage_bnpl_orders',
        'view_bnpl_orders',
        
        // Reports - Full
        'view_reports',
        
        // Audit (tenant scope only)
        'view_audit_logs'
      ];
      
      const count = await assignPermissions(tenantAdminRole.rows[0].id, tenantAdminPerms);
      console.log(`  ✓ Tenant Admin: ${count} permissions (FULL TENANT ACCESS)`);
    }

    // ============================================
    // LOAN OFFICER - Tenant Scope (Loan Operations)
    // ============================================
    if (loanOfficerRole.rows.length > 0) {
      const loanOfficerPerms = [
        // Customers - Full (need to manage customer info for loans)
        'manage_customers',
        'view_customers',
        
        // Loans - Full (primary responsibility)
        'manage_loans',
        'approve_loans',
        'view_loans',
        'manage_loan_products',
        
        // Payments - View only (can see payment status)
        'view_payments',
        
        // BNPL - Manage (can process BNPL applications)
        'manage_bnpl_orders',
        'view_bnpl_orders',
        
        // Reports - View (for loan analytics)
        'view_reports'
      ];
      
      const count = await assignPermissions(loanOfficerRole.rows[0].id, loanOfficerPerms);
      console.log(`  ✓ Loan Officer: ${count} permissions (LOAN OPERATIONS)`);
    }

    // ============================================
    // CASHIER - Tenant Scope (Payment Processing)
    // ============================================
    if (cashierRole.rows.length > 0) {
      const cashierPerms = [
        // Customers - View only (need to verify customer info)
        'view_customers',
        
        // Loans - View only (need to see loan details for payments)
        'view_loans',
        
        // Payments - Full (primary responsibility)
        'process_payments',
        'view_payments',
        
        // BNPL - View only (can see BNPL payment details)
        'view_bnpl_orders',
        
        // Reports - View (for payment reconciliation)
        'view_reports'
      ];
      
      const count = await assignPermissions(cashierRole.rows[0].id, cashierPerms);
      console.log(`  ✓ Cashier: ${count} permissions (PAYMENT PROCESSING)`);
    }

    console.log('✅ Role permissions assigned with proper hierarchy');

    // Create Super Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdminUser = await db.query(
      `INSERT INTO users (tenant_id, role_id, email, password_hash, first_name, last_name, is_active)
       VALUES (NULL, $1, $2, $3, $4, $5, true)
       ON CONFLICT DO NOTHING
       RETURNING id, email`,
      [superAdminRole.rows[0]?.id, 'admin@exits-lms.com', hashedPassword, 'Super', 'Admin']
    );

    if (superAdminUser.rows.length > 0) {
      console.log('✅ Super Admin created:');
      console.log('   Email: admin@exits-lms.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change this password in production!');
    }

    // Create Demo Tenant
    const demoTenant = await db.query(
      `INSERT INTO tenants (name, subdomain, contact_first_name, contact_last_name, contact_email, contact_phone, status, subscription_plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Demo Company', 'demo', 'Demo', 'Admin', 'demo@example.com', '+1-555-0123', 'active', 'trial']
    );

    if (demoTenant.rows.length > 0) {
      const tenantId = demoTenant.rows[0].id;

      // Enable modules for demo tenant
      await db.query(
        `INSERT INTO tenant_features (tenant_id, module_name, is_enabled, enabled_at)
         VALUES ($1, $2, true, CURRENT_TIMESTAMP), ($1, $3, true, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [tenantId, 'money-loan', 'bnpl']
      );

      // Create demo tenant admin
      const demoPassword = await bcrypt.hash('demo123', 10);
      await db.query(
        `INSERT INTO users (tenant_id, role_id, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT DO NOTHING`,
        [tenantId, tenantAdminRole.rows[0]?.id, 'admin@demo.com', demoPassword, 'Demo', 'Admin']
      );

      console.log('✅ Demo tenant created:');
      console.log('   Tenant: Demo Company');
      console.log('   Email: admin@demo.com');
      console.log('   Password: demo123');
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
