import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  contact_first_name?: string;
  contact_last_name?: string;
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
  readonly activeTenants = signal<TenantRow[]>([]);
  readonly suspendedTenants = signal<TenantRow[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly statusFilter = signal('all');

  private searchSubject = new Subject<void>();

  constructor(private tenantService: TenantService, private route: ActivatedRoute) {
    // Debounce search and filter changes to prevent rate limiting
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.loadTenants();
    });
  }

  ngOnInit(): void {
    console.log('[TENANT_LIST] 🎯 Component initialized');
    // Subscribe to query parameters for pre-filtering (Active/Suspended tenants from sidebar)
    this.route.queryParams.subscribe(params => {
      console.log('[TENANT_LIST] 🔗 Query param changed:', { 
        status: params['status'],
        allParams: params 
      });
      if (params['status']) {
        console.log('[TENANT_LIST] 🔗 Query param detected:', { status: params['status'] });
        this.statusFilter.set(params['status']);
      } else {
        this.statusFilter.set('all');
      }
      this.loadTenants();
    });
  }

  loadTenants(): void {
    this.loading.set(true);
    console.log('[TENANT_LIST] Loading tenants with:', {
      search: this.searchTerm(),
      status: this.statusFilter()
    });
    
    this.tenantService.getAllTenants(this.searchTerm(), this.statusFilter() === 'all' ? undefined : this.statusFilter()).subscribe({
      next: (response) => {
        console.log('[TENANT_LIST] ✅ Tenants loaded:', {
          success: response.success,
          count: response.tenants?.length || 0,
          tenants: response.tenants
        });
        
        if (response.success) {
          this.tenants.set(response.tenants);
          this.filteredTenants.set(response.tenants);
          const activeTenants = response.tenants.filter((t: TenantRow) => t.status === 'active');
          const suspendedTenants = response.tenants.filter((t: TenantRow) => t.status === 'suspended');
          
          console.log('[TENANT_LIST] 📊 Filtered tenants:', {
            active: activeTenants.length,
            suspended: suspendedTenants.length,
            activeSample: activeTenants.slice(0, 1),
            suspendedSample: suspendedTenants.slice(0, 1)
          });
          
          this.activeTenants.set(activeTenants);
          this.suspendedTenants.set(suspendedTenants);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('[TENANT_LIST] ❌ Error loading tenants:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(event?: Event): void {
    if (event) {
      const value = (event.target as HTMLInputElement).value;
      console.log('[TENANT_LIST] 🔍 Search triggered:', value);
      this.searchTerm.set(value);
    }
    this.searchSubject.next();
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    console.log('[TENANT_LIST] 📋 Status filter changed:', value);
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

  onTenantClick(tenant: TenantRow): void {
    console.log('[TENANT_LIST] 👁️ Viewing tenant:', {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status,
      hasId: !!tenant.id,
      allProps: tenant
    });
  }
}
