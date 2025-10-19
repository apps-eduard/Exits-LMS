# Exits LMS - Quick Reference Guide

## 📱 Quick Start

### Default Credentials
```
Super Admin:
  Email: admin@exits-lms.com
  Password: admin123

Demo Tenant Admin:
  Email: admin@demo.com
  Password: demo123
```

---

## 🔑 API Quick Reference

### Authentication
```bash
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }
```

### Users (Super Admin Only)
```bash
GET    /api/users/                    # List all users
POST   /api/users/                    # Create user
GET    /api/users/:id                 # Get user
PUT    /api/users/:id                 # Update user
PATCH  /api/users/:id/status          # Toggle status
DELETE /api/users/:id                 # Delete user
POST   /api/users/:id/reset-password  # Reset password
```

### Tenant Users (Tenant Admin)
```bash
GET    /api/users/tenant/me                    # Current profile
GET    /api/users/tenant/users                 # List users
POST   /api/users/tenant/users                 # Create user
GET    /api/users/tenant/users/:id             # Get user
PUT    /api/users/tenant/users/:id             # Update user
PATCH  /api/users/tenant/users/:id/status      # Toggle status
DELETE /api/users/tenant/users/:id             # Delete user
```

### Roles
```bash
GET /api/users/roles/list              # Get available roles
```

### Customers (Tenant Users)
```bash
GET    /api/customers/                 # List customers
POST   /api/customers/                 # Create customer
GET    /api/customers/:id              # Get customer
PUT    /api/customers/:id              # Update customer
DELETE /api/customers/:id              # Delete customer
GET    /api/customers/stats/summary    # Get statistics
```

### Tenants (Super Admin)
```bash
GET    /api/tenants/                   # List tenants
POST   /api/tenants/                   # Create tenant
GET    /api/tenants/:id                # Get tenant
PUT    /api/tenants/:id                # Update tenant
POST   /api/tenants/:id/modules        # Toggle module
GET    /api/tenants/:id/users          # Get tenant users
```

### Settings
```bash
# Tenant Settings
GET    /api/settings/tenant/settings    # Get settings
PUT    /api/settings/tenant/settings    # Update settings
GET    /api/settings/tenant/branding    # Get branding
PUT    /api/settings/tenant/branding    # Update branding

# Platform Settings (Admin Only)
GET    /api/settings/                   # Get platform settings
PUT    /api/settings/                   # Update platform settings
```

---

## 🔐 Roles & Permissions Quick Matrix

| Role | Manage Users | View Customers | Manage Customers | Manage Loans | Process Payments |
|------|:------------:|:--------------:|:----------------:|:------------:|:----------------:|
| Super Admin | ✅ | - | - | - | - |
| Tenant Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Loan Officer | ❌ | ✅ | ✅ | ✅ | ❌ |
| Cashier | ❌ | ✅ | ❌ | ✅ | ✅ |

---

## 📊 Available Roles

### Platform Scope
- **Super Admin** - Full system access

### Tenant Scope
- **tenant-admin** - Full tenant access
- **Loan Officer** - Manage loans & customers
- **Cashier** - Process payments only

---

## 🎯 Access Levels

### Super Admin
- Access: ALL endpoints
- Manage: All tenants, users, system settings
- Scope: platform

### Tenant Admin
- Access: Tenant-level endpoints
- Manage: Users, customers, loans, settings in their tenant
- Scope: tenant
- Data: Only their tenant

### Loan Officer
- Access: Customer & loan endpoints
- Manage: Customers, view loans, create customers
- Scope: tenant
- Data: Only their tenant

### Cashier
- Access: View-only customer & payment endpoints
- Manage: Process payments only
- Scope: tenant
- Data: Only their tenant

---

## 🚫 Common Permission Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No token or invalid token | Login again and get new token |
| 403 Forbidden (scope) | Wrong scope required | Use correct user role |
| 403 Forbidden (permission) | Insufficient permissions | Check user role permissions |
| 403 Forbidden (module) | Module not enabled | Enable module for tenant |
| 404 Not Found | Resource doesn't exist | Verify resource ID and tenant |
| 400 Bad Request | Invalid data | Check request format and fields |

---

## 🔍 Query Parameters

### Search & Filter Users
```bash
GET /api/users/tenant/users?search=john&role=Loan%20Officer&status=active
```

### Search & Filter Customers
```bash
GET /api/customers/?search=juan&status=active
```

### Search & Filter Tenants
```bash
GET /api/tenants/?search=demo&status=active
```

---

## 💾 Example Request/Response

### Create Tenant User

