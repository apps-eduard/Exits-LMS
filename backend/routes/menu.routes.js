const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Menu Configuration with permission linking
 * Maps routes and actions to permissions
 */
const MENU_CONFIG = {
  platform: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'System Dashboard & Quick Stats',
      order: 1,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: '🏠',
          route: '/super-admin/dashboard',
          description: 'Quick stats: tenants, users, loans, system health',
          permission: null // No permission required
        },
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: '📝',
          route: '/super-admin/audit-logs',
          description: 'System-wide activity log',
          permission: 'view_audit_logs'
        }
      ]
    },
    {
      id: 'tenant-mgmt',
      title: 'Tenant Management',
      description: 'Manage all tenants and their settings',
      order: 2,
      items: [
        {
          id: 'all-tenants',
          label: 'All Tenants',
          icon: '🏢',
          route: '/super-admin/tenants',
          description: 'View and manage all tenants',
          permission: 'view_tenants'
        },
        {
          id: 'active-tenants',
          label: 'Active Tenants',
          icon: '✅',
          route: '/super-admin/tenants',
          queryParams: { status: 'active' },
          description: 'View active tenants',
          permission: 'view_tenants'
        },
        {
          id: 'suspended-tenants',
          label: 'Suspended Tenants',
          icon: '⏸️',
          route: '/super-admin/tenants',
          queryParams: { status: 'suspended' },
          description: 'View suspended tenants',
          permission: 'view_tenants'
        },
        {
          id: 'create-tenant',
          label: 'Create Tenant',
          icon: '➕',
          route: '/super-admin/tenants/create',
          description: 'Onboard new tenant',
          permission: 'create_tenants'
        }
      ]
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configuration and administration',
      order: 3,
      items: [
        {
          id: 'system-settings',
          label: 'Settings',
          icon: '⚙️',
          route: '/super-admin/settings',
          description: 'System configuration',
          permission: 'manage_system_settings'
        },
        {
          id: 'system-roles',
          label: 'System Roles',
          icon: '👑',
          route: '/super-admin/settings/system-roles',
          description: 'Create & manage platform roles and permissions',
          permission: 'manage_roles'
        },
        {
          id: 'email-templates',
          label: 'Email Templates',
          icon: '✉️',
          route: '/super-admin/settings/email-templates',
          description: 'Manage system email templates',
          permission: 'manage_email_templates'
        }
      ]
    },
    {
      id: 'users',
      title: 'System Team',
      description: 'Manage system administrators and users',
      order: 4,
      items: [
        {
          id: 'team-members',
          label: 'Team Members',
          icon: '👥',
          route: '/super-admin/users',
          description: 'Manage system users',
          permission: 'manage_users'
        },
        {
          id: 'user-activity',
          label: 'Activity Logs',
          icon: '📊',
          route: '/super-admin/users/activity',
          description: 'View user activity',
          permission: 'view_audit_logs'
        }
      ]
    }
  ],
  tenant: [
    {
      id: 'overview',
      title: 'Dashboard & Overview',
      description: 'Quick snapshot of daily activity',
      order: 1,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: '🏠',
          route: '/tenant/dashboard',
          description: 'Daily activity overview',
          permission: null
        }
      ]
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Customer account management',
      order: 2,
      items: [
        {
          id: 'customers',
          label: 'All Customers',
          icon: '👥',
          route: '/tenant/customers',
          description: 'Manage customer accounts',
          permission: 'view_customers',
          children: [
            {
              id: 'add-customer',
              label: 'Add Customer',
              icon: '➕',
              route: '/tenant/customers/create',
              description: 'Create new customer',
              permission: 'create_customers'
            },
            {
              id: 'active-customers',
              label: 'Active Customers',
              icon: '✅',
              route: '/tenant/customers?status=active',
              description: 'View active customers',
              permission: 'view_customers'
            },
            {
              id: 'pending-customers',
              label: 'Pending Customers',
              icon: '⏳',
              route: '/tenant/customers?status=pending',
              description: 'View pending customers',
              permission: 'view_customers'
            }
          ]
        },
        {
          id: 'kyc',
          label: 'KYC Verification',
          icon: '🆔',
          route: '/tenant/customers/kyc',
          description: 'Manage KYC verification',
          permission: 'manage_kyc'
        }
      ]
    },
    {
      id: 'loans',
      title: 'Loan Management',
      description: 'Loan applications and processing',
      order: 3,
      items: [
        {
          id: 'loans',
          label: 'All Loans',
          icon: '💰',
          route: '/tenant/customers-loans',
          description: 'View and manage loans',
          permission: 'view_loans',
          children: [
            {
              id: 'active-loans',
              label: 'Active Loans',
              icon: '✅',
              route: '/tenant/customers-loans?status=active',
              description: 'View active loans',
              permission: 'view_loans'
            },
            {
              id: 'pending-loans',
              label: 'Pending Loans',
              icon: '⏳',
              route: '/tenant/customers-loans?status=pending',
              description: 'View pending loans',
              permission: 'view_loans'
            },
            {
              id: 'closed-loans',
              label: 'Closed Loans',
              icon: '✔️',
              route: '/tenant/customers-loans?status=closed',
              description: 'View closed loans',
              permission: 'view_loans'
            }
          ]
        },
        {
          id: 'applications',
          label: 'Applications',
          icon: '📋',
          route: '/tenant/customers-loans/applications',
          description: 'Loan applications',
          permission: 'view_loan_applications'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      description: 'Handle payments and transactions',
      order: 4,
      items: [
        {
          id: 'payments',
          label: 'All Payments',
          icon: '💳',
          route: '/tenant/payments',
          description: 'Process and track payments',
          permission: 'view_payments',
          children: [
            {
              id: 'pending-payments',
              label: 'Pending Payments',
              icon: '⏳',
              route: '/tenant/payments?status=pending',
              description: 'Pending payment transactions',
              permission: 'view_payments'
            },
            {
              id: 'completed-payments',
              label: 'Completed Payments',
              icon: '✅',
              route: '/tenant/payments?status=completed',
              description: 'Completed payment transactions',
              permission: 'view_payments'
            },
            {
              id: 'failed-payments',
              label: 'Failed Payments',
              icon: '❌',
              route: '/tenant/payments?status=failed',
              description: 'Failed payment transactions',
              permission: 'view_payments'
            }
          ]
        },
        {
          id: 'reconciliation',
          label: 'Reconciliation',
          icon: '✔️',
          route: '/tenant/payments/reconciliation',
          description: 'Payment reconciliation',
          permission: 'reconcile_payments'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Tenant configuration',
      order: 5,
      items: [
        {
          id: 'tenant-settings',
          label: 'Organization Settings',
          icon: '⚙️',
          route: '/tenant/settings',
          description: 'Tenant configuration',
          permission: 'manage_tenant_settings',
          children: [
            {
              id: 'general-settings',
              label: 'General Settings',
              icon: '⚙️',
              route: '/tenant/settings',
              description: 'Organization info and settings',
              permission: 'manage_tenant_settings'
            },
            {
              id: 'billing',
              label: 'Billing',
              icon: '💵',
              route: '/tenant/settings/billing',
              description: 'Billing and payment methods',
              permission: 'manage_billing'
            }
          ]
        },
        {
          id: 'tenant-roles',
          label: 'Roles & Permissions',
          icon: '👑',
          route: '/tenant/settings/roles',
          description: 'Manage tenant roles',
          permission: 'manage_roles'
        },
        {
          id: 'tenant-users',
          label: 'Team Members',
          icon: '👤',
          route: '/tenant/users',
          description: 'Manage tenant users',
          permission: 'manage_users'
        }
      ]
    }
  ]
};

/**
 * GET /api/menus/platform - Get platform admin menu
 * Returns menu structure filtered by user permissions
 */
router.get('/platform', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const roleScope = req.user.roleScope;
    
    console.log('[MENU_API] 🍔 Platform menu requested by:', {
      userId,
      roleScope,
      isSuperAdmin: roleScope === 'platform'
    });
    
    // For platform admins, show all menu items (super admin)
    const isSuperAdmin = roleScope === 'platform';
    const menu = filterMenuByPermissions(MENU_CONFIG.platform, [], isSuperAdmin);
    
    console.log('[MENU_API] ✅ Platform menu returned:', {
      sections: menu.length,
      items: menu.reduce((sum, s) => sum + s.items.length, 0)
    });
    
    res.json(menu);
  } catch (error) {
    console.error('[MENU_API] ❌ Error fetching platform menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * GET /api/menus/tenant - Get tenant menu
 * Returns menu structure filtered by user permissions
 */
router.get('/tenant', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    
    // For tenant users, show all menu items
    // Permission filtering is handled by route guards
    const isSuperAdmin = true; // Show all items for now
    const menu = filterMenuByPermissions(MENU_CONFIG.tenant, [], isSuperAdmin);
    
    res.json(menu);
  } catch (error) {
    logger.error('Error fetching tenant menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * GET /api/menus/role/:roleId - Get menu for specific role
 */
router.get('/role/:roleId', authMiddleware, async (req, res) => {
  try {
    const { roleId } = req.params;
    const scope = req.query.scope || 'platform';
    
    // For now, return full menu (can be filtered by role later)
    const menuConfig = scope === 'tenant' ? MENU_CONFIG.tenant : MENU_CONFIG.platform;
    
    const menu = filterMenuByPermissions(menuConfig, []);
    
    res.json(menu);
  } catch (error) {
    logger.error('Error fetching role menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/**
 * Helper function to filter menu items by permissions
 * If isSuperAdmin is true, show all items regardless of permissions
 */
function filterMenuByPermissions(menuConfig, permissions, isSuperAdmin = false) {
  return menuConfig.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // If super admin, show everything
      if (isSuperAdmin) return true;
      // If no permission required, show it
      if (!item.permission) return true;
      // If permission is required, check if user has it
      return permissions.includes(item.permission);
    })
  })).filter(section => section.items.length > 0); // Remove empty sections
}

module.exports = router;
