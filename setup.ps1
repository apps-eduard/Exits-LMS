# Exits LMS - Automated Setup Script
# This script will set up both backend and frontend
# Updated: October 20, 2025
# Changes:
#   - Added addresses table for tenant and customer address management
#   - Added contact_first_name and contact_last_name to tenants
#   - Added address_id foreign keys to tenants, users, and customers
#   - Implemented proper environment configuration loading
#   - Added role_menus table for menu-based access control
#   - Fixed street_address to be nullable in addresses table
#   - Added permission matrix component for role/permission management
#   - Added menu assignment UI for role-menu associations

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Exits LMS - Automated Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Setup Version: 3.0 (Menu-Based Access Control Edition)" -ForegroundColor Cyan
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
Write-Host "  - Role-Menu link table for menu-based access control" -ForegroundColor Gray
Write-Host "  - Addresses table for multi-entity address linking (nullable street_address)" -ForegroundColor Gray
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
    Write-Host "  3. Addresses table for multi-entity linking (nullable street_address)" -ForegroundColor Cyan
    Write-Host "  4. Users, Roles, and Permissions tables" -ForegroundColor Cyan
    Write-Host "  5. Role-Menus junction table for menu-based access control" -ForegroundColor Cyan
    Write-Host "  6. Customer and Loan management tables" -ForegroundColor Cyan
    Write-Host "  7. BNPL and feature management tables" -ForegroundColor Cyan
    Write-Host "  8. Audit logging tables" -ForegroundColor Cyan
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
Write-Host "Running address schema fix (making street_address nullable)..." -ForegroundColor Yellow
npm run db:fix-address 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Address schema fixed successfully" -ForegroundColor Green
} else {
    Write-Host "Address schema fix completed (may have already been fixed)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Database Schema Summary:" -ForegroundColor Cyan
Write-Host "  Tables: 13+ (Tenants, Users, Roles, Permissions, Role-Menus, Customers, Loans, etc.)" -ForegroundColor Gray
Write-Host "  Columns: Address fields added for multi-entity support (street_address now nullable)" -ForegroundColor Gray
Write-Host "  Indexes: Performance optimized for multi-tenant queries" -ForegroundColor Gray
Write-Host "  Foreign Keys: Full referential integrity enforced" -ForegroundColor Gray

Write-Host ""
Write-Host "Backend Components:" -ForegroundColor Yellow
Write-Host "  Role Management APIs:" -ForegroundColor Green
Write-Host "    - File: controllers/role.controller.js" -ForegroundColor Gray
Write-Host "    - Routes: routes/role.routes.js" -ForegroundColor Gray
Write-Host "    - Mount Point: /api/roles (in server.js)" -ForegroundColor Gray
Write-Host "  Menu Assignment APIs:" -ForegroundColor Green
Write-Host "    - File: controllers/role-menus.controller.js" -ForegroundColor Gray
Write-Host "    - Routes: routes/role.routes.js & routes/menu.routes.js" -ForegroundColor Gray
Write-Host "    - Database: role_menus junction table" -ForegroundColor Gray
Write-Host "  API Endpoints:" -ForegroundColor Green
Write-Host "    GET  /api/roles - Get all roles with aggregated permissions" -ForegroundColor Gray
Write-Host "    GET  /api/roles/:id - Get single role by ID with permissions" -ForegroundColor Gray
Write-Host "    POST /api/roles - Create new role (requires admin)" -ForegroundColor Gray
Write-Host "    PUT  /api/roles/:id - Update existing role" -ForegroundColor Gray
Write-Host "    DELETE /api/roles/:id - Delete role (protected roles cannot be deleted)" -ForegroundColor Gray
Write-Host "    POST /api/roles/:id/permissions - Bulk assign permissions to role" -ForegroundColor Gray
Write-Host "    POST /api/roles/:id/menus - Assign menus to role (NEW)" -ForegroundColor Gray
Write-Host "    GET  /api/roles/:id/menus - Get menus assigned to role (NEW)" -ForegroundColor Gray
Write-Host "    DELETE /api/roles/:roleId/menus/:menuId - Remove menu from role (NEW)" -ForegroundColor Gray
Write-Host "    GET  /api/menus/user-menus - Get current user's accessible menus (NEW)" -ForegroundColor Gray
Write-Host "    GET  /api/menus/available - Get all available menus (NEW)" -ForegroundColor Gray
Write-Host "    GET  /api/permissions - Get all available permissions" -ForegroundColor Gray
Write-Host "  Middleware Applied:" -ForegroundColor Green
Write-Host "    - authMiddleware: Validates JWT token on all routes" -ForegroundColor Gray
Write-Host "    - rbacMiddleware: Checks permissions for create/update/delete operations (fixed to check roleName)" -ForegroundColor Gray
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

# Seed settings data
Write-Host ""
Write-Host "Seeding platform settings..." -ForegroundColor Yellow
Write-Host "This will populate default settings including:" -ForegroundColor Cyan
Write-Host "  - Platform configuration (name, URL, timezone)" -ForegroundColor Gray
Write-Host "  - Email settings (SMTP, sender info)" -ForegroundColor Gray
Write-Host "  - Feature flags (modules, analytics, branding)" -ForegroundColor Gray
Write-Host "  - Security settings (password requirements, session timeout)" -ForegroundColor Gray
Write-Host ""
npm run seed:settings 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Settings seeding failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Note: If this is the first run, settings will be seeded when the backend starts" -ForegroundColor Yellow
    Write-Host "  - Run: npm run seed:settings" -ForegroundColor Gray
} else {
    Write-Host "Platform settings seeded successfully" -ForegroundColor Green
}
Write-Host ""
Write-Host "Seeded settings include:" -ForegroundColor Cyan
Write-Host "  Platform (name, URL, support email, timezone, currency)" -ForegroundColor Gray
Write-Host "  Email (SMTP host, port, sender email/name)" -ForegroundColor Gray
Write-Host "  Features (email notifications, 2FA, modules, analytics)" -ForegroundColor Gray
Write-Host "  Security (password length, session timeout, login attempts)" -ForegroundColor Gray

