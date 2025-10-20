# RBAC System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONT-END ANGULAR                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RbacService                                              │  │
│  │  • Load roles & permissions                             │  │
│  │  • hasPermission(permission)                            │  │
│  │  • hasAnyPermission([permissions])                      │  │
│  │  • hasAllPermissions([permissions])                     │  │
│  │  • Role CRUD operations                                 │  │
│  │  • Permission matrix generation                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ▲                                       │
│                         │ HTTP Requests                         │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Components                                               │  │
│  │  • SuperAdminLayoutComponent                           │  │
│  │    - 8 collapsible menu sections                       │  │
│  │    - Dynamic menu rendering based on permissions       │  │
│  │  • PermissionMatrixComponent                           │  │
│  │    - Visual matrix: Roles vs Resources                 │  │
│  │    - CRUD operation indicators                         │  │
│  │    - Permission statistics                             │  │
│  │  • TenantLayoutComponent                               │  │
│  │    - 10 collapsible menu sections                      │  │
│  │    - Tenant-scoped navigation                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Route Guards (To be implemented)                         │  │
│  │  • PlatformGuard (platform scope only)                 │  │
│  │  • SuperAdminGuard (Super Admin only)                  │  │
│  │  • PermissionGuard (specific permission required)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  User Context:                                                 │
│  • currentUser$ (Observable)                                   │
│  • user.roleId, user.role_name, user.permissions[]           │
│  • user.scope ('platform' or 'tenant')                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
        │                                                   │
        │ API Calls                                         │
        │                                                   │
        ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACK-END NODE.JS/EXPRESS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Middleware Stack                                         │  │
│  │  1. auth.middleware          → Verify JWT token        │  │
│  │  2. tenant-isolation         → Extract tenant context  │  │
│  │  3. checkScope()             → Validate scope          │  │
│  │  4. checkPermission()        → Verify permission       │  │
│  │  5. Route Handler            → Execute controller      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RBAC Middleware (rbac.middleware.js)                    │  │
│  │                                                          │  │
│  │ checkPermission(requiredPerm):                          │  │
│  │   if user.scope == 'platform'                          │  │
│  │     → Grant all permissions ✓                          │  │
│  │   else                                                  │  │
│  │     Query: SELECT permissions                          │  │
│  │     FROM permissions p                                 │  │
│  │     JOIN role_permissions rp ON p.id = rp.perm_id     │  │
│  │     WHERE rp.role_id = user.role_id                   │  │
│  │     AND p.name = requiredPerm                          │  │
│  │                                                          │  │
│  │ checkScope(requiredScope):                             │  │
│  │   if user.scope != requiredScope                       │  │
│  │     → Deny with 403 Forbidden                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Controllers                                              │  │
│  │  • user.controller.js                                  │  │
│  │    - getAllUsers (platform scope)                      │  │
│  │    - createUser, updateUser, deleteUser                │  │
│  │    - getRoles (filtered by scope)                      │  │
│  │  • (Other domain controllers)                          │  │
│  │    - All protected by checkPermission()                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
        │                                                   │
        │ SQL Queries                                       │
        │                                                   │
        ▼                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL DATABASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ USERS Table                                              │  │
│  │  • id (PK)                                              │  │
│  │  • email                                                 │  │
│  │  • role_id (FK → roles)                                │  │
│  │  • tenant_id (FK → tenants) [NULL for platform users]  │  │
│  │  • password_hash                                         │  │
│  │  • is_active                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ROLES Table                                              │  │
│  │  • id (PK)                                              │  │
│  │  • name (UNIQUE)                                        │  │
│  │    - Platform: 'Super Admin', 'Support Staff', 'Dev'   │  │
│  │    - Tenant: 'tenant-admin', 'Loan Officer', 'Cashier' │  │
│  │  • scope: 'platform' | 'tenant'                        │  │
│  │  • description                                           │  │
│  │  • created_at, updated_at                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PERMISSIONS Table                                        │  │
│  │  • id (PK)                                              │  │
│  │  • name (UNIQUE) [manage_users, view_customers, etc]   │  │
│  │  • resource [users, customers, loans, payments, etc]   │  │
│  │  • action ['create', 'read', 'update', 'delete']       │  │
│  │  • description                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ROLE_PERMISSIONS Table (Junction)                       │  │
│  │  • role_id (FK → roles)                                │  │
│  │  • permission_id (FK → permissions)                     │  │
│  │  • Composite PK: (role_id, permission_id)              │  │
│  │                                                          │  │
│  │ Mapping Examples:                                        │  │
│  │  Super Admin Role           → ALL Permissions          │  │
│  │  Support Staff Role         → 5 permissions            │  │
│  │  Developer Role             → 5 permissions            │  │
│  │  Tenant Admin Role          → Tenant scope perms       │  │
│  │  Loan Officer Role          → Loan ops perms           │  │
│  │  Cashier Role               → Payment perms            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TENANTS Table                                            │  │
│  │  • id (PK)                                              │  │
│  │  • name                                                  │  │
│  │  • subscription_plan                                     │  │
│  │  • status ('active' | 'suspended')                      │  │
│  │  • created_at, updated_at                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


## Data Flow Example: User Login → Authorization

1. USER LOGIN (POST /api/auth/login)
   ├─ Email & Password received
   ├─ Query user from database
   ├─ Validate password hash
   ├─ If valid:
   │  ├─ Query user's role
   │  ├─ Query role's permissions
   │  ├─ Generate JWT with user + permissions
   │  └─ Return token
   └─ Token saved in localStorage (frontend)

