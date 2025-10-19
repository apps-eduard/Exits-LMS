# Exits LMS - Users, RBAC, and Customers Implementation Guide

## Overview

This document describes the comprehensive implementation of Users, Role-Based Access Control (RBAC), and Customers features for the Exits LMS platform, supporting both **Super Admin (Platform-level)** and **Tenant Admin (Tenant-level)** operations.

---

## 1. Architecture Overview

### Two-Level Access Control
- **Platform Level** (Super Admin): Manage all tenants, users, and system-wide settings
- **Tenant Level** (Tenant Admin): Manage users, customers, and settings within their tenant

### Key Components
1. **Authentication Middleware** (`auth.middleware.js`) - Validates JWT tokens
2. **RBAC Middleware** (`rbac.middleware.js`) - Checks permissions and scopes
3. **Tenant Isolation** (`tenant-isolation.middleware.js`) - Ensures data isolation
4. **Module Access** (`module-access.middleware.js`) - Checks module availability

---

## 2. Users Management

### Endpoints for Super Admin (Platform Scope)

#### List All Users
```
GET /api/users/
Authentication: Required
Scope: platform
Permission: manage_users

Query Parameters:
- search: Search by email, first name, or last name
- role: Filter by role name
- status: Filter by 'active' or 'inactive'

Response:
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role_name": "Super Admin",
      "tenant_name": "Demo Company",
      "is_active": true,
      "created_at": "2024-10-20T10:00:00Z"
    }
  ]
}
```

#### Create User
```
POST /api/users/
Authentication: Required
Scope: platform
Permission: manage_users

Request Body:
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "09123456789",
  "password": "SecurePassword123!",
  "roleName": "Super Admin",
  "tenantId": "tenant-uuid (optional)",
  "street_address": "123 Main St",
  "barangay": "Barangay 1",
  "city": "Manila",
  "province": "Metro Manila",
  "region": "NCR",
  "postal_code": "1000",
  "country": "Philippines"
}

Response:
{
  "success": true,
  "user": { ... },
  "message": "User created successfully"
}
```

#### Update User
```
PUT /api/users/:id
Authentication: Required
Scope: platform
Permission: manage_users

Request Body:
{
  "email": "updated@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "09198765432",
  "password": "NewPassword123! (optional)"
}
```

#### Toggle User Status
```
PATCH /api/users/:id/status
Authentication: Required
Scope: platform
Permission: manage_users

Request Body:
{
  "isActive": true/false
}
```

#### Reset Password
```
POST /api/users/:id/reset-password
Authentication: Required
Scope: platform
Permission: manage_users

Request Body:
{
  "newPassword": "NewPassword123!"
}
```

#### Delete User
```
DELETE /api/users/:id
Authentication: Required
Scope: platform
Permission: manage_users
```

---

### Endpoints for Tenant Admin (Tenant Scope)

#### Get Current User Profile
```
GET /api/users/tenant/me
Authentication: Required
Scope: tenant
Tenant Isolation: Required

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@demo.com",
    "first_name": "Demo",
    "last_name": "Admin",
    "role_name": "tenant-admin",
    "tenant_name": "Demo Company"
  }
}
```

#### List Tenant Users
```
GET /api/users/tenant/users
Authentication: Required
Scope: tenant
Permission: manage_users
Tenant Isolation: Required

Query Parameters:
- search: Search by email, name
- role: Filter by role
- status: Filter by active/inactive

Response:
{
  "success": true,
  "users": [...]
}
```

#### Get Tenant User
```
GET /api/users/tenant/users/:id
Authentication: Required
Scope: tenant
Permission: manage_users
Tenant Isolation: Required
```

#### Create Tenant User
```
POST /api/users/tenant/users
Authentication: Required
Scope: tenant
Permission: manage_users
Tenant Isolation: Required

Request Body:
{
  "email": "officer@demo.com",
  "firstName": "Loan",
  "lastName": "Officer",
  "phone": "09123456789",
  "password": "SecurePass123!",
  "roleName": "Loan Officer",  // Must be a tenant role
  "street_address": "456 Oak Ave",
  "barangay": "Barangay 2",
  "city": "Makati"
}

Response:
{
  "success": true,
  "user": {...},
  "message": "Tenant user created successfully"
}
```

#### Update Tenant User
```
PUT /api/users/tenant/users/:id
Authentication: Required
Scope: tenant
Permission: manage_users
Tenant Isolation: Required

Request Body:
{
  "firstName": "Updated",
  "lastName": "Name",
  "roleName": "Cashier",  // Optional
  "password": "NewPass123!"  // Optional
}
```

#### Toggle Tenant User Status
```
PATCH /api/users/tenant/users/:id/status
Authentication: Required
Scope: tenant
Permission: manage_users
Tenant Isolation: Required

Request Body:
{
  "isActive": false
}
```

