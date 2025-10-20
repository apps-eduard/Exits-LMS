# Permission Matrix Feature

## Overview

The Permission Matrix is a visual, grid-based interface that makes it easy to manage role permissions by allowing you to check or uncheck permissions for each role at a glance.

---

## Features

### ✅ Visual Grid Interface
- See all roles and permissions in one view
- Rows = Permissions (grouped by resource)
- Columns = Roles
- Checkboxes for quick enable/disable

### ✅ Grouped by Resource
Permissions are organized by resource category:
- **Tenants Management** (5 permissions)
- **User Management** (3 permissions)
- **Platform Settings** (4 permissions)
- **Menu Management** (3 permissions)
- **Audit Logs** (1 permission)

### ✅ Parent-Child Hierarchy
- **Parent permissions** (📁 folder icon): Automatically grant all child permissions
- **Child permissions** (📄 file icon): Specific sub-permissions
- Auto-add parent when you check a child
- Auto-remove children when you uncheck a parent

### ✅ Protected Roles
- Super Admin, Support Staff, and Developer are **protected**
- Protected roles show striped background
- Checkboxes are disabled (view-only)
- Prevents accidental modification of system roles

### ✅ Batch Operations
- **Select All** button on each role column header
- Toggle all permissions for a role with one click
- Shows ☑ when all selected, ☐ when partial

### ✅ Change Tracking
- Shows unsaved changes count
- "Save All Changes" button only enabled when there are changes
- Bulk save all role permissions in one operation
- Refresh button to discard changes

### ✅ Summary Stats
- Total roles count
- Total permissions count
- Protected roles count
- Unsaved changes indicator

---

## How to Use

### Access the Permission Matrix

1. Navigate to **Super Admin** dashboard
2. Go to **Settings** → **System Roles**
3. The Permission Matrix will load automatically

### Assign Permissions

**Individual Permission:**
1. Find the permission row
2. Find the role column
3. Click the checkbox to toggle

**All Permissions for a Role:**
1. Click the **☐/☑** button in the role column header
2. Toggles all permissions for that role

**Parent Permission:**
1. Check a parent permission (📁)
2. All child permissions are automatically checked
3. Uncheck parent to remove all children

**Child Permission:**
1. Check a child permission (📄)
2. Parent permission is automatically checked
3. Parent remains checked even if you uncheck one child

### Save Changes

1. Make your permission changes
2. **"Unsaved Changes"** counter appears in summary
3. **"Save All Changes"** button turns purple
4. Click **"💾 Save All Changes"**
5. All role permissions are saved to database

### Discard Changes

1. Click **"🔄 Refresh"** button
2. Matrix reloads from database
3. All unsaved changes are lost

---

## Permission Types

### Parent Permissions (Manage)

Grant comprehensive access including all child permissions:

| Parent | Children |
|--------|----------|
| `manage_tenants` | view_tenants, create_tenants, edit_tenants, delete_tenants |
| `manage_users` | view_users, edit_users |
| `manage_platform_settings` | view_platform_settings, edit_platform_settings, export_settings |
| `manage_menus` | view_menus, edit_menus |
| `manage_customers` | view_customers |
| `manage_loans` | approve_loans, view_loans |
| `process_payments` | view_payments |
| `manage_bnpl_orders` | view_bnpl_orders |

### Standalone Permissions

No parent-child relationship:
- `view_audit_logs` - View audit trail
- `manage_loan_products` - Manage loan products
- `manage_bnpl_merchants` - Manage BNPL merchants
- `view_reports` - Access reports

---

## UI Components

### Header Section
```
🔐 Permission Matrix
Manage role permissions with a visual matrix - Check or uncheck permissions for each role

[💾 Save All Changes] [🔄 Refresh]
```

### Matrix Grid
```
┌─────────────────────┬──────────┬──────────┬──────────┐
│ Resource/Permission │  Role 1  │  Role 2  │  Role 3  │
│                     │  ☑ All   │  ☐ All   │  ☐ All   │
├─────────────────────┼──────────┼──────────┼──────────┤
│ 🏢 TENANTS          │          │          │          │
│ 📁 Manage Tenants   │    ✓     │          │    ✓     │
│ 📄 View Tenants     │    ✓     │    ✓     │    ✓     │
│ 📄 Create Tenants   │    ✓     │          │    ✓     │
│ 📄 Edit Tenants     │    ✓     │          │    ✓     │
│ 📄 Delete Tenants   │    ✓     │          │          │
└─────────────────────┴──────────┴──────────┴──────────┘
```

### Summary Footer
```
Total Roles: 3
Total Permissions: 28
Protected Roles: 3
Unsaved Changes: 5
```

---

## Visual Indicators

### Permission Row Colors

- **Yellow Background** 🟨 = Parent permission (manages children)
- **Blue Background** 🟦 = Child permission (part of parent)
- **White Background** ⬜ = Standalone permission
- **Hover Effect** = Light gray highlight

### Role Column Indicators

- **Purple Gradient Header** 🟪 = Active role column
- **Striped Pattern** = Protected role (read-only)
- **✓ Green Checkmark** = Permission enabled
- **Empty Box** = Permission disabled

### Action Buttons