2. SUBSEQUENT REQUEST (GET /api/tenants)
   ├─ Frontend sends: Authorization: Bearer <jwt>
   ├─ Backend auth.middleware:
   │  ├─ Verify JWT signature
   │  ├─ Extract user from token
   │  └─ Attach to req.user
   ├─ Backend checkScope('platform'):
   │  ├─ If req.user.scope != 'platform'
   │  └─ Return 403 Forbidden
   ├─ Backend checkPermission('manage_tenants'):
   │  ├─ If user.scope == 'platform' → Grant ✓
   │  ├─ Else query role_permissions table
   │  └─ If found → Grant ✓ else Deny ✗
   ├─ If authorized → Execute controller
   └─ Return response with data

3. COMPONENT USAGE (Frontend)
   ├─ currentUser$ has permissions array
   ├─ *ngIf="rbacService.hasPermission('manage_tenants', user.permissions)"
   ├─ Show/hide UI elements
   ├─ Enable/disable buttons
   └─ Render role-specific content


## Role Hierarchy & Inheritance

PLATFORM SCOPE:
  Super Admin
    ├─ All 14+ permissions
    ├─ Can manage: Tenants, Users, Settings, Audit Logs
    └─ Can access: All features

  Support Staff
    ├─ 5 specific permissions
    ├─ Can view: Customers, Loans, Payments, Audit Logs
    ├─ Can manage: Users (limited)
    └─ Cannot access: Financial, Settings

  Developer
    ├─ 5 technical permissions
    ├─ Can manage: Platform Settings, Users (technical)
    ├─ Can view: Audit Logs, Customers, Loans
    └─ Limited production access

TENANT SCOPE:
  Tenant Admin
    ├─ All tenant-level permissions
    ├─ Can manage: Customers, Loans, Staff, Payments
    └─ Cannot access: Platform settings, Other tenants

  Loan Officer
    ├─ Loan & Customer operations
    ├─ Can: Create/manage loans, View payments
    └─ Cannot: Manage staff, Delete operations

  Cashier
    ├─ Payment operations only
    ├─ Can: Process payments, View transactions
    └─ Cannot: Modify loans/customers, Manage anyone


## Security Boundaries

┌────────────────────────────────────────────────────────────────┐
│ PLATFORM BOUNDARY                                              │
│                                                                │
│  • Only Platform Scope users can access (scope check)         │
│  • Enforced in checkScope('platform') middleware              │
│  • Tenant_id must be NULL for these operations                │
│  • Super Admin grants all permissions                         │
│  • Support Staff & Developer have limited access              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TENANT BOUNDARY (Per Tenant)                                   │
│                                                                │
│  • Tenant users can only access their tenant data             │
│  • Enforced via WHERE tenant_id = req.tenantId                │
│  • Cannot see other tenants' data                              │
│  • Scope validation in tenant-isolation middleware            │
│  • Role permissions apply within tenant context                │
│                                                                │
└────────────────────────────────────────────────────────────────┘


## Seed Data Created

Platform Roles:
  ✓ Super Admin      (platform scope, all permissions)
  ✓ Support Staff    (platform scope, 5 specific permissions)
  ✓ Developer        (platform scope, 5 technical permissions)

Tenant Roles:
  ✓ tenant-admin     (tenant scope, all tenant permissions)
  ✓ Loan Officer     (tenant scope, loan operations)
  ✓ Cashier          (tenant scope, payment operations)

Permissions: 15+ total
  • Tenant management (2)
  • User management (2)
  • Audit & compliance (1)
  • Platform settings (1)
  • Customer management (2)
  • Loan management (3)
  • Payment management (2)
  • Loan products (1)
  • BNPL management (3)
  • Reports & analytics (1)

Default Accounts:
  • Super Admin: admin@exits-lms.com / admin123
  • Tenant Admin: admin@demo.com / demo123 (for Demo Company)
```

## API Route Protection Examples

```javascript
// Platform-only routes
router.get('/api/tenants', 
  checkScope('platform'), 
  checkPermission('manage_tenants'), 
  tenantController.getAllTenants);

router.post('/api/tenants', 
  checkScope('platform'), 
  checkPermission('manage_tenants'), 
  tenantController.createTenant);

// User management (platform scope)
router.get('/api/users', 
  checkScope('platform'), 
  checkPermission('manage_users'), 
  userController.getAllUsers);

// Audit logs (platform only)
router.get('/api/audit-logs', 
  checkScope('platform'), 
  checkPermission('view_audit_logs'), 
  auditController.getAuditLogs);

// Tenant-specific routes (auto-scoped)
router.get('/api/tenant/customers', 
  authMiddleware,
  checkScope('tenant'),
  checkPermission('view_customers'),
  customerController.getTenantCustomers);

// Only Super Admin
router.delete('/api/roles/:id',
  checkScope('platform'),
  checkPermission('manage_users'),
  // Additional check: Only Super Admin can delete roles
  roleController.deleteRole);
```

---

**This architecture ensures:**
- ✅ Strict scope separation (platform vs tenant)
- ✅ Permission-based access control
- ✅ Database-backed permission checks
- ✅ No client-side trust
- ✅ Audit trail capability
- ✅ Scalable to additional roles/permissions
- ✅ Multi-tenant data isolation
