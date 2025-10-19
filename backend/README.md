# Exits Loan Management SaaS - Backend API

Multi-Tenant Loan Management platform supporting Money-Loan and BNPL (Buy-Now-Pay-Later) modules with comprehensive RBAC.

## Features

- **Multi-Tenant Architecture** with strict tenant isolation
- **JWT Authentication** with refresh tokens
- **Role-Based Access Control (RBAC)** with platform and tenant scopes
- **Module-Based Feature Gating** (Money-Loan, BNPL)
- **Comprehensive Audit Logging**
- **PostgreSQL** database with optimized queries
- **Security** features: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE exits_lms;
```

4. Run migrations:
```bash
npm run migrate
```

5. Seed initial data:
```bash
npm run seed
```

## Default Credentials

### Super Admin (Platform Access)
- Email: `admin@exits-lms.com`
- Password: `admin123`

### Demo Tenant Admin
- Email: `admin@demo.com`
- Password: `demo123`
- Tenant: Demo Company

**⚠️ Change these passwords in production!**

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server runs on `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Tenants (Super Admin Only)
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/:id` - Get tenant details
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/:id` - Update tenant
- `POST /api/tenants/:id/modules` - Toggle tenant modules
- `GET /api/tenants/:id/users` - Get tenant users

### Customers (Money-Loan Module)
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Database Schema

### Core Tables
- `tenants` - Tenant organizations
- `users` - Platform and tenant users
- `roles` - Role definitions (platform/tenant scope)
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mappings
- `tenant_features` - Module access control per tenant

### Money-Loan Module
- `customers` - Customer information
- `loan_products` - Loan product definitions
- `loans` - Loan records
- `loan_payments` - Payment transactions

### BNPL Module
- `bnpl_merchants` - Merchant records
- `bnpl_orders` - BNPL order records
- `bnpl_payments` - Installment payments

### Audit
- `audit_logs` - System-wide audit trail

## Architecture

### Middleware Stack
1. **Authentication** (`auth.middleware.js`) - JWT verification
2. **RBAC** (`rbac.middleware.js`) - Permission checking
3. **Tenant Isolation** (`tenant-isolation.middleware.js`) - Data segregation
4. **Module Access** (`module-access.middleware.js`) - Feature gating

### Security Features
- Password hashing with bcrypt
- JWT token management
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention via parameterized queries

## Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection
├── controllers/
│   ├── auth.controller.js
│   ├── tenant.controller.js
│   └── customer.controller.js
├── middleware/
│   ├── auth.middleware.js
│   ├── rbac.middleware.js
│   ├── tenant-isolation.middleware.js
│   └── module-access.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── tenant.routes.js
│   └── customer.routes.js
├── scripts/
│   ├── migrate.js           # Create database tables
│   └── seed.js              # Seed initial data
├── .env                     # Environment variables
├── server.js                # Express server
└── package.json
```

## Testing

```bash
npm test
```

## License

MIT

---

## 📚 Complete Documentation

For detailed implementation information, see the comprehensive documentation files:

### Quick Start Documentation
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⚡ - One-page quick lookup (2 min read)
  - API endpoints, roles matrix, common commands

### Comprehensive Guides
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** 📖 - Complete technical reference (20 min read)
  - Architecture, all endpoints, workflows, security considerations

### Testing & Examples
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** 🔧 - Practical API testing guide (15 min read)
  - 50+ cURL examples, workflows, debugging

### Feature Overview
- **[FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)** 📊 - Feature checklist and overview (10 min read)
  - Implemented features, roles matrix, testing guide

### Implementation Status
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** ✅ - What was done (5 min read)
  - Changes summary, features list, verification checklist

---

## 🎯 Recent Enhancements (October 2025)

### ✅ Users Management System
- Super Admin user management (platform-level)
- Tenant Admin user management (tenant-level)
- Complete CRUD operations
- Search, filter, and sorting

### ✅ Role-Based Access Control (RBAC)
- 4 predefined roles: Super Admin, Tenant Admin, Loan Officer, Cashier
- 16+ granular permissions
- Two-level scope system (platform/tenant)
- Enhanced permission validation

### ✅ Customers Management
- Tenant-scoped customer lists
- Full CRUD operations
- Customer statistics
- Module-based access control

### ✅ Tenant Settings
- Per-tenant settings storage
- Branding configuration
- Flexible JSON-based settings

---

## 🚀 Quick Start with New Features

### 1. Understand Architecture
```bash
cat QUICK_REFERENCE.md
```

### 2. Review Implementation
```bash
cat IMPLEMENTATION_GUIDE.md
```

### 3. Test with Examples
```bash
# See 50+ cURL examples
cat API_EXAMPLES.md
```

### 4. Explore Code
```bash
cat routes/user.routes.js
cat controllers/user.controller.js
cat middleware/rbac.middleware.js
```

---

## 🔑 Key Endpoints Overview

### Users (14 endpoints)
- Platform level: List all, create, get, update, status, delete, reset
- Tenant level: List tenant users, create, get, update, status, delete

### Customers (6 endpoints)
- List, create, get, update, delete, statistics

### Settings (4 endpoints)
- Get/update tenant settings, get/update branding

---

## 🔐 Roles Quick Reference

| Role | Scope | Capabilities |
|------|:-----:|-------------|
| Super Admin | Platform | Everything |
| Tenant Admin | Tenant | Users, Customers, Loans, Settings |
| Loan Officer | Tenant | Customers (R/W), Loans (R/W) |
| Cashier | Tenant | Payments, View Customers |

---

## 📊 Status

| Component | Status |
|-----------|:------:|
| User Management | ✅ |
| RBAC | ✅ |
| Customers | ✅ |
| Settings | ✅ |
| Documentation | ✅ |

---

## 📖 Documentation Guide

→ **Start with [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** (2 minutes)

Then explore other documents based on your needs:
- Technical details → [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- API testing → [API_EXAMPLES.md](./API_EXAMPLES.md)
- Feature overview → [FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)
- Implementation status → [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)

---

**Version:** 1.0  
**Last Updated:** October 20, 2025  
**Status:** ✅ Complete & Ready
