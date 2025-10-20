# Exits LMS - Automated Setup Script
# This script will set up both backend and frontend
# Updated: October 2025
# Changes:
#   - Added addresses table for tenant and customer address management
#   - Added contact_first_name and contact_last_name to tenants
#   - Added address_id foreign keys to tenants, users, and customers
#   - Implemented proper environment configuration loading

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Exits LMS - Automated Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setup Version: 2.0 (Database Improvements Edition)" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgInstalled = $false
try {
    $pgVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL is installed: $pgVersion" -ForegroundColor Green
        $pgInstalled = $true
    }
} catch {
    # PostgreSQL might be installed but not in PATH
}

if (-not $pgInstalled) {
    # Check common PostgreSQL installation paths
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\*\bin",
        "C:\Program Files (x86)\PostgreSQL\*\bin",
        "$env:ProgramFiles\PostgreSQL\*\bin",
        "${env:ProgramFiles(x86)}\PostgreSQL\*\bin"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $psqlPath = Get-ChildItem -Path $path -Filter "psql.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($psqlPath) {
                Write-Host "PostgreSQL found at: $($psqlPath.DirectoryName)" -ForegroundColor Green
                $pgInstalled = $true
                # Add to PATH for this session
                $env:Path += ";$($psqlPath.DirectoryName)"
                break
            }
        }
    }
}

if (-not $pgInstalled) {
    Write-Host "PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "PostgreSQL may be installed but not accessible from this terminal." -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Do you have PostgreSQL installed? (Y/n)"
    if ($response -eq 'n' -or $response -eq 'N') {
        Write-Host "Please install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Continuing setup (you can verify PostgreSQL manually)..." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend dependencies installed" -ForegroundColor Green

# Check if .env.local exists in backend
Write-Host ""
Write-Host "Checking backend configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host ".env.local not found" -ForegroundColor Cyan
    Write-Host "Creating .env.local from example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host ".env.local created" -ForegroundColor Green
    } else {
        Write-Host ".env.example not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ".env.local found" -ForegroundColor Green
}

# Run database migrations
Write-Host ""
Write-Host "Creating database tables..." -ForegroundColor Yellow
Write-Host "Note: Make sure PostgreSQL is running and 'exits_lms' database exists" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database schema includes:" -ForegroundColor Cyan
Write-Host "  - Tenants with contact info and address support" -ForegroundColor Gray
Write-Host "  - Users with address management" -ForegroundColor Gray
Write-Host "  - Customers with addresses for loan management" -ForegroundColor Gray
Write-Host "  - Roles and permissions with RBAC" -ForegroundColor Gray
Write-Host "  - Addresses table for multi-entity address linking" -ForegroundColor Gray
Write-Host "  - Tenant features/modules (Money Loan, BNPL, Pawnshop)" -ForegroundColor Gray
Write-Host "  - Loans and loan payments tracking" -ForegroundColor Gray
Write-Host "  - BNPL merchants and orders management" -ForegroundColor Gray
Write-Host "  - Audit logs for compliance" -ForegroundColor Gray
Write-Host ""

Write-Host "Executing migration script..." -ForegroundColor Cyan
npm run migrate 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Database migration failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The migration script creates:" -ForegroundColor Yellow
    Write-Host "  1. UUID-OSSP extension for unique identifiers" -ForegroundColor Cyan
    Write-Host "  2. Tenants table with address support" -ForegroundColor Cyan
    Write-Host "  3. Addresses table for multi-entity linking" -ForegroundColor Cyan
    Write-Host "  4. Users, Roles, and Permissions tables" -ForegroundColor Cyan
    Write-Host "  5. Customer and Loan management tables" -ForegroundColor Cyan
    Write-Host "  6. BNPL and feature management tables" -ForegroundColor Cyan
    Write-Host "  7. Audit logging tables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Common issues and solutions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. PostgreSQL is not running:" -ForegroundColor Cyan
    Write-Host "   Start PostgreSQL service and try again" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Database 'exits_lms' doesn't exist:" -ForegroundColor Cyan
    Write-Host "   psql -U postgres -c 'CREATE DATABASE exits_lms;'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Wrong database credentials:" -ForegroundColor Cyan
    Write-Host "   Check backend\.env.local configuration:" -ForegroundColor Gray
    Write-Host "   - DB_HOST (default: localhost)" -ForegroundColor Gray
    Write-Host "   - DB_PORT (default: 5432)" -ForegroundColor Gray
    Write-Host "   - DB_USER (default: postgres)" -ForegroundColor Gray
    Write-Host "   - DB_PASSWORD" -ForegroundColor Gray
    Write-Host "   - DB_NAME (default: exits_lms)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. PostgreSQL connection error:" -ForegroundColor Cyan
    Write-Host "   Verify PostgreSQL is accessible from your system" -ForegroundColor Gray
    Write-Host "   psql -U postgres -c 'SELECT version();'" -ForegroundColor Gray
    exit 1
}
Write-Host "Database tables created successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Database Schema Summary:" -ForegroundColor Cyan
Write-Host "  Tables: 12 (Tenants, Users, Roles, Permissions, Customers, Loans, etc.)" -ForegroundColor Gray
Write-Host "  Columns: Address fields added for multi-entity support" -ForegroundColor Gray
Write-Host "  Indexes: Performance optimized for multi-tenant queries" -ForegroundColor Gray
Write-Host "  Foreign Keys: Full referential integrity enforced" -ForegroundColor Gray

