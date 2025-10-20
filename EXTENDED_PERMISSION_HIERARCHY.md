# Extended Permission Hierarchy 🏗️

## Permission Structure Overview

### System Admin Permissions (Platform Scope)

```
┌─────────────────────────────────────────────────────────────┐
│                  SYSTEM ADMIN PERMISSIONS                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 TENANT MANAGEMENT (4 children)                          │
│  ├─ 🔗 View Tenants                                        │
│  ├─ 🔗 Create Tenants                                      │
│  ├─ 🔗 Edit Tenants                                        │
│  └─ 🔗 Delete Tenants                                      │
│                                                             │
│  📦 SYSTEM SETTINGS (3 children)                            │
│  ├─ 🔗 View Platform Settings                              │
│  ├─ 🔗 Edit Platform Settings                              │
│  └─ 🔗 Export Settings                                     │
│                                                             │
│  📦 SYSTEM TEAM (2 children)                                │
│  ├─ 🔗 View Users                                          │
│  └─ 🔗 Edit Users                                          │
│                                                             │
│  📄 AUDIT & COMPLIANCE (Standalone)                         │
│  └─ ✓ View Audit Logs                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Permission Breakdown

### 1. Tenant Management (4 Children) 👥

**Parent:** `manage_tenants` - Manage all tenants

**Children:**
1. **`view_tenants`** - View all tenant information
2. **`create_tenants`** - Create new tenant accounts
3. **`edit_tenants`** - Edit tenant information and settings
4. **`delete_tenants`** - Delete tenant accounts

**Hierarchy Rules:**
```
If manage_tenants ✓ → Can check/uncheck any child
If manage_tenants ✗ → All children DISABLED
                      Cannot view, create, edit, or delete tenants
```

**Use Cases:**
- ✅ Super Admin: manage_tenants ✓ + all 4 children ✓
- ✅ Tenant Manager: manage_tenants ✓ + view_tenants ✓, edit_tenants ✓
- ❌ Support Staff: manage_tenants ✗ + all children DISABLED

---

### 2. System Settings (3 Children) ⚙️

**Parent:** `manage_platform_settings` - Manage platform settings

**Children:**
1. **`view_platform_settings`** - View platform configuration
2. **`edit_platform_settings`** - Edit platform settings
3. **`export_settings`** - Export settings configuration

**Hierarchy Rules:**
```
If manage_platform_settings ✓ → Can check/uncheck any child
If manage_platform_settings ✗ → All children DISABLED
                                Cannot view, edit, or export settings
```

**Use Cases:**
- ✅ Super Admin: manage_platform_settings ✓ + all 3 children ✓
- ✅ Developer: manage_platform_settings ✓ + view_platform_settings ✓, edit_platform_settings ✓
- ❌ Support Staff: manage_platform_settings ✗ + all children DISABLED

---

### 3. System Team (2 Children) 👨‍💼

**Parent:** `manage_users` - Manage system users

**Children:**
1. **`view_users`** - View system user accounts
2. **`edit_users`** - Edit system user information and roles

**Hierarchy Rules:**
```
If manage_users ✓ → Can check/uncheck any child
If manage_users ✗ → All children DISABLED
                     Cannot view or edit users
