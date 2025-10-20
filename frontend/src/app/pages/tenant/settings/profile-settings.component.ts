import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import { ConfirmationDialogService } from '../../../core/services/confirmation-dialog.service';

@Component({
  selector: 'app-tenant-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss'
})
export class TenantProfileSettingsComponent implements OnInit {
  readonly activeTab = signal<'profile' | 'password'>('profile');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error'>('success');

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private confirmationService: ConfirmationDialogService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', []],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  loadProfile(): void {
    this.loading.set(true);
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentUser = response.user;
          this.profileForm.patchValue({
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            phone: response.user.phone || '',
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.showMessage('Failed to load profile', 'error');
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: 'profile' | 'password'): void {
    this.activeTab.set(tab);
    this.message.set('');
  }

  async saveProfile(): Promise<void> {
    if (!this.profileForm.valid) {
      this.showMessage('Please fill in all required fields correctly', 'error');
      return;
    }

    const result = await this.confirmationService.confirm({
      title: 'Update Profile',
      message: 'Are you sure you want to update your profile information?',
      confirmText: 'Update',
      cancelText: 'Cancel',
      confirmClass: 'success',
      icon: 'question'
    });

    if (!result.confirmed) return;

    this.saving.set(true);

    const formValue = this.profileForm.value;

    this.authService.updateProfile({
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('✓ Profile updated successfully', 'success');
          this.currentUser = response.user;
        }
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        const errorMsg = error.error?.error || 'Failed to update profile';
        this.showMessage(`✗ ${errorMsg}`, 'error');
        this.saving.set(false);
      }
    });
  }

  async changePassword(): Promise<void> {
    if (!this.passwordForm.valid) {
      this.showMessage('Please fill in all password fields correctly', 'error');
      return;
    }

    const formValue = this.passwordForm.value;

    if (formValue.newPassword !== formValue.confirmPassword) {
      this.showMessage('New passwords do not match', 'error');
      return;
    }

    if (formValue.newPassword === formValue.currentPassword) {
      this.showMessage('New password must be different from current password', 'error');
      return;
    }

    const result = await this.confirmationService.confirm({
      title: 'Change Password',
      message: 'Are you sure you want to change your password? You will need to log in again.',
      confirmText: 'Change',
      cancelText: 'Cancel',
      confirmClass: 'warning',
      icon: 'warning'
    });

    if (!result.confirmed) return;

    this.saving.set(true);

    this.authService.changePassword({
      currentPassword: formValue.currentPassword,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('✓ Password changed successfully. Please log in again.', 'success');
          this.passwordForm.reset();
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.authService.logout();
            window.location.href = '/login';
          }, 2000);
        }
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        const errorMsg = error.error?.error || 'Failed to change password';
        this.showMessage(`✗ ${errorMsg}`, 'error');
        this.saving.set(false);
      }
    });
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message.set(msg);
    this.messageType.set(type);

    setTimeout(() => {
      this.message.set('');
    }, 5000);
  }
}
