# Role Filtering Troubleshooting Guide

## Issue: System Roles Component Shows Tenant Roles (or vice versa)

This guide helps debug why role filtering isn't working properly.

---

## Quick Diagnosis

### Step 1: Check the Browser Console

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Open System Roles component** (`/super-admin/settings/system-roles`)
4. **Look for these logs:**

```
[SystemRolesComponent] All roles from API: [...]
[SystemRolesComponent] Role: Super Admin, Scope: platform, IsPlatform: true
[SystemRolesComponent] Role: tenant-admin, Scope: tenant, IsPlatform: false
[SystemRolesComponent] Filtered platform roles: [...]
```

5. **Open Tenant Roles component** (`/tenant/settings/roles`)
6. **Look for these logs:**

```
[TenantRolesComponent] All roles from API: [...]
[TenantRolesComponent] Role: Super Admin, Scope: platform, IsTenant: false
[TenantRolesComponent] Role: tenant-admin, Scope: tenant, IsTenant: true
[TenantRolesComponent] Filtered tenant roles: [...]
```

---

## Common Issues & Solutions

### Issue 1: API Response Missing `scope` Field

**Symptom:** All roles show (no filtering)

**Debug:** In console, check if roles have the `scope` property:
```javascript
// In console, run:
console.log(response.roles[0]);
// Should show: { id, name, scope: 'platform' or 'tenant', ... }
```

**Solution:** Check backend role.controller.js - must include `scope` in SELECT:
```sql
SELECT r.id, r.name, r.scope, r.description, ...
```

**Verify:**
```bash
# Backend - check database directly
psql -U postgres -d exits_lms -c "SELECT id, name, scope FROM roles;"
```

**Expected Output:**
```
                  id                  |       name       |  scope   
--------------------------------------+------------------+----------
 uuid-1                               | Super Admin      | platform
 uuid-2                               | Support Staff    | platform
 uuid-3                               | Developer        | platform
 uuid-4                               | tenant-admin     | tenant
 uuid-5                               | Loan Officer     | tenant
 uuid-6                               | Cashier          | tenant
```

---

### Issue 2: Routes Not Properly Registered

**Symptom:** "Component not found" error or both components show at same path

**Solution:** Check your routing modules:

**For Super Admin:**
```typescript
// super-admin.routes.ts or app.routes.ts
{
  path: 'super-admin',
  component: SuperAdminComponent,
  children: [
    {
      path: 'settings',
      children: [
        {
          path: 'system-roles',
          component: SystemRolesComponent  // ✓ MUST be path: 'system-roles'
        }
      ]
    }
  ]
}
```

**For Tenant:**
```typescript
// tenant.routes.ts or app.routes.ts
{
  path: 'tenant',
  component: TenantComponent,
  children: [
    {
      path: 'settings',
      children: [
        {
          path: 'roles',
          component: TenantRolesComponent  // ✓ MUST be path: 'roles'
        }
      ]
    }
  ]
}
```

**Verify Routes:**
```typescript
// In any component, inject Router and run:
constructor(private router: Router) {
  console.log(this.router.config); // Shows all routes
}
```

---

### Issue 3: Both Components Imported at Same Path

**Symptom:** Can't navigate to one component

**Solution:** Check app.routes.ts or routing module - ensure:
- ✓ SystemRolesComponent is ONLY at `/super-admin/settings/system-roles`
- ✓ TenantRolesComponent is ONLY at `/tenant/settings/roles`

**Find duplicates:**
```bash
# Search for route definitions
grep -r "system-roles\|tenant.*roles" src/app/**/*.ts
```

---

### Issue 4: Wrong Component Shown at Wrong Path

**Symptom:** System roles page shows tenant roles

**Debug Steps:**

1. **Check which component is loaded:**
```typescript
// In network tab of DevTools
// Check URL and view source - look for component name
```

2. **Check component selector:**
```typescript
// Open component file and verify:
@Component({
  selector: 'app-system-roles',  // ✓ System component
  // OR
  selector: 'app-tenant-roles',  // ✓ Tenant component
})
```

3. **Verify template files:**
```bash
# Check file content
cat frontend/src/app/pages/super-admin/settings/system-roles.component.html | head -5
# Should show: "System Role Management"

cat frontend/src/app/pages/tenant/settings/tenant-roles.component.html | head -5
# Should show: "Tenant Role Management"
```

---

### Issue 5: Filtering Logic Broken

**Debug the filter:**

1. **Add breakpoint** in browser DevTools at system-roles.component.ts line ~68:
```typescript
.filter((role: any) => {
  const isPlatform = role.scope === 'platform';
  // ← Breakpoint here
  return isPlatform;
})
```

2. **Check values:**
   - `role.scope` should be 'platform' or 'tenant'
   - `isPlatform` should be `true` for platform roles, `false` for tenant roles

3. **Common mistake:** Typo in scope value:
```typescript
// ❌ WRONG - Looking for 'PLATFORM' (uppercase)
.filter((role: any) => role.scope === 'PLATFORM')

// ✓ RIGHT - Looking for 'platform' (lowercase)
.filter((role: any) => role.scope === 'platform')
```

---

## Complete Verification Checklist

