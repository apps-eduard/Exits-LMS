# Database Setup Helper
# Run this in a regular PowerShell/Command Prompt (not VS Code terminal)
# PostgreSQL must be in PATH or run from PostgreSQL directory

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Exits LMS - Database Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get PostgreSQL password
Write-Host "Enter your PostgreSQL password for user 'postgres':" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for psql
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "Step 1: Creating database 'exits_lms'..." -ForegroundColor Yellow

# Create database
$createDb = @"
SELECT 'CREATE DATABASE exits_lms'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'exits_lms')\gexec
"@

echo $createDb | psql -U postgres -h localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database 'exits_lms' ready" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create database" -ForegroundColor Red
    Write-Host "You may need to create it manually:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres" -ForegroundColor Cyan
    Write-Host "  CREATE DATABASE exits_lms;" -ForegroundColor Cyan
    $env:PGPASSWORD = $null
    exit 1
}

Write-Host ""
Write-Host "✓ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run in VS Code terminal:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run migrate" -ForegroundColor White
Write-Host "  npm run seed" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

# Clear password
$env:PGPASSWORD = $null