#### Delete Tenant User
```
DELETE /api/users/tenant/users/:id
Authentication: Required
Scope: tenant
Permission: manage_users
Tenant Isolation: Required

Note: Cannot delete the only tenant admin user
```

#### Get Roles
```
GET /api/users/roles/list
Authentication: Required

Response:
{
  "success": true,
  "roles": [
    { "id": "uuid", "name": "Super Admin", "scope": "platform" },
    { "id": "uuid", "name": "tenant-admin", "scope": "tenant" },
    { "id": "uuid", "name": "Loan Officer", "scope": "tenant" },
    { "id": "uuid", "name": "Cashier", "scope": "tenant" }
  ]
}

Note: Super Admin sees all roles, Tenant users see only tenant roles
```

---

## 3. RBAC (Role-Based Access Control)

### Permission System

**Platform Permissions:**
- `manage_tenants` - Manage all tenants
- `view_audit_logs` - View system audit logs
- `manage_platform_settings` - Manage platform-wide settings

**Tenant Permissions:**
- `manage_users` - Manage tenant users
- `manage_customers` - Create, update, delete customers
- `view_customers` - View customers
- `manage_loans` - Manage loans
- `approve_loans` - Approve loan applications
- `view_loans` - View loans
- `process_payments` - Process payments
- `view_payments` - View payments
- `manage_loan_products` - Manage loan products
- `manage_bnpl_merchants` - Manage BNPL merchants
- `manage_bnpl_orders` - Manage BNPL orders
- `view_bnpl_orders` - View BNPL orders
- `view_reports` - View reports

### Role Hierarchy

#### Platform Level
- **Super Admin** - Full platform access
  - Scope: `platform`
  - All permissions

#### Tenant Level
- **tenant-admin** - Full tenant access
  - Scope: `tenant`
  - All tenant permissions
  
- **Loan Officer** - Manage loans and customers
  - Scope: `tenant`
  - Permissions: manage_customers, view_customers, manage_loans, view_loans, view_payments, manage_loan_products, manage_bnpl_orders, view_bnpl_orders, view_reports
  
- **Cashier** - Process payments
  - Scope: `tenant`
  - Permissions: view_customers, view_loans, process_payments, view_payments, view_bnpl_orders

### RBAC Middleware Usage

```javascript
// Require specific permission
router.get('/customers', 
  authenticate,
  checkPermission('view_customers'),
  controller.getCustomers
);

// Require specific scope
router.get('/settings',
  authenticate,
  checkScope('platform'),
  controller.getSettings
);

// Both permission and scope
router.post('/customers',
  authenticate,
  checkScope('tenant'),
  checkPermission('manage_customers'),
  controller.createCustomer
);
```

---

## 4. Customers Management

### Endpoints for Tenant Users

#### List Customers
```
GET /api/customers/
Authentication: Required
Module Access: money-loan (must be enabled)
Permission: view_customers
Tenant Isolation: Required

Query Parameters:
- search: Search by name, email, phone
- status: Filter by 'active' or 'inactive'

Response:
{
  "success": true,
  "customers": [
    {
      "id": "uuid",
      "first_name": "Juan",
      "last_name": "dela Cruz",
      "email": "juan@example.com",
      "phone": "09123456789",
      "loan_count": 2,
      "total_outstanding": 50000.00,
      "status": "active",
      "created_at": "2024-10-20T10:00:00Z"
    }
  ]
}
```

#### Get Customer Details
```
GET /api/customers/:id
Authentication: Required
Module Access: money-loan
Permission: view_customers
Tenant Isolation: Required

Response:
{
  "success": true,
  "customer": {
    "id": "uuid",
    "first_name": "Juan",
    "last_name": "dela Cruz",
    "email": "juan@example.com",
    "phone": "09123456789",
    "address": "123 Main St",
    "id_number": "123-456-789",
    "loan_count": 2,
    "total_outstanding": 50000.00,
    "loans": [
      {
        "id": "uuid",
        "product_name": "Standard Loan",
        "status": "active",
        "outstanding_balance": 25000.00
      }
    ]
  }
}
```

#### Create Customer
```
POST /api/customers/
Authentication: Required
Module Access: money-loan
Permission: manage_customers
Tenant Isolation: Required

Request Body:
{
  "firstName": "Juan",
  "lastName": "dela Cruz",
  "email": "juan@example.com",
  "phone": "09123456789",
  "address": "123 Main St, Manila",
  "idNumber": "123-456-789"
}

Response:
{
  "success": true,
  "customer": {...},
  "message": "Customer created successfully"
}
```

