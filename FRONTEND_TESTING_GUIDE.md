# Frontend Testing Guide

## Pre-Testing Setup

### 1. Ensure Backend is Running
```bash
# Backend should be running on http://localhost:3000
# Check backend is responsive
curl http://localhost:3000/health
```

### 2. Ensure Frontend Dev Server is Running
```bash
# Frontend should run on http://localhost:4200
cd frontend
npm start
```

### 3. Login as Tenant Admin
- Navigate to http://localhost:4200/login
- Use tenant admin credentials
- Should redirect to `/tenant/dashboard`

---

## Component Navigation Tests

### Test 1: Navigation Links Visible
1. Login as tenant admin
2. Check sidebar for "Management" section
3. Verify these items appear:
   - 👥 Users
   - 👨‍💼 Customers

### Test 2: Navigate to Users Component
1. Click sidebar "Users" link
2. Verify route changes to `/tenant/users`
3. Component should load without errors
4. Should show table with column headers

### Test 3: Navigate to Customers Component
1. Click sidebar "Customers" link
2. Verify route changes to `/tenant/customers`
3. Component should load without errors
4. Should display summary cards + table

---

## Users Component Tests

### Test 4: Load Users List
**Expected:** Users table populated with tenant's users

```
Steps:
1. Navigate to /tenant/users
2. Wait for loading spinner to disappear
3. Verify users table shows data

Validates:
✅ UserService.getTenantUsers() working
✅ Component signals updating
✅ Table rendering correctly
```

### Test 5: Search Functionality
**Expected:** Users filtered by search term

```
Steps:
1. Enter search term in search bar
2. Click Search button (or press Enter)
3. Table should update with matching users

Validates:
✅ Search query passed to API
✅ API filtering working
✅ Table re-renders with results
```

### Test 6: Role Filter
**Expected:** Users filtered by role

```
Steps:
1. Select a role from Role dropdown
2. Table should immediately update
3. Only users with selected role appear

Validates:
✅ Role filter parameter sent to API
✅ API filtering by role working
✅ Reactive filter change handling
```

### Test 7: Status Filter
**Expected:** Users filtered by status

```
Steps:
1. Select status from Status dropdown (Active/Inactive)
2. Table should immediately update
3. Only users with selected status appear

Validates:
✅ Status filter parameter sent to API
✅ API filtering by status working
```

### Test 8: Create User Modal Opens
**Expected:** Modal appears with empty form

```
Steps:
1. Click "+ Add User" button
2. Modal should overlay the page
3. Form fields should be empty
4. Modal title should say "Create User"

Validates:
✅ Modal toggle working
✅ Form reset on create mode
✅ CSS animations working
```

### Test 9: Create User Form Validation
**Expected:** Form validates inputs before submit

```
Steps:
1. Open create modal
2. Try to submit without filling required fields
3. Error messages should appear below fields:
   - "Email is required"
   - "Password is required"
   - "Role is required"

Validates:
✅ Form validators configured
✅ Error display working
✅ Submit button disabled when invalid
```

### Test 10: Create User Success
**Expected:** New user created and added to table

```
Steps:
1. Open create modal
2. Fill all required fields:
   - Email: newuser@example.com
   - Password: SecurePass123
   - Role: manager
3. Click Save button
4. Modal should close
5. New user should appear in table

Validates:
✅ UserService.createTenantUser() working
✅ API endpoint accepting POST request
✅ Table updating with new user
✅ Success feedback to user
```

### Test 11: Edit User Modal
**Expected:** Modal opens with user data pre-filled

```
Steps:
1. Click Edit button on a user row
2. Modal should show "Edit User" title
3. Form fields should be populated with current data
4. Modal mode should be 'edit'

Validates:
✅ Edit modal logic working
✅ Form pre-population working
✅ Modal mode switching
```

### Test 12: Update User
**Expected:** User data updated in table

```
Steps:
1. Edit a user
2. Change one field (e.g., role)
3. Click Save
4. Modal closes
5. User in table updated with new data

Validates:
✅ UserService.updateTenantUser() working
✅ API PUT endpoint working
✅ Table re-renders
```

### Test 13: Toggle User Status
**Expected:** User status changes (active ↔ inactive)

```
Steps:
1. Find an active user row
2. Click the status toggle button (Activate/Deactivate)
3. User status badge should change
4. Button label should change

Validates:
✅ UserService.toggleTenantUserStatus() working
✅ API PATCH endpoint working
✅ UI immediately reflects change
```

### Test 14: Delete User
**Expected:** User removed from table

```
Steps:
1. Click Delete button on a user
2. Confirmation dialog appears
3. Confirm deletion
4. User should disappear from table

Validates:
✅ UserService.deleteTenantUser() working
✅ API DELETE endpoint working
✅ Table updates without user
✅ Confirmation prevents accidents
```

