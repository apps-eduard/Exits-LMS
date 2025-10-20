# Menu-Based Access Control Implementation Guide

## Overview

This implementation adds **menu-based access control** to the system. Each role can now be assigned specific menus, and users will only see navigation items they have access to.

## Architecture

### 1. Database Layer (`role_menus` table)

**Schema:**
```sql
CREATE TABLE role_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, menu_id)
);
```

**Purpose:**
- Links roles to the menus they can access
- Cascades deletes when role or menu is deleted
- Prevents duplicate role-menu assignments

**Initial Seeding:**
- Protected system roles (Super Admin, Support Staff, Developer) automatically get ALL menus
- Other roles start with zero menus (empty access)

### 2. Backend API Endpoints

#### Role Menu Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|-----------|
| POST | `/api/roles/:id/menus` | Assign menus to a role | manage_platform_settings |
| GET | `/api/roles/:id/menus` | Get menus for a role | (any user) |
| DELETE | `/api/roles/:roleId/menus/:menuId` | Remove menu from role | manage_platform_settings |

#### Menu Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|-----------|
| GET | `/api/menus/available` | Get all available menus for assignment | (any user) |
| GET | `/api/menus/user-menus` | Get user's accessible menus | (authenticated) |

#### Request/Response Examples

**Assign Menus to Role:**
```bash
POST /api/roles/{roleId}/menus
Content-Type: application/json

{
  "menuIds": [
    "menu-uuid-1",
    "menu-uuid-2",
    "menu-uuid-3"
  ]
}

Response:
{
  "success": true,
  "message": "Menus assigned successfully",
  "menuCount": 3
}
```

**Get Role Menus:**
```bash
GET /api/roles/{roleId}/menus

Response:
{
  "success": true,
  "menus": [
    {
      "id": "uuid",
      "name": "Dashboard",
      "icon": "🏠",
      "path": "/super-admin/dashboard",
      "scope": "platform",
      "order_index": 1
    },
    // ... more menus
  ]
}
```

**Get User's Accessible Menus:**
```bash
GET /api/menus/user-menus

Response:
{
  "success": true,
  "menus": [
    {
      "id": "uuid",
      "name": "Dashboard",
      "icon": "🏠",
      "path": "/super-admin/dashboard",
      "scope": "platform",
      "order_index": 1
    },
    // ... only menus assigned to user's role
  ]
}
```

### 3. Frontend Service Methods (RBAC Service)

```typescript
// Assign menus to a role
assignMenusToRole(roleId: string, menuIds: string[]): Observable<any>

// Get menus assigned to a role
getRoleMenus(roleId: string): Observable<any>

// Get all available menus
getAvailableMenus(): Observable<any>

// Get user's accessible menus (based on role)
getUserMenus(): Observable<any>

// Remove a menu from a role
removeMenuFromRole(roleId: string, menuId: string): Observable<any>
```

### 4. Files Modified/Created

**Backend:**
- ✅ `migrations/create_role_menus_table.sql` - Database migration
- ✅ `scripts/run-migrations.js` - Migration runner
- ✅ `controllers/role-menus.controller.js` - NEW - Menu assignment logic
- ✅ `routes/role.routes.js` - Added menu assignment routes
- ✅ `routes/menu.routes.js` - Added menu query endpoints

**Frontend:**
- ✅ `core/services/rbac.service.ts` - Added menu management methods

## Implementation Steps

### Step 1: Run Database Migration

```bash
cd backend
node scripts/run-migrations.js
```

This will:
1. Create the `role_menus` table
2. Automatically assign ALL menus to protected roles (Super Admin, Support Staff, Developer)
3. Leave other roles with zero menus

### Step 2: Test Backend API

Use Postman or curl to test:

```bash
# Get available menus
curl http://localhost:3000/api/menus/available \
  -H "Authorization: Bearer {token}"

# Assign menus to IT Support role
curl -X POST http://localhost:3000/api/roles/{roleId}/menus \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"menuIds": ["menu-id-1", "menu-id-2"]}'

# Get user's accessible menus
curl http://localhost:3000/api/menus/user-menus \
  -H "Authorization: Bearer {token}"
```

