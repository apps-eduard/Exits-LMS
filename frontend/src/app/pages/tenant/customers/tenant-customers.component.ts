import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-tenant-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-customers.component.html',
  styleUrls: ['./tenant-customers.component.scss']
})
export class TenantCustomersComponent implements OnInit {
  readonly customers = signal<any[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly filterStatus = signal('');
  readonly summary = signal<any>(null);

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

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

  createCustomer(): void {
    this.router.navigate(['/tenant/customers/create']);
  }

  editCustomer(customer: any): void {
    this.router.navigate([`/tenant/customers/${customer.id}/edit`]);
  }

  deleteCustomer(customer: any): void {
    if (confirm(`Are you sure you want to delete ${customer.first_name} ${customer.last_name}?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCustomers();
            this.loadSummary();
          }
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
        }
      });
    }
  }

  toggleCustomerStatus(customer: any): void {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    this.customerService.updateCustomer(customer.id, { status: newStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCustomers();
          this.loadSummary();
        }
      },
      error: (error) => {
        console.error('Error updating customer status:', error);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  }
}
