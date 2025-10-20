import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  error = '';
  roles = signal<{ value: string; label: string }[]>([]);
  
  philipineProvinces = [
    'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique',
    'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batangas', 'Benguet', 'Biliran',
    'Bohol', 'Bukidnon', 'Bulacan', 'Calauan', 'Camarines Norte', 'Camarines Sur',
    'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu', 'Compostela Valley',
    'Cotabato', 'Davao del Norte', 'Davao del Sur', 'Davao Oriental', 'Dinagat Islands',
    'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo',
    'Isabela', 'Kalinga', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'La Union',
    'Leyte', 'Maguindanao', 'Marinduque', 'Masbate', 'Mindoro Occidental', 'Mindoro Oriental',
    'Misamis Occidental', 'Misamis Oriental', 'Mountain Province', 'Negros Occidental',
    'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Palawan',
    'Pampanga', 'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar',
    'Sarangani', 'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat',
    'Sulu', 'Sundalandia', 'Tarlac', 'Tawi-Tawi', 'Terminillo', 'Timor', 'Tondo',
    'Tukuran', 'Tulungan', 'Valenzuela', 'Western Samar', 'Zamboanga del Norte',
    'Zamboanga del Sur', 'Zamboanga Sibugay'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private rbacService: RbacService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      roleName: ['Support Staff', Validators.required],
      is_active: [true],
      // Philippine Address fields
      street_address: [''],
      barangay: [''],
      city: ['', Validators.required],
      province: ['', Validators.required],
      region: [''],
      postal_code: [''],
      country: ['Philippines']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadRoles(); // Load available roles
    
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      // Make password optional for edit mode
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValidators([]);
      this.userForm.get('password')?.updateValueAndValidity({ emitEvent: false });
      this.userForm.get('confirm_password')?.clearValidators();
      this.userForm.get('confirm_password')?.setValidators([]);
      this.userForm.get('confirm_password')?.updateValueAndValidity({ emitEvent: false });
      
      this.loadUser();
    }
  }

  loadRoles(): void {
    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success && response.roles) {
          // Filter for platform scope roles and map to dropdown format
          const platformRoles = response.roles
            .filter(r => r.scope === 'platform')
            .map(r => ({
              value: r.name,
              label: r.name
            }));
          this.roles.set(platformRoles);
          console.log('✅ Platform roles loaded for user assignment:', platformRoles);
        }
      },
      error: (error) => {
        console.error('❌ Failed to load roles:', error);
        // Fallback to empty array if API fails
        this.roles.set([]);
      }
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirm_password');
    
    if (!password || !confirmPassword) return null;
    if (!password.value || !confirmPassword.value) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  loadUser(): void {
    if (!this.userId) return;
    
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success) {
          const user = response.user;
          this.userForm.patchValue({
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            roleName: user.role_name,
            is_active: user.is_active,
            street_address: user.street_address || '',
            barangay: user.barangay || '',
            city: user.city || '',
            province: user.province || '',
            region: user.region || '',
            postal_code: user.postal_code || '',
            country: user.country || 'Philippines'
          });
          // Make email read-only in edit mode
          this.userForm.get('email')?.disable();
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

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';

    const formValue = this.userForm.getRawValue(); // getRawValue includes disabled fields
    const formData: any = { 
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      roleName: formValue.roleName,
      is_active: formValue.is_active,
      street_address: formValue.street_address,
      barangay: formValue.barangay,
      city: formValue.city,
      province: formValue.province,
      region: formValue.region,
      postal_code: formValue.postal_code,
      country: formValue.country || 'Philippines'
    };

    // Only include password if provided
    if (formValue.password) {
      formData.password = formValue.password;
    }

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/super-admin/users']);
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.error = error.error?.error || 'Failed to update user';
          this.submitting = false;
        }
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/super-admin/users']);
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.error = error.error?.error || 'Failed to create user';
          this.submitting = false;
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) return `${this.formatFieldName(fieldName)} is required`;
    if (field?.hasError('email')) return 'Invalid email format';
    if (field?.hasError('minlength')) return `Minimum length is ${field.errors?.['minlength'].requiredLength}`;
    if (this.userForm.hasError('passwordMismatch') && (fieldName === 'password' || fieldName === 'confirm_password')) {
      return 'Passwords do not match';
    }
    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace('_', ' ')
      .trim()
      .charAt(0)
      .toUpperCase() + fieldName.slice(1);
  }
}
