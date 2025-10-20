import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RbacService } from '../../../core/services/rbac.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  roles = signal<{ label: string; value: string }[]>([]);

  // Philippine Provinces (73)
  philipineProvinces = [
    'Abruzzo', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique',
    'Apayao', 'Aurora', 'Bataan', 'Batangas', 'Batanes', 'Benguet', 'Biliran', 'Bohol',
    'Bukidnon', 'Bulacan', 'Calabarzon', 'Camarines Norte', 'Camarines Sur', 'Camiguin',
    'Capiz', 'Catanduanes', 'Cavite', 'Cebu', 'Compostela Valley', 'Cotabato',
    'Davao City', 'Davao del Norte', 'Davao del Sur', 'Davao Oriental',
    'Eastern Visayas', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo',
    'Isabelal', 'Kalinga', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte',
    'La Union', 'Manila', 'Marinduque', 'Masbate', 'Mindanao', 'Misamis Oriental',
    'Misamis Occidental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental',
    'Northern Mindanao', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
    'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
    'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor', 'Soccsksargen', 'Southern Leyte',
    'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi',
    'Benguet', 'Quirino', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private rbacService: RbacService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group(
      {
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', Validators.required],
        role_name: ['', Validators.required],
        is_active: [true],
        street_address: [''],
        barangay: [''],
        city: ['', Validators.required],
        province: ['', Validators.required],
        region: [''],
        postal_code: [''],
        country: [{ value: 'Philippines', disabled: true }]
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  ngOnInit(): void {
    this.loadRoles(); // Load available roles
    
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.makePasswordOptional();
      this.loadUser();
    }
  }

  loadRoles(): void {
    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success && response.roles) {
          // Filter for tenant scope roles and map to dropdown format
          const tenantRoles = response.roles
            .filter(r => r.scope === 'tenant')
            .map(r => ({
              label: r.name,
              value: r.name
            }));
          this.roles.set(tenantRoles);
          console.log('✅ Tenant roles loaded for user assignment:', tenantRoles);
        }
      },
      error: (error) => {
        console.error('❌ Failed to load roles:', error);
        // Fallback to empty array if API fails
        this.roles.set([]);
      }
    });
  }

  makePasswordOptional(): void {
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.get('confirm_password')?.clearValidators();
    this.userForm.get('confirm_password')?.updateValueAndValidity();

    // Disable email in edit mode
    this.userForm.get('email')?.disable();
  }

  loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getTenantUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          const user = response.user;
          this.userForm.patchValue({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone || '',
            role_name: user.role_name || 'user',
            is_active: user.is_active,
            street_address: user.street_address || '',
            barangay: user.barangay || '',
            city: user.city || '',
            province: user.province || '',
            region: user.region || '',
            postal_code: user.postal_code || '',
            country: user.country || 'Philippines'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.error = 'Failed to load user data';
        this.loading = false;
      }
    });
  }

  passwordMatchValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirm = control.get('confirm_password');

      if (!password || !confirm) return null;
      if (confirm.errors && !confirm.errors['passwordMismatch']) {
        return null;
      }

      if (password.value !== confirm.value) {
        confirm.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirm.setErrors(null);
        return null;
      }
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      return this.formatFieldName(fieldName) + ' is required';
    }
    if (errors['email']) {
      return 'Invalid email format';
    }
    if (errors['minlength']) {
      return `${this.formatFieldName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return 'Invalid field';
  }

  formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.submitting = true;
    this.error = null;

    // Get form value including disabled fields
    const formValue = this.userForm.getRawValue();

    // Remove password fields if empty in edit mode
    if (this.isEditMode && !formValue.password) {
      delete formValue.password;
      delete formValue.confirm_password;
    } else {
      delete formValue.confirm_password; // Never send confirm_password to backend
    }

    if (this.isEditMode && this.userId) {
      this.updateUser(this.userId, formValue);
    } else {
      this.createUser(formValue);
    }
  }

  createUser(data: any): void {
    this.userService.createTenantUser(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tenant/users']);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.error = error.error?.error || 'Error creating user';
        this.submitting = false;
      }
    });
  }

  updateUser(userId: string, data: any): void {
    this.userService.updateTenantUser(userId, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tenant/users']);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.error = error.error?.error || 'Error updating user';
        this.submitting = false;
      }
    });
  }
}
