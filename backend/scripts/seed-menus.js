/**
 * Menu Seeder Script
 * Seeds the menus table with comprehensive platform and tenant menu structure
 * Run: node scripts/seed-menus.js
 */

const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Complete menu structure with all enterprise features
const MENU_DATA = {
  platform: [
    // Overview Section (1-3)
    { name: 'Dashboard', slug: 'dashboard', icon: '🏠', route: '/super-admin/dashboard', order: 1, parent: null },
    { name: 'Audit Logs', slug: 'audit-logs', icon: '📋', route: '/super-admin/audit-logs', order: 2, parent: null },
    { name: 'System Logs', slug: 'system-logs', icon: '📝', route: '/super-admin/system-logs', order: 3, parent: null },
    
    // Tenant Management Section (4-7)
    { name: 'All Tenants', slug: 'tenants', icon: '🏢', route: '/super-admin/tenants', order: 4, parent: null },
    { name: 'Active Tenants', slug: 'active-tenants', icon: '✅', route: '/super-admin/tenants?status=active', order: 5, parent: 'tenants' },
    { name: 'Suspended Tenants', slug: 'suspended-tenants', icon: '⏸️', route: '/super-admin/tenants?status=suspended', order: 6, parent: 'tenants' },
    { name: 'Create Tenant', slug: 'create-tenant', icon: '➕', route: '/super-admin/tenants/create', order: 7, parent: 'tenants' },
    
    // Analytics & Reports Section (8-11)
    { name: 'System Analytics', slug: 'analytics', icon: '📈', route: '/super-admin/analytics', order: 8, parent: null },
    { name: 'Revenue Reports', slug: 'revenue-reports', icon: '💰', route: '/super-admin/reports/revenue', order: 9, parent: 'analytics' },
    { name: 'User Activity Reports', slug: 'user-activity-reports', icon: '👥', route: '/super-admin/reports/user-activity', order: 10, parent: 'analytics' },
    { name: 'Tenant Usage Reports', slug: 'tenant-usage-reports', icon: '🏢', route: '/super-admin/reports/tenant-usage', order: 11, parent: 'analytics' },
    
    // Billing & Subscriptions Section (12-15)
    { name: 'All Subscriptions', slug: 'subscriptions', icon: '💳', route: '/super-admin/subscriptions', order: 12, parent: null },
    { name: 'Subscription Plans', slug: 'plans', icon: '📦', route: '/super-admin/plans', order: 13, parent: 'subscriptions' },
    { name: 'Invoices', slug: 'invoices', icon: '🧾', route: '/super-admin/invoices', order: 14, parent: 'subscriptions' },
    { name: 'Payments', slug: 'platform-payments', icon: '💵', route: '/super-admin/payments', order: 15, parent: 'subscriptions' },
    
    // Notifications Section (16-18)
    { name: 'System Notifications', slug: 'notifications', icon: '📬', route: '/super-admin/notifications', order: 16, parent: null },
    { name: 'Alerts', slug: 'alerts', icon: '🔔', route: '/super-admin/alerts', order: 17, parent: 'notifications' },
    { name: 'Announcements', slug: 'announcements', icon: '📨', route: '/super-admin/announcements', order: 18, parent: 'notifications' },
    
    // System Health Section (19-22)
    { name: 'Health Check', slug: 'health', icon: '🏥', route: '/super-admin/health', order: 19, parent: null },
    { name: 'Performance Metrics', slug: 'metrics', icon: '📊', route: '/super-admin/metrics', order: 20, parent: 'health' },
    { name: 'Error Logs', slug: 'errors', icon: '🐛', route: '/super-admin/errors', order: 21, parent: 'health' },
    { name: 'Background Jobs', slug: 'jobs', icon: '🔄', route: '/super-admin/jobs', order: 22, parent: 'health' },
    
    // Settings Section (23-29)
    { name: 'Settings', slug: 'settings', icon: '⚙️', route: '/super-admin/settings', order: 23, parent: null },
    { name: 'System Roles', slug: 'roles', icon: '👥', route: '/super-admin/settings/roles', order: 24, parent: 'settings' },
    { name: 'Menu Management', slug: 'menu-management', icon: '🎨', route: '/super-admin/settings/menus', order: 25, parent: 'settings' },
    { name: 'Email Templates', slug: 'email-templates', icon: '📧', route: '/super-admin/settings/email-templates', order: 26, parent: 'settings' },
    { name: 'Email Configuration', slug: 'email-config', icon: '✉️', route: '/super-admin/settings/email-config', order: 27, parent: 'settings' },
    { name: 'Security Settings', slug: 'security-settings', icon: '🔐', route: '/super-admin/settings/security', order: 28, parent: 'settings' },
    { name: 'API Management', slug: 'api-management', icon: '🌐', route: '/super-admin/settings/api-keys', order: 29, parent: 'settings' },
    
    // System Users Section (30)
    { name: 'System Users', slug: 'system-users', icon: '👨‍💼', route: '/super-admin/users', order: 30, parent: null }
  ],
  
  tenant: [
    // Dashboard (1)
    { name: 'Dashboard', slug: 'dashboard', icon: '🏠', route: '/tenant/dashboard', order: 1, parent: null },
    
    // Customers Section (2-6)
    { name: 'All Customers', slug: 'customers', icon: '👥', route: '/tenant/customers', order: 2, parent: null },
    { name: 'Active Customers', slug: 'active-customers', icon: '✅', route: '/tenant/customers?status=active', order: 3, parent: 'customers' },
    { name: 'Inactive Customers', slug: 'inactive-customers', icon: '❌', route: '/tenant/customers?status=inactive', order: 4, parent: 'customers' },
    { name: 'New Customers', slug: 'new-customers', icon: '🆕', route: '/tenant/customers?status=new', order: 5, parent: 'customers' },
    { name: 'Customer KYC', slug: 'kyc', icon: '🆔', route: '/tenant/customers/kyc', order: 6, parent: 'customers' },
    
    // Loans Section (7-11)
    { name: 'All Loans', slug: 'loans', icon: '💰', route: '/tenant/loans', order: 7, parent: null },
    { name: 'Active Loans', slug: 'active-loans', icon: '✅', route: '/tenant/loans?status=active', order: 8, parent: 'loans' },
    { name: 'Pending Loans', slug: 'pending-loans', icon: '⏳', route: '/tenant/loans?status=pending', order: 9, parent: 'loans' },
    { name: 'Completed Loans', slug: 'completed-loans', icon: '✔️', route: '/tenant/loans?status=completed', order: 10, parent: 'loans' },
    { name: 'Loan Applications', slug: 'loan-applications', icon: '📄', route: '/tenant/loans/applications', order: 11, parent: 'loans' },
    
    // Payments Section (12-16)
    { name: 'All Payments', slug: 'payments', icon: '💳', route: '/tenant/payments', order: 12, parent: null },
    { name: 'Pending Payments', slug: 'pending-payments', icon: '⏳', route: '/tenant/payments?status=pending', order: 13, parent: 'payments' },
    { name: 'Completed Payments', slug: 'completed-payments', icon: '✅', route: '/tenant/payments?status=completed', order: 14, parent: 'payments' },
    { name: 'Failed Payments', slug: 'failed-payments', icon: '❌', route: '/tenant/payments?status=failed', order: 15, parent: 'payments' },
    { name: 'Payment Reconciliation', slug: 'reconciliation', icon: '🔄', route: '/tenant/payments/reconciliation', order: 16, parent: 'payments' },
    
    // Reports & Analytics Section (17-21)
    { name: 'Dashboard Reports', slug: 'tenant-reports', icon: '📈', route: '/tenant/reports', order: 17, parent: null },
    { name: 'Financial Reports', slug: 'financial-reports', icon: '💰', route: '/tenant/reports/financial', order: 18, parent: 'tenant-reports' },
    { name: 'Customer Reports', slug: 'customer-reports', icon: '👥', route: '/tenant/reports/customers', order: 19, parent: 'tenant-reports' },
    { name: 'Loan Reports', slug: 'loan-reports', icon: '💵', route: '/tenant/reports/loans', order: 20, parent: 'tenant-reports' },
    { name: 'Payment Reports', slug: 'payment-reports', icon: '💳', route: '/tenant/reports/payments', order: 21, parent: 'tenant-reports' },
    
    // Communications Section (22-25)
    { name: 'Email Campaigns', slug: 'email-campaigns', icon: '📧', route: '/tenant/communications/emails', order: 22, parent: null },
    { name: 'SMS Notifications', slug: 'sms-notifications', icon: '💬', route: '/tenant/communications/sms', order: 23, parent: 'email-campaigns' },
    { name: 'Push Notifications', slug: 'push-notifications', icon: '🔔', route: '/tenant/communications/push', order: 24, parent: 'email-campaigns' },
    { name: 'Communication Templates', slug: 'comm-templates', icon: '📋', route: '/tenant/communications/templates', order: 25, parent: 'email-campaigns' },
    
    // Advanced Features Section (26-29)
    { name: 'Automation Rules', slug: 'automation', icon: '🤖', route: '/tenant/automation', order: 26, parent: null },
    { name: 'Workflows', slug: 'workflows', icon: '🔀', route: '/tenant/workflows', order: 27, parent: 'automation' },
    { name: 'Integrations', slug: 'integrations', icon: '🔗', route: '/tenant/integrations', order: 28, parent: 'automation' },
    { name: 'API Access', slug: 'api-access', icon: '🔌', route: '/tenant/api-access', order: 29, parent: 'automation' },
    
    // Documents Section (30-32)
    { name: 'Document Library', slug: 'documents', icon: '📄', route: '/tenant/documents', order: 30, parent: null },
    { name: 'Document Templates', slug: 'doc-templates', icon: '📂', route: '/tenant/documents/templates', order: 31, parent: 'documents' },
    { name: 'Compliance Documents', slug: 'compliance-docs', icon: '🔒', route: '/tenant/documents/compliance', order: 32, parent: 'documents' },
    
    // Settings Section (33-37)
    { name: 'Organization Settings', slug: 'settings', icon: '⚙️', route: '/tenant/settings', order: 33, parent: null },
    { name: 'Company Profile', slug: 'company-profile', icon: '🏢', route: '/tenant/settings/profile', order: 34, parent: 'settings' },
    { name: 'Billing', slug: 'billing', icon: '💵', route: '/tenant/settings/billing', order: 35, parent: 'settings' },
    { name: 'Roles', slug: 'tenant-roles', icon: '👥', route: '/tenant/settings/roles', order: 36, parent: 'settings' },
    { name: 'Team Members', slug: 'tenant-team', icon: '👨‍💼', route: '/tenant/settings/team', order: 37, parent: 'settings' }
  ]
};

