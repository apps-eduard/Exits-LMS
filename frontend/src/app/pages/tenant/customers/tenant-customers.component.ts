import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-tenant-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tenant-customers.component.html',
  styleUrls: ['./tenant-customers.component.scss']
})
export class TenantCustomersComponent implements OnInit {
  readonly customers = signal<any[]>([]);
  readonly loading = signal(false);
  readonly showModal = signal(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly selectedCustomer = signal<any>(null);
  readonly searchQuery = signal('');
  readonly filterStatus = signal('');
  readonly summary = signal<any>(null);

  // Philippine Provinces
  readonly philippineProvinces = [
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

  customerForm: FormGroup;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      // Philippine Address Fields
      streetAddress: [''],
      barangay: [''],
      city: [''],
      province: [''],
      region: [''],
      postalCode: [''],
      country: ['Philippines'],
      idNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadSummary();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customerService.getAllCustomers(
      this.searchQuery(),
      this.filterStatus()
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers.set(response.customers);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading.set(false);
      }
    });
  }

  loadSummary(): void {
    this.customerService.getCustomersSummary().subscribe({
      next: (response) => {
        if (response.success) {
          this.summary.set(response.summary);
        }
      },
      error: (error) => console.error('Error loading summary:', error)
    });
  }

  onSearch(): void {
    this.loadCustomers();
  }

  onFilterChange(): void {
    this.loadCustomers();
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.customerForm.reset();
    this.selectedCustomer.set(null);
    this.showModal.set(true);
  }

  openEditModal(customer: any): void {
    this.modalMode.set('edit');
    this.selectedCustomer.set(customer);
    this.customerForm.patchValue({
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      streetAddress: customer.street_address || '',
      barangay: customer.barangay || '',
      city: customer.city || '',
      province: customer.province || '',
      region: customer.region || '',
      postalCode: customer.postal_code || '',
      country: customer.country || 'Philippines',
      idNumber: customer.id_number
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.customerForm.reset();
    this.selectedCustomer.set(null);
  }

  onSubmit(): void {
    if (!this.customerForm.valid) {
      alert('Please fill in all required fields');
      return;
    }

    const formData = this.customerForm.value;

    if (this.modalMode() === 'create') {
      this.createCustomer(formData);
    } else {
      this.updateCustomer(this.selectedCustomer().id, formData);
    }
  }

  createCustomer(data: any): void {
    this.loading.set(true);
    this.customerService.createCustomer(data).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Customer created successfully');
          this.closeModal();
          this.loadCustomers();
          this.loadSummary();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error creating customer:', error);
        alert(error.error?.error || 'Error creating customer');
        this.loading.set(false);
      }
    });
  }

  updateCustomer(customerId: string, data: any): void {
    this.loading.set(true);
    this.customerService.updateCustomer(customerId, data).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Customer updated successfully');
          this.closeModal();
          this.loadCustomers();
          this.loadSummary();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        alert(error.error?.error || 'Error updating customer');
        this.loading.set(false);
      }
    });
  }

  deleteCustomer(customer: any): void {
    if (confirm(`Are you sure you want to delete ${customer.first_name} ${customer.last_name}?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Customer deleted successfully');
            this.loadCustomers();
            this.loadSummary();
          }
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          alert(error.error?.error || 'Error deleting customer');
        }
      });
    }
  }

  toggleCustomerStatus(customer: any): void {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    this.customerService.updateCustomer(customer.id, { status: newStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`Customer ${newStatus}`);
          this.loadCustomers();
          this.loadSummary();
        }
      },
      error: (error) => {
        console.error('Error updating customer status:', error);
        alert(error.error?.error || 'Error updating customer status');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    return status === 'active' ? 'badge-success' : 'badge-secondary';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  }
}
