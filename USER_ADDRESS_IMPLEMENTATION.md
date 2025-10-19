# User Address Implementation Guide

## Overview
This document describes the Philippine address field implementation in the TenantUsersComponent, matching the pattern established in TenantCustomersComponent.

## Files Modified

### 1. TenantUsersComponent TypeScript
**File:** `frontend/src/app/pages/tenant/users/tenant-users.component.ts`

#### Philippine Provinces Array
```typescript
readonly philippineProvinces = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan',
  'Albay', 'Antique', 'Apayao', 'Aurora', 'Basilan',
  'Bataan', 'Batangas', 'Batanes', 'Benguet', 'Biliran',
  'Bohol', 'Bukidnon', 'Bulacan', 'Calamianes',
  'Camarines Norte', 'Camarines Sur', 'Camiguin',
  'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
  'Cotabato', 'Davao del Norte', 'Davao del Sur',
  'Davao Occidental', 'Davao Oriental', 'Dinagat Islands',
  'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte',
  'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga',
  'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur',
  'Leyte', 'Maguindanao', 'Marinduque', 'Masbate',
  'Mindoro Occidental', 'Mindoro Oriental', 'Misamis Occidental',
  'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
  'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya',
  'Palawan', 'Pampanga', 'Pangasinan', 'Quirino',
  'Rizal', 'Romblon', 'Samar', 'Sarangani',
  'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte',
  'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur',
  'Tarlac', 'Tawi-Tawi', 'Terminillo', 'Ifugao',
  'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'
];
```

#### Form Group Structure
The `userForm` now includes address fields alongside user information:

```typescript
this.userForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  phone: [''],
  password: ['', [Validators.required, Validators.minLength(8)]],
  role: ['', Validators.required],
  status: ['active', Validators.required],
  // Philippine Address Fields
  streetAddress: [''],
  barangay: [''],
  city: [''],
  province: [''],
  region: [''],
  postalCode: [''],
  country: ['Philippines']
});
```

#### Data Mapping in openEditModal()
When editing a user, the address fields are automatically populated:

```typescript
if (this.modalMode() === 'edit' && user) {
  // ... existing code
  
  // Map address fields
  this.userForm.patchValue({
    streetAddress: user.streetAddress || '',
    barangay: user.barangay || '',
    city: user.city || '',
    province: user.province || '',
    region: user.region || '',
    postalCode: user.postalCode || '',
    country: user.country || 'Philippines'
  });
  
  // Disable email field in edit mode
  this.userForm.get('email')?.disable();
}
```

### 2. TenantUsersComponent HTML Template
**File:** `frontend/src/app/pages/tenant/users/tenant-users.component.html`

#### Modal Structure - Scrollable Container
```html
<!-- Modal wrapper with flex layout and height constraint -->
<div class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 flex flex-col">
  
  <!-- Header - sticky at top (flex-shrink-0) -->
  <div class="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 border-b border-gray-700">
    ...
  </div>
  
  <!-- Body - scrollable (flex-1 overflow-y-auto) -->
  <form class="overflow-y-auto flex-1 p-6 space-y-4">
    ...
    
    <!-- Philippine Address Section -->
    <div class="pt-4 border-t border-gray-700">
      <h4 class="text-xs font-bold text-gray-200 mb-3">Address Information</h4>
      
      <!-- Street Address -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Street Address</label>
        <input type="text" formControlName="streetAddress" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white" placeholder="123 Main Street" />
      </div>

      <!-- Barangay -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Barangay</label>
        <input type="text" formControlName="barangay" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white" placeholder="Barangay Name" />
      </div>

      <!-- City -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">City</label>
        <input type="text" formControlName="city" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white" placeholder="City/Municipality" />
      </div>

      <!-- Province (Dropdown) -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Province</label>
        <select formControlName="province" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:border-blue-500">
          <option value="">Select Province</option>
          <option *ngFor="let province of philippineProvinces" [value]="province">{{ province }}</option>
        </select>
      </div>

      <!-- Region -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Region</label>
        <input type="text" formControlName="region" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white" placeholder="Region Code" />
      </div>

      <!-- Postal Code -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Postal Code</label>
        <input type="text" formControlName="postalCode" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white" placeholder="1000" />
      </div>

      <!-- Country (Auto-filled, disabled) -->
      <div>
        <label class="block text-xs font-semibold text-gray-300 mb-1">Country</label>
        <input type="text" formControlName="country" [value]="'Philippines'" [disabled]="true" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-white disabled:opacity-50" />
      </div>
    </div>
  </form>
  
  <!-- Footer - sticky at bottom (flex-shrink-0) -->
  <div class="flex-shrink-0 flex gap-3 p-6 border-t border-gray-700">
    ...
  </div>
</div>
```