async function seedMenus() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('\n🌱 Starting menu seeding...\n');
    
    // Clear existing menus
    await client.query('DELETE FROM menus');
    console.log('✅ Cleared existing menus');
    
    // Track parent IDs for children
    const parentIds = {};
    
    // Seed Platform Menus
    console.log('\n📊 Seeding Platform Menus...');
    for (const menu of MENU_DATA.platform) {
      const menuId = uuidv4();
      const parentId = menu.parent ? parentIds[menu.parent] : null;
      
      await client.query(
        `INSERT INTO menus (id, name, slug, icon, route, parent_menu_id, order_index, scope, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [menuId, menu.name, menu.slug, menu.icon, menu.route, parentId, menu.order, 'platform', true]
      );
      
      // Store parent ID for children reference
      parentIds[menu.slug] = menuId;
      
      const parentInfo = menu.parent ? ` (parent: ${menu.parent})` : ' (root)';
      console.log(`  ✓ ${menu.order}. ${menu.name}${parentInfo}`);
    }
    
    console.log(`\n✅ Seeded ${MENU_DATA.platform.length} platform menus`);
    
    // Seed Tenant Menus
    console.log('\n📊 Seeding Tenant Menus...');
    for (const menu of MENU_DATA.tenant) {
      const menuId = uuidv4();
      const parentId = menu.parent ? parentIds[menu.parent] : null;
      
      await client.query(
        `INSERT INTO menus (id, name, slug, icon, route, parent_menu_id, order_index, scope, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [menuId, menu.name, menu.slug, menu.icon, menu.route, parentId, menu.order, 'tenant', true]
      );
      
      // Store parent ID for children reference
      parentIds[menu.slug] = menuId;
      
      const parentInfo = menu.parent ? ` (parent: ${menu.parent})` : ' (root)';
      console.log(`  ✓ ${menu.order}. ${menu.name}${parentInfo}`);
    }
    
    console.log(`\n✅ Seeded ${MENU_DATA.tenant.length} tenant menus`);
    
    await client.query('COMMIT');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Menu seeding completed successfully!');
    console.log('='.repeat(60));
    console.log(`📊 Platform Menus: ${MENU_DATA.platform.length}`);
    console.log(`📊 Tenant Menus: ${MENU_DATA.tenant.length}`);
    console.log(`📊 Total Menus: ${MENU_DATA.platform.length + MENU_DATA.tenant.length}`);
    console.log('='.repeat(60));
    
    // Menu breakdown
    console.log('\n📋 Platform Menu Structure:');
    console.log('  • Overview: 2 menus (Dashboard, Audit Logs)');
    console.log('  • Tenant Management: 4 menus');
    console.log('  • Analytics & Reports: 4 menus');
    console.log('  • Billing & Subscriptions: 4 menus');
    console.log('  • Notifications: 3 menus');
    console.log('  • System Health: 4 menus');
    console.log('  • Settings: 7 menus');
    console.log('  • System Team: 2 menus');
    
    console.log('\n📋 Tenant Menu Structure:');
    console.log('  • Dashboard: 1 menu');
    console.log('  • Customers: 5 menus');
    console.log('  • Loans: 5 menus');
    console.log('  • Payments: 5 menus');
    console.log('  • Reports & Analytics: 5 menus');
    console.log('  • Communications: 4 menus');
    console.log('  • Advanced Features: 4 menus');
    console.log('  • Documents: 3 menus');
    console.log('  • Settings: 5 menus');
    
    console.log('\n🚀 Next steps:');
    console.log('  1. Verify menus: node scripts/check-existing-menus.js');
    console.log('  2. Access Menu Management: /super-admin/settings/menus');
    console.log('  3. Edit menu properties (name, icon, parent, order, status)');
    console.log('\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding menus:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the seeder
seedMenus().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
