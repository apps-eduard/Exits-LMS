# Role & Permission Management Guide

## Overview

This document explains the **Role-Based Access Control (RBAC)** system, permission hierarchy, and role assignments in Exits LMS.

---

## Permission Hierarchy

### Parent → Child Relationship

Permissions follow a **hierarchical structure** where parent permissions grant broader access, and child permissions are subsets:

```
manage_tenants (Parent)
  ├── view_tenants (Child)
  ├── create_tenants (Child)
  ├── edit_tenants (Child)
  └── delete_tenants (Child)

manage_users (Parent)
  ├── view_users (Child)
  └── edit_users (Child)

manage_platform_settings (Parent)
  ├── view_platform_settings (Child)
  ├── edit_platform_settings (Child)
  └── export_settings (Child)

manage_menus (Parent)
  ├── view_menus (Child)
  └── edit_menus (Child)

manage_customers (Parent)
  └── view_customers (Child)

manage_loans (Parent)
  ├── approve_loans (Child)
  └── view_loans (Child)

process_payments (Parent)
  └── view_payments (Child)

manage_bnpl_orders (Parent)
  └── view_bnpl_orders (Child)
```

### Standalone Permissions

Some permissions don't have children and are standalone:
- `view_audit_logs`
- `manage_loan_products`
- `manage_bnpl_merchants`
- `view_reports`

---

## Role Definitions

### Platform Roles (Scope: `platform`)

Platform roles manage the entire system across all tenants.

#### 1. Super Admin
**Description:** Full platform access with all permissions

**Use Case:** System owner, platform administrator

**Permissions:** ALL (28 total)
- All tenant management permissions
- All user management permissions
- All platform settings permissions
- All menu management permissions
- All audit log access
- All tenant operational permissions (for debugging/support)

**Access Level:** 🔴 CRITICAL - Complete system control

---

#### 2. Support Staff
**Description:** Customer support and user assistance

**Use Case:** Help desk, customer service, user support team

**Permissions (12 total):**

| Permission | Reason |
|------------|--------|
| `view_tenants` | See tenant information for support |
| `view_users` | View user accounts |
| `edit_users` | Help users with account issues |
| `view_audit_logs` | Track user actions for support tickets |
| `view_platform_settings` | Reference system configuration |
| `view_menus` | Understand navigation structure |
| `view_customers` | Support tenant customer issues |
| `view_loans` | Check loan status for inquiries |
| `view_payments` | Verify payment information |
| `view_reports` | Generate support reports |

**Access Level:** 🟡 MEDIUM - Read-only with user support capabilities

**What Support Staff CANNOT Do:**
- ❌ Create/delete tenants
- ❌ Modify platform settings
- ❌ Edit menus
- ❌ Approve loans
- ❌ Process payments
- ❌ Manage customers

---

#### 3. Developer
**Description:** Technical support and system configuration

**Use Case:** Development team, DevOps, technical administrators

**Permissions (18 total):**

| Permission | Reason |
|------------|--------|
| `view_tenants` | Monitor tenant configurations |
| `manage_users` | Full user management for technical support |
| `view_users` | View user accounts |
| `edit_users` | Fix user account issues |
| `manage_platform_settings` | Configure system settings |
| `view_platform_settings` | View configurations |
| `edit_platform_settings` | Modify settings |
| `export_settings` | Backup/export configurations |
| `manage_menus` | Configure navigation |
| `view_menus` | View menu structure |
| `edit_menus` | Modify menu properties |
| `view_audit_logs` | Debug and trace issues |
| `view_customers` | Debug tenant issues |
| `view_loans` | Debug loan processing |
| `view_payments` | Debug payment issues |
| `view_bnpl_orders` | Debug BNPL functionality |
| `view_reports` | Technical analytics |

**Access Level:** 🟠 HIGH - Technical configuration access

**What Developers CANNOT Do:**
- ❌ Create/delete tenants (managed by Super Admin)
- ❌ Approve loans (business decision)
- ❌ Process payments (financial operation)
- ❌ Manage customers (tenant responsibility)

---

### Tenant Roles (Scope: `tenant`)

Tenant roles operate within a specific tenant organization.

#### 4. Tenant Admin
**Description:** Full tenant management access

**Use Case:** Tenant organization administrator, business owner

**Permissions (18 total):**

| Category | Permissions |
|----------|-------------|
| **Users** | `manage_users`, `view_users`, `edit_users` |
| **Customers** | `manage_customers`, `view_customers` |
| **Loans** | `manage_loans`, `approve_loans`, `view_loans`, `manage_loan_products` |
| **Payments** | `process_payments`, `view_payments` |
| **BNPL** | `manage_bnpl_merchants`, `manage_bnpl_orders`, `view_bnpl_orders` |
| **Reports** | `view_reports` |
| **Audit** | `view_audit_logs` (tenant scope only) |

