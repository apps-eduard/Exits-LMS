import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

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
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      id_number: [''],
      street_address: [''],
      barangay: [''],
      city: [''],
      province: [''],
      region: [''],
      postal_code: [''],
      country: [{ value: 'Philippines', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.isEditMode = true;
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    if (!this.customerId) return;

    this.loading = true;
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (response) => {
        if (response.success && response.customer) {
          const customer = response.customer;
          this.customerForm.patchValue({
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email || '',
            phone: customer.phone || '',
            id_number: customer.id_number || '',
            street_address: customer.street_address || '',
            barangay: customer.barangay || '',
            city: customer.city || '',
            province: customer.province || '',
            region: customer.region || '',
            postal_code: customer.postal_code || '',
            country: customer.country || 'Philippines'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.error = 'Failed to load customer data';
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
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
    if (!this.customerForm.valid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.customerForm.value;

    if (this.isEditMode && this.customerId) {
      this.updateCustomer(this.customerId, formValue);
    } else {
      this.createCustomer(formValue);
    }
  }

  createCustomer(data: any): void {
    this.customerService.createCustomer(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tenant/customers']);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        this.error = error.error?.error || 'Error creating customer';
        this.submitting = false;
      }
    });
  }

  updateCustomer(customerId: string, data: any): void {
    this.customerService.updateCustomer(customerId, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tenant/customers']);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.error = error.error?.error || 'Error updating customer';
        this.submitting = false;
      }
    });
  }
}
