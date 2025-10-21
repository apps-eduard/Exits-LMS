# Test User Password Reset Added to Setup ✅

## Changes Made

### 1. New Script: reset-password.js
**File:** `backend/scripts/reset-password.js`

**Purpose:** Reset test user passwords to known values during setup

**What it does:**
- ✅ Resets super admin password to `admin123`
- ✅ Resets demo user password to `demo123`
- ✅ Displays reset credentials in console
- ✅ Verifies users exist in database before updating

**Usage:**
```bash
node backend/scripts/reset-password.js
```

**Output:**
```
[RESET_PASSWORD] Starting test user password reset...

[RESET_PASSWORD] Resetting super admin: admin@exits-lms.com
✓ Super admin password reset successfully
  Email: admin@exits-lms.com
  Password: admin123

[RESET_PASSWORD] Resetting demo tenant user: demo@exits-lms.com
✓ Demo user password reset successfully
  Email: demo@exits-lms.com
  Password: demo123

[RESET_PASSWORD] ✅ Test user password reset complete!

You can now login with these credentials:
  Super Admin: admin@exits-lms.com / admin123
  Demo User:   demo@exits-lms.com / demo123
```

### 2. Updated: setup.ps1
**File:** `setup.ps1`

**Added at end of setup process:**
- Calls `reset-password.js` after all seeding
- Displays test user credentials clearly
- Handles errors gracefully (shows fallback credentials if script fails)
- Logs that passwords have been reset

**New section:**
```powershell
# Runs at the very end of setup, just before the final success message
& node "$PSScriptRoot\backend\scripts\reset-password.js"
```

## Flow

```
setup.ps1 runs...
  ↓
Backend setup
  ↓
Frontend setup
  ↓
Seeding (creates users with hashed passwords)
  ↓
Reset test user passwords ← NEW STEP
  ↓
Display test credentials ← NEW STEP
  ↓
"Happy coding! Application is ready..."
```

## Test User Credentials

**After running setup.ps1:**

| User | Email | Password |
|------|-------|----------|
| Super Admin | `admin@exits-lms.com` | `admin123` |
| Demo Tenant | `demo@exits-lms.com` | `demo123` |

## How to Login

1. Start frontend: `npm start` (in frontend folder)
2. Go to http://localhost:4200/login
3. Enter credentials from above
4. Click "Login"
5. You should now be able to access the dashboard

## What Happens if Reset Fails

If the reset script fails (e.g., database not running):
- ✅ Setup continues (doesn't fail)
- ✅ Fallback credentials displayed from seeding
- ✅ User can manually reset password by running the script later
- ✅ Same credentials still work (if they were seeded correctly)

## Manual Password Reset

If you need to reset passwords manually later:

```bash
cd backend
node scripts/reset-password.js
```

## Error Handling

The reset script handles:
- ✅ Missing users (checks if update affected any rows)
- ✅ Database connection errors (exits gracefully)
- ✅ Password hashing errors (exits with error code)
- ✅ File path issues (PowerShell catches exceptions)

## Verification

**Check if credentials work:**

```bash
# Terminal
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exits-lms.com","password":"admin123"}'

# Expected response (token):
{"success":true,"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

## Status

✅ **Implemented:** Reset script created
✅ **Integrated:** Added to setup.ps1
✅ **Error handling:** Graceful fallback if script fails
✅ **User friendly:** Clear credential display at end
✅ **Tested:** Works with seeded users

---

## Benefits

1. **Consistent Testing** - Always have working test credentials
2. **Less Confusion** - Credentials displayed at setup end
3. **Reproducible** - Easy to reset passwords anytime
4. **Safe** - Doesn't fail if database isn't running
5. **Clear Flow** - Users know exactly what credentials to use

---

**Document Created:** October 21, 2025
**Files Added:** 1 (reset-password.js)
**Files Modified:** 1 (setup.ps1)
**Test Credentials:** Automatically reset at setup end
