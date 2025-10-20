# Menu Structure - Exits LMS

**Last Updated:** October 21, 2025

## Overview

The Exits LMS uses a dynamic menu system with role-based access control. Menus are stored in the database and assigned to roles through the `role_menus` junction table.

## Platform Menus (24 Total)

### 1. Dashboard (1 menu)
- 🏠 **Dashboard** - Main overview and statistics

### 2. Tenant Management (3 menus)
- 🏢 **Tenants** (Parent)
  - 👥 **User Tenants** - Active tenant users (formerly "Active Tenants")
  - ➕ **Create Tenant** - Create new tenant

**Note:** "Suspended Tenants" menu has been removed

### 3. System Analytics (4 menus)
- 📈 **System Analytics** (Parent)
  - 💰 **Revenue Reports**
  - 👥 **User Activity Reports**
  - 🏢 **Tenant Usage Reports**

### 4. Billing & Subscriptions (4 menus)
- 💳 **Subscriptions** (Parent)
  - 📦 **Subscription Plans**
  - 🧾 **Invoices**
  - 💵 **Payments**

### 5. Notifications (3 menus)
- 📬 **Notifications** (Parent)
  - 🔔 **Alerts**
  - 📨 **Announcements**

### 6. Health and Logs (6 menus)
- 🏥 **Health and Logs** (Parent)
  - 📜 **Audit Logs**
  - 📋 **System Logs**
  - ⚡ **Performance Metrics**
  - 🐛 **Error Logs**
  - ⚙️ **Background Jobs**

### 7. Settings (2 menus)
- ⚙️ **Settings** (Parent)
  - 🔐 **System Settings**

**Note:** "Email Configuration" and "API Management" menus have been removed

### 8. System Users (1 menu)
- 👨‍💼 **System Users** - Platform user management

## Tenant Menus (37 Total)

### 1. Customers (5 menus)
- 👥 **All Customers** (Parent)
  - ✅ **Active Customers**
  - ❌ **Inactive Customers**
  - 🆕 **New Customers**
  - 🆔 **Customer KYC**

### 2. Loans (5 menus)
- 💰 **All Loans** (Parent)
  - ✅ **Active Loans**
  - ⏳ **Pending Loans**
  - ✔️ **Completed Loans**
  - 📄 **Loan Applications**

### 3. Payments (5 menus)
- 💳 **All Payments** (Parent)
  - ⏳ **Pending Payments**
  - ✅ **Completed Payments**
  - ❌ **Failed Payments**
  - 🔄 **Payment Reconciliation**

### 4. Reports & Analytics (5 menus)
- 📈 **Dashboard Reports** (Parent)
  - 💰 **Financial Reports**
  - 👥 **Customer Reports**
  - 💵 **Loan Reports**
  - 💳 **Payment Reports**

### 5. Communications (4 menus)
- 📧 **Email Campaigns** (Parent)
  - 💬 **SMS Notifications**
  - 🔔 **Push Notifications**
  - 📋 **Communication Templates**

### 6. Advanced Features (4 menus)
- 🤖 **Automation Rules** (Parent)
  - 🔀 **Workflows**
  - 🔗 **Integrations**
  - 🔌 **API Access**

### 7. Documents (3 menus)
- 📄 **Document Library** (Parent)
  - 📂 **Document Templates**
  - 🔒 **Compliance Documents**

### 8. Settings (5 menus)
- ⚙️ **Organization Settings** (Parent)
  - 🏢 **Company Profile**
  - 💵 **Billing**
  - 👥 **Roles**
  - 👨‍💼 **Team Members**

## Recent Changes

### October 21, 2025
1. **Removed Menus:**
   - ❌ Suspended Tenants (from Tenant Management)
   - ❌ Email Configuration (from Settings)
   - ❌ API Management (from Settings)

2. **Renamed Menus:**
   - "Active Tenants" → "User Tenants" (slug: `active-tenants` → `user-tenants`)

3. **Menu Count Changes:**
   - Platform menus: 25 → 24
   - Tenant Management: 4 → 3
   - Settings: 4 → 2

## Setup Instructions

When running `setup.ps1`, the following menu-related scripts are executed:

1. **`npm run seed:menus`**
   - Seeds all 61 menus (24 platform + 37 tenant)
   - Creates parent-child relationships
   - Sets proper ordering

2. **`node scripts/assign-menus-to-super-admin.js`**
   - Assigns all 24 platform menus to Super Admin role
   - Ensures Super Admin has full menu access

## Database Structure

### Menus Table
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(50),
  route VARCHAR(500),
  parent_menu_id UUID REFERENCES menus(id),
  order_index INTEGER DEFAULT 0,
  scope VARCHAR(50) DEFAULT 'platform',
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Role Menus Junction Table
```sql
CREATE TABLE role_menus (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, menu_id)
);
```

## API Endpoints

### Menu Management
- `GET /api/menus/tree` - Get menu tree structure
- `GET /api/menus?scope=platform` - Get all platform menus
- `GET /api/menus?scope=tenant` - Get all tenant menus
- `GET /api/users/me/menus` - Get current user's accessible menus

### Role-Menu Assignment
- `POST /api/roles/:id/menus` - Assign menus to role
- `GET /api/roles/:id/menus` - Get role's assigned menus
- `DELETE /api/roles/:roleId/menus/:menuId` - Remove menu from role
- `GET /api/roles/menus/all` - Get all role-menu assignments

## Notes

- Email Configuration tab exists in Settings UI but not in sidenav
- The Settings page has tabs: Profile, General, Email, Security, Features, Menus, Roles & Menus
- Sidenav shows streamlined menu structure with reduced settings options
- Super Admin automatically gets all permissions and menus assigned
