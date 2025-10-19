import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tenant-form.component.html',
  styles: []
})
export class TenantFormComponent implements OnInit {
  tenantForm: FormGroup;
  isEditMode = false;
  tenantId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

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
    private tenantService: TenantService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tenantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      subdomain: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      contactFirstName: ['', [Validators.required, Validators.minLength(2)]],
      contactLastName: ['', [Validators.required, Validators.minLength(2)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: [''],
      subscriptionPlan: ['trial', Validators.required],
      status: ['active', Validators.required],
      // Philippine Address Fields
      street_address: [''],
      barangay: [''],
      city: ['', Validators.required],
      province: ['', Validators.required],
      region: [''],
      postal_code: [''],
      country: ['Philippines'],
      // Module toggles
      money_loan_enabled: [true],
      pawnshop_enabled: [false],
      bnpl_enabled: [false]
    });
  }

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('id');
    if (this.tenantId) {
      this.isEditMode = true;
      this.loadTenant();
    }
  }

  loadTenant(): void {
    if (!this.tenantId) return;
    
    this.loading = true;
    this.tenantService.getTenantById(this.tenantId).subscribe({
      next: (response) => {
        if (response.success) {
          const tenant = response.tenant;
          this.tenantForm.patchValue({
            name: tenant.name,
            subdomain: tenant.subdomain,
            contactFirstName: tenant.contact_first_name,
            contactLastName: tenant.contact_last_name,
            contactEmail: tenant.contact_email,
            contactPhone: tenant.contact_phone,
            subscriptionPlan: tenant.subscription_plan,
            status: tenant.status,
            street_address: tenant.street_address || '',
            barangay: tenant.barangay || '',
            city: tenant.city || '',
            province: tenant.province || '',
            region: tenant.region || '',
            postal_code: tenant.postal_code || '',
            country: tenant.country || 'Philippines',
            money_loan_enabled: this.getModuleStatus(tenant, 'money-loan'),
            pawnshop_enabled: this.getModuleStatus(tenant, 'pawnshop'),
            bnpl_enabled: this.getModuleStatus(tenant, 'bnpl')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
        this.error = 'Failed to load tenant data';
        this.loading = false;
      }
    });
  }

  getModuleStatus(tenant: any, moduleName: string): boolean {
    if (!tenant.modules) return false;
    const module = tenant.modules.find((m: any) => m.module === moduleName);
    return module?.enabled || false;
  }

  onSubmit(): void {
    if (this.tenantForm.invalid) {
      Object.keys(this.tenantForm.controls).forEach(key => {
        this.tenantForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';

    const formData = this.tenantForm.value;
    
    if (this.isEditMode && this.tenantId) {
      this.tenantService.updateTenant(this.tenantId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/super-admin/tenants', this.tenantId]);
          }
        },
        error: (error) => {
          console.error('Error updating tenant:', error);
          this.error = error.error?.message || 'Failed to update tenant';
          this.submitting = false;
        }
      });
    } else {
      this.tenantService.createTenant(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/super-admin/tenants']);
          }
        },
        error: (error) => {
          console.error('Error creating tenant:', error);
          this.error = error.error?.message || 'Failed to create tenant';
          this.submitting = false;
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tenantForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.tenantForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName} is required`;
    if (field?.hasError('email')) return 'Invalid email format';
    if (field?.hasError('minlength')) return `Minimum length is ${field.errors?.['minlength'].requiredLength}`;
    if (field?.hasError('pattern')) return 'Only lowercase letters, numbers, and hyphens allowed';
    return '';
  }
}
