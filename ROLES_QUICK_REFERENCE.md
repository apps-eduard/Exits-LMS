# Role Management - Visual Reference Card

## Quick Navigation

```
Application
│
├─ SUPER ADMIN SECTION (Purple 🟣)
│  │
│  └─ Settings
│     └─ System Roles (/super-admin/settings/system-roles)
│        └─ SystemRolesComponent
│           ├─ Super Admin
│           ├─ Support Staff
│           └─ Developer
│
└─ TENANT SECTION (Green 🟢)
   │
   └─ Settings
      └─ Tenant Roles (/tenant/settings/roles)
         └─ TenantRolesComponent
            ├─ tenant-admin
            ├─ Loan Officer
            └─ Cashier
```

---

## Component at a Glance

### System Roles (Purple 🟣)
```
┌─────────────────────────────────────────────┐
│   System Role Management                    │
│   (/super-admin/settings/system-roles)      │
├─────────────────────────────────────────────┤
│                                             │
│  Tabs:                                      │
│  👥 System Roles (3)  │  ⚙️ Permissions    │
│                                             │
│  Platform Roles:                            │
│  • Super Admin (🔒 Protected)              │
│  • Support Staff (🔒 Protected)            │
│  • Developer (🔒 Protected)                │
│                                             │
│  System Permissions (4):                    │
│  ☑ manage_tenants                          │
│  ☑ view_audit_logs                         │
│  ☑ manage_platform_settings                │
│  ☑ manage_users                            │
│                                             │
│  [➕ Create System Role]                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Tenant Roles (Green 🟢)
```
┌─────────────────────────────────────────────┐
│   Tenant Role Management                    │
│   (/tenant/settings/roles)                  │
├─────────────────────────────────────────────┤
│                                             │
│  Tabs:                                      │
│  👥 Tenant Roles (3)  │  ⚙️ Permissions    │
│                                             │
│  Tenant Roles:                              │
│  • tenant-admin (🔒 Protected)             │
│  • Loan Officer                             │
│  • Cashier                                  │
│                                             │
│  Tenant Permissions (13):                   │
│  ☑ User Management (1)                     │
│  ☑ Customer Management (2)                 │
│  ☑ Loan Management (4)                     │
│  ☑ Payment Management (2)                  │
│  ☑ BNPL Management (3)                     │
│  ☑ Reports (1)                             │
│                                             │
│  [➕ Create Tenant Role]                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Feature Comparison Matrix

```
╔═══════════════════════════════════════════════════════╗
║                   FEATURE                    SYS  TEN ║
╠═══════════════════════════════════════════════════════╣
║ Route                                        🟣   🟢  ║
║ Access Path          /super-admin/settings   SYS  TEN ║
║ Component Name       SystemRoles             ✓    -   ║
║                      TenantRoles             -    ✓   ║
║ Scope Filtering      platform                ✓    -   ║
║                      tenant                  -    ✓   ║
║ Protected Roles      3                       ✓    1   ║
║ Custom Roles         Unlimited               ✓    ✓   ║
║ Total Permissions    4                       ✓    13  ║
║ Permission Groups    1                       ✓    6   ║
║ User Type            Super Admin             ✓    -   ║
║                      Tenant Admin            -    ✓   ║
║ Color Theme          Purple                  🟣   -   ║
║                      Green                   -    🟢  ║
║ Main Focus           Platform Mgmt           ✓    -   ║
║                      Operations              -    ✓   ║
║ Create Button        Create System Role      ✓    -   ║
║                      Create Tenant Role      -    ✓   ║
╚═══════════════════════════════════════════════════════╝
```

---

## Role Hierarchy Tree

```
┌─────────────────────────────────────────┐
│         ALL SYSTEM USERS                │
│     (Platform + Tenants)                │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐            ┌──▼────┐
    │PLATFORM │            │TENANT │
    │ ROLES   │            │ROLES  │
    │(Purple) │            │(Green)│
    └───┬────┘            └──┬────┘
        │                    │
    ┌───┴────────┐           │
    │            │           │
  ┌─▼──────┐  ┌─▼────┐  ┌───▼──────┐
  │ Super  │  │Support│  │tenant   │
  │ Admin  │  │Staff  │  │admin    │
  │(🔒)    │  │(🔒)   │  │(🔒)     │
  └────────┘  └───────┘  └────┬────┘
                               │
                        ┌──────┴──────┐
                        │             │
                    ┌───▼───┐    ┌───▼──┐
                    │ Loan  │    │Cashier│
                    │Officer│    │       │
                    └───────┘    └───────┘
```

---

## Permission Scope Breakdown

### System (4 permissions)
```
┌──────────────────────────────────┐
│ Tenant Management (1)            │
│ └─ manage_tenants               │
├──────────────────────────────────┤
│ User Management (1)              │
│ └─ manage_users                 │
├──────────────────────────────────┤
│ Audit & Compliance (1)           │
│ └─ view_audit_logs              │
├──────────────────────────────────┤
│ Platform Settings (1)            │
│ └─ manage_platform_settings     │
└──────────────────────────────────┘
```

