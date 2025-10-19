# Manual Setup Guide - PostgreSQL PATH Issue Workaround

## 🔧 The Issue
PostgreSQL is installed on your system but not accessible from VS Code's terminal because it's not in the PATH environment variable.

## ✅ Quick Fix Option 1: Add PostgreSQL to System PATH

### Step 1: Find PostgreSQL Installation Path
1. Open Windows Explorer
2. Navigate to: `C:\Program Files\PostgreSQL\`
3. Find your version folder (e.g., `18\bin`)
4. Copy the full path (e.g., `C:\Program Files\PostgreSQL\18\bin`)

### Step 2: Add to System PATH
1. Press `Win + X` → Select **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **System variables**, find and select **Path**
5. Click **Edit**
6. Click **New**
7. Paste your PostgreSQL bin path: `C:\Program Files\PostgreSQL\18\bin`
8. Click **OK** on all dialogs

### Step 3: Restart VS Code
Close and reopen VS Code completely for the PATH changes to take effect.

---

## ✅ Quick Fix Option 2: Manual Database Setup (Recommended for Now)

You can set up the database manually without using the setup script:

### 1. Create Database
Open Command Prompt (outside VS Code) or PowerShell as Administrator:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE exits_lms;

# Exit psql
\q
```

### 2. Install Backend Dependencies
In VS Code terminal:

```powershell
cd backend
npm install
```

### 3. Configure Environment
The `.env` file should already exist in the `backend` folder. Verify it has:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exits_lms
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

**Update `DB_PASSWORD` with your actual PostgreSQL password!**

### 4. Run Migrations
```powershell
npm run migrate
```

This creates all 13 tables in the database.

### 5. Seed Initial Data
```powershell
npm run seed
```

This creates:
- Super Admin user (admin@exits-lms.com / admin123)
- Demo Tenant (admin@demo.com / demo123)
- All roles and permissions

### 6. Start Backend
```powershell
npm run dev
```

Backend should now run on http://localhost:3000

### 7. Install Frontend Dependencies
Open a NEW terminal in VS Code:

```powershell
cd frontend
npm install
```

### 8. Start Frontend
```powershell
npm start
```

Frontend should run on http://localhost:4200

---

## 🎯 Verify Setup

### Backend Health Check
Open browser: http://localhost:3000

You should see: `{"message":"Exits LMS API is running"}`

### Database Check
In Command Prompt (outside VS Code):

```powershell
psql -U postgres -d exits_lms

# List tables
\dt

# You should see:
# tenants, users, roles, permissions, role_permissions, tenant_features,
# customers, loan_products, loans, loan_payments,
# bnpl_merchants, bnpl_orders, bnpl_payments, audit_logs

# Exit
\q
```

### Frontend Check
1. Open browser: http://localhost:4200
2. You should see the landing page
3. Click "Get Started" or "Login"
4. Login with: **admin@exits-lms.com** / **admin123**
5. You should be redirected to Super Admin Dashboard

---

## 🔐 Default Credentials

### Super Admin (Platform Scope)
- **Email**: admin@exits-lms.com
- **Password**: admin123
- **Access**: Full platform control, tenant management

### Demo Tenant Admin (Tenant Scope)
- **Email**: admin@demo.com
- **Password**: demo123
- **Access**: Demo Microfinance tenant dashboard

---

## 🐛 Common Issues

### Issue: "database 'exits_lms' does not exist"
**Solution**: Create the database first:
```powershell
psql -U postgres
CREATE DATABASE exits_lms;
\q
```

### Issue: "password authentication failed"
**Solution**: Update `backend/.env` with correct password:
```env
DB_PASSWORD=your_actual_password
```

### Issue: "Cannot find module '@angular/core'"
**Solution**: Install frontend dependencies:
```powershell
cd frontend
npm install
```

### Issue: "Port 3000 already in use"
**Solution**: Kill the process or change port in `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

### Issue: "Port 4200 already in use"
**Solution**: Angular CLI will automatically prompt to use a different port (e.g., 4201)

---

## 📦 What Gets Created

### Database Tables (13)
1. **tenants** - Organizations using the platform
2. **users** - All users (platform and tenant)
3. **roles** - User roles (Super Admin, Tenant Admin, Loan Officer, Cashier)
4. **permissions** - Granular permissions
5. **role_permissions** - Role-permission mapping
6. **tenant_features** - Module enablement (Money-Loan, BNPL)
7. **customers** - Loan/BNPL customers
8. **loan_products** - Loan product definitions
9. **loans** - Active loans
10. **loan_payments** - Loan payment records
11. **bnpl_merchants** - BNPL merchant partners
12. **bnpl_orders** - BNPL orders
13. **bnpl_payments** - BNPL payment records
14. **audit_logs** - System audit trail

### Initial Data
- 1 Super Admin user
- 1 Demo Tenant ("Demo Microfinance")
- 4 Roles with 16 permissions
- 2 modules enabled for demo tenant

---

## 🚀 Quick Start Commands

Once everything is set up, use these commands daily:

### Start Backend
```powershell
cd backend
npm run dev
```

### Start Frontend (in new terminal)
```powershell
cd frontend
npm start
```

### Or use the start script:
```powershell
.\start.ps1
```

---

## 📞 Next Steps After Setup

1. **Test Login**: Login as Super Admin
2. **Explore Dashboard**: View tenant metrics
3. **Create a Tenant**: Click "Create Tenant"
4. **Toggle Modules**: Enable/disable Money-Loan or BNPL
5. **View Tenant Details**: Click on any tenant to see details

---

## 💡 Pro Tips

### VS Code Integrated Terminal Issue
If PostgreSQL commands don't work in VS Code terminal but work in regular Command Prompt, you have two options:

**Option A**: Always use Command Prompt (outside VS Code) for PostgreSQL commands
**Option B**: Add PostgreSQL to PATH (see Option 1 at top)

### Environment Variables
Keep your `.env` file secure and never commit it to Git. It's already in `.gitignore`.

### Database Backup
To backup your database:
```powershell
pg_dump -U postgres exits_lms > backup.sql
```

To restore:
```powershell
psql -U postgres exits_lms < backup.sql
```

---

## ✅ Setup Complete Checklist

- [ ] PostgreSQL installed (18.0)
- [ ] Node.js installed (v16+)
- [ ] Database `exits_lms` created
- [ ] Backend `.env` configured with correct password
- [ ] Backend dependencies installed (`npm install`)
- [ ] Migrations run successfully (`npm run migrate`)
- [ ] Seed data loaded (`npm run seed`)
- [ ] Backend server running (http://localhost:3000)
- [ ] Frontend dependencies installed
- [ ] Frontend server running (http://localhost:4200)
- [ ] Can login as Super Admin
- [ ] Can view dashboard

---

**If you complete all steps above, your Exits LMS is fully operational!** 🎉

Need help? Check the main README.md or QUICKSTART.md for more details.