```

**Use Cases:**
- ✅ Super Admin: manage_users ✓ + both children ✓
- ✅ Admin Assistant: manage_users ✓ + view_users ✓
- ❌ Loan Officer: manage_users ✗ + both children DISABLED

---

### 4. Audit & Compliance (Standalone) 📋

**Permission:** `view_audit_logs` - View all audit logs

**Characteristics:**
- Standalone - No children
- No parent dependency
- Can be enabled independently

---

## Complete Permission List (Total: 14 Permissions)

### Platform Permissions (10 Total)

| Category | Permission | Type | Resource | Action |
|----------|-----------|------|----------|--------|
| **Tenant Management** | manage_tenants | Parent | tenants | manage |
| | view_tenants | Child | tenants | view |
| | create_tenants | Child | tenants | create |
| | edit_tenants | Child | tenants | edit |
| | delete_tenants | Child | tenants | delete |
| **System Team** | manage_users | Parent | users | manage |
| | view_users | Child | users | view |
| | edit_users | Child | users | edit |
| **System Settings** | manage_platform_settings | Parent | settings | manage |
| | view_platform_settings | Child | settings | view |
| | edit_platform_settings | Child | settings | edit |
| | export_settings | Child | settings | export |
| **Audit & Compliance** | view_audit_logs | Standalone | audit_logs | view |

### Tenant Permissions (4 Total - for future tenant role UI)

| Permission | Type | Resource | Action |
|-----------|------|----------|--------|
| manage_customers | Parent | customers | manage |
| view_customers | Child | customers | view |
| manage_loans | Parent | loans | manage |
| approve_loans | Child | loans | approve |
| view_loans | Child | loans | view |
| process_payments | Parent | payments | process |
| view_payments | Child | payments | view |
| manage_loan_products | Parent | loan_products | manage |
| manage_bnpl_merchants | Parent | bnpl_merchants | manage |
| manage_bnpl_orders | Parent | bnpl_orders | manage |
| view_bnpl_orders | Child | bnpl_orders | view |
| view_reports | Standalone | reports | view |

---

## Code Implementation

### TypeScript: Permission Hierarchy Definition

```typescript
const PERMISSION_HIERARCHY: { [key: string]: string[] } = {
  // Tenant Management (4 children)
  'manage_tenants': [
    'view_tenants',
    'create_tenants',
    'edit_tenants',
    'delete_tenants'
  ],
  
  // System Settings (3 children)
  'manage_platform_settings': [
    'view_platform_settings',
    'edit_platform_settings',
    'export_settings'
  ],
  
  // System Team (2 children)
  'manage_users': [
    'view_users',
    'edit_users'
  ]
};
```

### Backend: Database Seeds

```javascript
const permissions = [
  // Tenant Management (Parent + 4 children)
  { name: 'manage_tenants', resource: 'tenants', action: 'manage', 
    description: 'Manage all tenants' },
  { name: 'view_tenants', resource: 'tenants', action: 'view', 
    description: 'View all tenants (child)' },
  { name: 'create_tenants', resource: 'tenants', action: 'create', 
    description: 'Create new tenants (child)' },
  { name: 'edit_tenants', resource: 'tenants', action: 'edit', 
    description: 'Edit tenant information (child)' },
  { name: 'delete_tenants', resource: 'tenants', action: 'delete', 
    description: 'Delete tenants (child)' },
  
  // System Team (Parent + 2 children)
  { name: 'manage_users', resource: 'users', action: 'manage', 
    description: 'Manage system users' },
  { name: 'view_users', resource: 'users', action: 'view', 
    description: 'View system users (child)' },
  { name: 'edit_users', resource: 'users', action: 'edit', 
    description: 'Edit system user information (child)' },
  
  // System Settings (Parent + 3 children)
  { name: 'manage_platform_settings', resource: 'settings', action: 'manage', 
    description: 'Manage platform settings' },
  { name: 'view_platform_settings', resource: 'settings', action: 'view', 
    description: 'View platform settings (child)' },
  { name: 'edit_platform_settings', resource: 'settings', action: 'edit', 
    description: 'Edit platform settings (child)' },
  { name: 'export_settings', resource: 'settings', action: 'export', 
    description: 'Export settings configuration (child)' },
];
```

---

## UI Rendering Example

### System Admin Role Configuration

```
PERMISSIONS TAB:

✅ 📦 Manage Tenants (Parent)
   ✅ 🔗 View Tenants
      ✓ Can toggle
   ✅ 🔗 Create Tenants
      ✓ Can toggle
   ✅ 🔗 Edit Tenants
      ✓ Can toggle
   ✅ 🔗 Delete Tenants
      ✓ Can toggle

✅ 📦 Manage Platform Settings (Parent)
   ✅ 🔗 View Platform Settings
      ✓ Can toggle
   ☐ 🔗 Edit Platform Settings
      ✓ Can toggle (optional)
   ☐ 🔗 Export Settings
      ✓ Can toggle (optional)

✅ 📦 Manage Users (Parent)
   ✅ 🔗 View Users
      ✓ Can toggle
   ☐ 🔗 Edit Users
      ✓ Can toggle (optional)

✅ 📄 View Audit Logs (Standalone)
   ✓ Can toggle
```

---

## Interaction Scenarios

### Scenario 1: Enable "Create Tenants" Child

```
State BEFORE:
❌ Manage Tenants (Parent - unchecked)
   ❌ Create Tenants (Child - disabled)

User Action:
Clicks: Create Tenants checkbox

System Response:
1. Check if parent is checked? → NO
2. Auto-enable parent: Manage Tenants ✅
3. Enable child: Create Tenants ✅

State AFTER:
✅ Manage Tenants (Parent - auto-checked!)
   ✅ Create Tenants (Child - checked)
   ☐ View Tenants (unchecked - user can toggle)
   ☐ Edit Tenants (unchecked - user can toggle)
   ☐ Delete Tenants (unchecked - user can toggle)
