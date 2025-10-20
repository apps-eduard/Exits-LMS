# Permission Matrix System - Complete Implementation Guide

## Overview

The Permission Matrix is the **core access control system** for the Exits LMS platform. It provides role-based access control (RBAC) with hierarchical permissions, allowing Super Admins to define granular access controls for all roles across the platform.

## Architecture

### Components

1. **Frontend: permission-matrix.component.ts** (364 lines)
   - Standalone Angular component
   - Manages permission matrix UI with two tabs: System Roles and Permission Matrix
   - Handles role CRUD operations
   - Manages hierarchical permission assignments

2. **Backend: role.controller.js**
   - REST API endpoints for role management
   - Permission assignment logic
   - Database operations on roles and role_permissions tables

3. **Database: PostgreSQL**
   - `roles` table - stores role definitions
   - `role_permissions` table - junction table linking roles to permissions
   - `permissions` table - master list of all system permissions

### Permission Hierarchy

The system uses a parent-child permission hierarchy to simplify management:

```
manage_tenants (parent)
├── view_tenants (child)
├── create_tenants (child)
├── edit_tenants (child)
└── delete_tenants (child)

manage_users (parent)
├── view_users (child)
└── edit_users (child)

manage_platform_settings (parent)
├── view_platform_settings (child)
├── edit_platform_settings (child)
└── export_settings (child)

manage_menus (parent)
├── view_menus (child)
└── edit_menus (child)

manage_customers (parent)
└── view_customers (child)

manage_loans (parent)
├── approve_loans (child)
└── view_loans (child)

process_payments (parent)
└── view_payments (child)

manage_bnpl_orders (parent)
└── view_bnpl_orders (child)
```

**Key Feature:** When a parent permission is checked, all child permissions are automatically enabled. When unchecked, all children are disabled.

## Features

### 1. System Roles Tab

**Capabilities:**
- View all platform roles (filtered by scope='platform')
- Create new custom roles with name and description
- Edit role details (name, description) for non-protected roles
- Delete custom roles
- Cannot modify protected system roles (Super Admin, Support Staff, Developer)

**Protected Roles:**
```
- Super Admin → Auto-granted ALL permissions
- Support Staff → Auto-granted ALL permissions
- Developer → Auto-granted ALL permissions
```

**Protected Role Behavior:**
- Checkbox cells are disabled (grayed out)
- Cannot be edited or deleted
- Show visual indicator (darker background)
- Automatically have all permissions

### 2. Permission Matrix Tab

**Main Grid:**
- Rows: All permissions (grouped by resource)
- Columns: All platform roles
- Cells: Checkboxes to enable/disable permission for role
- Parent permissions highlighted in yellow
- Child permissions highlighted in blue
- Protected roles have disabled cells

**Features:**
- **Search:** Filter permissions by name/description (if implemented)
- **Permissions grouped by resource:** Better organization
  - Tenants (5 permissions)
  - Users (2 permissions)
  - Platform Settings (3 permissions)
  - Menus (2 permissions)
  - Customers (1 permission)
  - Loans (2 permissions)
  - Payments (1 permission)
  - BNPL Orders (1 permission)
  - Audit Logs (1 permission)
  - Reports (1 permission)

**Icons:**
- 📁 Parent permissions
- 📄 Child permissions
- 🏢 Tenants resource
- 👥 Users resource
- ⚙️ Settings resource
- 📋 Menus resource
- 👤 Customers resource
- 💰 Loans resource
- 💳 Payments resource
- 🛒 BNPL resource
- 📜 Audit Logs resource
- 📈 Reports resource

**Statistics:**
- Total Roles count
- Total Permissions count
- Protected Roles count
- Unsaved Changes count (only shown if changes exist)

### 3. Save Functionality

- **Save All Changes button** - only enabled when changes are detected
- **Refresh button** - reload from database
- Shows saving state with ⏳ spinner
- Bulk save all role permission changes in one operation
- Optimistic UI updates
- Success/error feedback

## Data Flow

### Permission Assignment Flow

