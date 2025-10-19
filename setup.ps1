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

# Run database migrations
Write-Host ""
Write-Host "Creating database tables..." -ForegroundColor Yellow
Write-Host "Note: Make sure PostgreSQL is running and 'exits_lms' database exists" -ForegroundColor Cyan

$response = Read-Host "Have you created the 'exits_lms' database? (Y/n)"
if ($response -eq 'n' -or $response -eq 'N') {
    Write-Host ""
    Write-Host "Please create the database first:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres" -ForegroundColor Cyan
    Write-Host "  CREATE DATABASE exits_lms;" -ForegroundColor Cyan
    Write-Host "  \q" -ForegroundColor Cyan
    exit 1
}

npm run migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Database migration failed!" -ForegroundColor Red
    Write-Host "Please check your database configuration in backend/.env" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Database tables created" -ForegroundColor Green

# Seed initial data
Write-Host ""
Write-Host "Seeding initial data..." -ForegroundColor Yellow
npm run seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Database seeding failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Initial data seeded" -ForegroundColor Green

# Navigate back
Set-Location -Path ".."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

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
Write-Host "  Setup Complete! ✓" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
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
Write-Host "  Super Admin: admin@exits-lms.com / admin123" -ForegroundColor White
Write-Host "  Tenant Admin: admin@demo.com / demo123" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