Write-Host ""
Write-Host "Backend Components:" -ForegroundColor Yellow
Write-Host "  Role Management APIs:" -ForegroundColor Green
Write-Host "    - File: controllers/role.controller.js" -ForegroundColor Gray
Write-Host "    - Routes: routes/role.routes.js" -ForegroundColor Gray
Write-Host "    - Mount Point: /api/roles (in server.js)" -ForegroundColor Gray
Write-Host "  API Endpoints:" -ForegroundColor Green
Write-Host "    GET  /api/roles - Get all roles with aggregated permissions" -ForegroundColor Gray
Write-Host "    GET  /api/roles/:id - Get single role by ID with permissions" -ForegroundColor Gray
Write-Host "    POST /api/roles - Create new role (requires admin)" -ForegroundColor Gray
Write-Host "    PUT  /api/roles/:id - Update existing role" -ForegroundColor Gray
Write-Host "    DELETE /api/roles/:id - Delete role (protected roles cannot be deleted)" -ForegroundColor Gray
Write-Host "    POST /api/roles/:id/permissions - Bulk assign permissions to role" -ForegroundColor Gray
Write-Host "    GET  /api/permissions - Get all available permissions" -ForegroundColor Gray
Write-Host "  Middleware Applied:" -ForegroundColor Green
Write-Host "    - authMiddleware: Validates JWT token on all routes" -ForegroundColor Gray
Write-Host "    - rbacMiddleware: Checks permissions for create/update/delete operations" -ForegroundColor Gray
Write-Host ""

# Seed initial data
Write-Host ""
Write-Host "Seeding initial data (roles, permissions, users)..." -ForegroundColor Yellow
Write-Host "This will populate:" -ForegroundColor Cyan
Write-Host "  - Platform roles (Super Admin, Support Staff, Developer)" -ForegroundColor Gray
Write-Host "  - Tenant roles (tenant-admin, Loan Officer, Cashier)" -ForegroundColor Gray
Write-Host "  - Permissions and role-permission mappings" -ForegroundColor Gray
Write-Host "  - Demo super admin account" -ForegroundColor Gray
Write-Host "  - Demo tenant with sample admin user" -ForegroundColor Gray
Write-Host ""
npm run seed 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Database seeding failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Note: If migration was successful but seeding failed:" -ForegroundColor Yellow
    Write-Host "  - Verify the roles were created" -ForegroundColor Gray
    Write-Host "  - Check .env.local credentials are correct" -ForegroundColor Gray
    Write-Host "  - Run: npm run seed" -ForegroundColor Gray
    exit 1
}
Write-Host "Initial data seeded successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Seeded data includes:" -ForegroundColor Cyan
Write-Host "  Platform Roles (Super Admin, Support Staff, Developer with appropriate permissions)" -ForegroundColor Gray
Write-Host "  Tenant Roles (Admin, Loan Officer, Cashier with tenant scope)" -ForegroundColor Gray
Write-Host "  Permissions for all roles" -ForegroundColor Gray
Write-Host "  Super Admin user account" -ForegroundColor Gray
Write-Host "  Demo tenant with admin user" -ForegroundColor Gray

# Navigate back
Set-Location -Path ".."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

