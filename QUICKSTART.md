# Exits LMS - Quick Start Guide

This guide will help you get the Exits Loan Management SaaS platform up and running quickly.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v16+) installed
- ✅ PostgreSQL (v12+) installed and running
- ✅ npm installed (comes with Node.js)

## Step-by-Step Setup

### 1. Database Setup

**Option A: Using pgAdmin**
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `exits_lms`
4. Click "Save"

**Option B: Using psql command line**
```powershell
psql -U postgres
CREATE DATABASE exits_lms;
\q
```

### 2. Backend Setup

Open PowerShell and navigate to the backend directory:

```powershell
cd "d:\speed-space\Exits LMS\backend"

# Install dependencies
npm install

# The .env file is already configured with default settings
# If you need to change database credentials, edit .env file

# Create database tables
npm run migrate

# Seed initial data (creates Super Admin and Demo Tenant)
npm run seed

# Start the backend server
npm run dev
```

✅ Backend should now be running on **http://localhost:3000**

### 3. Frontend Setup

Open a **NEW** PowerShell window:

```powershell
cd "d:\speed-space\Exits LMS\frontend"

# Install dependencies
npm install

# Start the frontend server
npm start
```

✅ Frontend should now be running on **http://localhost:4200**

### 4. Access the Application

Open your browser and go to: **http://localhost:4200**

## Login Credentials

### Super Admin Access
- **URL:** http://localhost:4200/login
- **Email:** `admin@exits-lms.com`
- **Password:** `admin123`
- **Access:** Full platform control, manage all tenants

### Demo Tenant Access
- **URL:** http://localhost:4200/login
- **Email:** `admin@demo.com`
- **Password:** `demo123`
- **Access:** Tenant dashboard with Money-Loan and BNPL modules enabled

## What You Can Do

### As Super Admin
1. **Manage Tenants**
   - Create new tenant organizations
   - Enable/disable modules (Money-Loan, BNPL) per tenant
   - View tenant users
   - Suspend or activate tenants

2. **View Audit Logs**
   - Track all platform activities
   - Monitor tenant actions

3. **Platform Settings**
   - Configure system-wide settings

### As Tenant Admin
1. **Money-Loan Module**
   - Manage customers
   - Create loan products
   - Process loans
   - Track payments

2. **BNPL Module**
   - Manage merchants
   - Create BNPL orders
   - Track installments
   - Process payments

3. **Dashboard**
   - View metrics and statistics
   - Monitor overdue loans
   - Track upcoming payments

## Troubleshooting

### Backend Won't Start
```powershell
# Check if PostgreSQL is running
# Check database credentials in backend/.env
# Ensure port 3000 is not in use
```

### Frontend Won't Start
```powershell
# Check if port 4200 is available
# Try clearing node_modules and reinstalling:
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Can't Connect to Database
1. Verify PostgreSQL is running
2. Check credentials in `backend/.env`
3. Ensure database `exits_lms` exists
4. Default credentials: user=postgres, password=postgres

### Database Tables Not Created
```powershell
cd backend
npm run migrate
```

### No Super Admin User
```powershell
cd backend
npm run seed
```

## Next Steps

Once everything is running:

1. **Explore as Super Admin**
   - Login with admin@exits-lms.com
   - Create a new tenant
   - Enable modules for the tenant

2. **Test Tenant Features**
   - Login with admin@demo.com
   - Add customers
   - Create loan products
   - Process a loan

3. **Test Theme Toggle**
   - Click the sun/moon icon to switch between light and dark mode

4. **Check Tenant Isolation**
   - Create multiple tenants
   - Verify data separation

## Development Workflow

### Backend Changes
1. Edit files in `backend/`
2. Server auto-restarts (nodemon)
3. Test API with browser or Postman

### Frontend Changes
1. Edit files in `frontend/src/`
2. Browser auto-refreshes
3. Check console for errors

## Stopping the Servers

### Stop Backend
Press `Ctrl + C` in the backend PowerShell window

### Stop Frontend
Press `Ctrl + C` in the frontend PowerShell window

## Default Ports

- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:4200
- **PostgreSQL:** localhost:5432

## Quick Commands Reference

### Backend
```powershell
cd backend
npm run dev          # Start development server
npm run migrate      # Create database tables
npm run seed         # Seed initial data
npm test             # Run tests
```

### Frontend
```powershell
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## Support

If you encounter issues:
1. Check the detailed README files in `/backend` and `/frontend`
2. Verify all prerequisites are installed
3. Check console/terminal for error messages
4. Ensure all ports are available

## Security Note

⚠️ **Important:** The default credentials are for development only. Change them before deploying to production!

---

**Happy coding!** 🚀