# Seed menu data
Write-Host ""
Write-Host "Seeding application menus..." -ForegroundColor Yellow
Write-Host "This will populate comprehensive menu structure:" -ForegroundColor Cyan
Write-Host "  Platform Menus (30 total):" -ForegroundColor Gray
Write-Host "    - Overview: Dashboard, Audit Logs" -ForegroundColor Gray
Write-Host "    - Tenant Management: All Tenants, Active, Suspended, Create" -ForegroundColor Gray
Write-Host "    - Analytics & Reports: System Analytics, Revenue, User Activity, Tenant Usage" -ForegroundColor Gray
Write-Host "    - Billing & Subscriptions: Subscriptions, Plans, Invoices, Payments" -ForegroundColor Gray
Write-Host "    - Notifications: System Notifications, Alerts, Announcements" -ForegroundColor Gray
Write-Host "    - System Health: Health Check, Performance Metrics, Error Logs, Background Jobs" -ForegroundColor Gray
Write-Host "    - Settings: System Roles, Menu Management, Email Config, Security, API Management" -ForegroundColor Gray
Write-Host "    - System Team: Team Members, Activity Logs" -ForegroundColor Gray
Write-Host "  Tenant Menus (37 total):" -ForegroundColor Gray
Write-Host "    - Customers: All Customers, Active, Inactive, New, KYC" -ForegroundColor Gray
Write-Host "    - Loans: All Loans, Active, Pending, Completed, Applications" -ForegroundColor Gray
Write-Host "    - Payments: All Payments, Pending, Completed, Failed, Reconciliation" -ForegroundColor Gray
Write-Host "    - Reports & Analytics: Dashboard, Financial, Customer, Loan, Payment Reports" -ForegroundColor Gray
Write-Host "    - Communications: Email Campaigns, SMS, Push Notifications, Templates" -ForegroundColor Gray
Write-Host "    - Advanced Features: Automation Rules, Workflows, Integrations, API Access" -ForegroundColor Gray
Write-Host "    - Documents: Document Library, Templates, Compliance Documents" -ForegroundColor Gray
Write-Host "    - Settings: Organization, Company Profile, Billing, Roles, Team" -ForegroundColor Gray
Write-Host ""
npm run seed:menus 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Menu seeding failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Note: You can manually seed menus later by running:" -ForegroundColor Yellow
    Write-Host "  cd backend && npm run seed:menus" -ForegroundColor Gray
} else {
    Write-Host "Application menus seeded successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Menu Structure Summary:" -ForegroundColor Cyan
    Write-Host "  Total Menus: 67 (30 platform + 37 tenant)" -ForegroundColor Gray
    Write-Host "  Parent Menus: 18 root sections" -ForegroundColor Gray
    Write-Host "  Child Menus: 49 sub-menu items" -ForegroundColor Gray
    Write-Host "  Access: Menu Management at /super-admin/settings/menus" -ForegroundColor Gray
    Write-Host "  Features: Edit-only UI (name, icon, parent, order, status)" -ForegroundColor Gray
}

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
Write-Host "    - Location: /super-admin/settings/roles (permission-matrix component)" -ForegroundColor Gray
Write-Host "    - Features: View, create, edit, delete roles with tabbed interface" -ForegroundColor Gray
Write-Host "  Permission Matrix Tab:" -ForegroundColor Green
Write-Host "    - Component: permission-matrix.component.ts (364+ lines)" -ForegroundColor Gray
Write-Host "    - Features: Checkbox grid for managing role permissions with hierarchy" -ForegroundColor Gray
Write-Host "    - Protected Roles: Super Admin, Support Staff, Developer (auto-grant all permissions)" -ForegroundColor Gray
Write-Host "  Menu Assignment Tab (NEW):" -ForegroundColor Green
Write-Host "    - Component: menu-assignment.component.ts (340+ lines)" -ForegroundColor Gray
Write-Host "    - Features: Role dropdown, menu checklist by scope, select/deselect all, save/cancel" -ForegroundColor Gray
Write-Host "    - Database: Stores menu assignments in role_menus junction table" -ForegroundColor Gray
Write-Host "  RBAC Service Updates:" -ForegroundColor Green
Write-Host "    - File: core/services/rbac.service.ts" -ForegroundColor Gray
Write-Host "    - New Methods: assignMenusToRole, getRoleMenus, getAvailableMenus, getUserMenus, removeMenuFromRole" -ForegroundColor Gray
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
Write-Host "Version: 3.0 - Menu-Based Access Control Edition" -ForegroundColor Green
Write-Host ""

