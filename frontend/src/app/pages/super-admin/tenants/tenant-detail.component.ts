import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tenant-detail.component.html',
  styles: []
})
export class TenantDetailComponent implements OnInit {
  readonly tenant = signal<any>(null);
  readonly users = signal<any[]>([]);
  readonly loading = signal(true);
  readonly loadingUsers = signal(false);
  readonly error = signal<string | null>(null);
  readonly toggling = signal<{ [key: string]: boolean }>({});

  constructor(
    private route: ActivatedRoute,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    const tenantId = this.route.snapshot.paramMap.get('id');
    if (tenantId) {
      this.loadTenant(tenantId);
      this.loadUsers(tenantId);
    }
  }

  loadTenant(tenantId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.tenantService.getTenantById(tenantId).subscribe({
      next: (response) => {
        if (response.success && response.tenant) {
          this.tenant.set(response.tenant);
        } else if (response.tenant) {
          this.tenant.set(response.tenant);
        } else {
          this.error.set('Failed to load tenant data');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
        this.error.set('Error loading tenant: ' + (error?.error?.error || 'Unknown error'));
        this.loading.set(false);
      }
    });
  }

  loadUsers(tenantId: string): void {
    this.loadingUsers.set(true);
    this.tenantService.getTenantUsers(tenantId).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.users)) {
          this.users.set(response.users);
        } else if (Array.isArray(response.users)) {
          this.users.set(response.users);
        }
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers.set(false);
      }
    });
  }

  getModuleStatus(moduleName: string): boolean {
    const currentTenant = this.tenant();
    if (!currentTenant?.modules) return false;
    const module = currentTenant.modules.find((m: any) => m.module === moduleName);
    return module?.enabled || false;
  }

  toggleModule(moduleName: string): void {
    const currentTenant = this.tenant();
    if (!currentTenant?.id) return;
    
    const currentStatus = this.getModuleStatus(moduleName);
    const togglingObj = this.toggling();
    togglingObj[moduleName] = true;
    this.toggling.set(togglingObj);

    this.tenantService.toggleModule(currentTenant.id, moduleName, !currentStatus).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTenant(currentTenant.id);
        }
        const togglingObj = this.toggling();
        togglingObj[moduleName] = false;
        this.toggling.set(togglingObj);
      },
      error: (error) => {
        console.error('Error toggling module:', error);
        const togglingObj = this.toggling();
        togglingObj[moduleName] = false;
        this.toggling.set(togglingObj);
      }
    });
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

  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      'Tenant Admin': 'bg-blue-900/30 border border-blue-700 text-blue-400',
      'Loan Officer': 'bg-cyan-900/30 border border-cyan-700 text-cyan-400',
      'Cashier': 'bg-green-900/30 border border-green-700 text-green-400'
    };
    return colors[roleName] || 'bg-gray-700/30 border border-gray-600 text-gray-400';
  }
}
