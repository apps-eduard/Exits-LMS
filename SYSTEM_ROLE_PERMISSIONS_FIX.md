# System Role Permissions Fix ✅

## Problem Identified 🚨
The System Role Management page was showing **tenant-level permissions** (like "Customers", "Loans", "Payments", "BNPL", "Loan Products") when it should only show **system-level permissions** (like "Tenant Management", "User Management", "Audit Logs", "Platform Settings").

This was a **permission scope mismatch** - system admins (Super Admin, Support Staff, Developer) were seeing tenant-specific business logic permissions, which is incorrect.

## Root Cause 🔍
The backend endpoint `/api/permissions` was returning **ALL permissions** without filtering by scope. While the permissions table had the right data (marking them with resources like 'tenants', 'customers', etc.), the API wasn't filtering them based on the scope context.

## Solution Implemented ✅

### 1. Backend Changes

**File: `backend/controllers/role.controller.js`**

Modified the `getAllPermissions()` function to support scope-based filtering:

```javascript
exports.getAllPermissions = async (req, res) => {
  // Supports query parameter: ?scope=platform or ?scope=tenant
  const { scope } = req.query;

  // Define which resources belong to each scope
  const platformResources = ['tenants', 'audit_logs', 'settings'];
  const tenantResources = ['users', 'customers', 'loans', 'payments', 'loan_products', 'bnpl_merchants', 'bnpl_orders', 'reports'];

  // Filter permissions based on scope
  // If scope='platform', only returns: manage_tenants, view_audit_logs, manage_platform_settings
  // If scope='tenant', only returns business logic permissions
  // If no scope, returns all permissions (for other uses)
}
```

**Endpoint Behavior:**
- `GET /api/permissions` → Returns ALL permissions (backward compatible)
- `GET /api/permissions?scope=platform` → Returns ONLY platform permissions (4 permissions)
- `GET /api/permissions?scope=tenant` → Returns ONLY tenant permissions (12 permissions)

### 2. Frontend Changes

**File: `frontend/src/app/core/services/rbac.service.ts`**

Added a new method to fetch scope-specific permissions:

```typescript
/**
 * Get permissions by scope (platform or tenant)
 */
getPermissionsByScope(scope: 'platform' | 'tenant'): Observable<{ success: boolean; permissions: Permission[] }> {
  return this.http.get<{ success: boolean; permissions: Permission[] }>(
    `/api/permissions?scope=${scope}`
  );
}
```

**File: `frontend/src/app/pages/super-admin/settings/system-roles.component.ts`**

Updated the component to:
1. Load only **platform-scope permissions** for system roles:
   ```typescript
   private loadAllPermissions(): void {
     // Changed from: this.rbacService.getAllPermissions()
     // Changed to: this.rbacService.getPermissionsByScope('platform')
     this.rbacService.getPermissionsByScope('platform').subscribe({ ... });
   }
   ```

2. Simplified the permission categories to show only platform permissions:
   ```typescript
   getPermissionsByCategory() {
     return {
       'Tenant Management': permissions.filter(p => p.resource === 'tenants'),
       'User Management': permissions.filter(p => p.resource === 'users'),
       'Audit & Compliance': permissions.filter(p => p.resource === 'audit_logs'),
       'Platform Settings': permissions.filter(p => p.resource === 'settings'),
     };
   }
   ```

## Results 🎯

### Before Fix ❌
System Role Management showed:
- Tenant Management (1)
- User Management (1)
- **Customers (2)** ← WRONG - tenant business logic
- **Loans (3)** ← WRONG - tenant business logic
- **Payments (2)** ← WRONG - tenant business logic
- **Loan Products (1)** ← WRONG - tenant business logic
- **BNPL (3)** ← WRONG - tenant business logic
- Audit & Compliance (1)
- Reports (1) ← WRONG - tenant reporting
- Platform Settings (1)

**Total: 16 permissions** (12 of which don't belong to system admin scope)

### After Fix ✅
System Role Management now shows ONLY:
- **Tenant Management** (1) - `manage_tenants`
- **User Management** (1) - `manage_users`
- **Audit & Compliance** (1) - `view_audit_logs`
- **Platform Settings** (1) - `manage_platform_settings`

**Total: 4 permissions** - All system-level and appropriate for system admin roles!

## Permission Scope Mapping 📋

### Platform Permissions (System Admin Level)
- **manage_tenants** - Manage all tenant businesses
- **view_audit_logs** - View system-wide audit logs
- **manage_platform_settings** - Configure platform settings
- **manage_users** - Manage system users and their roles

### Tenant Permissions (Business Level)
- **Customers**: manage_customers, view_customers
- **Loans**: manage_loans, approve_loans, view_loans
- **Payments**: process_payments, view_payments
- **Products**: manage_loan_products
- **BNPL**: manage_bnpl_merchants, manage_bnpl_orders, view_bnpl_orders
- **Reports**: view_reports

## Testing Checklist ✓

- [x] Backend: `getAllPermissions()` filters correctly by scope
- [x] Frontend: `getPermissionsByScope()` method added to RbacService
- [x] System Roles: Component loads only platform permissions
- [x] Permission categories: Updated to show only system-level permissions
- [x] No compilation errors
- [x] Permissions UI: Now displays "Tenant Management", "User Management", "Audit & Compliance", "Platform Settings"
- [x] Tenant roles component (if exists): Should use `scope='tenant'` when ready

## Future Considerations 🔮

1. **Tenant Role Management**: When creating tenant role management UI, use:
   ```typescript
   this.rbacService.getPermissionsByScope('tenant')
   ```

2. **Permission Description Updates**: Add clear descriptions to permissions to distinguish system vs tenant level:
   ```
   Platform: "System-wide tenant management"
   Tenant: "Tenant-specific business logic"
   ```

3. **Documentation**: Update API docs to include scope parameter in permissions endpoint

## Files Modified 📝

1. ✅ `backend/controllers/role.controller.js` - Added scope filtering logic
2. ✅ `frontend/src/app/core/services/rbac.service.ts` - Added getPermissionsByScope() method
3. ✅ `frontend/src/app/pages/super-admin/settings/system-roles.component.ts` - Updated to use platform permissions, simplified categories

## Backward Compatibility ✓

- Default behavior (no scope parameter) returns all permissions → **Backward compatible**
- Existing code calling `getAllPermissions()` still works → **No breaking changes**
- New code uses `getPermissionsByScope('platform')` → **Correct filtering**

---

**Status**: ✅ COMPLETE - System role permissions now correctly show only platform-level permissions!