### Test 15: Error Handling
**Expected:** Graceful error display

```
Steps:
1. Stop backend server (simulate API failure)
2. Try to search/filter users
3. Error message should appear
4. Table should remain visible
5. No console errors

Validates:
✅ Error handling in subscribe
✅ User feedback on failure
✅ No unhandled exceptions
```

---

## Customers Component Tests

### Test 16: Load Customers List
**Expected:** Customers table populated

```
Steps:
1. Navigate to /tenant/customers
2. Wait for loading
3. Verify summary cards show numbers
4. Verify customers table populated

Validates:
✅ CustomerService.getAllCustomers() working
✅ CustomerService.getCustomersSummary() working
✅ Both data loaded in parallel
```

### Test 17: Summary Cards Display
**Expected:** Statistics showing correctly

```
Summary Cards:
- Total Customers: X (Y active)
- Active Loans: X (of Y total)
- Outstanding Balance: $X.XX

Steps:
1. Check each card displays correct data
2. Values should match table data
3. Currency should be formatted

Validates:
✅ getCustomersSummary() returning correct data
✅ Currency formatting working
✅ Signal binding to UI
```

### Test 18: Search Customers
**Expected:** Customers filtered by search

```
Steps:
1. Enter customer name/email in search
2. Click Search or press Enter
3. Table should show matching customers

Validates:
✅ Search parameter passed to API
✅ API returning filtered results
```

### Test 19: Status Filter Customers
**Expected:** Customers filtered by status

```
Steps:
1. Select status from dropdown
2. Table updates immediately
3. Only selected status customers shown

Validates:
✅ Filter parameter working
✅ Reactive updates
```

### Test 20: Create Customer Modal
**Expected:** Modal opens with empty form

```
Steps:
1. Click "+ Add Customer" button
2. Modal appears with "Create Customer" title
3. Form fields empty
4. All fields present (First Name, Last Name, Email, Phone, Address, ID)

Validates:
✅ Modal toggle working
✅ Form setup correctly
```

### Test 21: Create Customer Validation
**Expected:** Form validates before submit

```
Steps:
1. Open create modal
2. Try submit without First/Last Name
3. Error messages appear:
   - "First name is required"
   - "Last name is required"

Validates:
✅ Validators configured
✅ Error display working
```

### Test 22: Create Customer Success
**Expected:** New customer added to table

```
Steps:
1. Open create modal
2. Fill required fields:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com (optional)
   - Phone: 555-1234 (optional)
3. Click Save
4. Modal closes
5. New customer appears in table

Validates:
✅ CustomerService.createCustomer() working
✅ API POST endpoint working
✅ Table updated
```

### Test 23: Edit Customer
**Expected:** Modal opens with customer data

```
Steps:
1. Click Edit on a customer row
2. Modal shows "Edit Customer" title
3. All fields pre-populated with current data
4. Change one field
5. Click Save
6. Table updates with new data

Validates:
✅ Edit mode working
✅ Form pre-population
✅ Update working
```

### Test 24: Delete Customer (Allowed)
**Expected:** Customer deleted if no active loans

```
Steps:
1. Select customer with no loans
2. Loan count should show "0 loans"
3. Delete button should be enabled
4. Click Delete
5. Confirm in dialog
6. Customer removed from table

Validates:
✅ CustomerService.deleteCustomer() working
✅ API DELETE endpoint working
```

### Test 25: Delete Customer (Blocked)
**Expected:** Delete blocked if customer has loans

```
Steps:
1. Select customer with active loans
2. Loan count shows "X loans" where X > 0
3. Delete button should be DISABLED
4. Hover over button shows tooltip:
   "Cannot delete customer with active loans"

Validates:
✅ Loan count check working
✅ Delete button disabling working
✅ Tooltip message
✅ Prevents data loss
```

### Test 26: Currency Formatting
**Expected:** Money values formatted correctly

```
Steps:
1. Check Outstanding Balance in summary card
2. Should show as $X.XX
3. Check customer row Outstanding column
4. Should show as $X.XX

Validates:
✅ formatCurrency() working
✅ Currency formatting applied
```

---

## Responsive Design Tests

### Test 27: Desktop View (1400px+)
```
Expected:
- Sidebar visible on left
- Multi-column layout
- Summary cards in 3-column grid
- Table fully visible without scroll
- Action buttons visible
```

### Test 28: Tablet View (768px-1399px)
```
Expected:
- Sidebar auto-hidden (hamburger menu)
- Content takes full width
- Summary cards in 2-column grid
- Table might need horizontal scroll
- Buttons still clickable
```

### Test 29: Mobile View (<768px)
```
Expected:
- Sidebar fully hidden
- Hamburger menu toggles sidebar
- Summary cards in 1-column
- Table stacked vertically
- Reduced font sizes
- Touch-friendly button sizes
```