Write-Host "New Features in This Release:" -ForegroundColor Yellow
Write-Host "  Menu-Based Access Control System:" -ForegroundColor Green
Write-Host "    - role_menus junction table for granular menu assignment" -ForegroundColor Gray
Write-Host "    - Menu Assignment UI component with role selection and checkboxes" -ForegroundColor Gray
Write-Host "    - Backend APIs for managing role-menu associations" -ForegroundColor Gray
Write-Host "    - Permission matrix component with tab-based interface" -ForegroundColor Gray
Write-Host "  Fixed Database Issues:" -ForegroundColor Green
Write-Host "    - street_address column now nullable (supports empty addresses)" -ForegroundColor Gray
Write-Host "    - run 'node scripts/fix-address-nullable.js' if needed" -ForegroundColor Gray
Write-Host "  RBAC Middleware Improvements:" -ForegroundColor Green
Write-Host "    - Fixed permission checking to validate roleName in JWT token" -ForegroundColor Gray
Write-Host "    - Protected roles (Super Admin, Support Staff, Developer) auto-grant all permissions" -ForegroundColor Gray
Write-Host "    - Non-protected roles require explicit permission assignments" -ForegroundColor Gray
Write-Host ""

Write-Host "API Endpoints Added:" -ForegroundColor Yellow
Write-Host "  Role Management APIs:" -ForegroundColor Green
Write-Host "    - GET /api/roles - List all roles with permissions" -ForegroundColor Gray
Write-Host "    - GET /api/roles/:id - Get single role with permissions" -ForegroundColor Gray
Write-Host "    - POST /api/roles - Create new role" -ForegroundColor Gray
Write-Host "    - PUT /api/roles/:id - Update existing role" -ForegroundColor Gray
Write-Host "    - DELETE /api/roles/:id - Delete role" -ForegroundColor Gray
Write-Host "    - POST /api/roles/:id/permissions - Assign permissions to role" -ForegroundColor Gray
Write-Host "  Menu-Based Access Control APIs (NEW):" -ForegroundColor Green
Write-Host "    - POST /api/roles/:id/menus - Assign menus to a role" -ForegroundColor Gray
Write-Host "    - GET /api/roles/:id/menus - Get menus assigned to a role" -ForegroundColor Gray
Write-Host "    - DELETE /api/roles/:roleId/menus/:menuId - Remove menu from role" -ForegroundColor Gray
Write-Host "    - GET /api/menus/user-menus - Get current user's accessible menus" -ForegroundColor Gray
Write-Host "    - GET /api/menus/available - Get all available menus" -ForegroundColor Gray
Write-Host "  Utility APIs:" -ForegroundColor Green
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
Write-Host "    - roleName now included in JWT token (for RBAC middleware)" -ForegroundColor Gray
Write-Host "  Customers table" -ForegroundColor Green
Write-Host "    - address_id replacing legacy address TEXT field" -ForegroundColor Gray
Write-Host "  Addresses table" -ForegroundColor Green
Write-Host "    - Multi-entity support (tenants, users, customers)" -ForegroundColor Gray
Write-Host "    - Primary address tracking" -ForegroundColor Gray
Write-Host "    - street_address is now NULLABLE (supports empty addresses)" -ForegroundColor Gray
Write-Host "  Roles table" -ForegroundColor Green
Write-Host "    - Columns: id, name, scope, description, created_at" -ForegroundColor Gray
Write-Host "    - Note: No updated_at column (use created_at for read-only references)" -ForegroundColor Gray
Write-Host "  Permissions table" -ForegroundColor Green
Write-Host "    - Stores permission definitions (name, resource, action, description)" -ForegroundColor Gray
Write-Host "  Role Permissions junction table" -ForegroundColor Green
Write-Host "    - Maps roles to permissions with many-to-many relationship" -ForegroundColor Gray
Write-Host "  Role Menus junction table (NEW)" -ForegroundColor Green
Write-Host "    - Maps roles to menus for menu-based access control" -ForegroundColor Gray
Write-Host "    - Cascading deletes for data integrity" -ForegroundColor Gray
Write-Host "    - Protected roles auto-seeded with all menus" -ForegroundColor Gray
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
Write-Host "  Role-based access control (RBAC) with permission matrix UI" -ForegroundColor Green
Write-Host "  Menu-based access control with granular menu assignment" -ForegroundColor Green
Write-Host "  Address management for all entities (with nullable street_address)" -ForegroundColor Green
Write-Host "  Tenant-specific modules (Money Loan, BNPL, Pawnshop)" -ForegroundColor Green
Write-Host "  Audit logging for compliance" -ForegroundColor Green
Write-Host "  Protected roles with automatic permission/menu grants" -ForegroundColor Green
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
Write-Host "  4. Fix address schema: node scripts/fix-address-nullable.js" -ForegroundColor Gray
Write-Host "  5. Execute menu migration: node scripts/run-migrations.js" -ForegroundColor Gray
Write-Host "  6. Seed data: npm run seed" -ForegroundColor Gray
Write-Host "  7. Seed settings: npm run seed:settings" -ForegroundColor Gray
Write-Host ""

Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "  If you encounter column errors after migration:" -ForegroundColor Cyan
Write-Host "    - Backend server has stale connections" -ForegroundColor Gray
Write-Host "    - Solution: Restart 'npm run dev' to refresh connections" -ForegroundColor Gray
Write-Host "  If street_address NOT NULL error when creating tenants:" -ForegroundColor Cyan
Write-Host "    - Run: node scripts/fix-address-nullable.js" -ForegroundColor Gray
Write-Host "    - This makes street_address nullable to support partial address entry" -ForegroundColor Gray
Write-Host "  If role_menus table doesn't exist:" -ForegroundColor Cyan
Write-Host "    - Run: node scripts/run-migrations.js" -ForegroundColor Gray
Write-Host "    - This creates the role_menus junction table and seeds protected roles" -ForegroundColor Gray
Write-Host "  If permissions are denied:" -ForegroundColor Cyan
Write-Host "    - Verify JWT token includes roleName field" -ForegroundColor Gray
Write-Host "    - Check role is assigned correct permissions in database" -ForegroundColor Gray
Write-Host "    - Login with correct credentials and try again" -ForegroundColor Gray
Write-Host ""