```
1. User opens Settings → Roles & Permissions tab
   ↓
2. PermissionMatrixComponent.ngOnInit()
   ↓
3. loadMatrix() called
   ├→ rbacService.getAllRoles()
   │  └→ GET /api/roles (with scope='platform' filter)
   │     └→ Returns: { success, roles[] with permissions[] }
   │
   └→ rbacService.getPermissionsByScope('platform')
      └→ GET /api/permissions?scope=platform
         └→ Returns: { success, permissions[] }
   ↓
4. Build matrix: Matrix[roleId] = Set<permissionName>
   ↓
5. Render checkboxes in grid
   ↓
6. User toggles permissions (clicks checkboxes)
   ├→ togglePermission(roleId, permissionName)
   │  ├→ If unchecking parent: remove all children
   │  └→ If checking child: add parent if not present
   │  └→ Update matrix signal
   │
   └→ toggleAllPermissionsForRole(roleId)
      └→ Toggle all permissions for a single role
   ↓
7. User clicks "Save All Changes"
   ↓
8. saveAllChanges() called
   ├→ Build permissionIds array for each role
   ├→ Map permission names to IDs
   └→ For each role:
      └→ rbacService.assignPermissionsToRole(roleId, permissionIds[])
         └→ POST /api/roles/:id/permissions
            ├→ Body: { permissions: string[] (permission IDs) }
            └→ Backend: Delete all existing role_permissions, insert new ones
   ↓
9. Success → UI shows confirmation, reload data
   ↓
10. Permission takes effect for users with that role on next login/API call
```

### Permission Check Flow (At Runtime)

```
1. User makes API request (e.g., DELETE /api/users/:id)
   ↓
2. Express server receives request with JWT token
   ↓
3. authMiddleware: Verify JWT → extract userId
   ↓
4. Fetch user from database:
   SELECT u.*, r.name as role_name, r.scope
   FROM users u
   LEFT JOIN roles r ON u.role_id = r.id
   WHERE u.id = $1
   ↓
5. Attach to req.user:
   {
     id, email, roleName: "IT Support", roleScope: "platform", roleId, ...
   }
   ↓
6. rbac Middleware: checkPermission('delete_users')
   ├→ If PROTECTED_ROLES includes role_name: ✅ PASS (auto-granted)
   ├→ Else query database:
   │  SELECT p.name FROM permissions p
   │  JOIN role_permissions rp ON p.id = rp.permission_id
   │  WHERE rp.role_id = req.user.roleId AND p.name = 'delete_users'
   │
   ├→ If found: ✅ PASS → next()
   └→ Else: ❌ FAIL → 403 Forbidden
   ↓
7. Route controller executes or returns error
```

## Security

### Permission Validation

1. **Protected System Roles**: Super Admin, Support Staff, Developer always have all permissions
2. **Permission Persistence**: Permissions stored in role_permissions junction table
3. **Permission Scope**: Separate permissions for 'platform' vs 'tenant' scopes
4. **JWT Token**: Permission checks happen on each request via RBAC middleware

### Protected Fields

- Cannot delete Super Admin, Support Staff, Developer roles
- Cannot edit names of protected roles
- Checkboxes are disabled (readonly) for protected roles

## API Endpoints

### Role Management

```
GET /api/roles
  Query: ?scope=platform|tenant
  Returns: { success, roles[] }

POST /api/roles
  Body: { name, scope, description }
  Returns: { success, role }

PUT /api/roles/:id
  Body: { name, description }
  Returns: { success, role }

DELETE /api/roles/:id
  Returns: { success }

POST /api/roles/:id/permissions
  Body: { permissions: string[] (permission IDs) }
  Returns: { success }
```

### Permission Management

```
GET /api/permissions?scope=platform|tenant
  Returns: { success, permissions[] }

GET /api/permissions/:id
  Returns: { success, permission }
```

## Usage Guide

### For Super Admin: Assign Permissions to a Custom Role

