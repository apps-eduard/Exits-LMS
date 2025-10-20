# System Roles vs Tenant Roles - Quick Comparison

## Side-by-Side Comparison

### System Roles (Platform Scope)

```
Location: /super-admin/settings/system-roles
Component: SystemRolesComponent
Theme: Purple 🟣
Access: Super Admin Only

Protected Roles:
  1. Super Admin (Full platform access)
  2. Support Staff (Limited access)
  3. Developer (Technical access)

Permissions (4):
  - manage_tenants
  - view_audit_logs
  - manage_platform_settings
  - manage_users

Responsibilities:
  ✓ Manage all platform tenants
  ✓ View system audit logs
  ✓ Configure platform settings
  ✓ Manage platform users
```

### Tenant Roles (Tenant Scope)

```
Location: /tenant/settings/roles
Component: TenantRolesComponent
Theme: Green 🟢
Access: Tenant Admin Only

Protected Roles:
  1. tenant-admin (Full tenant access)
  2. Loan Officer (Loan operations)
  3. Cashier (Payments)

Permissions (13):
  User Management (1)
    - manage_users
  
  Customer Management (2)
    - manage_customers
    - view_customers
  
  Loan Management (4)
    - manage_loans
    - approve_loans
    - view_loans
    - manage_loan_products
  
  Payment Management (2)
    - process_payments
    - view_payments
  
  BNPL Management (3)
    - manage_bnpl_merchants
    - manage_bnpl_orders
    - view_bnpl_orders
  
  Reports (1)
    - view_reports

Responsibilities:
  ✓ Manage tenant users
  ✓ Manage customers
  ✓ Process loans
  ✓ Handle payments
  ✓ Manage BNPL operations
  ✓ View reports
```

---

## Matrix Overview

| Aspect | System | Tenant |
|--------|--------|--------|
| **Route** | `/super-admin/settings/system-roles` | `/tenant/settings/roles` |
| **Component** | `SystemRolesComponent` | `TenantRolesComponent` |
| **Scope** | Platform | Organization |
| **Color** | Purple 🟣 | Green 🟢 |
| **Managed By** | Super Admin | Tenant Admin |
| **Icon** | 🌐 Platform | 🏢 Tenant |
| **Roles Count** | 3 protected + custom | 3 protected + custom |
| **Permission Count** | 4 | 13 |
| **Main Focus** | Platform Management | Operations |
| **Protected** | Super Admin, Support Staff, Developer | tenant-admin |
| **Key Permissions** | Tenant management, Audit logs | Loan operations, Payments |

---

## Permission Distribution

### System (4 permissions)
- Tenant Management: 1 (manage_tenants)
- User Management: 1 (manage_users)
- Audit: 1 (view_audit_logs)
- Settings: 1 (manage_platform_settings)

### Tenant (13 permissions)
- User Management: 1
- Customer Management: 2
- Loan Management: 4
- Payment Management: 2
- BNPL Management: 3
- Reports: 1

---

## Role Hierarchy

```
┌─────────────────────────────────────────────┐
│         All Users (Platform)                │
└────────────────┬────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐      ┌────▼────┐
    │ Platform │      │  Tenant  │
    │  Roles   │      │  Roles   │
    └────┬────┘      └────┬────┘
         │                │
    ┌────┴────────┐   ┌───┴──────────┐
    │             │   │              │
┌───▼────┐  ┌────▼───┐ ┌──▼───────┐ ┌─▼──────┐
│ Super  │  │Support │ │ tenant  │ │ Loan  │
│ Admin  │  │ Staff  │ │ admin   │ │Officer│
└────────┘  └────────┘ └────┬───┘ └───────┘
                             │
                        ┌────▼─────┐
                        │  Cashier  │
                        └───────────┘
```

---

## Frontend Integration

### System Roles Component Structure
```typescript
class SystemRolesComponent {
  // Signals
  roles: signal<RoleConfig[]>         // Platform roles only
  selectedRole: signal<RoleConfig>
  activeTab: signal<'roles' | 'permissions'>
  
  // Protected roles (cannot delete)
  protectedRoles = ['Super Admin', 'Support Staff', 'Developer']
  
  // System permissions (4 total)
  systemPermissions = [
    { name: 'manage_tenants', ... },
    { name: 'view_audit_logs', ... },
    { name: 'manage_platform_settings', ... },
    { name: 'manage_users', ... }
  ]
  
  // Key methods
  loadSystemRoles()           // Filters scope === 'platform'
  createNewRole()
  editRole()
  deleteRole()
  togglePermission()
}
```

