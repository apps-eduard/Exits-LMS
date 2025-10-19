@echo off
REM GitHub Push Verification Script (Windows)
REM Run this before pushing to verify .env files are not exposed

echo.
echo ====================================================
echo GitHub Push Verification
echo ====================================================
echo.

setlocal enabledelayedexpansion
set HAS_DANGER=0
set HAS_WARNING=0

echo Checking for exposed environment files...
echo.

REM Check for .env files that should NOT be committed
echo ❌ Checking for .env files that should NOT be committed:
for %%F in (.env .env.local backend\.env backend\.env.local frontend\.env frontend\.env.local) do (
    git ls-files --cached | findstr /R /C:"^%%F$" >nul
    if !errorlevel! equ 0 (
        echo    ❌ DANGER: %%F is staged for commit!
        set HAS_DANGER=1
    ) else (
        echo    ✅ %%F is not staged
    )
)

echo.
echo ✅ Checking for .env.example files that SHOULD be committed:
for %%F in (.env.example backend\.env.example frontend\.env.example) do (
    git ls-files --cached | findstr /R /C:"^%%F$" >nul
    if !errorlevel! equ 0 (
        echo    ✅ %%F is staged
    ) else (
        if exist "%%F" (
            echo    ⚠️  %%F exists but is NOT staged
            echo       Run: git add %%F
            set HAS_WARNING=1
        ) else (
            echo    ⚠️  %%F does not exist
        )
    )
)

echo.
echo 📋 Checking for secrets in staged files:
git diff --cached | findstr /I "password secret api_key token" >nul
if !errorlevel! equ 0 (
    echo    ❌ DANGER: Secrets found in staged files!
    git diff --cached | findstr /I "password secret api_key token"
    set HAS_DANGER=1
) else (
    echo    ✅ No secrets detected in staged files
)

echo.
echo 📁 Staged files summary:
git diff --cached --name-only | more

echo.
if !HAS_DANGER! equ 1 (
    echo ❌ PUSH BLOCKED: Dangerous files detected!
    echo    Remove them from staging:
    echo    git reset HEAD ^<filename^>
    exit /b 1
) else if !HAS_WARNING! equ 1 (
    echo ⚠️  WARNINGS: Some files need attention
    exit /b 1
) else (
    echo ✅ ALL CHECKS PASSED - Ready to push!
    exit /b 0
)