### Tenant (13 permissions)
```
┌──────────────────────────────────┐
│ User Management (1)              │
│ └─ manage_users                 │
├──────────────────────────────────┤
│ Customer Management (2)          │
│ ├─ manage_customers             │
│ └─ view_customers               │
├──────────────────────────────────┤
│ Loan Management (4)              │
│ ├─ manage_loans                 │
│ ├─ approve_loans                │
│ ├─ view_loans                   │
│ └─ manage_loan_products         │
├──────────────────────────────────┤
│ Payment Management (2)           │
│ ├─ process_payments             │
│ └─ view_payments                │
├──────────────────────────────────┤
│ BNPL Management (3)              │
│ ├─ manage_bnpl_merchants        │
│ ├─ manage_bnpl_orders           │
│ └─ view_bnpl_orders             │
├──────────────────────────────────┤
│ Reports (1)                      │
│ └─ view_reports                 │
└──────────────────────────────────┘
```

---

## User Journey

### Super Admin Journey
```
1. Login as Super Admin
   ↓
2. Navigate to Super Admin Dashboard
   ↓
3. Go to Settings
   ↓
4. Click "System Roles" (Purple 🟣)
   ↓
5. Manage Platform Roles:
   • View Super Admin, Support Staff, Developer
   • Edit existing roles
   • Create new system roles
   • Assign system permissions
```

### Tenant Admin Journey
```
1. Login as Tenant Admin
   ↓
2. Navigate to Tenant Dashboard
   ↓
3. Go to Settings
   ↓
4. Click "Tenant Roles" (Green 🟢)
   ↓
5. Manage Tenant Roles:
   • View tenant-admin, Loan Officer, Cashier
   • Edit existing roles
   • Create new tenant roles
   • Assign tenant permissions
```

---

## API Flow

```
Frontend Request (Port 4200)
│
├─ api.interceptor.ts
│  └─ Detects: /api/* request
│     └─ Routes: localhost:4200 → localhost:3000
│
Backend API (Port 3000)
│
├─ GET /api/roles
│  ├─ Returns: All roles (platform + tenant)
│  └─ Frontend filters by scope:
│     ├─ SystemRoles → filters scope='platform'
│     └─ TenantRoles → filters scope='tenant'
│
├─ POST /api/roles
│  └─ Create new role with scope
│
├─ PUT /api/roles/:id
│  └─ Update role (including permissions)
│
├─ DELETE /api/roles/:id
│  └─ Delete role (protected roles rejected)
│
├─ GET /api/permissions
│  └─ Returns: All available permissions
│
└─ POST /api/roles/:id/permissions
   └─ Bulk assign permissions to role

Database (PostgreSQL)
└─ roles, role_permissions, permissions tables
```

---

## File Structure

```
frontend/src/app/pages/
│
├─ super-admin/settings/
│  ├─ role-management.component.* (old, can be removed)
│  └─ system-roles.component.*    (NEW ✨)
│     ├─ system-roles.component.ts (196 lines)
│     ├─ system-roles.component.html (165 lines)
│     └─ system-roles.component.scss (6 lines)
│
└─ tenant/settings/
   └─ tenant-roles.component.*     (NEW ✨)
      ├─ tenant-roles.component.ts (238 lines)
      ├─ tenant-roles.component.html (222 lines)
      └─ tenant-roles.component.scss (6 lines)

Documentation/
├─ ROLE_SEPARATION_DOCUMENTATION.md (comprehensive)
├─ ROLE_SEPARATION_COMPLETE.md (quick ref)
├─ SYSTEM_VS_TENANT_ROLES.md (comparison)
├─ ROLE_SEPARATION_FINAL_SUMMARY.md (overview)
└─ ROLES_QUICK_REFERENCE.md (this file)
```

---

## Key Takeaways

✅ **Separated by Scope** - Platform vs Tenant clearly distinguished  
✅ **Color Coded** - Purple for system, Green for tenant  
✅ **Access Control** - Each accessible only to appropriate users  
✅ **Protected Roles** - Cannot be deleted  
✅ **Full CRUD** - Create, Read, Update, Delete operations  
✅ **Permission Management** - Assign/revoke per role  
✅ **Backend Compatible** - API unchanged, backward compatible  
✅ **Database Unchanged** - No schema modifications needed  

---

## Status

```
✅ Components Created
✅ Templates Designed
✅ Styling Applied
✅ Logic Implemented
✅ Documentation Complete
✅ No Compilation Errors
✅ Ready for Integration

Status: PRODUCTION READY 🚀
```

---

**Last Updated:** October 20, 2025  
**Version:** 1.0  
**Status:** Complete ✅