**Request:**
```bash
POST /api/users/tenant/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "officer@demo.com",
  "firstName": "Loan",
  "lastName": "Officer",
  "phone": "09123456789",
  "password": "SecurePass123!",
  "roleName": "Loan Officer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "officer@demo.com",
    "firstName": "Loan",
    "lastName": "Officer",
    "phone": "09123456789",
    "roleName": "Loan Officer",
    "isActive": true
  },
  "message": "Tenant user created successfully"
}
```

---

## 🔄 Typical Workflows

### Workflow 1: Create New Tenant with Users

```
1. Super Admin login
   ↓
2. Create tenant (POST /api/tenants/)
   ↓
3. Enable modules (POST /api/tenants/{id}/modules)
   ↓
4. Create tenant admin user (POST /api/users/)
   ↓
5. Tenant admin login
   ↓
6. Create loan officer (POST /api/users/tenant/users)
   ↓
7. Create customers (POST /api/customers/)
```

### Workflow 2: Loan Officer Daily Operations

```
1. Login
   ↓
2. View customers (GET /api/customers/)
   ↓
3. Create new customer (POST /api/customers/)
   ↓
4. View customer details (GET /api/customers/{id})
   ↓
5. Update customer info (PUT /api/customers/{id})
   ↓
6. View customer stats (GET /api/customers/stats/summary)
```

### Workflow 3: Tenant Admin User Management

```
1. Login
   ↓
2. View all users (GET /api/users/tenant/users)
   ↓
3. Create new user (POST /api/users/tenant/users)
   ↓
4. Update user role (PUT /api/users/tenant/users/{id})
   ↓
5. Toggle user status (PATCH /api/users/tenant/users/{id}/status)
   ↓
6. Delete inactive user (DELETE /api/users/tenant/users/{id})
```

---

## 📋 Tenant Features (Modules)

Each tenant can have these modules enabled/disabled:

- **money-loan** - Money lending module
- **pawnshop** - Pawnshop module
- **bnpl** - Buy Now Pay Later module

```bash
# Enable module
POST /api/tenants/{tenantId}/modules
{
  "moduleName": "money-loan",
  "isEnabled": true
}

# Check if enabled
# GET /api/customers/ will fail with 403 if money-loan module disabled
```

---

## 🛡️ Security Tips

1. **Change default password** for super admin before production
2. **Use strong passwords** - minimum 8 characters with mixed case
3. **Keep JWT secret secure** - store in environment variables
4. **Use HTTPS only** in production
5. **Set short token expiration** times
6. **Enable audit logging** for compliance
7. **Review permissions regularly** for unused roles/users
8. **Implement rate limiting** to prevent brute force attacks

---

## 🧪 Test Checklist

- [ ] Super Admin can manage all users
- [ ] Tenant Admin can only see their users
- [ ] Loan Officer cannot create users
- [ ] Cashier cannot manage customers
- [ ] Customer module requires money-loan enabled
- [ ] Tenant cannot access other tenant's data
- [ ] Module access restrictions work
- [ ] Permissions are enforced correctly
- [ ] Password hashing works
- [ ] Token validation works

---

## 📞 Debugging Tips

### Check Token Claims
```bash
# Decode JWT token at https://jwt.io
# Look for: userId, roleId, roleScope
```

### Check User Permissions
```bash
# Query database
SELECT p.name FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = '<role_id>'
```

### Check Module Status
```bash
# Query database
SELECT * FROM tenant_features
WHERE tenant_id = '<tenant_id>' AND module_name = 'money-loan'
```

### Enable Debug Logging
```javascript
// In RBAC middleware, logs show:
// [RBAC] Checking permission: manage_customers
// [RBAC] ✅ Permission granted: manage_customers
```

---

## 📚 Documentation Files

- **IMPLEMENTATION_GUIDE.md** - Comprehensive technical guide
- **FEATURES_SUMMARY.md** - Feature overview and matrix
- **API_EXAMPLES.md** - cURL examples and workflows
- **QUICK_REFERENCE.md** - This file

---

## 🚀 Common cURL Commands

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exits-lms.com","password":"admin123"}'
```

### List Users
```bash
curl -X GET http://localhost:3000/api/users/ \
  -H "Authorization: Bearer $TOKEN"
```

### Create Customer
```bash
curl -X POST http://localhost:3000/api/customers/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Juan","lastName":"Dela Cruz","email":"juan@example.com"}'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/users/tenant/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔗 Related Files

Backend:
- `routes/user.routes.js` - User API routes
- `routes/customer.routes.js` - Customer API routes
- `controllers/user.controller.js` - User logic
- `controllers/customer.controller.js` - Customer logic
- `middleware/rbac.middleware.js` - Permission checking
- `middleware/tenant-isolation.middleware.js` - Data isolation

Frontend (if applicable):
- Components for user management
- Components for customer management
- Auth service for login

---

**Version:** 1.0  
**Last Updated:** October 20, 2025  
**Status:** ✅ Complete
