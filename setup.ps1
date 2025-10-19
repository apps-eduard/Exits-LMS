# Exits LMS - Automated Setup Script
# This script will set up both backend and frontend

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Exits LMS - Automated Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgInstalled = $false
try {
    $pgVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
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
                Write-Host "✓ PostgreSQL found at: $($psqlPath.DirectoryName)" -ForegroundColor Green
                $pgInstalled = $true
                # Add to PATH for this session
                $env:Path += ";$($psqlPath.DirectoryName)"
                break
            }
        }
    }
}

if (-not $pgInstalled) {
    Write-Host "⚠ PostgreSQL not found in PATH" -ForegroundColor Yellow
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
    Write-Host "✗ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Check if .env.local exists in backend
Write-Host ""
Write-Host "Checking backend configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env.local")) {
    Write-Host "⚠️  backend\.env.local not found!" -ForegroundColor Yellow
    Write-Host "Please create it first:" -ForegroundColor Cyan
    Write-Host "  cp backend\.env.example backend\.env.local" -ForegroundColor White
    Write-Host "  Edit backend\.env.local with your database credentials" -ForegroundColor White
    $response = Read-Host "Press Enter to continue once you've created backend\.env.local"
    if (-not (Test-Path "backend\.env.local")) {
        Write-Host "✗ backend\.env.local still not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ backend\.env.local found" -ForegroundColor Green
}

# Run database migrations
Write-Host ""
Write-Host "Creating database tables..." -ForegroundColor Yellow
Write-Host "Note: Make sure PostgreSQL is running and 'exits_lms' database exists" -ForegroundColor Cyan

Write-Host ""
Write-Host "Executing migration script..." -ForegroundColor Cyan
npm run migrate 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Database migration failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues and solutions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. PostgreSQL is not running:" -ForegroundColor Cyan
    Write-Host "   Start PostgreSQL service and try again" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Database 'exits_lms' doesn't exist:" -ForegroundColor Cyan
    Write-Host "   psql -U postgres" -ForegroundColor Gray
    Write-Host "   CREATE DATABASE exits_lms;" -ForegroundColor Gray
    Write-Host "   \q" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Wrong database credentials:" -ForegroundColor Cyan
    Write-Host "   Check backend\.env.local configuration:" -ForegroundColor Gray
    Write-Host "   - DB_HOST" -ForegroundColor Gray
    Write-Host "   - DB_PORT" -ForegroundColor Gray
    Write-Host "   - DB_USER" -ForegroundColor Gray
    Write-Host "   - DB_PASSWORD" -ForegroundColor Gray
    Write-Host "   - DB_NAME" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. PostgreSQL connection error:" -ForegroundColor Cyan
    Write-Host "   Verify PostgreSQL is accessible from your system" -ForegroundColor Gray
    exit 1
}
Write-Host "✓ Database tables created successfully" -ForegroundColor Green

# Seed initial data
Write-Host ""
Write-Host "Seeding initial data (roles, permissions, users)..." -ForegroundColor Yellow
Write-Host ""
npm run seed 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Database seeding failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Initial data seeded successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Seeded data includes:" -ForegroundColor Cyan
Write-Host "  ✓ Platform Roles (Super Admin)" -ForegroundColor Gray
Write-Host "  ✓ Tenant Roles (Admin, Loan Officer, Cashier)" -ForegroundColor Gray
Write-Host "  ✓ Permissions for all roles" -ForegroundColor Gray
Write-Host "  ✓ Super Admin user account" -ForegroundColor Gray
Write-Host "  ✓ Demo tenant with admin user" -ForegroundColor Gray

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
    Write-Host "ℹ️  frontend\.env.local not found" -ForegroundColor Cyan
    Write-Host "Creating frontend\.env.local from example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✓ frontend\.env.local created" -ForegroundColor Green
    } else {
        Write-Host "⚠️  frontend\.env.example not found!" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ frontend\.env.local found" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Navigate back
Set-Location -Path ".."

# Success message
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Database Status:" -ForegroundColor Yellow
Write-Host "  ✓ Tables created" -ForegroundColor Green
Write-Host "  ✓ Roles configured" -ForegroundColor Green
Write-Host "  ✓ Permissions assigned" -ForegroundColor Green
Write-Host "  ✓ Initial data seeded" -ForegroundColor Green
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
Write-Host ""
Write-Host "  Tenant Admin (Demo):" -ForegroundColor Cyan
Write-Host "    Email: admin@demo.com" -ForegroundColor White
Write-Host "    Password: demo123" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  Security Reminder:" -ForegroundColor Yellow
Write-Host "  • Change these passwords immediately in production!" -ForegroundColor Red
Write-Host "  • Never commit .env files to GitHub" -ForegroundColor Red
Write-Host "  • Keep .env.local files on your local machine only" -ForegroundColor Red
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  • See ENV_SETUP_GUIDE.md for environment configuration" -ForegroundColor Cyan
Write-Host "  • See GITHUB_PUSH_GUIDE.md for GitHub push instructions" -ForegroundColor Cyan
Write-Host "  • See START_HERE.md for quick reference" -ForegroundColor Cyan
Write-Host ""

Write-Host "Happy coding! 🚀" -ForegroundColor Green
