# System vs Tenant Permissions - Visual Guide

## Permission Hierarchy 🏗️

```
┌─────────────────────────────────────────────────────────────┐
│                    ALL PERMISSIONS (16)                    │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│  PLATFORM SCOPE (4)     │      TENANT SCOPE (12)            │
│  System Admin Level     │      Business Logic Level         │
│                         │                                   │
│ ┌─────────────────────┐ │ ┌──────────────────────────────┐  │
│ │ Tenant Management   │ │ │ Customers (2)                │  │
│ │ • manage_tenants    │ │ │ • manage_customers           │  │
│ └─────────────────────┘ │ │ • view_customers             │  │
│                         │ └──────────────────────────────┘  │
│ ┌─────────────────────┐ │ ┌──────────────────────────────┐  │
│ │ User Management     │ │ │ Loans (3)                    │  │
│ │ • manage_users      │ │ │ • manage_loans               │  │
│ └─────────────────────┘ │ │ • approve_loans              │  │
│                         │ │ • view_loans                 │  │
│ ┌─────────────────────┐ │ └──────────────────────────────┘  │
│ │ Audit & Compliance  │ │ ┌──────────────────────────────┐  │
│ │ • view_audit_logs   │ │ │ Payments (2)                 │  │
│ └─────────────────────┘ │ │ • process_payments           │  │
│                         │ │ • view_payments              │  │
│ ┌─────────────────────┐ │ └──────────────────────────────┘  │
│ │ Platform Settings   │ │ ┌──────────────────────────────┐  │
│ │ • manage_platform_  │ │ │ Loan Products (1)            │  │
│ │   settings          │ │ │ • manage_loan_products       │  │
│ └─────────────────────┘ │ └──────────────────────────────┘  │
│                         │ ┌──────────────────────────────┐  │
│                         │ │ BNPL (3)                     │  │
│                         │ │ • manage_bnpl_merchants      │  │
│                         │ │ • manage_bnpl_orders         │  │
│                         │ │ • view_bnpl_orders           │  │
│                         │ └──────────────────────────────┘  │
│                         │ ┌──────────────────────────────┐  │
│                         │ │ Reports (1)                  │  │
│                         │ │ • view_reports               │  │
│                         │ └──────────────────────────────┘  │
└─────────────────────────┴───────────────────────────────────┘
```

## API Response Structure

### Request: `GET /api/permissions?scope=platform`

```json
{
  "success": true,
  "permissions": [
    {
      "id": "perm-001",
      "name": "manage_tenants",
      "resource": "tenants",
      "action": "manage",
      "description": "Manage all tenants"
    },
    {
      "id": "perm-002",
      "name": "manage_users",
      "resource": "users",
      "action": "manage",
      "description": "Manage tenant users"
    },
    {
      "id": "perm-003",
      "name": "view_audit_logs",
      "resource": "audit_logs",
      "action": "view",
      "description": "View all audit logs"
    },
    {
      "id": "perm-004",
      "name": "manage_platform_settings",
      "resource": "settings",
      "action": "manage",
      "description": "Manage platform settings"
    }
  ]
}
```

**Total: 4 permissions (Platform scope only)**

---

### Request: `GET /api/permissions?scope=tenant`

```json
{
  "success": true,
  "permissions": [
    // Customers (2)
    {
      "id": "perm-005",
      "name": "manage_customers",
      "resource": "customers",
      "action": "manage",
      "description": "Manage customers"
    },
    {
      "id": "perm-006",
      "name": "view_customers",
      "resource": "customers",
      "action": "view",
      "description": "View customers"
    },
    // ... 10 more tenant permissions
  ]
}
```

**Total: 12 permissions (Tenant scope only)**

---

### Request: `GET /api/permissions` (No scope)

Returns **all 16 permissions** (backward compatible)

## Role Assignments

### System Roles (Platform Scope)

```
┌────────────────────────────────────────────────┐
│ SUPER ADMIN                                    │
├────────────────────────────────────────────────┤
│ ✓ manage_tenants                               │
│ ✓ manage_users                                 │
│ ✓ view_audit_logs                              │
│ ✓ manage_platform_settings                     │
│ → Can manage all tenants and system settings   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ SUPPORT STAFF                                  │
├────────────────────────────────────────────────┤
│ ✓ view_audit_logs                              │
│ ✓ manage_users (limited)                       │
│ ✓ view_customers                               │
│ ✓ view_loans                                   │
│ ✓ view_payments                                │
│ → Can support and monitor system               │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ DEVELOPER                                      │
├────────────────────────────────────────────────┤
│ ✓ view_audit_logs                              │
│ ✓ manage_platform_settings                     │
│ ✓ manage_users (technical)                     │
│ ✓ view_customers                               │
│ ✓ view_loans                                   │
│ → Can manage technical aspects                 │
└────────────────────────────────────────────────┘
```

### Tenant Roles (Business Scope) - Future

```
┌────────────────────────────────────────────────┐
│ TENANT ADMIN                                   │
├────────────────────────────────────────────────┤
│ ✓ manage_customers                             │
│ ✓ manage_loans                                 │
│ ✓ manage_loan_products                         │
│ ✓ process_payments                             │
│ ✓ manage_bnpl_merchants                        │
│ ✓ manage_bnpl_orders                           │
│ ✓ view_reports                                 │
│ → Full tenant business management              │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ LOAN OFFICER                                   │
├────────────────────────────────────────────────┤
│ ✓ manage_customers                             │
│ ✓ manage_loans                                 │
│ ✓ approve_loans                                │
│ ✓ view_payments                                │
│ ✓ manage_bnpl_orders                           │
│ ✓ view_reports                                 │
│ → Loan management and approval                 │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ CASHIER                                        │
├────────────────────────────────────────────────┤
│ ✓ view_customers                               │
│ ✓ view_loans                                   │
│ ✓ process_payments                             │
│ ✓ view_payments                                │
│ ✓ view_bnpl_orders                             │
│ → Payment processing only                      │
└────────────────────────────────────────────────┘
```

## Data Flow 🔄

### Before Fix (WRONG)
```
System Admin UI
       ↓
Load All Permissions
       ↓
GET /api/permissions (returns 16)
       ↓
Show 4 system + 12 TENANT permissions ❌
       ↓
User confused - sees Customers, Loans, Payments
```

### After Fix (CORRECT)
```
System Admin UI
       ↓
Load Platform Permissions
       ↓
GET /api/permissions?scope=platform (returns 4)
       ↓
Show ONLY 4 system permissions ✅
       ↓
User sees: Tenant Mgmt, User Mgmt, Audit, Settings
       ↓
Clean separation of concerns!
```

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **Permissions Shown** | 16 (4 system + 12 tenant) | 4 (system only) |
| **Tenant Business Perms** | ❌ Visible to system admin | ✅ Hidden from system admin |
| **Separation of Concerns** | ❌ Poor | ✅ Excellent |
| **Backend Filtering** | ❌ None | ✅ Scope-based |
| **Frontend Loading** | `getAllPermissions()` | `getPermissionsByScope('platform')` |
| **API Endpoint** | `/api/permissions` | `/api/permissions?scope=platform` |

---

**Result: System Admin now sees ONLY system-level permissions! 🎉**
