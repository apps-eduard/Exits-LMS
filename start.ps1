# Exits LMS - Quick Start Script
# This script opens two terminals and starts both backend and frontend

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Starting Exits LMS..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$currentPath = Get-Location

# Start Backend in a new terminal
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\backend'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in a new terminal
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host 'Frontend Server' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Servers Starting..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two PowerShell windows will open." -ForegroundColor Yellow
Write-Host "Wait for both servers to start (may take a minute)." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Green
Write-Host "http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login with:" -ForegroundColor Yellow
Write-Host "  admin@exits-lms.com / admin123 (Super Admin)" -ForegroundColor White
Write-Host "  admin@demo.com / demo123 (Tenant Admin)" -ForegroundColor White
Write-Host ""
