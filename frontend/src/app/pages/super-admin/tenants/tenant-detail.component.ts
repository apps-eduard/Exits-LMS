import { Component, OnInit } from '@angular/core';
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
  tenant: any = null;
  users: any[] = [];
  loading = true;
  loadingUsers = false;
  toggling: { [key: string]: boolean } = {};

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
    this.loading = true;
    this.tenantService.getTenantById(tenantId).subscribe({
      next: (response) => {
        if (response.success) {
          this.tenant = response.tenant;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tenant:', error);
        this.loading = false;
      }
    });
  }

  loadUsers(tenantId: string): void {
    this.loadingUsers = true;
    this.tenantService.getTenantUsers(tenantId).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.users;
        }
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
      }
    });
  }

  getModuleStatus(moduleName: string): boolean {
    if (!this.tenant?.modules) return false;
    const module = this.tenant.modules.find((m: any) => m.module === moduleName);
    return module?.enabled || false;
  }

  toggleModule(moduleName: string): void {
    if (!this.tenant?.id) return;
    
    const currentStatus = this.getModuleStatus(moduleName);
    this.toggling[moduleName] = true;

    this.tenantService.toggleModule(this.tenant.id, moduleName, !currentStatus).subscribe({
      next: (response) => {
        if (response.success) {
          // Reload tenant data to reflect changes
          this.loadTenant(this.tenant.id);
        }
        this.toggling[moduleName] = false;
      },
      error: (error) => {
        console.error('Error toggling module:', error);
        this.toggling[moduleName] = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'badge-success',
      'trial': 'badge-warning',
      'inactive': 'badge-danger',
      'suspended': 'badge-info'
    };
    return colors[status] || 'badge-secondary';
  }

  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      'Tenant Admin': 'badge-primary',
      'Loan Officer': 'badge-info',
      'Cashier': 'badge-success'
    };
    return colors[roleName] || 'badge-secondary';
  }
}