### Tenant Roles Component Structure
```typescript
class TenantRolesComponent {
  // Signals
  roles: signal<RoleConfig[]>         // Tenant roles only
  selectedRole: signal<RoleConfig>
  activeTab: signal<'roles' | 'permissions'>
  
  // Protected roles (cannot delete)
  protectedRoles = ['tenant-admin']
  
  // Tenant permissions (13 total)
  tenantPermissions = [
    { name: 'manage_users', ... },
    { name: 'manage_customers', ... },
    { name: 'manage_loans', ... },
    { name: 'approve_loans', ... },
    { name: 'view_loans', ... },
    { name: 'process_payments', ... },
    { name: 'view_payments', ... },
    { name: 'manage_loan_products', ... },
    { name: 'manage_bnpl_merchants', ... },
    { name: 'manage_bnpl_orders', ... },
    { name: 'view_bnpl_orders', ... },
    { name: 'view_reports', ... }
  ]
  
  // Key methods
  loadTenantRoles()           // Filters scope === 'tenant'
  createNewRole()
  editRole()
  deleteRole()
  togglePermission()
}
```

---

## Database Perspective

### Roles Table
```sql
SELECT * FROM roles;

id    | name            | scope      | description
------|-----------------|------------|----------------------------------
uuid1 | Super Admin     | platform   | Full platform access
uuid2 | Support Staff   | platform   | Support and customer service
uuid3 | Developer       | platform   | Development and technical support
uuid4 | tenant-admin    | tenant     | Full tenant access
uuid5 | Loan Officer    | tenant     | Manage loans and customers
uuid6 | Cashier         | tenant     | Process payments
```

### Role Permissions
```sql
SELECT * FROM role_permissions;

role_id | permission_id
--------|---------------
uuid1   | perm1         (manage_tenants)
uuid1   | perm2         (view_audit_logs)
uuid1   | perm3         (manage_platform_settings)
uuid1   | perm4         (manage_users)
uuid4   | perm4         (manage_users)
uuid4   | perm5         (manage_customers)
uuid4   | perm6         (view_customers)
uuid4   | perm7         (manage_loans)
...
```

---

## API Flow

```
┌─────────────────────────────┐
│   Frontend (4200)           │
├────────┬────────────────────┤
│ System │   Tenant           │
│ Roles  │   Roles            │
└────┬───┴────┬───────────────┘
     │        │
     │   API Interceptor
     │   (routes to :3000)
     │        │
     ▼        ▼
┌────────────────────────────┐
│  Backend Express (3000)    │
├────────┬───────────────────┤
│ GET /api/roles             │  Returns ALL roles
│ POST /api/roles            │  Create new role
│ PUT /api/roles/:id         │  Update role
│ DELETE /api/roles/:id      │  Delete role
│ GET /api/permissions       │  Get all permissions
│ POST /api/roles/:id/perms  │  Assign permissions
└────────────────────────────┘
     │        │
     └────┬───┘
          │
          ▼
┌────────────────────────────┐
│    PostgreSQL Database     │
├────────┬───────────────────┤
│ roles  │ role_permissions  │
│ perms  │ (junction table)  │
└────────────────────────────┘
```

**Note:** Backend returns all roles, frontend components filter by scope.

---

## Scope Filtering Logic

### SystemRolesComponent
```typescript
private loadSystemRoles(): void {
  this.rbacService.getAllRoles().subscribe(response => {
    // Filter to platform scope only
    const platformRoles = response.roles
      .filter(role => role.scope === 'platform')
      .map(role => ({
        id: role.id,
        name: role.name,
        scope: 'platform',
        description: role.description,
        permissions: role.permissions.map(p => p.name)
      }));
    
    this.roles.set(platformRoles);
  });
}
```

### TenantRolesComponent
```typescript
private loadTenantRoles(): void {
  this.rbacService.getAllRoles().subscribe(response => {
    // Filter to tenant scope only
    const tenantRoles = response.roles
      .filter(role => role.scope === 'tenant')
      .map(role => ({
        id: role.id,
        name: role.name,
        scope: 'tenant',
        description: role.description,
        permissions: role.permissions.map(p => p.name)
      }));
    
    this.roles.set(tenantRoles);
  });
}
```

---

## User Experience

### For Super Admin
1. Log in as Super Admin
2. Navigate to **Super Admin Settings**
3. Click **System Roles** (Purple section)
4. Manage platform-wide roles
5. Assign system permissions

### For Tenant Admin
1. Log in as Tenant Admin
2. Navigate to **Tenant Settings**
3. Click **Roles** (Green section)
4. Manage tenant-specific roles
5. Assign tenant permissions

---

## Configuration Summary

| Feature | System | Tenant |
|---------|--------|--------|
| **Show** | Platform roles | Tenant roles |
| **Hide** | Tenant roles | Platform roles |
| **Location** | Super Admin section | Tenant section |
| **Color** | Purple/indigo | Green/emerald |
| **Access** | Super Admin users | Tenant Admin users |
| **Permissions** | 4 system operations | 13 tenant operations |

---

**Version:** 1.0  
**Status:** Complete  
**Last Updated:** October 2025
