# Global Confirmation Dialog - Usage Guide

## Overview
A beautiful, reusable confirmation dialog component that's now globally available in your Angular application. It replaces the browser's standard `confirm()` and `alert()` dialogs with a professional, theme-aware modal.

## Features
✅ Beautiful dark-themed modal design  
✅ Smooth animations (fade-in/scale)  
✅ Multiple icon types (warning, question, success, error, info)  
✅ Customizable button colors (danger, warning, success, info)  
✅ Backdrop click to close  
✅ Escape key support (optional)  
✅ Promise-based API for easy async/await usage  
✅ Zero setup - automatically global!

## Installation Status
✅ **Complete** - Already implemented in your app!

### Files Created:
- `frontend/src/app/core/services/confirmation-dialog.service.ts` - Service for dialog control
- `frontend/src/app/core/components/confirmation-dialog.component.ts` - Dialog component
- Updated `frontend/src/app/app.component.ts` - Added globally to app root

## Usage Examples

### Basic Confirmation
```typescript
import { ConfirmationDialogService } from '../../../core/services/confirmation-dialog.service';

constructor(private confirmationService: ConfirmationDialogService) {}

async deleteItem() {
  const result = await this.confirmationService.confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item? This cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmClass: 'danger',
    icon: 'warning'
  });

  if (result.confirmed) {
    // Perform delete action
  }
}
```

### Suspend Tenant (Currently Implemented)
```typescript
async toggleTenantStatus(tenant: TenantRow) {
  const result = await this.confirmationService.confirm({
    title: 'Suspend Tenant',
    message: `Are you sure you want to suspend "${tenant.name}"? This action can be reversed.`,
    confirmText: 'Suspend',
    cancelText: 'Cancel',
    confirmClass: 'warning',
    icon: 'question'
  });

  if (result.confirmed) {
    this.tenantService.updateTenantStatus(tenant.id, 'suspended').subscribe({
      next: () => {
        this.loadTenants();
      },
      error: (error) => {
        this.showErrorDialog(error);
      }
    });
  }
}
```

### Error Dialog
```typescript
async showErrorDialog(error: string) {
  await this.confirmationService.confirm({
    title: 'Error',
    message: error,
    confirmText: 'OK',
    cancelText: '',
    confirmClass: 'danger',
    icon: 'error'
  });
}
```

### Success Dialog
```typescript
async showSuccessDialog(message: string) {
  await this.confirmationService.confirm({
    title: 'Success',
    message: message,
    confirmText: 'OK',
    cancelText: '',
    confirmClass: 'success',
    icon: 'success'
  });
}
```

### Info Dialog
```typescript
async showInfoDialog(title: string, message: string) {
  await this.confirmationService.confirm({
    title: title,
    message: message,
    confirmText: 'OK',
    cancelText: '',
    confirmClass: 'info',
    icon: 'info'
  });
}
```

## Configuration Options

### ConfirmationConfig Interface
```typescript
interface ConfirmationConfig {
  title: string;                    // Dialog title
  message: string;                  // Dialog message
  confirmText?: string;             // Confirm button text (default: 'Confirm')
  cancelText?: string;              // Cancel button text (default: 'Cancel')
  confirmClass?: string;            // Button color: 'danger' | 'warning' | 'success' | 'info'
  icon?: string;                    // Icon type: 'warning' | 'question' | 'info' | 'success' | 'error'
}
```

### Icon Types
- **warning** - Yellow warning icon (for caution actions)
- **question** - Purple question mark (for confirmations)
- **success** - Green checkmark (for success messages)
- **error** - Red X icon (for errors)
- **info** - Blue information icon (for info messages)

### Button Colors
- **danger** - Red button (for delete/suspend operations)
- **warning** - Yellow button (for cautionary actions)
- **success** - Green button (for positive actions)
- **info** - Blue button (for informational dialogs)

## Return Values

### ConfirmationResult
```typescript
interface ConfirmationResult {
  confirmed: boolean;    // true if user clicked confirm, false if cancelled
  data?: any;           // Optional data to pass back
}
```

## Styling
The dialog uses Tailwind CSS classes and matches your dark theme:
- Dark gray background (#1F2937)
- Purple accent colors for primary actions
- Smooth transitions and animations
- Responsive design (works on mobile/tablet/desktop)

## Examples in Your App

### Tenant Suspend/Activate
**File**: `frontend/src/app/pages/super-admin/tenants/tenant-list.component.ts`

The `toggleTenantStatus()` method now uses the global confirmation dialog:
```typescript
toggleTenantStatus(tenant: TenantRow, event: Event): void {
  event.stopPropagation();
  
  const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
  const action = newStatus === 'suspended' ? 'suspend' : 'activate';

  this.confirmationService.confirm({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Tenant`,
    message: `Are you sure you want to ${action} "${tenant.name}"? This action can be reversed.`,
    confirmText: action.charAt(0).toUpperCase() + action.slice(1),
    cancelText: 'Cancel',
    confirmClass: action === 'suspend' ? 'warning' : 'success',
    icon: 'question'
  }).then(result => {
    if (result.confirmed) {
      this.tenantService.updateTenantStatus(tenant.id, newStatus).subscribe({
        next: (response: any) => {
          console.log(`✅ Tenant ${action}ed:`, response);
          this.loadTenants();
        },
        error: (error: any) => {
          console.error(`❌ Failed to ${action} tenant:`, error);
          this.confirmationService.confirm({
            title: 'Error',
            message: `Failed to ${action} tenant. Please try again.`,
            confirmText: 'OK',
            cancelText: '',
            confirmClass: 'danger',
            icon: 'error'
          });
        }
      });
    }
  });
}
```

## Best Practices

1. **Use Appropriate Icons and Colors**
   - Danger actions: red button with warning icon
   - Positive actions: green button with success icon
   - Neutral actions: purple button with question icon

2. **Clear, Concise Messages**
   - Include what action will be performed
   - Mention if it can be reversed
   - Warn about data loss if applicable

3. **Handle Errors Gracefully**
   - Show error dialogs when operations fail
   - Provide helpful error messages
   - Allow users to retry if appropriate

4. **Consistent Naming**
   - Use verb-noun structure (e.g., "Delete Item", "Suspend Tenant")
   - Match button text to the action (e.g., "Suspend" not "Continue")

## Next Steps

To use the confirmation dialog in other components:

1. Import the service:
```typescript
import { ConfirmationDialogService } from '../../../core/services/confirmation-dialog.service';
```

2. Inject into constructor:
```typescript
constructor(private confirmationService: ConfirmationDialogService) {}
```

3. Call in your methods:
```typescript
const result = await this.confirmationService.confirm({
  title: 'Confirm Action',
  message: 'Are you sure?',
  confirmText: 'Yes',
  cancelText: 'No',
  icon: 'question'
});
```

That's it! No other setup needed. The dialog is already globally available in your app.