### Step 3: Create Frontend UI Component

Next step is to create a menu assignment component in the permission matrix page that shows:

1. **Available Menus List**
   - Hierarchical list of all menus
   - Organized by scope (platform/tenant)

2. **Role Menu Selection**
   - Checkboxes for each menu
   - Visual indication of selected menus
   - "Select All" / "Deselect All" buttons

3. **Save/Apply**
   - Save button to apply changes
   - Success/error notifications

### Step 4: Update Frontend Navigation

Modify the navigation component to:

1. Call `getUserMenus()` on app initialization
2. Filter/build menu tree based on accessible menus
3. Hide menu items not assigned to the user's role

## Use Cases

### Use Case 1: Give IT Support Limited Menu Access

```typescript
const roleId = 'it-support-role-id';
const allowedMenuIds = [
  'dashboard-menu-id',
  'audit-logs-menu-id',
  'settings-menu-id'
];

rbacService.assignMenusToRole(roleId, allowedMenuIds).subscribe(
  response => console.log('Menus assigned!'),
  error => console.error('Failed to assign menus')
);
```

### Use Case 2: Get User's Accessible Menus on Login

```typescript
// In auth service after successful login
rbacService.getUserMenus().subscribe(
  menus => {
    // Build navigation with only these menus
    this.navigationService.setMenus(menus);
  }
);
```

### Use Case 3: Restrict Cashier to Only Payment Processing

```typescript
const cashierRoleId = 'cashier-role-id';
const cashierMenuIds = [
  'payments-menu-id',
  'payment-history-menu-id',
  'profile-settings-menu-id'
];

rbacService.assignMenusToRole(cashierRoleId, cashierMenuIds).subscribe();
```

## Security Considerations

### Multi-Layer Protection

1. **Menu Assignment** (Admin Level)
   - Only users with `manage_platform_settings` can assign menus
   - Changes require audit log entry

2. **Frontend Filtering** (UX Level)
   - Navigation only shows assigned menus
   - User can't see links to restricted features

3. **Backend API Validation** (Security Level)
   - Every API endpoint still checks permissions
   - Menu assignment doesn't override permission checks
   - If user bypasses frontend, backend still denies access

### Example: Double Protection

```
User with "Cashier" role (no payments permission):
1. Frontend: Payments menu not shown
2. Backend: If they try to POST /api/payments
   → Error: "Insufficient permissions. Required: manage_payments"
```

## Database Migration Commands

If you need to run the migration manually via psql:

```sql
-- Copy the content from migrations/create_role_menus_table.sql
-- and execute in your postgres connection

-- Verify table was created:
\dt role_menus

-- Check that protected roles have all menus assigned:
SELECT COUNT(*) FROM role_menus WHERE role_id IN (
  SELECT id FROM roles WHERE name IN ('Super Admin', 'Support Staff', 'Developer')
);
```

## Configuration

### Initial Settings

- **Protected Roles** (always have all menus): 
  - Super Admin
  - Support Staff
  - Developer

- **Custom Roles** (empty by default):
  - IT Support
  - Loan Officer
  - Cashier
  - (any newly created roles)

### Customization Points

To add/modify protected roles, edit:
- `backend/migrations/create_role_menus_table.sql` - SQL migration
- `backend/middleware/rbac.middleware.js` - PROTECTED_ROLES array

## Next Steps

1. ✅ Backend infrastructure in place
2. ⏳ Create frontend UI component for menu assignment
3. ⏳ Update navigation to filter menus per user
4. ⏳ Add audit logging for menu assignments
5. ⏳ Create admin dashboard to visualize menu-to-role mappings

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Protected roles automatically get all menus
- [ ] Can assign menus to custom roles via API
- [ ] Can fetch role menus via API
- [ ] Can fetch user menus via API
- [ ] Menu assignment requires proper permissions
- [ ] Removing menus from a role works
- [ ] Deleted menus cascade delete from role_menus
- [ ] Deleted roles cascade delete from role_menus
- [ ] Frontend navigation filters menus correctly
- [ ] Backend still validates permissions (not bypassed by menu assignment)
