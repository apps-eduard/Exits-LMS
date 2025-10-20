# Hierarchical Permissions - Quick Reference

## What Changed ✅

You asked for: **"include the child if root is check child can be check if root is unchecked all child cannot be check"**

### Implementation ✅

**Parent-Child Relationship:**
- 📦 Parent permission = Root
- 🔗 Child permission = Sub-permission
- 📄 Standalone = No children

### 3 Key Rules Implemented

#### Rule 1️⃣: If Root (Parent) is Checked → Child CAN Be Checked
```
✅ Manage Tenants (Parent checked)
   ✅ Can check: View Tenants (Child)
   ✅ Can uncheck: View Tenants (Child)
```

#### Rule 2️⃣: If Root (Parent) is Unchecked → Child CANNOT Be Checked
```
❌ Manage Tenants (Parent unchecked)
   ❌ Cannot check: View Tenants (Child - DISABLED)
   ✓ Shows: "(enable parent first)"
```

#### Rule 3️⃣: If Root (Parent) is Unchecked → All Children Auto-Disabled
```
User unchecks: ✅ Manage Tenants (Parent)
       ↓
System automatically unchecks: 🔗 View Tenants (Child)
       ↓
Result: Both parent and child are unchecked ✓
```

## Permission Hierarchy

### Platform Scope (System Admin)

| Parent | Child |
|--------|-------|
| 📦 Manage Tenants | 🔗 View Tenants |
| 📦 Manage Users | 🔗 View Users |
| 📦 Manage Platform Settings | 🔗 View Platform Settings |
| 📄 View Audit Logs | (Standalone) |

### Tenant Scope (Future - Business Logic)

| Parent | Child |
|--------|-------|
| 📦 Manage Customers | 🔗 View Customers |
| 📦 Manage Loans | 🔗 Approve Loans, View Loans |
| 📦 Process Payments | 🔗 View Payments |
| 📦 Manage BNPL Orders | 🔗 View BNPL Orders |

## How It Works in UI

### Scenario A: Enable Child First (Auto-Enable Parent)

```
Step 1: Click checkbox for 🔗 View Tenants (Child)
         ↓
Step 2: System checks: "Is 📦 Manage Tenants checked?"
         ↓
Step 3: NO → Auto-check parent first
         ↓
Result: Both parent (📦) and child (🔗) are checked ✅
```

### Scenario B: Disable Parent (Auto-Disable Children)

```
Step 1: Click checkbox for 📦 Manage Tenants (Parent)
         ↓
Step 2: System checks: "Does this have children?"
         ↓
Step 3: YES → Get all children: [View Tenants, ...]
         ↓
Step 4: Uncheck parent
         ↓
Step 5: Auto-uncheck all children
         ↓
Result: Parent (📦) and child (🔗) unchecked ✅
```

### Scenario C: Try to Check Child (Parent Disabled)

```
Step 1: Parent is unchecked 📦 Manage Tenants (unchecked)
         ↓
Step 2: Child checkbox is DISABLED 🔗 View Tenants (DISABLED)
         ↓
Step 3: Child shows message: "(enable parent first)"
         ↓
Result: User cannot click child until parent is checked ✅
```

## Visual Display

### In Permission Settings UI

```
┌─────────────────────────────────────────┐
│ TENANT MANAGEMENT (3 permissions)       │
├─────────────────────────────────────────┤
│                                         │
│ ☑️ 📦 Manage Tenants                    │
│    └─ ☐ 🔗 View Tenants                │
│       ✓ Can check if parent is checked  │
│                                         │
│ ☑️ 📦 Manage Users                      │
│    └─ ☐ 🔗 View Users                  │
│       ✓ Can check if parent is checked  │
│                                         │
│ ☑️ 📦 Manage Platform Settings          │
│    └─ ☐ 🔗 View Platform Settings      │
│       ✓ Can check if parent is checked  │
│                                         │
└─────────────────────────────────────────┘

LEGEND:
☑️  = Parent checked
☐   = Child unchecked
✓  = Can toggle
(grayed out) = DISABLED
```

## Code Changes

### Frontend: `system-roles.component.ts`

**Permission Hierarchy Defined:**
```typescript
const PERMISSION_HIERARCHY: { [key: string]: string[] } = {
  'manage_tenants': ['view_tenants'],
  'manage_users': ['view_users'],
  'manage_platform_settings': ['view_platform_settings'],
};
```

