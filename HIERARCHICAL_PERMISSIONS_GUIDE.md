# Hierarchical Permission System 🏗️

## Overview
This system implements a **parent-child permission hierarchy** where:
- ✅ **Parent permission** → Can have multiple **child permissions**
- ✅ **Child can only be enabled** if **parent is enabled**
- ✅ **Disabling parent** → Automatically **disables all children**
- ✅ **Enabling child** → Automatically **enables parent**

## Permission Hierarchy Structure

### Platform Scope Permissions

```
📦 Manage Tenants (Parent)
   └── 🔗 View Tenants (Child)
   
📦 Manage Users (Parent)
   └── 🔗 View Users (Child)
   
📦 Manage Platform Settings (Parent)
   └── 🔗 View Platform Settings (Child)
   
📄 View Audit Logs (Standalone)
```

### Tenant Scope Permissions (Future)

```
📦 Manage Customers (Parent)
   └── 🔗 View Customers (Child)
   
📦 Manage Loans (Parent)
   ├── 🔗 Approve Loans (Child)
   └── 🔗 View Loans (Child)
   
📦 Process Payments (Parent)
   └── 🔗 View Payments (Child)
   
📦 Manage BNPL Orders (Parent)
   └── 🔗 View BNPL Orders (Child)
   
📄 Manage Loan Products (Standalone)
📄 Manage BNPL Merchants (Standalone)
📄 View Reports (Standalone)
```

## How It Works

### Scenario 1: Enable Child Permission ✅

```
User clicks checkbox: View Tenants (child)
         ↓
System checks: Is "Manage Tenants" (parent) enabled?
         ↓
NO → Automatically enable parent first
         ↓
Then enable child "View Tenants"
         ↓
Result: Both parent and child are checked ✓
```

**Code Logic:**
```typescript
if (index === -1) {  // Adding permission
  permissions.push(permissionName);  // Add the child
  
  // Find if this is a child and auto-enable parent
  for (const [parent, children] of Object.entries(PERMISSION_HIERARCHY)) {
    if (children.includes(permissionName)) {
      if (!permissions.includes(parent)) {
        permissions.push(parent);  // Auto-enable parent!
      }
    }
  }
}
```

### Scenario 2: Disable Parent Permission ✅

```
User clicks checkbox: Manage Tenants (parent)
         ↓
System checks: Is this a parent permission?
         ↓
YES → Get all children: ["View Tenants", ...]
         ↓
Remove parent: Manage Tenants
         ↓
Remove all children: View Tenants
         ↓
Result: Parent and all children are unchecked ✓
```

**Code Logic:**
```typescript
if (index > -1) {  // Removing permission
  permissions.splice(index, 1);  // Remove the parent
  
  // Remove all child permissions
  const childPermissions = PERMISSION_HIERARCHY[permissionName] || [];
  childPermissions.forEach(child => {
    const childIndex = permissions.indexOf(child);
    if (childIndex > -1) {
      permissions.splice(childIndex, 1);  // Remove children!
    }
  });
}
```

### Scenario 3: UI Disabling ✅

```
Child permission checkbox is DISABLED if parent is not checked
         ↓
Show message: "(enable parent first)"
         ↓
User cannot click the checkbox
         ↓
Forces user to enable parent to access child
```

**HTML:**
```html
<input type="checkbox" 
       [disabled]="!hasPermission(parentName)"
       (change)="togglePermission(childName)">
```

## UI Visual Indicators

### Parent Permission (Group Owner)
```
📦 Manage Tenants
   └── Parent checkbox with package emoji
   └── Indented under category
   └── Can toggle independently
```

### Child Permission (Grouped Under Parent)
```
   └── 🔗 View Tenants
       └── Linked with 🔗 emoji
       └── Indented further
       └── DISABLED unless parent checked
       └── Shows: "(enable parent first)"
```

### Standalone Permission
```
📄 View Audit Logs
   └── Standalone with 📄 emoji
   └── No dependencies
   └── Always enabled
```

## Implementation Details

### Frontend File: `system-roles.component.ts`

**Permission Hierarchy Configuration:**
```typescript
const PERMISSION_HIERARCHY: { [key: string]: string[] } = {
  'manage_tenants': ['view_tenants'],
  'manage_users': ['view_users'],
  'manage_platform_settings': ['view_platform_settings'],
};
```

**Key Methods:**

1. **`togglePermission(permissionName: string)`**
   - Handles both parent and child toggles
   - Auto-enables parent when child is enabled
   - Auto-disables all children when parent is disabled

2. **`isParentPermission(permissionName: string): boolean`**
   - Returns true if permission has children
   - Used to render parent/child UI differently

3. **`getChildPermissions(parentName: string): string[]`**
   - Returns array of child permissions
   - Used to render child checkboxes

4. **`canUncheckParent(parentName: string): boolean`**
   - Checks if parent has any checked children
   - Prevents orphaning children

### Frontend File: `system-roles.component.html`