### Backend Check
- [ ] Database has roles with `scope` column (platform or tenant)
- [ ] API endpoint `/api/roles` returns roles with `scope` field
- [ ] Test with curl/Postman:
```bash
curl http://localhost:3000/api/roles
```
Should return:
```json
{
  "success": true,
  "roles": [
    { "id": "...", "name": "Super Admin", "scope": "platform", ... },
    { "id": "...", "name": "tenant-admin", "scope": "tenant", ... }
  ]
}
```

### Frontend Check
- [ ] Both components are created and compile without errors
- [ ] Both components have debugging console.logs
- [ ] Routes are registered correctly (verify with `router.config`)
- [ ] Navigate to each route and check console output
- [ ] SystemRolesComponent shows only platform roles
- [ ] TenantRolesComponent shows only tenant roles

### API Interceptor Check
- [ ] `api.interceptor.ts` exists and is registered in `app.config.ts`
- [ ] Verify interceptor is routing requests to correct backend port
- [ ] Check Network tab: API calls should go to `http://localhost:3000/api/roles`

---

## Testing Script

Run this in browser console to verify everything:

```javascript
// Test 1: Check if components are loaded
console.log('SystemRolesComponent exists:', !!window['SystemRolesComponent']);
console.log('TenantRolesComponent exists:', !!window['TenantRolesComponent']);

// Test 2: Check routes
console.log('Current route:', window.location.pathname);

// Test 3: Check if filtering works
const testRoles = [
  { name: 'Super Admin', scope: 'platform' },
  { name: 'tenant-admin', scope: 'tenant' },
  { name: 'Cashier', scope: 'tenant' }
];

const platformFiltered = testRoles.filter(r => r.scope === 'platform');
const tenantFiltered = testRoles.filter(r => r.scope === 'tenant');

console.log('Platform roles filter test:', platformFiltered.length === 1 ? '✓' : '✗');
console.log('Tenant roles filter test:', tenantFiltered.length === 2 ? '✓' : '✗');
```

---

## Real-World Troubleshooting Session

### Scenario: Seeing tenant roles in system component

**Step 1:** Open browser DevTools console
```
[SystemRolesComponent] All roles from API: Array(6)
  0: {id, name: "Super Admin", scope: "platform", ...}
  1: {id, name: "Support Staff", scope: "platform", ...}
  2: {id, name: "Developer", scope: "platform", ...}
  3: {id, name: "tenant-admin", scope: "tenant", ...}
  4: {id, name: "Loan Officer", scope: "tenant", ...}
  5: {id, name: "Cashier", scope: "tenant", ...}
```

**Observation:** All 6 roles are present (good!)

**Step 2:** Check next log
```
[SystemRolesComponent] Role: Super Admin, Scope: platform, IsPlatform: true
[SystemRolesComponent] Role: Support Staff, Scope: platform, IsPlatform: true
[SystemRolesComponent] Role: Developer, Scope: platform, IsPlatform: true
[SystemRolesComponent] Role: tenant-admin, Scope: tenant, IsPlatform: false  ← Filtered out ✓
[SystemRolesComponent] Role: Loan Officer, Scope: tenant, IsPlatform: false  ← Filtered out ✓
[SystemRolesComponent] Role: Cashier, Scope: tenant, IsPlatform: false       ← Filtered out ✓
```

**Observation:** Filtering is working correctly! All 3 platform roles kept, all 3 tenant roles filtered out

**Step 3:** Check final log
```
[SystemRolesComponent] Filtered platform roles: Array(3)
  0: {id, name: "Super Admin", scope: "platform", ...}
  1: {id, name: "Support Staff", scope: "platform", ...}
  2: {id, name: "Developer", scope: "platform", ...}
```

**Result:** ✓ System component is correctly showing only platform roles!

---

## Still Having Issues?

### Create a Minimal Test

Create a test component to isolate the issue:

```typescript
// test-role-filter.component.ts
import { Component, OnInit } from '@angular/core';
import { RbacService } from '../../../core/services/rbac.service';

@Component({
  selector: 'app-test-role-filter',
  template: `
    <pre>{{ debug | json }}</pre>
  `,
  standalone: true
})
export class TestRoleFilterComponent implements OnInit {
  debug: any = {};

  constructor(private rbacService: RbacService) {}

  ngOnInit() {
    this.rbacService.getAllRoles().subscribe(response => {
      this.debug.allRoles = response.roles;
      this.debug.platformRoles = response.roles.filter((r: any) => r.scope === 'platform');
      this.debug.tenantRoles = response.roles.filter((r: any) => r.scope === 'tenant');
    });
  }
}
```

Navigate to this component and verify the filtering works at the simplest level.

---

## Contact Points to Check

1. **Backend:**
   - `backend/controllers/role.controller.js` - getAllRoles() method
   - `backend/routes/role.routes.js` - GET /api/roles endpoint
   - `backend/server.js` - routes mounted correctly

2. **Frontend:**
   - `frontend/src/app/pages/super-admin/settings/system-roles.component.ts`
   - `frontend/src/app/pages/tenant/settings/tenant-roles.component.ts`
   - `frontend/src/app/app.routes.ts` or routing module

3. **Database:**
   - roles table has `scope` column with values 'platform' or 'tenant'

---

**Last Updated:** October 20, 2025  
**Version:** 1.0  
**Debug Logs:** Added to both components for easy troubleshooting
