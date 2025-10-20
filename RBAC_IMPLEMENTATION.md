# RBAC Implementation Guide

## Overview
This document describes the Role-Based Access Control (RBAC) system implemented in the Exits LMS platform.

## Architecture

### 1. **Platform Roles** (Scope: 'platform')
These roles are for system/team management users who operate the platform:

- **Super Admin** 
  - Full platform access
  - All permissions granted
  - Can manage tenants, users, settings, and view all data
  - Can create and assign roles

- **Support Staff**
  - Limited support and customer service access
  - Permissions: view_audit_logs, manage_users, view_customers, view_loans, view_payments
  - Can help users but cannot modify system settings
  - Cannot access financial/subscription settings

- **Developer**
  - Technical and development access
  - Permissions: view_audit_logs, manage_platform_settings, manage_users, view_customers, view_loans
  - Can access platform configuration and debugging
  - Limited user management capabilities

### 2. **Tenant Roles** (Scope: 'tenant')
These roles are for individual tenant organizations:

- **Tenant Admin**
  - Full tenant-specific access
  - Can manage customers, loans, payments, staff
  - Permissions tied to their specific tenant only

- **Loan Officer**
  - Loan and customer management
  - Can manage customers, loans, view payments, access BNPL

- **Cashier**
  - Payment processing only
  - Can view customers/loans and process payments
  - Minimal access level

## Permission Matrix

### Platform Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| **Tenants** | Super Admin | Super Admin | Super Admin | Super Admin |
| **Users** | Super Admin, Support Staff | Super Admin, Support Staff | Super Admin | Super Admin |
| **Audit Logs** | - | Super Admin, Support Staff, Developer | - | - |
| **Platform Settings** | - | - | Super Admin, Developer | - |
| **Customers** | - | Super Admin, Support Staff, Developer | - | - |
| **Loans** | - | Super Admin, Support Staff, Developer | - | - |
| **Payments** | - | Super Admin, Support Staff, Developer | - | - |

### Tenant Permissions

| Resource | Admin | Loan Officer | Cashier |
|----------|-------|--------------|---------|
| **Customers** | ✓ | ✓ | ✓ (view only) |
| **Loans** | ✓ | ✓ | ✓ (view only) |
| **Payments** | ✓ | ✗ | ✓ |
| **Loan Products** | ✓ | ✗ | ✗ |
| **BNPL Orders** | ✓ | ✓ | ✓ (view only) |
| **Reports** | ✓ | ✓ | ✗ |
| **Staff Management** | ✓ | ✗ | ✗ |

## Implementation Files

### Backend

**Middleware:**
- `backend/middleware/rbac.middleware.js` - Permission checking
- `backend/middleware/tenant-isolation.middleware.js` - Tenant scope separation

**Controllers:**
- `backend/controllers/user.controller.js` - User management with RBAC

**Database:**
- `roles` table - Role definitions
- `permissions` table - Permission definitions
- `role_permissions` - Junction table mapping roles to permissions

### Frontend

**Services:**
- `frontend/src/app/core/services/rbac.service.ts` - RBAC service
  - Load roles and permissions
  - Check user permissions
  - CRUD operations for roles/permissions
  - Generate permission matrices

**Components:**
- `frontend/src/app/pages/super-admin/super-admin-layout.component.ts` - Main admin layout with navigation
- `frontend/src/app/pages/super-admin/rbac/permission-matrix.component.ts` - Permission matrix visualization

**Navigation:**
- Super Admin Layout: 8 sections with role-based menu items
- Tenant Layout: 10 sections with role-based menu items

## Key Features

### 1. Permission Checking
```typescript
// In component
this.rbacService.hasPermission('manage_users', userPermissions)
this.rbacService.hasAnyPermission(['manage_users', 'view_users'], userPermissions)
this.rbacService.hasAllPermissions(['manage_users', 'manage_tenants'], userPermissions)
```

