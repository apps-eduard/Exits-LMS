# Environment Setup Guide

## Overview
This project uses environment variables to manage configuration across different environments (development, staging, production). This guide explains how to set up environment files locally and when pushing to GitHub.

## Environment Files Structure

### Files to Track in Git
- `.env.example` - Template with placeholder values (tracked)
- `backend/.env.example` - Backend template (tracked)
- `frontend/.env.example` - Frontend template (tracked)

### Files to Ignore in Git
- `.env` - Production secrets (NEVER commit)
- `.env.local` - Local development secrets (NEVER commit)
- `.env.*.local` - Any local environment variants (NEVER commit)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Copy the example file to create local environment
cp .env.example .env.local

# Edit .env.local with your local values
# Important: Change JWT secrets and database password for production
```

**Backend `.env.local` should contain:**
```properties
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exits_lms
DB_USER=postgres
DB_PASSWORD=your_local_password
JWT_SECRET=your_local_secret
JWT_REFRESH_SECRET=your_local_refresh_secret
FRONTEND_URL=http://localhost:4200
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
```

### 2. Frontend Setup

```bash
cd frontend

# Copy the example file to create local environment
cp .env.example .env.local

# Edit .env.local with your local values
```

**Frontend `.env.local` should contain:**
```properties
ANGULAR_APP_NAME=Exits LMS
ANGULAR_APP_VERSION=1.0.0
NG_APP_API_BASE_URL=http://localhost:3000/api
NG_APP_API_TIMEOUT=30000
NG_APP_ENVIRONMENT=development
```

### 3. Update Application Code to Use Environment Variables

**Backend (main.ts or app.module.ts):**
```typescript
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
```

**Frontend (environment.ts files):**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: process.env['NG_APP_API_BASE_URL'] || 'http://localhost:3000/api'
};
```

## GitHub Push Checklist

Before pushing to GitHub:

1. ✅ **Do NOT commit `.env` files**
   ```bash
   git status  # Verify .env files are not staged
   ```

2. ✅ **Commit `.env.example` files**
   ```bash
   git add .env.example backend/.env.example frontend/.env.example
   git commit -m "docs: add environment configuration examples"
   ```

3. ✅ **Verify `.gitignore` is correct**
   ```bash
   cat .gitignore  # Check .env and .env.local are ignored
   ```

4. ✅ **Double-check before pushing**
   ```bash
   git diff --cached  # Review all staged changes
   git push
   ```

## Production Deployment

For production environments:

1. **Create production `.env` files** on the server (NOT in Git)
   ```bash
   # On production server
   sudo nano backend/.env.production
   # Add production secrets
   ```

2. **Use environment-specific configs:**
   ```bash
   # Load production config
   NODE_ENV=production node dist/main.js
   ```

3. **Security Best Practices:**
   - Use strong, randomly generated JWT secrets
   - Never use development secrets in production
   - Rotate secrets regularly
   - Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
   - Use SSL/HTTPS in production

## Troubleshooting

### Environment variables not loading?

1. **Backend:** Check that you're using `process.env.VARIABLE_NAME`
2. **Frontend:** Verify Angular is loading `.env.local` via `ng serve`
3. **Docker:** Pass env variables via `-e` flag or `.env` file

### Accidentally committed `.env`?

```bash
# Remove from git history (immediately!)
git rm --cached .env .env.local
git commit -m "remove: accidentally committed env files"

# Invalidate secrets immediately!
# Change all JWT secrets in production
```

## Additional Resources

- [12 Factor App - Config](https://12factor.net/config)
- [Angular Environment Setup](https://angular.io/guide/build#configuring-environment-specific-defaults)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
