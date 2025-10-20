# Profile Settings & Change Password Implementation

## Overview
Complete implementation of profile settings and change password functionality for both System Admin and Tenant users with confirmation dialogs and audit logging.

## Features Implemented

### 1. Backend API Endpoints

#### Profile Update
- **Endpoint**: `PUT /api/auth/profile`
- **Authentication**: Required (authMiddleware)
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1234"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-1234"
    }
  }
  ```
- **Audit Logging**: Logs UPDATE action with USER_PROFILE resource
- **Validation**:
  - firstName and lastName are required
  - Email must be valid and unique (if changed)
  - Phone is optional

#### Change Password
- **Endpoint**: `PUT /api/auth/change-password`
- **Authentication**: Required (authMiddleware)
- **Request Body**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456",
    "confirmPassword": "newPassword456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **Audit Logging**: Logs UPDATE action with USER_PASSWORD resource
- **Validation**:
  - All three fields required
  - New password must be at least 8 characters
  - New password must differ from current password
  - Passwords must match
  - Current password verified against stored hash

### 2. Frontend Services

#### AuthService Updates
```typescript
updateProfile(profileData: {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}): Observable<any>

changePassword(passwordData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Observable<any>
```

### 3. Frontend Components

#### System Admin Profile Settings
- **Path**: `/super-admin/settings`
- **Component**: `ProfileSettingsComponent`
- **Location**: `frontend/src/app/pages/super-admin/settings/profile-settings.component.ts`
- **Features**:
  - Two tabs: Profile Information & Change Password
  - Form validation with real-time feedback
  - Confirmation dialog before saving
  - Success/error messages
  - Auto-redirect after password change

#### Tenant Profile Settings
- **Path**: `/tenant/settings`
- **Component**: `TenantProfileSettingsComponent` + `TenantSettingsComponent`
- **Location**: `frontend/src/app/pages/tenant/settings/profile-settings.component.ts`
- **Features**:
  - Two tabs: Profile Information & Change Password
  - Integrated with tenant role management
  - Same form validation and confirmation dialogs
  - Auto-redirect after password change

### 4. Global Confirmation Dialog Integration
Both components use the global `ConfirmationDialogService` for:
- Profile update confirmation
- Password change warning (shows "You will need to log in again")
- Error notifications

## File Structure

```
frontend/src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts (UPDATED)
│   │   └── confirmation-dialog.service.ts (EXISTING)
│   └── components/
│       └── confirmation-dialog.component.ts (EXISTING)
├── pages/
│   ├── super-admin/
│   │   └── settings/
│   │       ├── settings.component.ts (UPDATED)
│   │       ├── settings.component.html (UPDATED)
│   │       ├── profile-settings.component.ts (NEW)
│   │       ├── profile-settings.component.html (NEW)
│   │       └── profile-settings.component.scss (NEW)
│   └── tenant/
│       ├── tenant-layout.component.html (UPDATED)
│       ├── settings/
│       │   ├── settings.component.ts (NEW)
│       │   ├── settings.component.html (NEW)
│       │   ├── settings.component.scss (NEW)
│       │   ├── profile-settings.component.ts (NEW)
│       │   ├── profile-settings.component.html (NEW)
│       │   └── profile-settings.component.scss (NEW)
│       └── tenant-roles.component.ts (EXISTING)
└── app.routes.ts (UPDATED)

backend/
├── controllers/
│   └── auth.controller.js (UPDATED)
├── routes/
│   └── auth.routes.js (UPDATED)
└── middleware/
    └── audit-logger.js (EXISTING)
```

## Usage

### System Admin Access
1. Navigate to `/super-admin/settings`
2. First tab shows "Profile Information"
3. Update name, email, or phone
4. Confirm changes in dialog
5. Switch to "Change Password" tab for password updates
6. System will redirect to login after password change

### Tenant User Access
1. Click profile dropdown in top-right corner
2. Select "Profile Settings" or "Organization Settings"
3. Navigate to `/tenant/settings`
4. Similar workflow as System Admin
5. Can also see and manage team roles in the "Team Roles" tab

## Security Features

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **Validation**: Server-side validation for all inputs
3. **Audit Logging**: All changes logged with:
   - User ID
   - Action type (UPDATE)
   - Resource type (USER_PROFILE or USER_PASSWORD)
   - Timestamp
   - IP address
   - User agent
   - Additional details

4. **Current Password Verification**: Must provide current password to change password
5. **Email Uniqueness**: Prevents duplicate emails when updating profile
6. **Session Management**: Users redirected to login after password change

## Form Validation

### Profile Tab
- **First Name**: Required, minimum 2 characters
- **Last Name**: Required, minimum 2 characters
- **Email**: Required, valid email format, must be unique
- **Phone**: Optional, no validation

### Change Password Tab
- **Current Password**: Required, minimum 8 characters
- **New Password**: Required, minimum 8 characters, must differ from current
- **Confirm Password**: Required, must match new password

## Error Handling

Backend returns appropriate error messages:
- `400 Bad Request`: Validation errors
  - Missing required fields
  - Invalid email format
  - Email already in use
  - Passwords don't match
  - Password too short
- `401 Unauthorized`: Invalid current password
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database or system errors

Frontend displays errors:
- Toast/banner style messages
- Color coded (red for errors, green for success)
- Auto-dismiss after 5 seconds

## Audit Trail

All profile and password changes are logged to `audit_logs` table:

### Example Log Entry
```json
{
  "tenant_id": null,
  "user_id": "system-admin-id",
  "action": "UPDATE",
  "resource": "USER_PROFILE",
  "resource_id": "system-admin-id",
  "details": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-1234",
    "emailChanged": true
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-10-20T10:30:00Z"
}
```

## Testing Checklist

- [ ] Update profile information successfully
- [ ] Prevent duplicate email addresses
- [ ] Validate form input requirements
- [ ] Show confirmation dialog before update
- [ ] Display success message
- [ ] Show error messages for invalid input
- [ ] Change password with current password verification
- [ ] Prevent reuse of current password
- [ ] Auto-redirect to login after password change
- [ ] Verify audit logs capture all changes
- [ ] Test on both System Admin and Tenant roles
- [ ] Verify form validation on both frontend and backend
- [ ] Test error scenarios (network errors, validation failures)

## API Examples

### Update Profile
```bash
curl -X PUT https://api.example.com/auth/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1-555-9876"
  }'
```

### Change Password
```bash
curl -X PUT https://api.example.com/auth/change-password \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass456",
    "confirmPassword": "NewPass456"
  }'
```

## Next Steps

1. Run backend server to enable API endpoints
2. Run frontend development server
3. Test profile update flows
4. Verify audit logs are captured
5. Test password change and redirect
6. Deploy to production after QA approval

## Notes

- All timestamps are stored in UTC
- User session remains valid after profile update
- Password change immediately invalidates session
- Confirmation dialogs use global service (no setup needed)
- All errors logged to backend logs with full stack traces
