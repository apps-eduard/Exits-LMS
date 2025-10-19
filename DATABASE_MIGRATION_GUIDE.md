# Database Migration & Setup Guide

## Overview

The Exits LMS project uses an automated migration system to set up the database with all required tables, indexes, and relationships.

## Prerequisites

Before running migrations, ensure:

1. **PostgreSQL is installed and running**
   ```bash
   psql --version  # Verify PostgreSQL
   ```

2. **Database `exits_lms` exists**
   ```bash
   psql -U postgres
   CREATE DATABASE exits_lms;
   \q
   ```

3. **Backend `.env.local` is configured**
   ```bash
   cp backend/.env.example backend/.env.local
   
   # Edit backend/.env.local with your credentials:
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_NAME=exits_lms
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   ```

## Migration Files

### Location
- **Migrations:** `backend/scripts/migrate.js`
- **Seeds:** `backend/scripts/seed.js`
- **Database Config:** `backend/config/database.js`

## Running Migrations

### Automated Setup (Recommended)
The `setup.ps1` script runs all migrations automatically:

```powershell
# Windows
.\setup.ps1

# Runs:
# 1. npm install (backend & frontend)
# 2. npm run migrate (creates all tables)
# 3. npm run seed (populates initial data)
```

### Manual Migrations

**Step 1: Install dependencies**
```bash
cd backend
npm install
```

**Step 2: Run migrations**
```bash
npm run migrate

# Expected output:
# 🔧 Creating database tables...
# ✅ All tables created successfully
```

**Step 3: Seed initial data**
```bash
npm run seed

# Expected output:
# 🌱 Seeding database...
# ✅ Roles created
# ✅ Permissions created
# ✅ Role permissions assigned
# ✅ Super Admin created
# ✅ Demo tenant created
# ✅ Database seeded successfully
```

## What Gets Created

### Tables
The migration creates 14 tables:

1. **tenants** - Tenant organizations
2. **roles** - Role definitions
3. **permissions** - Permission definitions
4. **role_permissions** - Role-permission junction
5. **users** - System users
6. **tenant_features** - Module access control
7. **customers** - Customer records
8. **loan_products** - Loan product definitions
9. **loans** - Loan transactions
10. **loan_payments** - Payment records
11. **bnpl_merchants** - BNPL merchant records
12. **bnpl_orders** - BNPL order records
13. **bnpl_payments** - BNPL payment records
14. **audit_logs** - Activity tracking

### Indexes
Performance indexes are created on:
- users (tenant_id, email)
- customers (tenant_id)
- loans (tenant_id, customer_id)
- loan_payments (tenant_id, loan_id)
- bnpl_orders (tenant_id)
- bnpl_payments (tenant_id)
- audit_logs (tenant_id)

### Initial Data
The seed creates:

**Roles (4):**
- Super Admin (platform scope)
- tenant-admin (tenant scope)
- Loan Officer (tenant scope)
- Cashier (tenant scope)

**Permissions (16):**
- Platform permissions (manage_tenants, view_audit_logs, manage_platform_settings)
- Tenant permissions (manage_users, manage_customers, manage_loans, etc.)

**Users (2):**
- Super Admin: `admin@exits-lms.com` / `admin123`
- Demo Tenant Admin: `admin@demo.com` / `demo123`

**Tenant (1):**
- Demo Company (demo.exits-lms.com)
- Modules enabled: Money-Loan, BNPL

## Troubleshooting

### Error: "Database does not exist"
```bash
# Create the database
psql -U postgres
CREATE DATABASE exits_lms;
\q

# Then run migration again
npm run migrate
```

### Error: "connect ECONNREFUSED"
```bash
# PostgreSQL is not running
# Start PostgreSQL service:

# Windows (as Administrator):
net start postgresql-x64-15

# macOS (using Homebrew):
brew services start postgresql

# Ubuntu/Linux:
sudo systemctl start postgresql
```

### Error: "role postgres does not exist"
```bash
# Create the PostgreSQL role
psql -U postgres
CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres';
ALTER ROLE postgres SUPERUSER;
\q
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
```bash
# PostgreSQL credentials are wrong
# Verify in backend/.env.local:
# - DB_HOST
# - DB_PORT
# - DB_USER
# - DB_PASSWORD

# Then try again:
npm run migrate
```

### Migration runs but seed fails
```bash
# Check the error message
# Common issue: Duplicate data from previous run
# Solution: Drop and recreate the database

psql -U postgres
DROP DATABASE exits_lms;
CREATE DATABASE exits_lms;
\q

# Then run both again:
npm run migrate
npm run seed
```

## Resetting Database

To completely reset the database:

```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Drop the database
DROP DATABASE IF EXISTS exits_lms;

# 3. Create a new database
CREATE DATABASE exits_lms;

# 4. Exit psql
\q

# 5. Run migrations again
cd backend
npm run migrate
npm run seed
```

## Verifying Migration

After successful migration, verify the setup:

```bash
# Connect to the database
psql -U postgres -d exits_lms

# List all tables
\dt

# Should show 14 tables:
# audit_logs, bnpl_merchants, bnpl_orders, bnpl_payments,
# customers, loan_payments, loan_products, loans,
# permissions, role_permissions, roles, tenant_features,
# tenants, users

# Count users (should be 2)
SELECT COUNT(*) FROM users;

# Count roles (should be 4)
SELECT COUNT(*) FROM roles;

# Count permissions (should be 16)
SELECT COUNT(*) FROM permissions;

# Exit psql
\q
```

## Database Schema

### Key Relationships
```
tenants
├── users (tenant_id, one-to-many)
├── customers (tenant_id, one-to-many)
├── loans (tenant_id, one-to-many)
├── tenant_features (tenant_id, one-to-many)
├── bnpl_merchants (tenant_id, one-to-many)
└── audit_logs (tenant_id, one-to-many)

roles
├── users (role_id, one-to-many)
└── role_permissions (role_id, one-to-many)

permissions
└── role_permissions (permission_id, one-to-many)

customers
└── loans (customer_id, one-to-many)
   └── loan_payments (loan_id, one-to-many)

bnpl_merchants
└── bnpl_orders (merchant_id, one-to-many)
   └── bnpl_payments (order_id, one-to-many)
```

## Environment Variables

Required in `backend/.env.local`:

```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exits_lms
DB_USER=postgres
DB_PASSWORD=your_password

# Node
NODE_ENV=development

# JWT (used by seed script)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000

# CORS
FRONTEND_URL=http://localhost:4200
```

## Next Steps

After successful migration:

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Login with default credentials:**
   - Super Admin: `admin@exits-lms.com` / `admin123`
   - Demo Tenant: `admin@demo.com` / `demo123`

4. **Change passwords immediately in production!**

## Production Deployment

For production:

1. **Use production database credentials** in `.env` (not `.env.local`)
2. **Use strong JWT secrets** - generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Use strong database password**
4. **Enable SSL for database connection** (optional)
5. **Regular backups** - implement backup strategy
6. **Monitor performance** - check indexes and query performance

---

**Need help?** Check [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) or [GITHUB_PUSH_GUIDE.md](./GITHUB_PUSH_GUIDE.md).
