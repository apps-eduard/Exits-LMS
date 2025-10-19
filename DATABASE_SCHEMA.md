# Exits LMS - Database Schema

## Database: exits_lms

### Overview
This database supports a multi-tenant SaaS platform with two main modules:
- **Money-Loan**: Traditional loan management
- **BNPL**: Buy-Now-Pay-Later installment management

## Core Tables

### tenants
Stores tenant organization information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Tenant unique identifier |
| name | VARCHAR(255) | Tenant organization name |
| subdomain | VARCHAR(100) UNIQUE | Subdomain for tenant |
| contact_email | VARCHAR(255) | Primary contact email |
| contact_phone | VARCHAR(50) | Contact phone number |
| status | VARCHAR(50) | active, inactive, suspended |
| trial_ends_at | TIMESTAMP | Trial period end date |
| subscription_plan | VARCHAR(100) | Current subscription plan |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

### roles
Defines user roles with scope (platform/tenant).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Role unique identifier |
| name | VARCHAR(100) | Role name |
| scope | VARCHAR(50) | 'platform' or 'tenant' |
| description | TEXT | Role description |
| created_at | TIMESTAMP | Record creation date |

**Default Roles:**
- Super Admin (platform scope)
- Tenant Admin (tenant scope)
- Loan Officer (tenant scope)
- Cashier (tenant scope)

### permissions
Defines granular permissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Permission unique identifier |
| name | VARCHAR(100) UNIQUE | Permission identifier |
| resource | VARCHAR(100) | Resource type (tenants, loans, etc) |
| action | VARCHAR(50) | Action type (view, manage, etc) |
| description | TEXT | Permission description |
| created_at | TIMESTAMP | Record creation date |

**Example Permissions:**
- manage_tenants
- view_customers
- manage_loans
- process_payments

### role_permissions
Junction table for role-permission relationships.

| Column | Type | Description |
|--------|------|-------------|
| role_id | UUID FK | References roles(id) |
| permission_id | UUID FK | References permissions(id) |

**Primary Key:** (role_id, permission_id)

### users
Stores all platform and tenant users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | User unique identifier |
| tenant_id | UUID FK NULL | References tenants(id), NULL for platform users |
| role_id | UUID FK | References roles(id) |
| email | VARCHAR(255) | User email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| first_name | VARCHAR(100) | User first name |
| last_name | VARCHAR(100) | User last name |
| phone | VARCHAR(50) | Contact phone |
| is_active | BOOLEAN | Account active status |
| last_login | TIMESTAMP | Last login timestamp |
| created_at | TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | Last update date |

**Constraints:**
- UNIQUE(email, tenant_id) - Email unique per tenant
- tenant_id NULL = Platform user (Super Admin)
- tenant_id NOT NULL = Tenant user

### tenant_features
Controls module access per tenant (feature gating).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Feature record identifier |
| tenant_id | UUID FK | References tenants(id) |
| module_name | VARCHAR(100) | 'money-loan' or 'bnpl' |
| is_enabled | BOOLEAN | Module enabled status |
| enabled_at | TIMESTAMP | When module was enabled |
| created_at | TIMESTAMP | Record creation date |

**Constraints:**
- UNIQUE(tenant_id, module_name)

---

## Money-Loan Module Tables

### customers
Stores customer information for loans.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Customer unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| first_name | VARCHAR(100) | Customer first name |
| last_name | VARCHAR(100) | Customer last name |
| email | VARCHAR(255) | Customer email |
| phone | VARCHAR(50) | Contact phone |
| address | TEXT | Physical address |
| id_number | VARCHAR(100) | National ID or passport |
| status | VARCHAR(50) | active, inactive |
| created_by | UUID FK | References users(id) |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

**Indexes:**
- idx_customers_tenant_id (tenant_id)

### loan_products
Defines loan product templates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Product unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| name | VARCHAR(255) | Product name |
| description | TEXT | Product description |
| min_amount | DECIMAL(15,2) | Minimum loan amount |
| max_amount | DECIMAL(15,2) | Maximum loan amount |
| interest_rate | DECIMAL(5,2) | Interest rate percentage |
| term_months | INTEGER | Loan term in months |
| is_active | BOOLEAN | Product active status |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

### loans
Stores individual loan records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Loan unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| customer_id | UUID FK | References customers(id) |
| loan_product_id | UUID FK | References loan_products(id) |
| loan_number | VARCHAR(100) UNIQUE | Unique loan number |
| principal_amount | DECIMAL(15,2) | Original loan amount |
| interest_rate | DECIMAL(5,2) | Applied interest rate |
| term_months | INTEGER | Loan term |
| total_amount | DECIMAL(15,2) | Total amount to repay |
| outstanding_balance | DECIMAL(15,2) | Current outstanding balance |
| status | VARCHAR(50) | pending, active, paid, defaulted |
| disbursement_date | DATE | When loan was disbursed |
| maturity_date | DATE | When loan is due |
| approved_by | UUID FK | References users(id) |
| approved_at | TIMESTAMP | Approval timestamp |
| created_by | UUID FK | References users(id) |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

**Indexes:**
- idx_loans_tenant_id (tenant_id)
- idx_loans_customer_id (customer_id)

### loan_payments
Tracks loan repayments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Payment unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| loan_id | UUID FK | References loans(id) |
| payment_number | VARCHAR(100) UNIQUE | Unique payment receipt number |
| amount | DECIMAL(15,2) | Payment amount |
| payment_date | DATE | Payment date |
| payment_method | VARCHAR(50) | cash, bank_transfer, etc |
| reference_number | VARCHAR(255) | External reference |
| notes | TEXT | Additional notes |
| recorded_by | UUID FK | References users(id) |
| created_at | TIMESTAMP | Record creation date |

