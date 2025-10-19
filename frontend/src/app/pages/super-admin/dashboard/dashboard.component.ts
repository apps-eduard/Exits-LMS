import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';

interface Stat {
  label: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  description?: string;
}

interface TenantItem {
  id: string;
  name: string;
  status: string;
  modules: any[];
  subscription_plan: string;
  createdAt: string;
  color: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class SuperAdminDashboardComponent implements OnInit {
  readonly stats = signal<Stat[]>([
    {
      label: 'Total Tenants',
      value: '48',
      change: '+12%',
      changeType: 'increase',
      icon: '🏢',
      color: 'blue',
      description: 'Active businesses'
    },
    {
      label: 'Money Loan Enabled',
      value: '38',
      change: '+15%',
      changeType: 'increase',
      icon: '💸',
      color: 'purple',
      description: 'Using this feature'
    },
    {
      label: 'Pawnshop Enabled',
      value: '35',
      change: '+18%',
      changeType: 'increase',
      icon: '�',
      color: 'green',
      description: 'Active in system'
    },
    {
      label: 'BNPL Enabled',
      value: '32',
      change: '+22%',
      changeType: 'increase',
      icon: '🛒',
      color: 'orange',
      description: 'Active this month'
    }
  ]);
  
  readonly recentTenants = signal<TenantItem[]>([]);
  readonly loading = signal(true);

  readonly colors = ['blue', 'purple', 'green', 'orange', 'pink'];

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.tenantService.getAllTenants().subscribe({
      next: (response) => {
        if (response.success) {
          const tenants = response.tenants;
          
          // Update stats
          let moneyLoanEnabled = 0;
          let pawnshopEnabled = 0;
          let bnplEnabled = 0;
          
          tenants.forEach((tenant: any) => {
            if (tenant.modules) {
              const moneyLoan = tenant.modules.find((m: any) => m.module === 'money-loan');
              const pawnshop = tenant.modules.find((m: any) => m.module === 'pawnshop');
              const bnpl = tenant.modules.find((m: any) => m.module === 'bnpl');
              
              if (moneyLoan?.enabled) moneyLoanEnabled++;
              if (pawnshop?.enabled) pawnshopEnabled++;
              if (bnpl?.enabled) bnplEnabled++;
            }
          });

          this.stats.update(s => [
            { ...s[0], value: tenants.length },
            { ...s[1], value: moneyLoanEnabled },
            { ...s[2], value: pawnshopEnabled },
            { ...s[3], value: bnplEnabled }
          ]);
          
          // Update recent tenants
          const formatted = tenants.slice(0, 8).map((t: any, i: number) => ({
            id: t.id,
            name: t.businessName || t.name,
            status: t.status,
            modules: t.modules || [],
            createdAt: t.createdAt,
            color: this.colors[i % this.colors.length]
          }));
          
          this.recentTenants.set(formatted);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading.set(false);
      }
    });
  }

  getActiveModulesCount(tenant: any): number {
    if (!tenant.modules) return 0;
    return tenant.modules.filter((m: any) => m.enabled).length;
  }

  getTotalModulesCount(tenant: any): number {
    if (!tenant.modules) return 0;
    return tenant.modules.length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'suspended':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
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
