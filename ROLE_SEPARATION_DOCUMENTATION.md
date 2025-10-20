# Role Management - Separation by Scope

## Overview

Role management has been split into **two separate components** based on scope:

1. **System Role Management** - Platform/System-wide roles
2. **Tenant Role Management** - Tenant-specific roles

This separation ensures clear boundaries between system administration and tenant operations.

---

## System Role Management

**Location:** `/super-admin/settings/system-roles`  
**Component:** `SystemRolesComponent`  
**Scope:** Platform (`scope: 'platform'`)

### System Roles (Protected)
- **Super Admin** - Full platform access with all permissions
- **Support Staff** - View audit logs, manage users, view customers/loans/payments
- **Developer** - Technical support with platform settings and audit access

### System Permissions
- `manage_tenants` - Manage all tenants in the platform
- `view_audit_logs` - View all audit logs across the platform
- `manage_platform_settings` - Manage platform configuration
- `manage_users` - Manage system-level users

### Features
- ✅ Create/Edit/Delete system roles (except protected roles)
- ✅ Assign permissions to system roles
- ✅ Protected roles cannot be deleted (Super Admin, Support Staff, Developer)
- ✅ Only accessible by super admins
- ✅ Purple theme for system-level distinction

---

## Tenant Role Management

**Location:** `/tenant/settings/roles`  
**Component:** `TenantRolesComponent`  
**Scope:** Tenant (`scope: 'tenant'`)

### Tenant Roles (Protected)
- **tenant-admin** - Full tenant access (manage customers, loans, users)
- **Loan Officer** - Manage loans, customers, and BNPL operations
- **Cashier** - Process payments and view transactions

### Tenant Permissions (13 total)

**User Management:**
- `manage_users` - Manage tenant users

**Customer Management:**
- `manage_customers` - Manage customers
- `view_customers` - View customers

**Loan Management:**
- `manage_loans` - Manage loans
- `approve_loans` - Approve loans
- `view_loans` - View loans
- `manage_loan_products` - Manage loan products

**Payment Management:**
- `process_payments` - Process payments
- `view_payments` - View payments

**BNPL Management:**
- `manage_bnpl_merchants` - Manage BNPL merchants
- `manage_bnpl_orders` - Manage BNPL orders
- `view_bnpl_orders` - View BNPL orders

**Reports:**
- `view_reports` - View reports

### Features
- ✅ Create/Edit/Delete tenant roles (except protected roles)
- ✅ Assign permissions to tenant roles
- ✅ Protected roles cannot be deleted (tenant-admin)
- ✅ Only accessible by tenant admins
- ✅ Green theme for tenant-level distinction

---

## Backend Integration

### Role Filtering by Scope

Both components filter roles by scope when loading:

**System Roles:**
```typescript
const platformRoles = response.roles
  .filter((role: any) => role.scope === 'platform')
```

**Tenant Roles:**
```typescript
const tenantRoles = response.roles
  .filter((role: any) => role.scope === 'tenant')
```

### API Endpoints Used
- `GET /api/roles` - Get all roles (both scopes returned)
- `GET /api/roles/:id` - Get single role details
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/:id/permissions` - Assign permissions
- `GET /api/permissions` - Get all available permissions

---

## Database Schema

**roles table:**
```sql
- id (UUID) - Primary key
- name (VARCHAR) - Role name
- scope (VARCHAR) - 'platform' or 'tenant'
- description (TEXT) - Role description
- created_at (TIMESTAMP) - Creation timestamp
```

**role_permissions table:**
```sql
- role_id (UUID FK) - References roles(id)
- permission_id (UUID FK) - References permissions(id)
```

**permissions table:**
```sql
- id (UUID) - Primary key
- name (VARCHAR UNIQUE) - Permission name
- resource (VARCHAR) - Resource type
- action (VARCHAR) - Action type
- description (TEXT) - Permission description
- created_at (TIMESTAMP)
```

---

## Seed Data

Both component types are seeded during database initialization:

**Platform Roles (System):**
```javascript
- Super Admin (platform scope)
- Support Staff (platform scope)
- Developer (platform scope)
```

**Tenant Roles:**
```javascript
- tenant-admin (tenant scope)
- Loan Officer (tenant scope)
- Cashier (tenant scope)
```

All roles are created with `ON CONFLICT DO NOTHING` to prevent duplicates.

---

## Visual Distinction

| Aspect | System | Tenant |
|--------|--------|--------|
| **Color Theme** | Purple | Green |
| **Location** | /super-admin/settings/system-roles | /tenant/settings/roles |
| **Scope Badge** | 🌐 Platform | 🏢 Tenant |
| **Create Button** | Create System Role | Create Tenant Role |
| **Protected Roles** | Super Admin, Support Staff, Developer | tenant-admin |

---

## Access Control

- **System roles** managed only by Super Admin users
- **Tenant roles** managed only by Tenant Admin users within their organization
- Backend RBAC middleware enforces permission checks on all operations
- Protected roles cannot be deleted by any user

---

## File Structure

### System Roles Component
```
frontend/src/app/pages/super-admin/settings/
├── system-roles.component.ts
├── system-roles.component.html
└── system-roles.component.scss
```

### Tenant Roles Component
```
frontend/src/app/pages/tenant/settings/
├── tenant-roles.component.ts
├── tenant-roles.component.html
└── tenant-roles.component.scss
```

---

## Migration Notes

If migrating from the unified role management component:

1. **System roles** moved to `/super-admin/settings/system-roles`
2. **Tenant roles** moved to `/tenant/settings/roles`
3. Role filtering by scope now happens client-side in each component
4. Backend API remains unchanged (returns all roles, scoped filtering is client responsibility)
5. Database schema unchanged (roles table already has `scope` column)

---

## Future Enhancements

- [ ] Role import/export functionality
- [ ] Permission dependency mapping
- [ ] Role cloning from existing roles
- [ ] Audit logs for role changes
- [ ] Bulk role operations
- [ ] Role permission templates