# Check if .env.local exists in frontend
Write-Host ""
Write-Host "Checking frontend configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "frontend\.env.local not found" -ForegroundColor Cyan
    Write-Host "Creating frontend\.env.local from example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "frontend\.env.local created" -ForegroundColor Green
    } else {
        Write-Host "frontend\.env.example not found!" -ForegroundColor Yellow
    }
} else {
    Write-Host "frontend\.env.local found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Frontend Components:" -ForegroundColor Yellow
Write-Host "  API Interceptor:" -ForegroundColor Green
Write-Host "    - File: src/app/core/interceptors/api.interceptor.ts" -ForegroundColor Gray
Write-Host "    - Purpose: Routes localhost:4200/api/* → localhost:3000/api/*" -ForegroundColor Gray
Write-Host "    - Registration: app.config.ts (registered before authInterceptor)" -ForegroundColor Gray
Write-Host "  Role Management UI:" -ForegroundColor Green
Write-Host "    - Location: /super-admin/settings/roles" -ForegroundColor Gray
Write-Host "    - Features: View, create, edit, delete roles and manage permissions" -ForegroundColor Gray
Write-Host "    - Calls: /api/roles/* and /api/permissions endpoints" -ForegroundColor Gray
Write-Host ""

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend dependencies installed" -ForegroundColor Green

# Navigate back
Set-Location -Path ".."

# Success message
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Version: 2.0 - Database Improvements Edition" -ForegroundColor Green
Write-Host ""

Write-Host "API Endpoints Added:" -ForegroundColor Yellow
Write-Host "  Role Management APIs:" -ForegroundColor Green
Write-Host "    - GET /api/roles - List all roles with permissions" -ForegroundColor Gray
Write-Host "    - GET /api/roles/:id - Get single role with permissions" -ForegroundColor Gray
Write-Host "    - POST /api/roles - Create new role" -ForegroundColor Gray
Write-Host "    - PUT /api/roles/:id - Update existing role" -ForegroundColor Gray
Write-Host "    - DELETE /api/roles/:id - Delete role" -ForegroundColor Gray
Write-Host "    - POST /api/roles/:id/permissions - Assign permissions to role" -ForegroundColor Gray
Write-Host "    - GET /api/permissions - List all permissions" -ForegroundColor Gray
Write-Host "  Frontend API Interceptor:" -ForegroundColor Green
Write-Host "    - Automatically routes /api/* requests from port 4200 to port 3000" -ForegroundColor Gray
Write-Host "    - Registered in app.config.ts before auth interceptor" -ForegroundColor Gray
Write-Host ""

Write-Host "Database Schema Status:" -ForegroundColor Yellow
Write-Host "  Tenants table" -ForegroundColor Green
Write-Host "    - contact_first_name and contact_last_name fields" -ForegroundColor Gray
Write-Host "    - address_id for linked address management" -ForegroundColor Gray
Write-Host "  Users table" -ForegroundColor Green
Write-Host "    - address_id for address linking" -ForegroundColor Gray
Write-Host "  Customers table" -ForegroundColor Green
Write-Host "    - address_id replacing legacy address TEXT field" -ForegroundColor Gray
Write-Host "  Addresses table" -ForegroundColor Green
Write-Host "    - Multi-entity support (tenants, users, customers)" -ForegroundColor Gray
Write-Host "    - Primary address tracking" -ForegroundColor Gray
Write-Host "  Roles table" -ForegroundColor Green
Write-Host "    - Columns: id, name, scope, description, created_at" -ForegroundColor Gray
Write-Host "    - Note: No updated_at column (use created_at for read-only references)" -ForegroundColor Gray
Write-Host "  Permissions table" -ForegroundColor Green
Write-Host "    - Stores permission definitions (name, resource, action, description)" -ForegroundColor Gray
Write-Host "  Role Permissions junction table" -ForegroundColor Green
Write-Host "    - Maps roles to permissions with many-to-many relationship" -ForegroundColor Gray
Write-Host ""

Write-Host "Roles and Permissions:" -ForegroundColor Yellow
Write-Host "  Platform Roles (for system team management):" -ForegroundColor Green
Write-Host "    - Super Admin: Full platform access with all permissions" -ForegroundColor Gray
Write-Host "    - Support Staff: View audit logs, manage users, view customers/loans/payments" -ForegroundColor Gray
Write-Host "    - Developer: Technical support with platform settings and audit access" -ForegroundColor Gray
Write-Host "  Tenant Roles (for tenant-specific operations):" -ForegroundColor Green
Write-Host "    - tenant-admin: Full tenant access (manage customers, loans, users)" -ForegroundColor Gray
Write-Host "    - Loan Officer: Manage loans, customers, and BNPL operations" -ForegroundColor Gray
Write-Host "    - Cashier: Process payments and view transactions" -ForegroundColor Gray
Write-Host "  Permissions (16 total):" -ForegroundColor Green
Write-Host "    - Platform: manage_tenants, view_audit_logs, manage_platform_settings" -ForegroundColor Gray
Write-Host "    - Users: manage_users" -ForegroundColor Gray
Write-Host "    - Customers: manage_customers, view_customers" -ForegroundColor Gray
Write-Host "    - Loans: manage_loans, approve_loans, view_loans, manage_loan_products" -ForegroundColor Gray
Write-Host "    - Payments: process_payments, view_payments" -ForegroundColor Gray
Write-Host "    - BNPL: manage_bnpl_merchants, manage_bnpl_orders, view_bnpl_orders" -ForegroundColor Gray
Write-Host "    - Reports: view_reports" -ForegroundColor Gray
Write-Host ""

Write-Host "Features Enabled:" -ForegroundColor Yellow
Write-Host "  Multi-tenant architecture with realm isolation" -ForegroundColor Green
Write-Host "  Role-based access control (RBAC)" -ForegroundColor Green
Write-Host "  Address management for all entities" -ForegroundColor Green
Write-Host "  Tenant-specific modules (Money Loan, BNPL, Pawnshop)" -ForegroundColor Green
Write-Host "  Audit logging for compliance" -ForegroundColor Green
Write-Host ""

Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Backend (Terminal 1):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   Backend will run on: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Frontend (Terminal 2):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host "   Frontend will run on: http://localhost:4200" -ForegroundColor Gray
Write-Host ""

Write-Host "Default Login Credentials:" -ForegroundColor Yellow
Write-Host "  Super Admin:" -ForegroundColor Cyan
Write-Host "    Email: admin@exits-lms.com" -ForegroundColor White
Write-Host "    Password: admin123" -ForegroundColor Gray
Write-Host "    Scope: Platform-wide super admin access" -ForegroundColor Gray
Write-Host ""
Write-Host "  Tenant Admin (Demo):" -ForegroundColor Cyan
Write-Host "    Email: admin@demo.com" -ForegroundColor White
Write-Host "    Password: demo123" -ForegroundColor Gray
Write-Host "    Scope: Tenant-scoped admin access" -ForegroundColor Gray
Write-Host ""

Write-Host "Database Connection Info:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor Cyan
Write-Host "  Port: 5432" -ForegroundColor Cyan
Write-Host "  Database: exits_lms" -ForegroundColor Cyan
Write-Host "  User: postgres" -ForegroundColor Cyan
Write-Host "  Location: backend\.env.local" -ForegroundColor Gray
Write-Host ""

Write-Host "Security Reminders:" -ForegroundColor Yellow
Write-Host "  IMPORTANT: Change these passwords immediately in production!" -ForegroundColor Red
Write-Host "  Never commit .env files to GitHub" -ForegroundColor Red
Write-Host "  Keep .env.local files on your local machine only" -ForegroundColor Red
Write-Host "  Use strong passwords for database user in production" -ForegroundColor Red
Write-Host "  Enable PostgreSQL SSL for remote connections" -ForegroundColor Red
Write-Host ""

Write-Host "Database Migration Features:" -ForegroundColor Yellow
Write-Host "  - UUID-OSSP extension for unique identifiers" -ForegroundColor Cyan
Write-Host "  - Addresses table with multi-entity support" -ForegroundColor Cyan
Write-Host "  - Contact information fields on tenants" -ForegroundColor Cyan
Write-Host "  - Address linking for users and customers" -ForegroundColor Cyan
Write-Host "  - Performance indexes for multi-tenant queries" -ForegroundColor Cyan
Write-Host "  - Referential integrity constraints" -ForegroundColor Cyan
Write-Host ""

Write-Host "Additional Documentation:" -ForegroundColor Yellow
Write-Host "  Database Migration: See backend/scripts/migrate.js" -ForegroundColor Cyan
Write-Host "  Seed Data: See backend/scripts/seed.js" -ForegroundColor Cyan
Write-Host "  Environment: See ENV_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "  GitHub: See GITHUB_PUSH_GUIDE.md" -ForegroundColor Cyan
Write-Host "  Quick Start: See START_HERE.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "To recreate the database:" -ForegroundColor Yellow
Write-Host "  1. Drop database: psql -U postgres -c 'DROP DATABASE IF EXISTS exits_lms;'" -ForegroundColor Gray
Write-Host "  2. Create database: psql -U postgres -c 'CREATE DATABASE exits_lms;'" -ForegroundColor Gray
Write-Host "  3. Run migration: cd backend && npm run migrate" -ForegroundColor Gray
Write-Host "  4. Seed data: npm run seed" -ForegroundColor Gray
Write-Host ""

Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "  If you encounter column errors after migration:" -ForegroundColor Cyan
Write-Host "    - Backend server has stale connections" -ForegroundColor Gray
Write-Host "    - Solution: Restart 'npm run dev' to refresh connections" -ForegroundColor Gray
Write-Host "  If permissions are denied:" -ForegroundColor Cyan
Write-Host "    - Login with correct credentials" -ForegroundColor Gray
Write-Host "    - Verify role assignments in database" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy coding! Application is ready for development." -ForegroundColor Green
Write-Host "Report issues: https://github.com/apps-eduard/Exits-LMS" -ForegroundColor Cyan
Write-Host ""
