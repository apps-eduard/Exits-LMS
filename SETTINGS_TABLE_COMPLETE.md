# Settings Table Implementation - Complete

## Overview
Successfully implemented the missing `settings` and `tenant_settings` tables for platform and tenant-specific configuration management.

## Changes Made

### 1. Database Migration (backend/scripts/migrate.js)
- Added `settings` table creation
  - Columns: id (UUID PK), key (VARCHAR UNIQUE), value (TEXT), description (TEXT), created_at, updated_at
  - Index on `key` column for fast lookups
  
- Added `tenant_settings` table creation
  - Columns: id (UUID PK), tenant_id (UUID FK), setting_key (VARCHAR), setting_value (TEXT), created_at, updated_at
  - Composite unique index on (tenant_id, setting_key)

### 2. Settings Seed Script (backend/scripts/seed-settings.js)
New script to populate default platform settings:
- **Platform Settings**: name, URL, support email, timezone, currency
- **Email Configuration**: SMTP host, port, sender email/name
- **Feature Flags**: email notifications, 2FA, API keys, modules (money-loan, BNPL, analytics)
- **Security Settings**: password minimum length, session timeout, max login attempts
- **Branding**: custom branding enable flag

Total: 19 default settings inserted on first run.

### 3. Package.json
Added new npm script: `npm run seed:settings`
- Command to re-seed settings without running full migration

### 4. Setup Script (setup.ps1)
Updated automated setup to include:
- After `npm run seed`: Runs `npm run seed:settings`
- New documentation section explaining seeded settings
- Updated database recreation instructions to include step 5 for seed:settings
- Error handling with helpful messages if settings seeding fails

## Database Tables

### settings
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### tenant_settings
```sql
CREATE TABLE tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, setting_key)
);
```

## Default Settings

| Key | Value | Description |
|-----|-------|-------------|
| platform_name | "Exits LMS" | Platform name |
| platform_url | "https://exits-lms.com" | Platform URL |
| support_email | "support@exits-lms.com" | Support email |
| timezone | "UTC" | Default timezone |
| currency | "PHP" | Default currency |
| smtp_host | "smtp.gmail.com" | SMTP host |
| smtp_port | 587 | SMTP port |
| sender_email | "noreply@exits-lms.com" | Sender email |
| sender_name | "Exits LMS" | Sender name |
| enable_email_notifications | true | Enable email notifications |
| enable_two_factor | false | Enable 2FA |
| password_min_length | 8 | Minimum password length |
| session_timeout | 30 | Session timeout in minutes |
| login_attempts | 5 | Max login attempts |
| enable_api_keys | true | Enable API keys |
| money_loan_enabled | true | Enable money-loan module |
| bnpl_enabled | true | Enable BNPL module |
| advanced_analytics_enabled | true | Enable advanced analytics |
| custom_branding_enabled | false | Enable custom branding |

## Controllers Using Settings

The `settings.controller.js` includes functions for:
- `getSettings()` - GET /api/settings (all platform settings)
- `getSetting(key)` - GET /api/settings/:key (single setting)
- `updateSettings()` - PUT /api/settings (bulk update)
- `updateSetting()` - PUT /api/settings/:key (single setting update)
- `testEmailConnection()` - POST /api/settings/email/test (test email config)
- `getTenantSettings()` - GET /api/tenant-settings (tenant-specific)
- `updateTenantSettings()` - PUT /api/tenant-settings (update tenant settings)
- `getTenantBranding()` - GET /api/tenant-branding (tenant branding)
- `updateTenantBranding()` - PUT /api/tenant-branding (update branding)

## Setup Instructions

### First Time Setup
```powershell
.\setup.ps1
```
This will:
1. Run `npm run migrate` to create all tables including settings
2. Run `npm run seed` to populate roles, permissions, users
3. Run `npm run seed:settings` to populate platform settings

### Re-seed Settings
```bash
cd backend
npm run seed:settings
```

### Recreate Database
```bash
# Drop and recreate database
psql -U postgres -c 'DROP DATABASE IF EXISTS exits_lms;'
psql -U postgres -c 'CREATE DATABASE exits_lms;'

# Run all setup
cd backend
npm run migrate
npm run seed
npm run seed:settings
```

## Fixed Issues

✅ **Error**: `relation "settings" does not exist`
- **Cause**: Settings table was referenced in code but not created in database
- **Fix**: Added settings table creation to migrate.js and seed to setup.ps1

✅ **Error**: Settings endpoint returning 500
- **Cause**: No settings table in database
- **Fix**: Created settings table with all indexes

## Testing

To verify the settings table works:

```bash
# Start backend
cd backend
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/settings
```

Expected response:
```json
{
  "success": true,
  "settings": {
    "platform_name": "Exits LMS",
    "platform_url": "https://exits-lms.com",
    "support_email": "support@exits-lms.com",
    ...
  }
}
```

## Status
✅ **COMPLETE** - All settings infrastructure is now in place and working