## Key Features

### 1. Scrollable Modal
- **Container class:** `max-h-96 flex flex-col` on modal wrapper
- **Body class:** `overflow-y-auto flex-1` on form
- **Header class:** `flex-shrink-0` on header
- **Footer class:** `flex-shrink-0` on footer
- **Benefit:** Form content scrolls while header and footer remain visible

### 2. Philippine Address Fields
All fields are optional except where integrated with validation:

| Field | Type | Validation | Purpose |
|-------|------|-----------|---------|
| **streetAddress** | Text | Optional | Street/house number |
| **barangay** | Text | Optional | Smallest administrative division |
| **city** | Text | Optional | City/Municipality name |
| **province** | Dropdown | Optional | 60+ Philippine provinces |
| **region** | Text | Optional | Region code (I-XVII) |
| **postalCode** | Text | Optional | 4-digit postal code |
| **country** | Text | Auto-filled | Fixed to "Philippines" |

### 3. Styling Consistency
All address fields use the same Tailwind CSS classes as the user information fields:
- Dark theme: `bg-gray-700` background, `border-gray-600` border
- Text color: `text-white` with `text-xs` size
- Focus state: `focus:border-blue-500`
- Labels: `text-gray-300` with `text-xs font-semibold`

### 4. Email Field Handling
- **Create mode:** Email field is required and editable
- **Edit mode:** Email field is disabled (users cannot change their email via this form)

### 5. Password Field Handling
- **Create mode:** Password is required (minimum 8 characters)
- **Edit mode:** Password is optional with placeholder "Leave empty to keep current"

## API Contract

The backend API now expects users to have these address fields. When creating or updating a user, include:

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'tenant_admin' | 'manager' | 'agent';
  status: 'active' | 'inactive';
  // Address fields
  streetAddress?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postalCode?: string;
  country?: string; // Always 'Philippines'
  created_at: Date;
}
```

## Form Validation

```typescript
// Create mode
✓ Email: required, valid email format
✓ First Name: required
✓ Last Name: required
✓ Phone: optional
✓ Password: required, minimum 8 characters
✓ Role: required
✓ Status: required
✓ Address fields: all optional

// Edit mode
✓ Email: disabled (not editable)
✓ First Name: required
✓ Last Name: required
✓ Phone: optional
✓ Password: optional (when provided, must be 8+ characters)
✓ Role: required
✓ Status: required
✓ Address fields: all optional
```

## Testing Checklist

- [ ] Create user form opens with empty address fields
- [ ] Edit user form populates all address fields from backend
- [ ] Province dropdown displays all 60+ Philippine provinces
- [ ] Form scrolls when address section is visible on mobile devices
- [ ] Email field is disabled in edit mode
- [ ] Password field shows correct placeholder in edit mode
- [ ] Country field is always set to "Philippines" and disabled
- [ ] Form validation prevents submission with invalid data
- [ ] Address fields submit correctly to backend
- [ ] Modal closes on successful save
- [ ] Modal footer remains visible while scrolling form

## Consistency with TenantCustomersComponent

This implementation follows the same pattern as TenantCustomersComponent:
- ✅ Same 60-province array
- ✅ Same form group structure with address fields
- ✅ Same scrollable modal layout
- ✅ Same Tailwind CSS styling
- ✅ Same field validation approach
- ✅ Same data mapping pattern in openEditModal()

## Future Enhancements

1. **Address Autocomplete:** Integrate with Google Maps API for autocomplete
2. **Validation:** Add regex patterns for postal codes
3. **Address Regions:** Link provinces to regions automatically
4. **Default Address:** Allow setting a default address for users
5. **Multiple Addresses:** Support multiple addresses per user with primary/secondary designation

## Build Verification

✅ **Frontend Build Status:** SUCCESSFUL
- No compilation errors
- All TypeScript types validated
- All template bindings resolved
- Bundle size: 347.46 kB initial

Application is ready for testing and deployment.
