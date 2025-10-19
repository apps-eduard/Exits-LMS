# Exits LMS - API Examples & cURL Commands

## Quick Reference for Testing Endpoints

---

## 1. Authentication

### Login as Super Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@exits-lms.com",
    "password": "admin123"
  }'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "email": "admin@exits-lms.com", ... }
# }
```

### Login as Tenant Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "demo123"
  }'
```

### Set Bearer Token
```bash
# For subsequent requests, use:
# -H "Authorization: Bearer <token_from_login>"

ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Users Management

### Super Admin - List All Users
```bash
curl -X GET "http://localhost:3000/api/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Query parameters:
# ?search=john&role=Loan%20Officer&status=active
```

### Super Admin - Create User
```bash
curl -X POST http://localhost:3000/api/users/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "phone": "09123456789",
    "password": "SecurePass123!",
    "roleName": "Super Admin",
    "tenantId": null,
    "street_address": "123 Main St",
    "barangay": "Barangay 1",
    "city": "Manila",
    "province": "Metro Manila",
    "region": "NCR",
    "postal_code": "1000",
    "country": "Philippines"
  }'
```

### Super Admin - Get User by ID
```bash
curl -X GET "http://localhost:3000/api/users/USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Super Admin - Update User
```bash
curl -X PUT "http://localhost:3000/api/users/USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "firstName": "Juan",
    "lastName": "Santos",
    "phone": "09198765432"
  }'
```

### Super Admin - Toggle User Status
```bash
curl -X PATCH "http://localhost:3000/api/users/USER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Super Admin - Reset User Password
```bash
curl -X POST "http://localhost:3000/api/users/USER_ID/reset-password" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePass123!"
  }'
```

### Super Admin - Delete User
```bash
curl -X DELETE "http://localhost:3000/api/users/USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 3. Tenant User Management

### Tenant Admin - Get Current Profile
```bash
TENANT_TOKEN="tenant_jwt_token_here"

curl -X GET "http://localhost:3000/api/users/tenant/me" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"
```

### Tenant Admin - List Tenant Users
```bash
curl -X GET "http://localhost:3000/api/users/tenant/users" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"

# Query parameters:
# ?search=john&role=Loan%20Officer&status=active
```

### Tenant Admin - Create Tenant User
```bash
curl -X POST "http://localhost:3000/api/users/tenant/users" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@demo.com",
    "firstName": "Loan",
    "lastName": "Officer",
    "phone": "09123456789",
    "password": "LoanOfficerPass123!",
    "roleName": "Loan Officer",
    "street_address": "456 Oak Ave",
    "barangay": "Barangay 2",
    "city": "Makati"
  }'
```

### Tenant Admin - Get Tenant User
```bash
curl -X GET "http://localhost:3000/api/users/tenant/users/USER_ID" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"
```

### Tenant Admin - Update Tenant User
```bash
curl -X PUT "http://localhost:3000/api/users/tenant/users/USER_ID" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "roleName": "Cashier",
    "password": "NewPass123!"
  }'
```

### Tenant Admin - Toggle Tenant User Status
```bash
curl -X PATCH "http://localhost:3000/api/users/tenant/users/USER_ID/status" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Tenant Admin - Delete Tenant User
```bash
curl -X DELETE "http://localhost:3000/api/users/tenant/users/USER_ID" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Roles
```bash
curl -X GET "http://localhost:3000/api/users/roles/list" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 4. Customers Management

### Tenant User - List Customers
```bash
LOAN_OFFICER_TOKEN="loan_officer_token_here"

curl -X GET "http://localhost:3000/api/customers/" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json"

# Query parameters:
# ?search=juan&status=active
```

### Tenant User - Get Customer Details
```bash
curl -X GET "http://localhost:3000/api/customers/CUSTOMER_ID" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json"
```

### Tenant User - Create Customer
```bash
curl -X POST "http://localhost:3000/api/customers/" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "dela Cruz",
    "email": "juan@example.com",
    "phone": "09123456789",
    "address": "123 Main St, Manila",
    "idNumber": "123-456-789-000"
  }'
```

### Tenant User - Update Customer
```bash
curl -X PUT "http://localhost:3000/api/customers/CUSTOMER_ID" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan.delacruz@example.com",
    "phone": "09198765432",
    "status": "active"
  }'
```

### Tenant User - Delete Customer
```bash
curl -X DELETE "http://localhost:3000/api/customers/CUSTOMER_ID" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json"

# Note: Will fail if customer has active loans
```

### Tenant User - Get Customer Summary
```bash
curl -X GET "http://localhost:3000/api/customers/stats/summary" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json"

# Response:
# {
#   "success": true,
#   "summary": {
#     "total_customers": 150,
#     "active_customers": 140,
#     "inactive_customers": 10,
#     "total_loans": 200,
#     "active_loans": 180,
#     "total_outstanding": 1250000.00
#   }
# }
```

---

## 5. Tenant Settings

### Tenant Admin - Get Tenant Settings
```bash
curl -X GET "http://localhost:3000/api/settings/tenant/settings" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"
```

### Tenant Admin - Update Tenant Settings
```bash
curl -X PUT "http://localhost:3000/api/settings/tenant/settings" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "business_hours": {
        "open": "08:00",
        "close": "18:00"
      },
      "loan_processing_days": 5,
      "notifications_enabled": true,
      "language": "en"
    }
  }'
```

### Tenant Admin - Get Branding
```bash
curl -X GET "http://localhost:3000/api/settings/tenant/branding" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"
```

### Tenant Admin - Update Branding
```bash
curl -X PUT "http://localhost:3000/api/settings/tenant/branding" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Company",
    "logoUrl": "https://example.com/new-logo.png",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d"
  }'