**Indexes:**
- idx_loan_payments_tenant_id (tenant_id)
- idx_loan_payments_loan_id (loan_id)

---

## BNPL Module Tables

### bnpl_merchants
Stores merchant information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Merchant unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| business_name | VARCHAR(255) | Merchant business name |
| contact_person | VARCHAR(255) | Contact person name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(50) | Contact phone |
| address | TEXT | Business address |
| commission_rate | DECIMAL(5,2) | Commission percentage |
| status | VARCHAR(50) | active, inactive |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

### bnpl_orders
Stores BNPL order records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Order unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| customer_id | UUID FK | References customers(id) |
| merchant_id | UUID FK | References bnpl_merchants(id) |
| order_number | VARCHAR(100) UNIQUE | Unique order number |
| total_amount | DECIMAL(15,2) | Total order amount |
| down_payment | DECIMAL(15,2) | Initial down payment |
| financed_amount | DECIMAL(15,2) | Amount to be paid in installments |
| outstanding_balance | DECIMAL(15,2) | Current outstanding balance |
| installment_count | INTEGER | Number of installments |
| installment_amount | DECIMAL(15,2) | Amount per installment |
| interest_rate | DECIMAL(5,2) | Interest rate if applicable |
| status | VARCHAR(50) | pending, active, completed, cancelled |
| order_date | DATE | Order creation date |
| first_payment_date | DATE | First installment due date |
| created_by | UUID FK | References users(id) |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Last update date |

**Indexes:**
- idx_bnpl_orders_tenant_id (tenant_id)

### bnpl_payments
Tracks BNPL installment payments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Payment unique identifier |
| tenant_id | UUID FK | References tenants(id) |
| order_id | UUID FK | References bnpl_orders(id) |
| payment_number | VARCHAR(100) UNIQUE | Unique payment receipt |
| installment_number | INTEGER | Which installment (1, 2, 3...) |
| amount | DECIMAL(15,2) | Payment amount |
| payment_date | DATE | Actual payment date |
| due_date | DATE | Scheduled due date |
| payment_method | VARCHAR(50) | Payment method |
| reference_number | VARCHAR(255) | External reference |
| status | VARCHAR(50) | paid, pending, overdue |
| notes | TEXT | Additional notes |
| recorded_by | UUID FK | References users(id) |
| created_at | TIMESTAMP | Record creation date |

**Indexes:**
- idx_bnpl_payments_tenant_id (tenant_id)

---

## Audit & Logging

### audit_logs
Comprehensive audit trail for all system actions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Log entry unique identifier |
| tenant_id | UUID FK NULL | References tenants(id), NULL for platform actions |
| user_id | UUID FK | References users(id) |
| action | VARCHAR(100) | Action performed |
| resource | VARCHAR(100) | Resource affected |
| resource_id | UUID | ID of affected resource |
| details | JSONB | Additional details (JSON) |
| ip_address | VARCHAR(50) | User's IP address |
| user_agent | TEXT | User's browser/client info |
| created_at | TIMESTAMP | Action timestamp |

**Indexes:**
- idx_audit_logs_tenant_id (tenant_id)

**Example Log Entries:**
```json
{
  "action": "create_loan",
  "resource": "loans",
  "details": {
    "loan_id": "uuid",
    "customer_id": "uuid",
    "amount": 10000
  }
}
```

---

## Relationships Diagram (Text)

```
tenants
  ├── users (1:N)
  ├── tenant_features (1:N)
  ├── customers (1:N)
  ├── loan_products (1:N)
  ├── loans (1:N)
  ├── bnpl_merchants (1:N)
  ├── bnpl_orders (1:N)
  └── audit_logs (1:N)

roles
  ├── users (1:N)
  └── role_permissions (1:N)

permissions
  └── role_permissions (1:N)

customers
  ├── loans (1:N)
  └── bnpl_orders (1:N)

loans
  └── loan_payments (1:N)

bnpl_orders
  └── bnpl_payments (1:N)
```

---

## Key Constraints & Rules

### Tenant Isolation
- All tenant-specific tables have `tenant_id` column
- Queries must filter by `tenant_id` (enforced by middleware)
- Platform users (tenant_id = NULL) can bypass isolation

### RBAC
- Users have one role
- Roles have many permissions
- Platform roles (scope='platform') for Super Admins
- Tenant roles (scope='tenant') for tenant users

### Module Access
- Modules enabled via `tenant_features` table
- Backend checks `is_enabled` before allowing operations
- Frontend hides disabled modules

### Data Integrity
- Foreign keys ensure referential integrity
- Cascade deletes where appropriate
- Check constraints on enum-like columns

---

## Performance Optimizations

### Indexes Created
- tenant_id on all tenant tables
- Foreign key columns
- Frequently queried columns (email, status, etc)

### Query Patterns
- Use tenant_id in WHERE clause for all tenant queries
- Join with roles and permissions for authorization
- Use audit_logs JSONB for flexible metadata

---

## Migrations

Create all tables:
```bash
npm run migrate
```

Seed initial data:
```bash
npm run seed
```

**Initial Seed Data:**
- Super Admin role and user
- Default tenant roles (Tenant Admin, Loan Officer, Cashier)
- Complete permissions set
- Demo tenant with both modules enabled
- Demo tenant admin user

---

## Environment Requirements

- PostgreSQL 12+
- UUID extension enabled
- JSONB support for audit_logs

---

**Last Updated:** 2025-10-19
**Database Version:** 1.0.0