#### Update Customer
```
PUT /api/customers/:id
Authentication: Required
Module Access: money-loan
Permission: manage_customers
Tenant Isolation: Required

Request Body:
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan.delacruz@example.com",
  "phone": "09198765432",
  "status": "active"
}
```

#### Delete Customer
```
DELETE /api/customers/:id
Authentication: Required
Module Access: money-loan
Permission: manage_customers
Tenant Isolation: Required

Note: Cannot delete customers with active loans
```

#### Get Customers Summary
```
GET /api/customers/stats/summary
Authentication: Required
Module Access: money-loan
Permission: view_customers
Tenant Isolation: Required

Response:
{
  "success": true,
  "summary": {
    "total_customers": 150,
    "active_customers": 140,
    "inactive_customers": 10,
    "total_loans": 200,
    "active_loans": 180,
    "total_outstanding": 1250000.00
  }
}
```

---

## 5. Tenant Settings Management

### Endpoints for Tenant Admin

#### Get Tenant Settings
```
GET /api/settings/tenant/settings
Authentication: Required
Tenant Isolation: Required

Response:
{
  "success": true,
  "settings": {
    "business_hours": { "open": "09:00", "close": "17:00" },
    "loan_processing_days": 3,
    "notifications_enabled": true
  }
}
```

#### Update Tenant Settings
```
PUT /api/settings/tenant/settings
Authentication: Required
Tenant Isolation: Required

Request Body:
{
  "settings": {
    "business_hours": { "open": "08:00", "close": "18:00" },
    "loan_processing_days": 5,
    "notifications_enabled": true
  }
}
```

#### Get Tenant Branding
```
GET /api/settings/tenant/branding
Authentication: Required
Tenant Isolation: Required

Response:
{
  "success": true,
  "branding": {
    "name": "Demo Company",
    "logo_url": "https://example.com/logo.png",
    "primary_color": "#007bff",
    "secondary_color": "#6c757d"
  }
}
```

#### Update Tenant Branding
```
PUT /api/settings/tenant/branding
Authentication: Required
Tenant Isolation: Required

Request Body:
{
  "name": "Demo Company",
  "logoUrl": "https://example.com/new-logo.png",
  "primaryColor": "#ff0000",
  "secondaryColor": "#0000ff"
}
```

---

## 6. Tenant Access Control

### How Tenant Isolation Works

The `tenant-isolation.middleware.js` ensures that:

1. **Super Admin** (platform scope) - Can bypass tenant isolation, access all tenants
2. **Tenant Users** (tenant scope) - Can only access their own tenant data

```javascript
// Middleware automatically sets req.tenantId
// This is used in queries to filter data by tenant

const getAllCustomers = async (req, res) => {
  const tenantId = req.tenantId;  // Set by middleware
  
  const query = `
    SELECT * FROM customers
    WHERE tenant_id = $1  // Ensures data isolation
  `;
  
  const result = await db.query(query, [tenantId]);
};
```

---

## 7. Example Workflows

### Workflow 1: Super Admin Creating a Tenant User

```bash
# 1. Super Admin logs in
POST /api/auth/login
Body: { "email": "admin@exits-lms.com", "password": "admin123" }
Response: { "token": "jwt_token_here" }

# 2. Super Admin creates tenant
POST /api/tenants/
Headers: { "Authorization": "Bearer jwt_token_here" }
Body: { "name": "ABC Lending", "subdomain": "abc-lending", ... }

# 3. Enable modules for tenant
POST /api/tenants/{tenantId}/modules
Body: { "moduleName": "money-loan", "isEnabled": true }

# 4. Create tenant admin
POST /api/users/
Headers: { "Authorization": "Bearer jwt_token_here" }
Body: {
  "email": "admin@abc-lending.com",
  "firstName": "Admin",
  "lastName": "User",
  "password": "TenantAdminPass123!",
  "roleName": "tenant-admin",
  "tenantId": "abc-tenant-id"
}
```

### Workflow 2: Tenant Admin Managing Users

```bash
# 1. Tenant Admin logs in
POST /api/auth/login
Body: { "email": "admin@abc-lending.com", "password": "TenantAdminPass123!" }
Response: { "token": "tenant_jwt_token" }

# 2. Get their own profile
GET /api/users/tenant/me
Headers: { "Authorization": "Bearer tenant_jwt_token" }

# 3. List all tenant users
GET /api/users/tenant/users
Headers: { "Authorization": "Bearer tenant_jwt_token" }

# 4. Create a new loan officer
POST /api/users/tenant/users
Headers: { "Authorization": "Bearer tenant_jwt_token" }
Body: {
  "email": "officer@abc-lending.com",
  "firstName": "Juan",
  "lastName": "Officer",
  "password": "OfficerPass123!",
  "roleName": "Loan Officer"
}

# 5. Create a customer
POST /api/customers/
Headers: { "Authorization": "Bearer tenant_jwt_token" }
Body: {
  "firstName": "Maria",
  "lastName": "Santos",
  "email": "maria@example.com",
  "phone": "09987654321",
  "address": "456 Oak Ave"
}
```