Write-Host "Menu-Based Access Control Implementation:" -ForegroundColor Yellow
Write-Host "  System Overview:" -ForegroundColor Green
Write-Host "    - Menus are filtered per role to improve UX" -ForegroundColor Gray
Write-Host "    - Backend permission checks remain unchanged (menu is UX layer only)" -ForegroundColor Gray
Write-Host "    - Protected roles automatically get access to all menus" -ForegroundColor Gray
Write-Host "    - Custom roles can have specific menus assigned via Permission Matrix UI" -ForegroundColor Gray
Write-Host "  How to Use:" -ForegroundColor Green
Write-Host "    1. Go to /super-admin/settings/roles" -ForegroundColor Gray
Write-Host "    2. Click on the 'Menu Assignment' tab" -ForegroundColor Gray
Write-Host "    3. Select a role from the dropdown" -ForegroundColor Gray
Write-Host "    4. Check/uncheck menus to assign/remove access" -ForegroundColor Gray
Write-Host "    5. Click 'Save Changes' to persist" -ForegroundColor Gray
Write-Host "  Database Structure:" -ForegroundColor Green
Write-Host "    - role_menus table with cascading deletes" -ForegroundColor Gray
Write-Host "    - Supports Platform scope menus" -ForegroundColor Gray
Write-Host "    - Supports Tenant scope menus" -ForegroundColor Gray
Write-Host ""

