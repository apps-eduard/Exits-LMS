import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div class="p-4 lg:p-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">My Profile</h1>
          <p class="text-xs text-gray-600 dark:text-gray-400">Manage your account settings and password</p>
        </div>

        <!-- Message Display -->
        <div *ngIf="message()" 
             [ngClass]="{
               'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-400': messageType() === 'success',
               'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-400': messageType() === 'error'
             }"
             class="p-3 rounded-lg text-xs mb-6">
          {{ message() }}
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button 
            (click)="activeTab.set('profile')"
            class="px-4 py-2 font-medium text-xs transition-colors border-b-2 -mb-0.5"
            [ngClass]="{
              'border-purple-500 text-purple-600 dark:text-purple-400': activeTab() === 'profile',
              'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300': activeTab() !== 'profile'
            }">
            👤 Profile Information
          </button>
          <button 
            (click)="activeTab.set('password')"
            class="px-4 py-2 font-medium text-xs transition-colors border-b-2 -mb-0.5"
            [ngClass]="{
              'border-purple-500 text-purple-600 dark:text-purple-400': activeTab() === 'password',
              'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300': activeTab() !== 'password'
            }">
            🔐 Change Password
          </button>
        </div>

        <!-- Profile Information Tab -->
        <div *ngIf="activeTab() === 'profile'" class="space-y-4">
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
            <!-- Personal Information Section -->
            <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>👤</span> Personal Information
              </h3>
              <div class="space-y-3">
                <!-- First Name & Last Name -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                    <input
                      type="text"
                      formControlName="firstName"
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      formControlName="lastName"
                      class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <!-- Email (Read-only) -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    formControlName="email"
                    readonly
                    class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400 text-xs cursor-not-allowed"
                  />
                  <p class="text-gray-500 dark:text-gray-500 text-xs mt-1">Email cannot be changed</p>
                </div>

                <!-- Phone (Optional) -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <!-- Account Information Section -->
            <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🔐</span> Account Information
              </h3>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                <input
                  type="text"
                  formControlName="role"
                  readonly
                  class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400 text-xs cursor-not-allowed"
                />
                <p class="text-gray-500 dark:text-gray-500 text-xs mt-1">Contact administrator to change your role</p>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="resetForm()"
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!profileForm.valid || savingProfile()"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
              >
                {{ savingProfile() ? '⏳ Updating...' : '💾 Update' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password Tab -->
        <div *ngIf="activeTab() === 'password'" class="space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300">
            <div class="flex gap-2">
              <div class="flex-shrink-0">ℹ️</div>
              <div>After changing your password, you will need to log in again with your new password.</div>
            </div>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
            <!-- Password Change Section -->
            <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">🔐 Change Password</h3>
              <div class="space-y-3">
                <!-- Current Password -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    formControlName="currentPassword"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    placeholder="Enter current password"
                  />
                  <div *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched" 
                       class="text-red-600 dark:text-red-400 text-xs mt-1">
                    Current password is required
                  </div>
                </div>

                <!-- New Password -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    formControlName="newPassword"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    placeholder="Min 8 characters"
                  />
                  <div *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched" 
                       class="text-red-600 dark:text-red-400 text-xs mt-1">
                    Password must be at least 8 characters
                  </div>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    formControlName="confirmPassword"
                    class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                    placeholder="Confirm new password"
                  />
                  <div *ngIf="passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched" 
                       class="text-red-600 dark:text-red-400 text-xs mt-1">
                    Passwords do not match
                  </div>
                </div>
              </div>
            </div>

            <!-- Change Password Button -->
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="resetPasswordForm()"
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!passwordForm.valid || changingPassword()"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
              >
                {{ changingPassword() ? '⏳ Changing...' : '🔐 Change' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  savingProfile = signal(false);
  changingPassword = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');
  activeTab = signal<'profile' | 'password'>('profile');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }, Validators.required],
      phone: [''],
      role: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: '',
        role: user.role || 'User'
      });
    }
  }

  resetForm(): void {
    this.loadUserProfile();
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    this.message.set('');
    const formValue = this.profileForm.getRawValue();

    setTimeout(() => {
      console.log('✅ Profile would be updated with:', {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone
      });
      this.message.set('✓ Profile updated successfully!');
      this.messageType.set('success');
      this.savingProfile.set(false);
      setTimeout(() => this.message.set(''), 3000);
    }, 500);
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.message.set('');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.changingPassword.set(true);
    this.message.set('');

    setTimeout(() => {
      console.log('✅ Password would be changed');
      this.message.set('✓ Password changed successfully! Please log in again.');
      this.messageType.set('success');
      this.passwordForm.reset();
      this.changingPassword.set(false);
      setTimeout(() => this.message.set(''), 3000);
    }, 500);
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }
}