---

## Error Scenarios

### Test 30: API Connection Error
```
Steps:
1. Stop backend server
2. Try to load users/customers
3. Error message should display
4. No console errors
5. Retry works after server restart
```

### Test 31: Invalid Form Data
```
Steps:
1. Enter invalid email format
2. Error message appears
3. Submit button stays disabled
4. Fix validation error
5. Submit button enables
```

### Test 32: Unauthorized Access
```
Steps:
1. Login as non-admin tenant user
2. Navigate to /tenant/users
3. Should either:
   - Show permission denied message, OR
   - Hide edit/delete/create buttons
```

---

## Performance Tests

### Test 33: Load Performance
```
Measure:
- Initial load time < 2 seconds
- Search execution < 500ms
- Filter application < 300ms
- Modal open animation smooth
- Scroll performance on large lists
```

### Test 34: Memory Leaks
```
Steps:
1. Open DevTools → Memory tab
2. Load users component
3. Search multiple times
4. Filter multiple times
5. Navigate away and back
6. Take heap snapshot
7. Memory should not continuously increase
```

---

## Accessibility Tests

### Test 35: Keyboard Navigation
```
Steps:
1. Tab through form fields
2. All form inputs must be reachable
3. Tab through table rows
4. Action buttons must be keyboard accessible
5. Modal must close with Escape key
6. Focus must be visible on all elements
```

### Test 36: Screen Reader
```
Use screen reader software:
- Should read table headers
- Should announce modal title
- Should announce error messages
- Form labels should be read with inputs
- Action buttons should have descriptive labels
```

---

## API Integration Verification

### Test 37: Verify API Calls
```bash
# Open browser DevTools → Network tab
# Perform these actions and verify API calls:

1. Load users list
   Expected call: GET /api/users/tenant/users

2. Search users
   Expected call: GET /api/users/tenant/users?search=...&role=...&status=...

3. Create user
   Expected call: POST /api/users/tenant/users
   Request body should have: email, password, role, firstName?, lastName?, phone?

4. Update user
   Expected call: PUT /api/users/tenant/users/{id}

5. Delete user
   Expected call: DELETE /api/users/tenant/users/{id}

6. Load customers
   Expected calls: 
   - GET /api/customers
   - GET /api/customers/stats/summary

7. Create customer
   Expected call: POST /api/customers
   Body: firstName, lastName, email?, phone?, address?, idNumber?
```

---

## Test Execution Order

**Recommended sequence:**
1. Navigation tests (1-3)
2. Data loading tests (4, 16, 17)
3. Search/filter tests (5-7, 18-19)
4. Create operations (8-10, 20-22)
5. Read/edit operations (11-12, 23)
6. Update operations (13)
7. Delete operations (14-15, 24-25)
8. Formatting tests (26)
9. Responsive design tests (27-29)
10. Error scenarios (30-32)
11. Performance tests (33-34)
12. Accessibility tests (35-36)
13. API verification (37)

---

## Known Limitations / To-Do

### Future Enhancements:
- [ ] Pagination for large lists
- [ ] Bulk actions (select multiple, delete all)
- [ ] Export to CSV
- [ ] Advanced date range filters
- [ ] Real-time updates with WebSocket
- [ ] User role permission editing
- [ ] Customer document upload
- [ ] Activity audit log
- [ ] Email notifications
- [ ] SMS notifications

---

## Troubleshooting

### Issue: Users table shows no data
**Solution:**
1. Check browser console for errors
2. Verify backend is running on :3000
3. Check browser DevTools Network tab for 401/403
4. Verify JWT token is valid
5. Check tenant ID in request

### Issue: Create user returns 400 error
**Solution:**
1. Check form validation error messages
2. Verify all required fields filled
3. Check email isn't already used
4. Check role is valid (tenant_admin, manager, agent)
5. Check password meets requirements

### Issue: Modal won't close
**Solution:**
1. Check if API call still pending (loading state)
2. Check browser console for errors
3. Try clicking outside modal or X button
4. Refresh page to reset state

### Issue: Responsive design broken on mobile
**Solution:**
1. Check viewport meta tag in index.html
2. Clear browser cache
3. Test in different mobile browsers
4. Check CSS media queries in SCSS files

---

## Testing Completed ✅

Use this checklist to track completed tests:

- [ ] Test 1: Navigation Links
- [ ] Test 2: Navigate to Users
- [ ] Test 3: Navigate to Customers
- [ ] Test 4-15: Users Component
- [ ] Test 16-26: Customers Component
- [ ] Test 27-29: Responsive Design
- [ ] Test 30-32: Error Scenarios
- [ ] Test 33-34: Performance
- [ ] Test 35-36: Accessibility
- [ ] Test 37: API Verification

**Overall Status:** [ ] READY FOR PRODUCTION

---

**Last Updated:** 2024