**Access Level:** 🔴 CRITICAL - Full tenant control

**What Tenant Admin CANNOT Do:**
- ❌ Access other tenants' data (realm isolation)
- ❌ Manage platform settings
- ❌ Create/delete tenants
- ❌ Modify system menus

---

#### 5. Loan Officer
**Description:** Loan and customer management

**Use Case:** Loan processing staff, credit analysts

**Permissions (11 total):**

| Category | Permissions | Reason |
|----------|-------------|--------|
| **Customers** | `manage_customers`, `view_customers` | Need to manage customer profiles for loan applications |
| **Loans** | `manage_loans`, `approve_loans`, `view_loans`, `manage_loan_products` | Primary responsibility - loan operations |
| **Payments** | `view_payments` | Check payment status, not process |
| **BNPL** | `manage_bnpl_orders`, `view_bnpl_orders` | Process BNPL applications |
| **Reports** | `view_reports` | Loan analytics and performance |

**Access Level:** 🟠 HIGH - Loan operations

**What Loan Officers CANNOT Do:**
- ❌ Process payments (Cashier's job)
- ❌ Manage users/staff
- ❌ Manage BNPL merchants (Admin only)
- ❌ Delete customers (Admin only)

---

#### 6. Cashier
**Description:** Payment processing and collection

**Use Case:** Cashiers, payment processors, collection staff

**Permissions (7 total):**

| Category | Permissions | Reason |
|----------|-------------|--------|
| **Customers** | `view_customers` | Verify customer identity |
| **Loans** | `view_loans` | See loan details for payments |
| **Payments** | `process_payments`, `view_payments` | Primary responsibility - payment processing |
| **BNPL** | `view_bnpl_orders` | Process BNPL payments |
| **Reports** | `view_reports` | Payment reconciliation reports |

**Access Level:** 🟡 MEDIUM - Payment operations

**What Cashiers CANNOT Do:**
- ❌ Create/edit customers
- ❌ Approve loans
- ❌ Manage loan products
- ❌ Manage BNPL orders/merchants
- ❌ Manage users

---

## Permission Breakdown by Resource

### Tenant Management (5 permissions)
- `manage_tenants` - Full tenant CRUD
- `view_tenants` - Read-only tenant access
- `create_tenants` - Create new tenants
- `edit_tenants` - Modify tenant info
- `delete_tenants` - Delete tenants

**Assigned To:**
- Super Admin: ALL
- Support Staff: view_tenants
- Developer: view_tenants

---

### User Management (3 permissions)
- `manage_users` - Full user CRUD
- `view_users` - Read-only user access
- `edit_users` - Modify user info

**Assigned To:**
- Super Admin: ALL
- Support Staff: view_users, edit_users
- Developer: ALL
- Tenant Admin: ALL (within tenant)

---

### Platform Settings (4 permissions)
- `manage_platform_settings` - Full settings CRUD
- `view_platform_settings` - Read-only settings
- `edit_platform_settings` - Modify settings
- `export_settings` - Export configuration

**Assigned To:**
- Super Admin: ALL
- Support Staff: view_platform_settings
- Developer: ALL

---

### Menu Management (3 permissions)
- `manage_menus` - Full menu CRUD
- `view_menus` - Read-only menu access
- `edit_menus` - Modify menu properties

**Assigned To:**
- Super Admin: ALL
- Support Staff: view_menus
- Developer: ALL

---

### Audit Logs (1 permission)
- `view_audit_logs` - View audit trail

**Assigned To:**
- Super Admin: YES
- Support Staff: YES
- Developer: YES
- Tenant Admin: YES (tenant scope only)

---

### Customer Management (2 permissions)
- `manage_customers` - Full customer CRUD
- `view_customers` - Read-only customer access

**Assigned To:**
- Super Admin: ALL (debugging)
- Support Staff: view_customers
- Developer: view_customers
- Tenant Admin: ALL
- Loan Officer: ALL
- Cashier: view_customers

---

### Loan Management (4 permissions)
- `manage_loans` - Full loan CRUD
- `approve_loans` - Approve/reject loans
- `view_loans` - Read-only loan access
- `manage_loan_products` - Manage loan products

**Assigned To:**
- Super Admin: ALL (debugging)
- Support Staff: view_loans
- Developer: view_loans
- Tenant Admin: ALL
- Loan Officer: ALL
- Cashier: view_loans

---

### Payment Management (2 permissions)
- `process_payments` - Process payment transactions
- `view_payments` - Read-only payment access

**Assigned To:**
- Super Admin: ALL (debugging)
- Support Staff: view_payments
- Developer: view_payments
- Tenant Admin: ALL
- Loan Officer: view_payments
- Cashier: ALL

---

### BNPL Management (3 permissions)
- `manage_bnpl_merchants` - Manage merchant accounts
- `manage_bnpl_orders` - Manage BNPL orders
- `view_bnpl_orders` - Read-only BNPL access

**Assigned To:**
- Super Admin: ALL (debugging)
- Developer: view_bnpl_orders
- Tenant Admin: ALL
- Loan Officer: manage_bnpl_orders, view_bnpl_orders
- Cashier: view_bnpl_orders

---

### Reports (1 permission)
- `view_reports` - Access reports and analytics

**Assigned To:**
- Super Admin: YES
- Support Staff: YES
- Developer: YES
- Tenant Admin: YES
- Loan Officer: YES
- Cashier: YES

---

## Permission Matrix

| Permission | Super Admin | Support Staff | Developer | Tenant Admin | Loan Officer | Cashier |
|------------|:-----------:|:-------------:|:---------:|:------------:|:------------:|:-------:|
| **Tenant Management** |
| manage_tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_tenants | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| create_tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| edit_tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| delete_tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Management** |
| manage_users | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| view_users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| edit_users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Platform Settings** |
| manage_platform_settings | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| view_platform_settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| edit_platform_settings | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| export_settings | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Menu Management** |
| manage_menus | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| view_menus | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| edit_menus | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Audit & Compliance** |
| view_audit_logs | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ |
| **Customer Management** |
| manage_customers | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| view_customers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Loan Management** |
| manage_loans | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| approve_loans | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| view_loans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manage_loan_products | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Payment Management** |
| process_payments | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| view_payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **BNPL Management** |
| manage_bnpl_merchants | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| manage_bnpl_orders | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| view_bnpl_orders | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Reports** |
| view_reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ = Has permission
- ❌ = No permission
- ✅* = Tenant scope only (not platform-wide)

---

## Database Schema

### Tables

```sql
-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  scope VARCHAR(20) NOT NULL, -- 'platform' or 'tenant'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission Junction
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

---

## How to Re-seed Permissions

### 1. Clear and Re-seed All Data
```bash
cd backend
npm run seed
```

This will:
1. Create all roles
2. Create all permissions
3. Assign permissions to roles with proper logic
4. Create demo users

### 2. Verify Role Permissions
```bash
# Query all permissions for a role
psql -U postgres -d exits_lms -c "
SELECT r.name as role, p.name as permission, p.resource, p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'Loan Officer'
ORDER BY p.resource, p.action;
"
```

---

## Security Best Practices

### 1. Principle of Least Privilege
- Users should only have permissions necessary for their job
- Start with minimal permissions and add as needed
- Review permissions regularly

### 2. Separation of Duties
- Payment processors ≠ Loan approvers
- Developers ≠ Business decision makers
- Support staff ≠ System administrators

### 3. Scope Isolation
- Platform roles cannot access tenant data (unless debugging with Super Admin)
- Tenant roles cannot access other tenants (realm isolation)
- Always filter by tenant_id in queries

### 4. Audit Trail
- All actions should be logged with user, timestamp, action
- `view_audit_logs` permission required to see logs
- Audit logs are immutable (no DELETE permission)

---

## Testing Permissions

### Login Credentials

**Super Admin (Platform):**
- Email: `admin@exits-lms.com`
- Password: `admin123`
- Can access all features

**Tenant Admin (Demo Company):**
- Email: `admin@demo.com`
- Password: `demo123`
- Can access all tenant features

**Support Staff (Create manually):**
- Use role: "Support Staff"
- Should see view-only access with user support capabilities

**Developer (Create manually):**
- Use role: "Developer"
- Should see technical configuration access

**Loan Officer (Create manually within tenant):**
- Use role: "Loan Officer"
- Should see loan and customer management

**Cashier (Create manually within tenant):**
- Use role: "Cashier"
- Should see payment processing

---

## Troubleshooting

### Issue: User can't access expected features

**Solution:**
1. Check role assignment: `SELECT role_id FROM users WHERE email = 'user@example.com';`
2. Check role permissions: See verification query above
3. Check scope: Platform users can't access tenant features and vice versa
4. Check RBAC middleware logs in backend console

### Issue: Too many permissions assigned

**Solution:**
1. Re-run seed script: `npm run seed`
2. Manually remove permissions:
```sql
DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Cashier')
AND permission_id = (SELECT id FROM permissions WHERE name = 'approve_loans');
```

### Issue: Missing permissions

**Solution:**
1. Add permission to database
2. Assign to role via API or database
3. Restart backend to refresh permission cache

---

**Last Updated:** October 20, 2025  
**Version:** 2.0 - Comprehensive Permission Logic