### 2. Dynamic Menu Rendering
```html
<!-- Show menu item only if user has permission -->
<a *ngIf="hasModule('manage_tenants')" routerLink="/super-admin/tenants">
  Tenant Management
</a>
```

### 3. Permission Matrix
- Visual representation of roles vs resources
- Shows CRUD capabilities for each role
- Summary statistics per role
- Legend for CRUD operations

### 4. Role Management
- Create new roles
- Assign permissions to roles
- Remove permissions from roles
- Update role descriptions
- Delete roles (with restrictions)

## Usage Examples

### Checking Permissions in Components

```typescript
// In Super Admin component
export class TenantManagementComponent implements OnInit {
  constructor(private rbacService: RbacService) {}

  canCreateTenant(): boolean {
    return this.rbacService.hasPermission('manage_tenants', this.userPermissions);
  }
}
```

### In Templates

```html
<!-- Only show to users with permission -->
<button *ngIf="canCreateTenant()" (click)="createTenant()">
  ➕ Create Tenant
</button>

<!-- Show different UI based on role -->
<div *ngIf="userRole === 'Super Admin'">
  Admin-only content
</div>
```

### Backend Route Protection

```javascript
// Require specific permission
router.post('/api/tenants', 
  checkScope('platform'),
  checkPermission('manage_tenants'),
  tenantController.createTenant
);

// Require platform scope
router.get('/api/audit-logs',
  checkScope('platform'),
  auditController.getAuditLogs
);
```

## Database Setup

The seed script (`backend/scripts/seed.js`) automatically:
1. Creates all platform roles (Super Admin, Support Staff, Developer)
2. Creates all tenant roles (Admin, Loan Officer, Cashier)
3. Creates permissions for all resources
4. Maps permissions to roles based on scope
5. Creates demo accounts with appropriate roles

Run seeding:
```bash
cd backend
npm run seed
```

## Security Best Practices

1. **Always check permissions on backend** - Never trust client-side permission checks
2. **Use scope separation** - Platform vs tenant permissions are strictly separated
3. **Principle of least privilege** - Assign minimum permissions needed
4. **Audit logging** - All RBAC operations should be logged
5. **Role immutability for system roles** - Don't allow deletion of built-in roles

## Future Enhancements

1. **Dynamic Role Creation** - Allow creating custom roles per tenant
2. **Permission Inheritance** - Role hierarchy (e.g., Admin inherits Officer permissions)
3. **Time-based Permissions** - Temporary access elevation
4. **Permission Caching** - Cache permissions in browser storage for performance
5. **Audit Dashboard** - Track all permission changes
6. **API Rate Limiting** - Different limits per role
7. **Resource-level Permissions** - Permissions on specific resources, not just resource types

## API Endpoints

### Role Management
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get role details with permissions
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Permissions
- `GET /api/permissions` - List all permissions
- `GET /api/rbac/matrix` - Get permission matrix
- `GET /api/rbac/permissions-by-resource` - Get permissions grouped by resource
- `POST /api/roles/:id/permissions` - Assign permissions to role
- `DELETE /api/roles/:id/permissions` - Remove permissions from role

### User Permissions (at auth time)
- User object includes `permissions` array with all assigned permissions
- Permissions automatically loaded on login

## Troubleshooting

### User can't access feature despite permission
1. Check user's role assignment in database
2. Verify role has permission in role_permissions table
3. Clear browser cache and re-login
4. Check permission spelling (case-sensitive)

### Permission matrix shows empty
1. Verify roles exist in database
2. Check permissions are created
3. Check role_permissions junction table has entries
4. Run: `npm run seed` to recreate sample data

### Role deletion fails
1. Check if role is assigned to users
2. Cannot delete roles with active users
3. Deactivate/reassign users first, then delete role

## Related Files
- `SETUP_SUCCESS.md` - Complete setup guide
- `DATABASE_SCHEMA.md` - Database structure documentation
- `ENV_SETUP_GUIDE.md` - Environment configuration
