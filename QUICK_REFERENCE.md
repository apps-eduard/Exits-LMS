# 🎯 Quick Reference - Multi-Tenant Architecture

## Super Admin (Platform Realm)
```
Email: admin@exits-lms.com
Password: admin123

User Record:
- tenant_id = NULL
- role = Super Admin
- scope = platform

Access:
- /api/tenants (all tenants, no filtering)
- /api/users (all users, no filtering)
- /api/settings (platform settings)

Can:
✅ Create new tenants
✅ Manage all tenants
✅ View all users
✅ Configure platform settings
✅ Enable/disable features for tenants
```

## Tenant Admin (Tenant Realm)
```
Email: admin@mycorp.com (created during signup)
Password: (set during signup)

User Record:
- tenant_id = <tenant-uuid> (NOT NULL)
- role = tenant-admin
- scope = tenant

Access:
- /api/customers (filtered by tenant_id)
- /api/loans (filtered by tenant_id)
- /api/bnpl-orders (if enabled, filtered by tenant_id)

Can:
✅ Manage own tenant's customers
✅ Manage own tenant's loans
✅ Process payments
❌ See other tenants' data (blocked by WHERE tenant_id = $1)
❌ Access platform settings
```

## Architecture Diagram
```
REQUEST (with Bearer token)
    ↓
authMiddleware
├─ Decode JWT
├─ Fetch user from DB
├─ Extract tenant_id
└─ Set req.user.tenantId
    ↓
checkModuleAccess('money-loan') [if tenant route]
├─ Query: tenant_features WHERE tenant_id
├─ Check is_enabled = true
└─ Block if not enabled
    ↓
tenantIsolation [if tenant route]
├─ Check roleScope
├─ Platform: bypass filtering
└─ Tenant: set req.tenantId
    ↓
checkPermission('manage_customers')
├─ Query: role_permissions
├─ Check user has permission
└─ Allow or deny
    ↓
CONTROLLER
├─ If platform: SELECT * FROM table (NO filtering)
└─ If tenant: SELECT * FROM table WHERE tenant_id = $1
    ↓
RESPONSE (filtered data)
```

## URL Patterns

### Platform Routes (Super Admin Only)
```
POST /api/auth/login                    → Authenticate user
GET  /api/tenants                       → List all tenants
GET  /api/tenants/:id                   → Get tenant details
PUT  /api/tenants/:id                   → Update tenant
POST /api/users                         → Create user
GET  /api/settings                      → Get platform settings
PUT  /api/settings                      → Update settings
```

### Tenant Routes (Tenant Users Only)
```
GET  /api/customers                     → List tenant's customers
POST /api/customers                     → Create customer
GET  /api/loans                         → List tenant's loans
POST /api/loans                         → Create loan
POST /api/bnpl-orders                   → Create BNPL order (if enabled)
```

### Public Routes (No Auth Required)
```
POST /api/tenants                       → Signup/Create tenant
GET  /health                            → Health check
```

## Query Examples

### Super Admin Query
```javascript
// Super Admin sees ALL tenants
SELECT * FROM tenants ORDER BY created_at DESC

Result: All tenants in system
```

### Tenant Admin Query
```javascript
// Tenant Admin sees only OWN data
SELECT * FROM customers 
WHERE tenant_id = 'abc-123-xyz'
ORDER BY created_at DESC

Result: Only customers belonging to tenant 'abc-123-xyz'
```

### Enforced Filtering
```javascript
// All tenant queries MUST include tenant_id
const tenantId = req.tenantId;  // From middleware

const result = await db.query(
  `SELECT * FROM loans WHERE tenant_id = $1`,
  [tenantId]  // ← MANDATORY
);
```

## Security Checks (Order Matters)

```
1. ✅ Token Valid?
   └─ authMiddleware → Verify JWT

2. ✅ Feature Enabled?
   └─ checkModuleAccess → Check tenant_features

3. ✅ Correct Realm?
   └─ tenantIsolation → Check roleScope

4. ✅ Has Permission?
   └─ checkPermission → Check role_permissions

5. ✅ Query Filtered?
   └─ Controller → WHERE tenant_id = $1
```

## Signup Flow

```
User: "I want to create a tenant"
    ↓
POST /api/tenants (PUBLIC, no auth needed)
    ├─ Validate form
    ├─ Create TENANT record
    ├─ Auto-generate subdomain if empty
    ├─ Create ADMIN USER with tenant_id ← KEY!
    ├─ Create TENANT_FEATURES (modules disabled)
    └─ Return success
    ↓
User logs in with admin email + password
    ↓
GET JWT token with user details
    ↓
Access /api/customers with token
    ├─ authMiddleware → Extract tenant_id
    ├─ getAllCustomers → WHERE tenant_id = extracted_value
    └─ Return only that tenant's customers
```

## Common Mistakes to Avoid

❌ **WRONG - No tenant filtering:**
```javascript
const result = await db.query(
  `SELECT * FROM customers`  // ← Missing tenant_id filter!
);
// All customers returned! Security breach!
```

✅ **RIGHT - Always filter:**
```javascript
const tenantId = req.tenantId;
const result = await db.query(
  `SELECT * FROM customers WHERE tenant_id = $1`,  // ← Always filter
  [tenantId]
);
// Only that tenant's customers returned
```

❌ **WRONG - Storing NULL tenant_id for tenant user:**
```javascript
await db.query(
  `INSERT INTO users (tenant_id, ...) 
   VALUES (NULL, ...)`  // ← NULL means Super Admin!
);
// Tenant user becomes Super Admin! Security breach!
```

✅ **RIGHT - Store tenant_id:**
```javascript
await db.query(
  `INSERT INTO users (tenant_id, ...) 
   VALUES ($1, ...)`,
  [tenantId]  // ← Real tenant UUID
);
// User belongs to specific tenant
```

## Testing Checklist

- [ ] Super Admin can login
- [ ] Super Admin sees all tenants
- [ ] Create new tenant via signup
- [ ] New tenant admin can login
- [ ] Tenant admin sees only own customers
- [ ] Tenant admin can't see other tenant's data
- [ ] Disabled feature returns 403 error
- [ ] Enabled feature works correctly
- [ ] Queries in browser console show WHERE tenant_id filter

---

**Reference Date**: October 19, 2025
