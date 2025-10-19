# Exits Loan Management SaaS

A comprehensive Multi-Tenant SaaS platform for Money-Loan and Buy-Now-Pay-Later (BNPL) management with advanced RBAC and strict tenant isolation.

## 🎯 Project Overview

**Exits LMS** is a full-stack loan management solution featuring:
- **Multi-Tenant Architecture** - Complete tenant isolation and data segregation
- **Money-Loan Module** - Full loan lifecycle management
- **BNPL Module** - Buy-Now-Pay-Later with installment tracking
- **RBAC System** - Role-based access control (Platform & Tenant scopes)
- **Feature Gating** - Per-tenant module access control
- **Dark Mode** - Complete light/dark theme support
- **Audit Logging** - Comprehensive activity tracking
- **Modern Stack** - Angular 17 + Express + PostgreSQL

## 📁 Project Structure

```
Exits LMS/
├── backend/              # Express.js API server
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, RBAC, tenant isolation
│   ├── routes/          # API endpoints
│   ├── scripts/         # Migration & seed scripts
│   └── server.js        # Entry point
│
└── frontend/            # Angular application
    ├── src/
    │   ├── app/
    │   │   ├── core/           # Services, guards, interceptors
    │   │   ├── shared/         # Reusable components
    │   │   ├── modules/        # Feature modules (Money-Loan, BNPL)
    │   │   └── pages/          # Page components
    │   ├── environments/       # Environment configs
    │   └── styles.scss         # Global styles with Tailwind
    └── angular.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```powershell
cd "d:\speed-space\Exits LMS"
```

2. **Setup Backend**
```powershell
cd backend
npm install

# Create local environment file
cp .env.example .env.local

# Edit .env.local with your database credentials
# Database setup: CREATE DATABASE exits_lms;

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

3. **Setup Frontend**
```powershell
cd ..\frontend
npm install

# Create local environment file
cp .env.example .env.local
```

> **Important:** See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for detailed environment configuration

4. **Start Development Servers**

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
# Frontend runs on http://localhost:4200
```

5. **Access the Application**
- Open browser: `http://localhost:4200`

## 🔐 Default Credentials

### Super Admin (Platform Access)
- **Email:** `admin@exits-lms.com`
- **Password:** `admin123`
- **Access:** Full platform control, tenant management

### Demo Tenant Admin
- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **Tenant:** Demo Company
- **Modules:** Money-Loan ✅ | BNPL ✅

> ⚠️ **Important:** Change these passwords in production!

## 📋 Features Checklist

### ✅ Completed
- [x] Backend Express API with PostgreSQL
- [x] Database schema with all tables
- [x] JWT Authentication system
- [x] RBAC middleware (platform/tenant scopes)
- [x] Tenant isolation middleware
- [x] Module access control (feature gating)
- [x] Authentication controllers & routes
- [x] Tenant management (Super Admin)
- [x] Customer management (Money-Loan)
- [x] Angular project structure
- [x] Core services (Auth, Theme)
- [x] Route guards (Auth, Role)
- [x] Landing page
- [x] Login page
- [x] Tailwind CSS with dark mode

### 🚧 In Progress
- [ ] Super Admin dashboard components
- [ ] Tenant dashboard components
- [ ] Money-Loan module (Loans, Products, Payments)
- [ ] BNPL module (Merchants, Orders, Payments)
- [ ] Audit logging UI
- [ ] Notifications system
- [ ] Reports & analytics

## 🏗️ Architecture

### Backend (Express + PostgreSQL)
- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based with permission checking
- **Tenant Isolation:** Automatic via middleware
- **Module Gating:** Per-tenant feature flags
- **Security:** Helmet, CORS, Rate limiting

### Frontend (Angular 17)
- **Standalone Components:** Modern Angular architecture
- **Lazy Loading:** Route-based code splitting
- **State Management:** RxJS BehaviorSubjects
- **Styling:** Tailwind CSS with dark mode
- **Guards:** Authentication & role-based routing

### Database Schema

**Core Tables:**
- `tenants` - Tenant organizations
- `users` - All system users
- `roles` - Role definitions
- `permissions` - Permission definitions
- `tenant_features` - Module access control

**Money-Loan Module:**
- `customers` - Customer records
- `loan_products` - Loan product definitions
- `loans` - Loan transactions
- `loan_payments` - Payment records

**BNPL Module:**
- `bnpl_merchants` - Merchant records
- `bnpl_orders` - Order records
- `bnpl_payments` - Installment payments

**Audit:**
- `audit_logs` - Activity tracking

## 🔧 Development

### Backend Commands
```powershell
npm run dev      # Development mode with nodemon
npm start        # Production mode
npm run migrate  # Create database tables
npm run seed     # Seed initial data
npm test         # Run tests
```

### Frontend Commands
```powershell
npm start        # Development server (port 4200)
npm run build    # Production build
npm test         # Run unit tests
ng generate component <name>  # Generate component
```

## 🌐 Environment Configuration

This project uses environment files for sensitive configuration:

- **`.env.example`** - Template file (tracked in Git)
- **`.env.local`** - Your local secrets (ignored by Git)

### Files to Track in Git
✅ `.env.example` - Safe template with placeholders  
✅ `.gitignore` - Prevents committing secrets

### Files to NEVER Commit
❌ `.env` - Production secrets  
❌ `.env.local` - Local development secrets

**Setup Instructions:**
```bash
# Backend
cp backend/.env.example backend/.env.local
# Edit backend/.env.local with your DB credentials

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API URL
```

See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) and [GITHUB_PUSH_GUIDE.md](./GITHUB_PUSH_GUIDE.md) for complete setup.

## 🎨 UI Components

### Available Tailwind Classes
- `btn` - Base button
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `btn-danger` - Danger button
- `input` - Form input
- `card` - Card container
- `table` - Data table
- `badge` - Status badge

### Theme Support
- Light mode (default)
- Dark mode (toggle in header)
- Persistent preference in localStorage

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile

### Tenants (Super Admin)
- `GET /api/tenants` - List tenants
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/:id` - Update tenant
- `POST /api/tenants/:id/modules` - Toggle module
- `GET /api/tenants/:id/users` - List tenant users

### Customers (Money-Loan)
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## 🔒 Security Features

- **Password Hashing:** bcrypt
- **JWT Tokens:** Secure token management
- **Rate Limiting:** 100 requests per 15 minutes
- **CORS:** Configured for frontend URL
- **Helmet:** Security headers
- **SQL Injection Prevention:** Parameterized queries
- **Tenant Isolation:** Automatic filtering

## 🧪 Testing

Run backend tests:
```powershell
cd backend
npm test
```

Run frontend tests:
```powershell
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set environment variables
2. Run migrations
3. Start server with `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Serve from `dist/` directory

## 🤝 Contributing

This is a demonstration project. For production use:
1. Change all default passwords
2. Update JWT secrets
3. Configure proper CORS origins
4. Setup SSL/TLS
5. Configure production database
6. Add monitoring and logging

## 📝 License

MIT

## 👨‍💻 Developer

Built with ❤️ using Angular, Express, and PostgreSQL

---

**Need Help?** Check the README files in `/backend` and `/frontend` for more detailed documentation.