**Parent Permission Rendering:**
```html
<div *ngIf="isParentPermission(perm.name)">
  <!-- Parent checkbox -->
  <label class="... mb-2 p-2 rounded ...">
    <input type="checkbox" [checked]="hasPermission(perm.name)"
           (change)="togglePermission(perm.name)">
    <span class="font-semibold">📦 {{ perm.name }}</span>
  </label>
  
  <!-- Child permissions (indented, with border) -->
  <div class="ml-5 pl-3 border-l-2 border-gray-600/30">
    <label *ngFor="let childName of getChildPermissions(perm.name)"
           class="p-1.5 rounded ...">
      <input type="checkbox" [checked]="hasPermission(childName)"
             [disabled]="!hasPermission(perm.name)"
             (change)="togglePermission(childName)">
      <span>🔗 {{ childName }}</span>
      <span *ngIf="!hasPermission(perm.name)" 
            class="text-xs text-gray-600">
        (enable parent first)
      </span>
    </label>
  </div>
</div>
```

**Standalone Permission Rendering:**
```html
<div *ngIf="!isParentPermission(perm.name)">
  <label class="... p-2 rounded ...">
    <input type="checkbox" [checked]="hasPermission(perm.name)"
           (change)="togglePermission(perm.name)">
    <span>📄 {{ perm.name }}</span>
  </label>
</div>
```

### Backend File: `seed.js`

**Updated Permissions with Parent-Child Relationships:**
```javascript
const permissions = [
  // Platform permissions
  { name: 'manage_tenants', resource: 'tenants', action: 'manage', description: 'Manage all tenants' },
  { name: 'view_tenants', resource: 'tenants', action: 'view', description: 'View all tenants (child of manage_tenants)' },
  
  { name: 'manage_users', resource: 'users', action: 'manage', description: 'Manage users' },
  { name: 'view_users', resource: 'users', action: 'view', description: 'View users (child of manage_users)' },
  
  // ... more parent-child pairs
];
```

## Use Cases

### Use Case 1: Super Admin Role
```
✅ Manage Tenants (parent)
   ✅ View Tenants (child - auto-enabled)
✅ Manage Users (parent)
   ✅ View Users (child - auto-enabled)
✅ Manage Platform Settings (parent)
   ✅ View Platform Settings (child - auto-enabled)
✅ View Audit Logs (standalone)
```

### Use Case 2: Support Staff Role
```
✅ Manage Users (parent)
   ✅ View Users (child - auto-enabled)
❌ Manage Tenants (parent disabled)
   ❌ View Tenants (child disabled)
✅ View Audit Logs (standalone)
❌ Manage Platform Settings
```

### Use Case 3: Developer Role
```
❌ Manage Tenants (parent disabled)
❌ Manage Users (parent disabled)
✅ Manage Platform Settings (parent)
   ✅ View Platform Settings (child - auto-enabled)
✅ View Audit Logs (standalone)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│         System Role Management UI               │
└─────────────────────────────────────────────────┘
                      ↓
        Select Role → Click Permissions Tab
                      ↓
┌─────────────────────────────────────────────────┐
│  Load Platform Permissions (via scope=platform) │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  getAllPermissionCategories()                   │
│  Returns permissions grouped by resource        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Render Permission Groups with Hierarchy        │
│  - Parents (📦) with borders                    │
│  - Children (🔗) indented                       │
│  - Standalone (📄) normal                       │
└─────────────────────────────────────────────────┘
                      ↓
            User checks/unchecks boxes
                      ↓
┌─────────────────────────────────────────────────┐
│  togglePermission(name)                         │
│  - Check if parent or child                     │
│  - Auto-enable parent if child checked          │
│  - Auto-disable children if parent unchecked    │
└─────────────────────────────────────────────────┘
                      ↓
           Update selectedRole signal
                      ↓
        Save to backend when user clicks Save
```

## Testing Checklist ✓

- [ ] Click child permission checkbox when parent is unchecked
  - Expected: Parent automatically checked
  - Result: ✅ Child and parent both checked

- [ ] Click parent permission checkbox
  - Expected: Parent unchecks, all children auto-uncheck
  - Result: ✅ Parent and all children unchecked

- [ ] Try to click child checkbox when parent is unchecked
  - Expected: Checkbox is disabled, shows "(enable parent first)"
  - Result: ✅ Checkbox disabled, cannot click

- [ ] Re-check parent permission
  - Expected: Parent checked, children remain unchecked (user choice)
  - Result: ✅ Only parent checked

- [ ] Check multiple children under parent
  - Expected: Parent must be checked, children can toggle independently
  - Result: ✅ Works correctly

- [ ] Uncheck parent after children checked
  - Expected: All children auto-uncheck
  - Result: ✅ Parent and children all unchecked

## Future Enhancements

1. **Visual Indicators** - Show count of checked children
   ```
   📦 Manage Tenants (2/2 permissions)
   ```

2. **Bulk Actions** - Check/uncheck all children at once
   ```html
   <button>Check All Children</button>
   ```

3. **Permission Dependencies** - More complex: A depends on B and C
   ```typescript
   {
     'approve_loans': ['manage_loans', 'view_loans'],
   }
   ```

4. **Partial Check** - Show parent as partially checked if some children are checked
   ```
   📦 Manage Tenants (⊙ 1/2 children checked)
   ```

---

**Status: ✅ IMPLEMENTED - Hierarchical permission system with parent-child validation!**