- **Purple Button** 🟣 = Save Changes (enabled only when changes exist)
- **White/Blue Button** ⚪ = Secondary actions (Refresh)
- **Gray Button** ⚫ = Disabled/Saving state

---

## Best Practices

### 1. Review Before Saving
- Check all changed permissions
- Verify child permissions are correct
- Ensure role has appropriate access level

### 2. Use Parent Permissions
- Grant `manage_tenants` instead of individual permissions
- Easier to maintain
- Automatically includes new children in future

### 3. Protect Critical Roles
- Don't modify Super Admin permissions
- Support Staff should be view-only
- Developer needs technical access

### 4. Save Frequently
- Don't make too many changes at once
- Save after completing each role
- Easier to track what changed

### 5. Test After Saving
- Log out and log back in with test user
- Verify permissions work as expected
- Check both granted and denied access

---

## Common Workflows

### Create New Support Role

1. Create role via Role Management (if not using matrix for creation)
2. Open Permission Matrix
3. Find new role column
4. Check these permissions:
   - `view_tenants`
   - `view_users`
   - `edit_users`
   - `view_audit_logs`
   - `view_platform_settings`
5. Click **Save All Changes**

### Promote User to Admin

1. Open Permission Matrix
2. Find user's current role
3. Copy their permissions
4. Find admin role column
5. Check additional admin permissions
6. Save changes

### Revoke Specific Access

1. Find the permission row
2. Find the role column
3. Uncheck the permission
4. Related child permissions auto-uncheck
5. Save changes

---

## Troubleshooting

### Issue: Checkboxes are disabled

**Cause:** You're trying to modify a protected role

**Solution:** 
- Protected roles: Super Admin, Support Staff, Developer
- These are system roles and cannot be modified via UI
- Modify database directly if absolutely necessary (not recommended)

### Issue: Changes not saving

**Cause:** Network error or permission denied

**Solution:**
1. Check browser console for errors
2. Verify you're logged in as Super Admin
3. Check backend logs
4. Try refreshing and saving again

### Issue: Child permissions not auto-checking

**Cause:** Permission hierarchy not defined

**Solution:**
1. Check if parent permission exists in `permissionHierarchy` object
2. Verify child permissions are spelled correctly
3. Contact developer to update hierarchy

### Issue: "Save All Changes" button disabled

**Cause:** No changes detected

**Solution:**
1. Make at least one permission change
2. Ensure checkbox actually toggled
3. If still disabled, refresh page and try again

---

## API Endpoints Used

### Get All Roles
```
GET /api/roles
Response: { success: true, roles: [...] }
```

### Get Permissions by Scope
```
GET /api/permissions?scope=platform
Response: { success: true, permissions: [...] }
```

### Assign Permissions to Role
```
POST /api/roles/:roleId/permissions
Body: { permissionNames: ["perm1", "perm2", ...] }
Response: { success: true, message: "..." }
```

---

## Technical Details

### Component
- **File:** `frontend/src/app/pages/super-admin/settings/permission-matrix.component.ts`
- **Route:** `/super-admin/settings/roles`
- **Type:** Standalone Component
- **Dependencies:** RbacService, CommonModule

### State Management
- **Signals:** Modern Angular reactive state
- `loading` - Loading state
- `saving` - Saving state
- `allPermissions` - All available permissions
- `platformRoles` - All platform roles
- `matrix` - Current permission assignments
- `originalMatrix` - Original state for change detection
- `hasChanges` - Whether unsaved changes exist

### Data Structures

**Permission:**
```typescript
{
  name: string;        // "manage_tenants"
  resource: string;    // "tenants"
  action: string;      // "manage"
  description: string; // "Manage all tenants"
}
```

**Role:**
```typescript
{
  id: string;
  name: string;        // "Super Admin"
  scope: string;       // "platform"
  permissions: Permission[];
}
```

**Matrix:**
```typescript
{
  [roleId]: Set<permissionName>
}
```

---

## Security

### Protected Roles
- Cannot modify Super Admin, Support Staff, Developer via UI
- Striped background indicates protected status
- Checkboxes are disabled (pointer-events: none)

### Permission Validation
- Backend validates all permission assignments
- RBAC middleware checks user permissions
- Only Super Admin can access Permission Matrix

### Audit Trail
- All permission changes are logged
- User, timestamp, before/after states recorded
- View audit logs to see who made changes

---

## Future Enhancements

### Planned Features
- [ ] Role creation within matrix
- [ ] Permission search/filter
- [ ] Bulk role actions (clone, delete)
- [ ] Permission recommendations
- [ ] Conflict detection
- [ ] Export to CSV/Excel
- [ ] Permission usage analytics
- [ ] Role comparison view

---

## Support

### Need Help?
- Check ROLE_PERMISSIONS_GUIDE.md for detailed permission info
- View backend logs: `cd backend && npm run dev`
- Frontend console: F12 in browser
- Contact: system administrator

### Report Issues
- GitHub: apps-eduard/Exits-LMS
- Include screenshots of matrix
- Provide error messages from console
- Describe steps to reproduce

---

**Last Updated:** October 20, 2025  
**Version:** 1.0 - Permission Matrix Release
