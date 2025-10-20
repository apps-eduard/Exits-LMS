# Quick Start: Test Menu Filtering

## Setup

1. **Ensure Backend is Running**
```powershell
cd d:\speed-space\"Exits LMS"\backend
npm run dev
# Should see: Server listening on port 3000
```

2. **Ensure Frontend is Running**
```powershell
cd d:\speed-space\"Exits LMS"\frontend
npm start
# Should see: Local: http://localhost:4200
```

## Test Scenario 1: Role with NO Menus

### Setup
1. Go to http://localhost:4200/super-admin/settings
2. Click "🔐 Roles & Menus" tab
3. Find or create a role "Test Role - No Menus"
4. Make sure NO menus are checked
5. Click "Save All Changes"

### Test User Creation
1. Go to http://localhost:4200/super-admin/users
2. Create user: `nomenu@test.com` / password
3. Assign role: "Test Role - No Menus"
4. Logout

### Expected Result
1. Login as `nomenu@test.com`
2. Sidebar should be EMPTY (no menus)
3. Browser console should show:
   ```
   [MENU_SERVICE] Loading user-specific platform menus...
   [MENU_SERVICE] Converting user menus to nav sections: []
   [SUPER_ADMIN_LAYOUT] User-specific platform menu loaded: {sections: 0}
   ```

---

## Test Scenario 2: Role with LIMITED Menus

### Setup
1. Go to http://localhost:4200/super-admin/settings
2. Click "🔐 Roles & Menus" tab
3. Find or create "Loan Officer" role
4. Check only these menus:
   - ✅ All Customers
   - ✅ All Loans
   - ✅ Payments
5. Click "Save All Changes"

### Test User Creation
1. Go to http://localhost:4200/super-admin/users
2. Create user: `officer@test.com` / password
3. Assign role: "Loan Officer"
4. Logout

### Expected Result
1. Login as `officer@test.com`
2. Sidebar should show ONLY:
   - All Customers
   - All Loans
   - Payments
3. Browser console should show:
   ```
   [MENU_SERVICE] Converting user menus to nav sections: (3 menus)
   [SUPER_ADMIN_LAYOUT] User-specific platform menu loaded: {sections: 3}
   ```

---

## Test Scenario 3: Super Admin (All Menus)

### Test
1. Login as `admin@exits-lms.com` (Super Admin)
2. Sidebar should show ALL menus
3. Go to Settings → Roles & Menus
4. Verify Super Admin role shows all menus with checkmarks (read-only)

### Expected Result
- All menus available
- Super Admin checkboxes are disabled (gray)
- Can see all platform navigation items

---

## Test Scenario 4: API Endpoint Verification

### Test GET /api/users/me/menus

```bash
# 1. Get JWT token (login)
# Copy token from localStorage after login

# 2. Test endpoint
curl -X GET "http://localhost:3000/api/users/me/menus" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Expected Response:
{
  "success": true,
  "menus": [
    {
      "id": "uuid...",
      "name": "Customers",
      "slug": "customers",
      "icon": "👥",
      "route": "/tenant/customers",
      "scope": "tenant",
      "is_active": true,
      "order_index": 1,
      "parent_menu_id": null
    },
    // ... more menus
  ],
  "count": 5
}
```

---

## Debugging

### Check Browser Console
```javascript
// Open DevTools (F12) → Console
// Look for:
[MENU_SERVICE] 📋 Loading user-specific platform menus...
[MENU_SERVICE] ✅ User menu sections: [...]
[SUPER_ADMIN_LAYOUT] ✅ User-specific platform menu loaded
```

### Check Network Tab
1. Open DevTools (F12) → Network
2. Look for `GET /api/users/me/menus`
3. Verify:
   - Status: 200 OK
   - Authorization header present
   - Response contains expected menus

### Check Backend Logs
```bash
# In terminal where backend is running, look for:
[21:12:40.095] ✅ User menus retrieved
   {
     "userId": "...",
     "roleId": "...",
     "menuCount": 5
   }
[21:12:40.095] GET /api/users/me/menus 200 3ms
```

### If Sidebar is Empty (Fallback Menu)
```javascript
// Browser console should show:
[MENU_SERVICE] ❌ Failed to load user menus: [error details]
[MENU_SERVICE] 📦 Using fallback menu
// This means API failed, but user can still see fallback menu
```

---

## Common Issues & Fixes

### Issue: "User sees all menus when role has none"
**Cause**: Old `getDynamicPlatformMenu()` still being used
**Fix**: 
```bash
# Verify frontend is using new method:
grep "getDynamicPlatformMenuForUser" \
  d:\speed-space\"Exits LMS"\frontend\src\app\pages\super-admin\super-admin-layout.component.ts
# Should show the method is being called
```

### Issue: "API returns 500 error"
**Cause**: Backend route not registered or JWT token invalid
**Fix**:
```bash
# Check route exists:
grep "/me/menus" d:\speed-space\"Exits LMS"\backend\routes\user.routes.js

# Restart backend:
cd d:\speed-space\"Exits LMS"\backend
Stop-Process -Name node -Force
npm run dev
```

### Issue: "Sidebar shows fallback menu instead of user menus"
**Cause**: API failing or returning unexpected format
**Fix**:
1. Check browser console for error message
2. Check backend logs for database errors
3. Verify role_menus table has data:
   ```sql
   SELECT * FROM role_menus WHERE role_id = '{user_role_id}';
   ```

---

## Database Verification

### Check role_menus table exists
```sql
SELECT * FROM role_menus LIMIT 5;
```

### Check user's role
```sql
SELECT id, email, role_id, name as role_name 
FROM users u 
JOIN roles r ON u.role_id = r.id
WHERE email = 'test@example.com';
```

### Check menus assigned to role
```sql
SELECT m.* FROM menus m
JOIN role_menus rm ON m.id = rm.menu_id
WHERE rm.role_id = '{role_id}'
ORDER BY m.order_index;
```

---

## Success Checklist ✅

- [ ] Role with no menus shows empty sidebar
- [ ] Role with 3 menus shows only those 3
- [ ] Super Admin shows all menus
- [ ] Parent-child hierarchy works (unchecking parent unchecks children)
- [ ] API returns correct menu count
- [ ] No console errors
- [ ] Network requests show correct Authorization header
- [ ] Backend logs show successful queries
- [ ] Fallback menu works if API fails
- [ ] Can assign/unassign menus from admin panel
- [ ] Changes take effect on next login

---

## Performance Testing

### Measure API Response Time
```javascript
// In browser console:
console.time('getUserMenus');
fetch('/api/users/me/menus', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(d => console.timeEnd('getUserMenus'));

// Should show: ~5-50ms depending on menu count
```

### Monitor Memory
- Open DevTools → Performance
- Take baseline heap snapshot
- Login/logout multiple times
- Take final heap snapshot
- Should not increase significantly (menu service caches properly)

---

## After Verification

If all tests pass:
1. Document any edge cases found
2. Test with different browsers (Chrome, Firefox, Safari)
3. Test on mobile (responsive design)
4. Ready for production deployment! 🚀