### Workflow 3: Loan Officer Managing Customers

```bash
# 1. Loan Officer logs in
POST /api/auth/login
Body: { "email": "officer@abc-lending.com", "password": "OfficerPass123!" }
Response: { "token": "officer_token" }

# 2. View all customers in tenant
GET /api/customers/
Headers: { "Authorization": "Bearer officer_token" }

# 3. Get customer details
GET /api/customers/{customerId}
Headers: { "Authorization": "Bearer officer_token" }

# 4. Update customer info
PUT /api/customers/{customerId}
Headers: { "Authorization": "Bearer officer_token" }
Body: { "email": "maria.santos@example.com" }

# Note: Cannot create/delete customers (no manage_customers permission)
```

---

## 8. Security Considerations

### Authentication
- JWT tokens required for all protected endpoints
- Tokens include user ID, role, and scope
- Tokens verified on every request

### Authorization
- Two-level scope system (platform/tenant)
- Permission-based access control
- Role hierarchy enforced

### Data Isolation
- Tenant middleware ensures data is scoped to tenant
- Query parameters include tenant_id filters
- No cross-tenant data access possible

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Password reset endpoints available
- No plaintext password storage

---

## 9. Error Handling

### Common Error Responses

```javascript
// 401 Unauthorized - No token provided
{ "error": "No token provided" }

// 401 Unauthorized - Invalid token
{ "error": "Invalid token" }

// 403 Forbidden - Insufficient permissions
{ "error": "Insufficient permissions. Required: manage_customers" }

// 403 Forbidden - Wrong scope
{ "error": "Access denied. Required scope: platform, your scope: tenant" }

// 404 Not Found - Resource not found
{ "error": "Customer not found" }

// 400 Bad Request - Validation error
{ "error": "Missing required fields: email, firstName, lastName" }

// 500 Internal Server Error - Server error
{ "error": "Failed to create customer" }
```

---

## 10. Database Requirements

### Required Tables
- `users` - User accounts
- `roles` - User roles
- `permissions` - System permissions
- `role_permissions` - Role-permission mappings
- `tenants` - Tenant organizations
- `tenant_features` - Module enablement per tenant
- `tenant_settings` - Tenant-specific settings
- `customers` - Customer records
- `addresses` - Address information
- `loans` - Loan records (for customer module)

### Schema Requirements
Refer to the database migrations for exact schema definitions.

---

## 11. Logging & Debugging

### RBAC Logging
Enable detailed RBAC logging:

```bash
[RBAC] Checking permission: manage_customers for user: officer@abc-lending.com, scope: tenant
[RBAC] ✅ Permission granted: manage_customers
```

### Tenant Isolation Logging
```bash
[TENANT_ISOLATION] User tenant_id: abc-tenant-id
[TENANT_ISOLATION] ✅ Tenant access allowed
```

---

## 12. Testing Checklist

- [ ] Super Admin can list all users across tenants
- [ ] Super Admin can create/update/delete users
- [ ] Tenant Admin can only see their own tenant's users
- [ ] Tenant Admin can create/manage users in their tenant
- [ ] Tenant Admin cannot create platform admin users
- [ ] Loan Officer can view customers
- [ ] Loan Officer cannot delete users
- [ ] Cashier cannot manage customers
- [ ] Tenant cannot access another tenant's data
- [ ] Module access restrictions work (money-loan, pawnshop, bnpl)
- [ ] Permissions are correctly enforced
- [ ] Password reset works
- [ ] User status toggle works

---

## 13. Future Enhancements

1. **Audit Logging** - Track all user actions
2. **Two-Factor Authentication** - Additional security layer
3. **Role Customization** - Allow tenants to create custom roles
4. **Permission Templates** - Pre-defined permission sets
5. **Bulk Operations** - Create/update multiple users at once
6. **Tenant Invitations** - Invite users via email
7. **Session Management** - Track active sessions
8. **IP Whitelisting** - Restrict access by IP address
9. **Activity Logs** - User activity tracking per tenant
10. **Export Functionality** - Export user lists and reports

---

## 14. Support & Maintenance

For issues or questions:
1. Check the error response for specific error messages
2. Review the RBAC and tenant isolation middleware logs
3. Verify user roles and permissions are set correctly
4. Ensure module features are enabled for the tenant
5. Check JWT token validity and expiration

---

**Last Updated:** October 20, 2025
**Version:** 1.0