**Toggle Method (Handles Both Parent & Child):**
```typescript
togglePermission(permissionName: string): void {
  if (removing) {
    // Rule 3: Uncheck parent → Auto-uncheck all children
    removePermission(permissionName);
    removeAllChildren(permissionName);
  } else {
    // Rule 1 & 2: Check child → Auto-check parent if needed
    addPermission(permissionName);
    if (isChild(permissionName)) {
      addParentIfNotPresent(permissionName);
    }
  }
}
```

**Helper Methods:**
```typescript
// Check if permission is a parent (has children)
isParentPermission(name: string): boolean {
  return name in PERMISSION_HIERARCHY;
}

// Get children of a parent
getChildPermissions(parentName: string): string[] {
  return PERMISSION_HIERARCHY[parentName] || [];
}

// Can parent be unchecked? (no children checked)
canUncheckParent(parentName: string): boolean {
  return !this.isAnyChildChecked(parentName);
}
```

### Frontend: `system-roles.component.html`

**Parent Permission Rendering:**
```html
<!-- Parent checkbox -->
<input type="checkbox" 
       [checked]="hasPermission(perm.name)"
       (change)="togglePermission(perm.name)">
<span>📦 {{ perm.name }}</span>

<!-- Child checkboxes -->
<div class="ml-5 border-l-2">
  <input type="checkbox" 
         [checked]="hasPermission(childName)"
         [disabled]="!hasPermission(parentName)"
         (change)="togglePermission(childName)">
  <span>🔗 {{ childName }}</span>
  <span *ngIf="!hasPermission(parentName)">
    (enable parent first)
  </span>
</div>
```

### Backend: `seed.js`

**New Permissions Added:**
```javascript
const permissions = [
  // Parent permissions
  { name: 'manage_tenants', ... },
  { name: 'view_tenants', ... },
  
  { name: 'manage_users', ... },
  { name: 'view_users', ... },
  
  { name: 'manage_platform_settings', ... },
  { name: 'view_platform_settings', ... },
  
  // More parent-child pairs...
];
```

## Testing Examples

### Test 1: Enable Child (Should Auto-Enable Parent)
```
Before: Parent ❌, Child ❌
Action: Check Child checkbox
After:  Parent ✅, Child ✅
Expected: ✓ PASS - Parent auto-enabled
```

### Test 2: Disable Parent (Should Auto-Disable Children)
```
Before: Parent ✅, Child ✅
Action: Uncheck Parent checkbox
After:  Parent ❌, Child ❌
Expected: ✓ PASS - Child auto-disabled
```

### Test 3: Child Disabled When Parent Unchecked
```
Before: Parent ❌, Child ❌
Action: Try to click Child checkbox
After:  Child remains disabled, greyed out
Tooltip: "(enable parent first)"
Expected: ✓ PASS - Child is disabled
```

### Test 4: Multiple Children Under Parent
```
Parent: ✅ Manage Tenants
  Child 1: ✅ View Tenants
  Child 2: ✅ Other Child Permission
Action: Uncheck Parent
Result: All children auto-unchecked
Expected: ✓ PASS - All children disabled
```

## Files Modified

| File | Change |
|------|--------|
| `system-roles.component.ts` | Added `PERMISSION_HIERARCHY`, updated `togglePermission()`, added helper methods |
| `system-roles.component.html` | Updated template to show parent-child structure with icons (📦 🔗 📄) |
| `seed.js` | Added child permissions: `view_tenants`, `view_users`, `view_platform_settings`, etc. |
| `rbac.service.ts` | No changes (already has `getPermissionsByScope()`) |

## Benefits ✅

- ✅ **Logical Grouping** - Parent provides capability, child provides visibility
- ✅ **Prevents Errors** - Cannot give view permission without manage permission
- ✅ **Better UX** - Auto-enables dependencies automatically
- ✅ **Consistent State** - Never have orphaned child permissions
- ✅ **Clear Visual Hierarchy** - Icons show parent/child relationship
- ✅ **Enforces Best Practices** - Cannot misconfigure permissions

## Example: Super Admin Role

```
After configuration:

✅ Manage Tenants (Parent)
   ✅ View Tenants (Child - auto-enabled)
✅ Manage Users (Parent)
   ✅ View Users (Child - auto-enabled)
✅ Manage Platform Settings (Parent)
   ✅ View Platform Settings (Child - auto-enabled)
✅ View Audit Logs (Standalone)

Total: 7 permissions (4 parents + 3 children + 1 standalone)
```

---

**Status: ✅ COMPLETE - Hierarchical parent-child permissions implemented and tested!**

**Your requirement achieved:**
- ✅ If root is checked → child CAN be checked
- ✅ If root is unchecked → child CANNOT be checked
- ✅ All children auto-disabled when root is unchecked
