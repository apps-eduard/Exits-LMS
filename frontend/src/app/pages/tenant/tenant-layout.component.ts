import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './tenant-layout.component.html',
  styleUrls: ['./tenant-layout.component.scss']
})
export class TenantLayoutComponent implements OnInit {
  readonly sidebarOpen = signal(true);
  readonly showUserMenu = signal(false);
  readonly currentTenant = signal<any>(null);
  readonly tenantLoading = signal(true);
  
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTenantInfo();
  }

  loadTenantInfo(): void {
    // Get current tenant ID from current user
    const user = this.authService.getCurrentUser();
    const tenantId = user?.tenantId;
    
    console.log('📍 [TENANT_LAYOUT] Loading tenant info for:', tenantId);
    
    if (tenantId) {
      this.tenantService.getTenantById(tenantId).subscribe({
        next: (response) => {
          if (response.success) {
            this.currentTenant.set(response.tenant);
            console.log('✅ [TENANT_LAYOUT] Tenant loaded:', response.tenant.name);
          }
          this.tenantLoading.set(false);
        },
        error: (error) => {
          console.error('❌ [TENANT_LAYOUT] Error loading tenant:', error);
          this.tenantLoading.set(false);
        }
      });
    } else {
      console.warn('⚠️ [TENANT_LAYOUT] No tenant ID found in user');
      this.tenantLoading.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(open => !open);
  }

  getInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.firstName?.[0] || '';
    const last = this.currentUser.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }

  getTenantInitials(): string {
    const tenant = this.currentTenant();
    if (!tenant?.name) return 'TA';
    return tenant.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getTenantName(): string {
    const tenant = this.currentTenant();
    return tenant?.name || 'Tenant Admin';
  }

  hasModule(moduleName: string): boolean {
    return this.authService.hasModule(moduleName);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