```

---

## 6. Tenants Management

### Super Admin - Create Tenant
```bash
curl -X POST "http://localhost:3000/api/tenants/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Lending Co.",
    "subdomain": "abc-lending",
    "contactFirstName": "Maria",
    "contactLastName": "Garcia",
    "contactEmail": "maria@abclending.com",
    "contactPhone": "09123456789",
    "subscriptionPlan": "professional",
    "street_address": "789 Business Ave",
    "city": "Makati",
    "province": "Metro Manila"
  }'
```

### Super Admin - Get Tenant Details
```bash
curl -X GET "http://localhost:3000/api/tenants/TENANT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Tenant Admin - Get Own Tenant Details
```bash
curl -X GET "http://localhost:3000/api/tenants/TENANT_ID" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json"

# Can only access their own tenant
```

### Super Admin - Update Tenant
```bash
curl -X PUT "http://localhost:3000/api/tenants/TENANT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Lending Co. Updated",
    "contactEmail": "newemail@abclending.com",
    "subscriptionPlan": "enterprise"
  }'
```

### Super Admin - Toggle Module for Tenant
```bash
curl -X POST "http://localhost:3000/api/tenants/TENANT_ID/modules" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleName": "money-loan",
    "isEnabled": true
  }'

# Available modules: money-loan, pawnshop, bnpl
```

### Super Admin - Get Tenant Users
```bash
curl -X GET "http://localhost:3000/api/tenants/TENANT_ID/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 7. Error Examples

### Missing Authorization Header
```bash
curl -X GET "http://localhost:3000/api/users/"

# Response (401):
# { "error": "No token provided" }
```

### Invalid Token
```bash
curl -X GET "http://localhost:3000/api/users/" \
  -H "Authorization: Bearer invalid_token"

# Response (401):
# { "error": "Invalid token" }
```

### Insufficient Permissions
```bash
# Loan Officer trying to create user
curl -X POST "http://localhost:3000/api/users/tenant/users" \
  -H "Authorization: Bearer $LOAN_OFFICER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# Response (403):
# { "error": "Insufficient permissions. Required: manage_users" }
```

### Wrong Scope
```bash
# Tenant user trying to access platform route
curl -X GET "http://localhost:3000/api/users/" \
  -H "Authorization: Bearer $TENANT_TOKEN"

# Response (403):
# { "error": "Access denied. Required scope: platform, your scope: tenant" }
```

### Not Found
```bash
curl -X GET "http://localhost:3000/api/customers/nonexistent_id" \
  -H "Authorization: Bearer $TOKEN"

# Response (404):
# { "error": "Customer not found" }
```

### Validation Error
```bash
curl -X POST "http://localhost:3000/api/users/tenant/users" \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John"
    # Missing required fields
  }'

# Response (400):
# { "error": "Missing required fields: email, firstName, lastName, password, roleName" }
```

---

## 8. Postman Collection

You can import this as a Postman collection. Save as `exits-lms-api.json`:

```json
{
  "info": {
    "name": "Exits LMS API",
    "description": "Complete API collection for Exits LMS",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login - Admin",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@exits-lms.com\",\"password\":\"admin123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 9. Environment Variables

For easier testing, set these environment variables:

```bash
# Super Admin
export ADMIN_TOKEN="<super_admin_jwt_token>"
export ADMIN_EMAIL="admin@exits-lms.com"
export ADMIN_PASSWORD="admin123"

# Tenant Admin
export TENANT_TOKEN="<tenant_admin_jwt_token>"
export TENANT_EMAIL="admin@demo.com"
export TENANT_PASSWORD="demo123"
export TENANT_ID="<tenant_uuid>"

# Loan Officer
export OFFICER_TOKEN="<loan_officer_jwt_token>"
export OFFICER_EMAIL="officer@demo.com"
export OFFICER_PASSWORD="<password>"

# API Base URL
export API_BASE="http://localhost:3000/api"
```

Then use them:
```bash
curl -X GET "$API_BASE/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 10. Testing Workflow

### 1. Test Super Admin Access
```bash
# Login
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | jq -r '.token')

# List all users
curl -X GET "$API_BASE/users/" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test Tenant Admin Access
```bash
# Login
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TENANT_EMAIL\",\"password\":\"$TENANT_PASSWORD\"}" \
  | jq -r '.token')

# List tenant users
curl -X GET "$API_BASE/users/tenant/users" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Loan Officer Access
```bash
# Login
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$OFFICER_EMAIL\",\"password\":\"$OFFICER_PASSWORD\"}" \
  | jq -r '.token')

# List customers
curl -X GET "$API_BASE/customers/" \
  -H "Authorization: Bearer $TOKEN"

# Try to list users (should fail)
curl -X GET "$API_BASE/users/tenant/users" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 11. Common Issues & Solutions

### Issue: 401 Unauthorized on valid token
**Solution:** Check if token has expired. Re-login and get a new token.

### Issue: 403 Forbidden - Access Denied
**Solution:** Verify user has correct permissions and role scope.

### Issue: 404 Not Found
**Solution:** Verify the resource ID is correct and exists in the database.

### Issue: 400 Bad Request
**Solution:** Check request body format and ensure all required fields are present.

### Issue: Module not enabled error
**Solution:** Enable the required module for the tenant first:
```bash
POST /api/tenants/{tenantId}/modules
{ "moduleName": "money-loan", "isEnabled": true }
```

---

**Last Updated:** October 20, 2025  
**API Version:** 1.0
