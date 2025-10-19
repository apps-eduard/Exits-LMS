# Debug Logs Guide - Signup Flow

## 🎯 Overview
Complete console logging has been added to track the entire signup flow from form submission to database creation. This helps identify where errors occur.

---

## 📱 Frontend Console Logs

### **Signup Component (`signup.component.ts`)**

When user clicks "Create Account" button, you'll see:

```
🚀 [COMPLETE_SIGNUP] Starting signup process...
📋 [FORM_DATA_COLLECTED] {
  adminEmail: "user@example.com",
  organizationName: "My Company",
  subdomain: "my-company" or "(auto-generated)",
  selectedFeatures: ["money-loan"]
}
📤 [SENDING_PAYLOAD] Calling createTenant API...
   Payload: {detailed payload object}
🌐 [TENANT_SERVICE] Making POST request to: http://localhost:3000/api/tenants
📦 [REQUEST_PAYLOAD] {...payload...}
```

**On Success:**
```
✅ [API_SUCCESS] Response received:
   Success: true
   Tenant ID: 12345
   Message: "Tenant created successfully!"
🎉 [SIGNUP_SUCCESS] Account created successfully!
⏳ [REDIRECTING] Will redirect to login in 2 seconds...
🔄 [REDIRECT] Navigating to /login
```

**On Error:**
```
❌ [API_ERROR] Request failed:
   Status: 500
   Message: "Failed to create tenant"
   Full Error: {...error details...}
📢 [ERROR_DISPLAYED_TO_USER]: "Failed to create account. Please try again."
```

**On Form Validation Error:**
```
❌ [FORM_VALIDATION_FAILED]
  Signup Form Valid: false
  Signup Form Errors: {...field errors...}
  Tenant Form Valid: false
  Tenant Form Errors: {...field errors...}
```

---

## 🔧 Backend Console Logs

### **Tenant Controller (`tenant.controller.js`)**

When API request arrives:

```
📝 [CREATE_TENANT] Starting tenant creation process...
📦 [REQUEST_BODY] {detailed request payload}
✅ [EXTRACTED_DATA] {name, subdomain, contactFirstName, ...}
```

**Subdomain Generation (if empty):**
```
🔄 [GENERATING_SUBDOMAIN] Auto-generating from name: "My Company"
✅ [GENERATED_SUBDOMAIN] my-company-a7k2p
```

**Database Operations:**
```
💾 [INSERTING_TENANT] Creating tenant record...
✅ [TENANT_CREATED] {
  id: 12345,
  name: "My Company",
  subdomain: "my-company-a7k2p"
}
📍 [CREATING_ADDRESS] Creating address record...
✅ [ADDRESS_CREATED] {addressId: 67890}
✅ [ADDRESS_LINKED] Address linked to tenant
🔧 [CREATING_FEATURES] Creating tenant features...
✅ [FEATURES_CREATED] Default features created
👤 [CREATING_ADMIN] Creating admin user... {adminEmail, adminFirstName, adminLastName}
🔑 [ROLE_FOUND] {roleId: 1, roleName: "tenant-admin"}
✅ [ADMIN_CREATED] Admin user created successfully
✅ [TRANSACTION_COMMITTED] All changes committed successfully
🔒 [CONNECTION_RELEASED] Database connection released
```

**On Error:**
```
❌ [ERROR_OCCURRED] Transaction rolled back
❌ [FULL_ERROR] Unique violation: duplicate key value violates...
❌ [ERROR_CODE] 23505
❌ [ERROR_DETAILS] {...full error object...}
❌ [UNIQUE_VIOLATION] Subdomain or email already exists
```

---

## 🐛 How to Use These Logs

### **1. Open Browser DevTools**
- Press `F12` or Right-click → Inspect
- Go to **Console** tab
- Keep it open while clicking "Create Account"

### **2. Read the Frontend Logs First**
These tell you:
- ✅ Forms are valid
- ✅ Data was collected
- ✅ API call was made
- ❌ Connection error (ERR_CONNECTION_REFUSED)
- ❌ API error returned

### **3. Check Backend Logs**
- Look at Node.js terminal where backend is running
- Search for error indicators: ❌, ⚠️
- Identify which step failed (tenant, address, admin, features, etc.)

### **4. Common Issues**

| Error | Meaning | Solution |
|-------|---------|----------|
| `ERR_CONNECTION_REFUSED` | Backend not running | Start backend: `npm start` in backend folder |
| `FORM_VALIDATION_FAILED` | Required fields empty | Check each field, fill all marked with * |
| `UNIQUE_VIOLATION` | Email/subdomain exists | Use different email or leave subdomain empty |
| `ROLE_NOT_FOUND` | tenant-admin role missing | Run database migration: `node scripts/migrate*.js` |
| `TRANSACTION_ROLLED_BACK` | Database error | Check PostgreSQL is running |

---

## 📊 Full Flow Diagram

```
User fills form → Clicks Create Account
        ↓
Frontend validates form
        ↓
Shows 🚀 [COMPLETE_SIGNUP] log
        ↓
Collects data → Shows 📋 [FORM_DATA_COLLECTED]
        ↓
Sends HTTP POST → Shows 📤 [SENDING_PAYLOAD]
        ↓
Backend receives request → Shows 📝 [CREATE_TENANT]
        ↓
Backend validates → Shows ✅ [EXTRACTED_DATA]
        ↓
Inserts tenant → Shows 💾 [INSERTING_TENANT]
        ↓
Creates address → Shows 📍 [CREATING_ADDRESS]
        ↓
Creates features → Shows 🔧 [CREATING_FEATURES]
        ↓
Creates admin → Shows 👤 [CREATING_ADMIN]
        ↓
Commits to DB → Shows ✅ [TRANSACTION_COMMITTED]
        ↓
Sends response → Frontend shows ✅ [API_SUCCESS]
        ↓
Redirects to login → Shows 🔄 [REDIRECT]
```

---

## 🔍 Example: Debugging a Connection Error

**Problem:** `net::ERR_CONNECTION_REFUSED`

**Solution Steps:**

1. Check frontend console:
   - If you see `🚀 [COMPLETE_SIGNUP]` but NOT `✅ [API_SUCCESS]`
   - And you see `ERR_CONNECTION_REFUSED`
   - → Backend is NOT running

2. In PowerShell/Terminal:
   ```bash
   cd backend
   npm start
   ```

3. Wait for: `Server running on port 3000` (or your port)

4. Try signup again

5. Frontend console should now show logs reaching backend

---

## 💡 Tips

- **Timestamps:** Browser adds timestamps to console logs
- **Filtering:** Type `[COMPLETE_SIGNUP]` in console search to filter
- **Network Tab:** Also check Network tab to see actual HTTP request/response
- **Save Logs:** Right-click console → Export logs to file for analysis
- **Both Consoles:** Keep both frontend AND backend consoles visible

---

**Added on:** October 19, 2025
**Status:** ✅ Active debugging enabled