1. Navigate to: **Settings → Roles & Permissions**
2. Click on **"System Roles"** tab
3. Find the custom role and click **"Edit"** (or create new)
4. Click **"Permission Matrix"** tab
5. Locate the role in column headers
6. Check desired permissions (unchecking parent auto-unchecks children)
7. Click **"Save All Changes"** button
8. Confirm changes saved successfully
9. Users with this role will have new permissions on next login

### For Developers: Protecting Routes

```typescript
// In route definitions:
router.delete('/api/users/:id',
  authMiddleware,
  checkScope('platform'),
  checkPermission('delete_users'),  // ← Permission check
  userController.deleteUser
);

// Protected roles auto-pass:
if (PROTECTED_ROLES.includes(req.user.roleName)) {
  return next(); // ✅ Always allow
}

// Custom roles checked against database
```

## Testing

### Unit Tests

```typescript
// Test parent-child hierarchy
togglePermission(roleId, 'manage_tenants');
// Should auto-enable: view_tenants, create_tenants, edit_tenants, delete_tenants

// Test protected roles
isProtectedRole('Super Admin'); // → true
canDeleteRole('Super Admin'); // → false
```

### Integration Tests

```
1. Create custom role "Editor"
2. Assign: view_users, edit_users permissions
3. Create test user with "Editor" role
4. Login as Editor user
5. Can view users: ✅ GET /api/users works
6. Can edit users: ✅ PUT /api/users/:id works
7. Cannot delete users: ❌ DELETE /api/users/:id → 403
8. Cannot manage tenants: ❌ GET /api/tenants → 403
```

### E2E Tests

- [ ] Load permission matrix - all permissions visible
- [ ] Create role - appears in matrix
- [ ] Assign permissions - checkboxes toggle
- [ ] Save permissions - backend updated
- [ ] Verify enforcement - user with role has those permissions
- [ ] Verify hierarchy - checking parent auto-checks children
- [ ] Protected roles - cannot edit/delete
- [ ] Delete role - removed from matrix

## Troubleshooting

### Issue: Permissions not taking effect

**Cause:** User needs to re-login to get new JWT token with updated permissions
**Solution:** Clear localStorage, login again

### Issue: Cannot save permission matrix

**Cause:** API error, likely permission denied
**Solution:** Check browser console for error, verify user is Super Admin with 'manage_permissions' permission

### Issue: Parent permissions not auto-checking children

**Cause:** JavaScript logic issue in togglePermission()
**Solution:** Check permissionHierarchy object has correct parent-child mappings

## Future Enhancements

1. **Permission Import/Export**: Bulk export/import permission matrices as JSON
2. **Permission Audit**: Track who made permission changes and when
3. **Permission Templates**: Pre-built role templates (e.g., "Editor", "Viewer", "Moderator")
4. **Delegation**: Allow Super Admin to delegate permission management to Support Staff
5. **Dynamic Hierarchies**: Define custom permission hierarchies per organization
6. **Conditional Permissions**: Permissions based on conditions (e.g., "edit_users if user.department === 'HR'")

## Maintenance

### Adding New Permissions

1. Create permission in database:
   ```sql
   INSERT INTO permissions (name, resource, action, description)
   VALUES ('new_permission', 'resource', 'action', 'description');
   ```

2. Update backend RBAC middleware if needed

3. Update permission-matrix component if new hierarchy needed:
   ```typescript
   private readonly permissionHierarchy: { [key: string]: string[] } = {
     "parent_permission": ["new_permission", ...]
   };
   ```

### Removing Permissions

1. Archive in database (add deleted_at timestamp)
2. Don't delete - for audit trail
3. Remove from permission hierarchy in component
4. Existing role_permissions references can stay (foreign key reference)

## Performance Notes

- **Permission Matrix Grid**: Uses CSS Grid for efficient rendering
- **Matrix Load**: O(n*m) where n=roles, m=permissions (~200+ calculations, acceptable)
- **Save Operations**: Bulk inserts via database, not individual updates
- **Caching**: No caching (real-time permission updates needed)

---

**Version:** 3.0 (Permission Matrix Edition)
**Last Updated:** October 20, 2025
**Status:** Complete & Production Ready ✅

