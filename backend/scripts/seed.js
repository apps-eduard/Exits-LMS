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

    // Assign permissions to Super Admin (all permissions)
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
    }

    // Assign permissions to Support Staff (limited permissions)
    if (supportStaffRole.rows.length > 0) {
      const supportPerms = await db.query(`
        SELECT id FROM permissions 
        WHERE name IN ('view_audit_logs', 'manage_users', 'view_customers', 'view_loans', 'view_payments')
      `);
      for (const perm of supportPerms.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [supportStaffRole.rows[0].id, perm.id]
        );
      }
    }

    // Assign permissions to Developer (technical permissions)
    if (developerRole.rows.length > 0) {
      const devPerms = await db.query(`
        SELECT id FROM permissions 
        WHERE name IN ('view_audit_logs', 'manage_platform_settings', 'manage_users', 'view_customers', 'view_loans')
      `);
      for (const perm of devPerms.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [developerRole.rows[0].id, perm.id]
        );
      }
    }

    // Assign permissions to Tenant Admin (all tenant permissions)
    if (tenantAdminRole.rows.length > 0) {
      const tenantPermissions = await db.query(`
        SELECT id FROM permissions 
        WHERE resource != 'tenants' AND resource != 'settings'
      `);
      for (const perm of tenantPermissions.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [tenantAdminRole.rows[0].id, perm.id]
        );
      }
    }

    // Assign permissions to Loan Officer
    if (loanOfficerRole.rows.length > 0) {
      const loanOfficerPerms = await db.query(`
        SELECT id FROM permissions 
        WHERE name IN ('manage_customers', 'view_customers', 'manage_loans', 'view_loans', 
                       'view_payments', 'manage_loan_products', 'manage_bnpl_orders', 
                       'view_bnpl_orders', 'view_reports')
      `);
      for (const perm of loanOfficerPerms.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [loanOfficerRole.rows[0].id, perm.id]
        );
      }
    }

    // Assign permissions to Cashier
    if (cashierRole.rows.length > 0) {
      const cashierPerms = await db.query(`
        SELECT id FROM permissions 
        WHERE name IN ('view_customers', 'view_loans', 'process_payments', 
                       'view_payments', 'view_bnpl_orders')
      `);
      for (const perm of cashierPerms.rows) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [cashierRole.rows[0].id, perm.id]
        );
      }
    }

    console.log('✅ Role permissions assigned');

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
