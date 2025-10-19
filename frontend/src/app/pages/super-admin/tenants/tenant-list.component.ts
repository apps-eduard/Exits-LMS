import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { debounceTime, Subject } from 'rxjs';

interface TenantRow {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'trial' | 'inactive' | 'suspended';
  subscription_plan: string;
  subscription_end?: string;
  contact_name?: string;
  contact_email: string;
  contact_phone?: string;
  modules: any[];
  created_at: string;
}

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.scss'
})
export class TenantListComponent implements OnInit {
  readonly tenants = signal<TenantRow[]>([]);
  readonly filteredTenants = signal<TenantRow[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly statusFilter = signal('all');

  private searchSubject = new Subject<void>();

  constructor(private tenantService: TenantService) {
    // Debounce search and filter changes to prevent rate limiting
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.loadTenants();
    });
  }

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading.set(true);
    this.tenantService.getAllTenants(this.searchTerm(), this.statusFilter() === 'all' ? undefined : this.statusFilter()).subscribe({
      next: (response) => {
        if (response.success) {
          this.tenants.set(response.tenants);
          this.filteredTenants.set(response.tenants);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(event?: Event): void {
    if (event) {
      const value = (event.target as HTMLInputElement).value;
      this.searchTerm.set(value);
    }
    this.searchSubject.next();
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.searchSubject.next();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-900/30 border border-green-700 text-green-400';
      case 'trial':
        return 'bg-blue-900/30 border border-blue-700 text-blue-400';
      case 'inactive':
        return 'bg-red-900/30 border border-red-700 text-red-400';
      case 'suspended':
        return 'bg-yellow-900/30 border border-yellow-700 text-yellow-400';
      default:
        return 'bg-gray-700/30 border border-gray-600 text-gray-400';
    }
  }

  getModuleStatus(tenant: any, moduleName: string): boolean {
    if (!tenant.modules) return false;
    const module = tenant.modules.find((m: any) => m.module === moduleName);
    return module?.enabled || false;
  }

  getActiveModulesCount(tenant: any): number {
    if (!tenant.modules) return 0;
    return tenant.modules.filter((m: any) => m.enabled).length;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