```

### Scenario 2: Disable "Manage Tenants" Parent

```
State BEFORE:
✅ Manage Tenants (Parent - checked)
   ✅ View Tenants (Child - checked)
   ✅ Create Tenants (Child - checked)
   ✅ Edit Tenants (Child - checked)
   ✅ Delete Tenants (Child - checked)

User Action:
Clicks: Manage Tenants checkbox

System Response:
1. Check if parent has children? → YES [4 children]
2. Uncheck parent: Manage Tenants ❌
3. Auto-uncheck all 4 children:
   - View Tenants ❌
   - Create Tenants ❌
   - Edit Tenants ❌
   - Delete Tenants ❌

State AFTER:
❌ Manage Tenants (Parent - unchecked)
   ❌ View Tenants (Child - auto-unchecked, disabled)
   ❌ Create Tenants (Child - auto-unchecked, disabled)
   ❌ Edit Tenants (Child - auto-unchecked, disabled)
   ❌ Delete Tenants (Child - auto-unchecked, disabled)
   
Message on each child: "(enable parent first)"
```

### Scenario 3: Try to Check Child When Parent Disabled

```
State:
❌ Manage Users (Parent - unchecked)
   ❌ View Users (Child - DISABLED, greyed out)
   ❌ Edit Users (Child - DISABLED, greyed out)

User Action:
Tries to click: View Users checkbox

System Response:
Input is DISABLED (HTML: disabled="disabled")
Tooltip shows: "(enable parent first)"
Nothing happens when user clicks

Result:
User cannot check View Users until parent is enabled
```

---

## Permission Totals

| Category | Parents | Children | Total |
|----------|---------|----------|-------|
| Tenant Management | 1 | 4 | 5 |
| System Settings | 1 | 3 | 4 |
| System Team | 1 | 2 | 3 |
| Audit & Compliance | 0 | 1 | 1 |
| **TOTAL PLATFORM** | **3** | **10** | **13** |
| **Tenant Scope (Future)** | Multiple | Multiple | 12 |
| **GRAND TOTAL** | - | - | **25** |

---

## Role Assignment Examples

### Super Admin Role
```
✅ manage_tenants + all 4 children
✅ manage_users + all 2 children
✅ manage_platform_settings + all 3 children
✅ view_audit_logs

Total: 13 permissions
```

### Developer Role
```
✅ manage_platform_settings
✅ view_platform_settings
✅ edit_platform_settings
☐ export_settings

✅ view_audit_logs

Total: 5 permissions
```

### Support Staff Role
```
✅ view_tenants (child only, parent disabled)
✅ view_users (child only, parent disabled)
✅ view_audit_logs

Total: 3 permissions
```

### Tenant Manager Role
```
✅ manage_tenants
✅ view_tenants (child)
✅ create_tenants (child)
✅ edit_tenants (child)
☐ delete_tenants (child - not allowed)

Total: 4 permissions
```

---

## Testing Checklist

- [ ] Verify all 9 new permissions in database
  - [ ] create_tenants
  - [ ] edit_tenants
  - [ ] delete_tenants
  - [ ] view_platform_settings
  - [ ] edit_platform_settings
  - [ ] export_settings
  - [ ] view_users
  - [ ] edit_users

- [ ] Test Tenant Management hierarchy (4 children)
  - [ ] Enable parent → all children can toggle
  - [ ] Disable parent → all 4 children auto-disable
  - [ ] Enable 1 child → parent auto-enables

- [ ] Test System Settings hierarchy (3 children)
  - [ ] Enable parent → all 3 children can toggle
  - [ ] Disable parent → all 3 children auto-disable
  - [ ] Enable any child → parent auto-enables

- [ ] Test System Team hierarchy (2 children)
  - [ ] Enable parent → both children can toggle
  - [ ] Disable parent → both children auto-disable
  - [ ] Enable any child → parent auto-enables

- [ ] Test standalone View Audit Logs
  - [ ] Can enable/disable independently
  - [ ] No dependencies

---

## Files Modified

| File | Changes | Lines Changed |
|------|---------|---------------|
| `system-roles.component.ts` | Updated `PERMISSION_HIERARCHY` with 9 new permissions | 3 → 16 lines |
| `seed.js` | Added 9 new permission seeds to database | Updated permissions array |

---

**Status: ✅ COMPLETE**

**All Code Compiles:** No errors ✅

**New Permissions Added:** 9
- manage_tenants: 4 children
- manage_platform_settings: 3 children
- manage_users: 2 children

**Total System Permissions:** 13 (3 parents + 10 children)
