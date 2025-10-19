# Restart Backend Server (Windows)
# Usage: .\restart.ps1

Write-Host "🛑 Stopping backend server..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
npm start