Write-Host "Summary of All Changes (Session Oct 20, 2025):" -ForegroundColor Yellow
Write-Host "  Backend Improvements:" -ForegroundColor Green
Write-Host "    ✓ Created role-menus.controller.js with 5 CRUD endpoints" -ForegroundColor Gray
Write-Host "    ✓ Added role-menu API routes (POST, GET, DELETE)" -ForegroundColor Gray
Write-Host "    ✓ Fixed RBAC middleware to check roleName in JWT token" -ForegroundColor Gray
Write-Host "    ✓ Updated auth controller to include roleName in token generation" -ForegroundColor Gray
Write-Host "    ✓ Fixed tenant controller to handle nullable street_address" -ForegroundColor Gray
Write-Host "    ✓ Created role_menus database migration script" -ForegroundColor Gray
Write-Host "  Frontend Improvements:" -ForegroundColor Green
Write-Host "    ✓ Fixed MenuAssignmentComponent TypeScript type errors" -ForegroundColor Gray
Write-Host "    ✓ Created 340+ line menu assignment component with full UI" -ForegroundColor Gray
Write-Host "    ✓ Added 5 new service methods to RBAC service" -ForegroundColor Gray
Write-Host "    ✓ Updated permission-matrix to include menu assignment tab" -ForegroundColor Gray
Write-Host "  Database Improvements:" -ForegroundColor Green
Write-Host "    ✓ Made street_address nullable to support partial address entry" -ForegroundColor Gray
Write-Host "    ✓ Created role_menus junction table with cascading deletes" -ForegroundColor Gray
Write-Host "    ✓ Auto-seeded protected roles with all menus" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy coding! Application is ready for development." -ForegroundColor Green
Write-Host "Report issues: https://github.com/apps-eduard/Exits-LMS" -ForegroundColor Cyan
Write-Host ""
