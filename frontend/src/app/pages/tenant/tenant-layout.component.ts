import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TenantService } from '../../core/services/tenant.service';
import { MenuService, NavSection } from '../../core/services/menu.service';

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
  readonly expandedSections = signal<Set<string>>(new Set());
  readonly expandedItems = signal<Set<string>>(new Set());
  readonly loadingMenu = signal(false);
  readonly menuError = signal<string | null>(null);
  
  currentUser: User | null = null;

  // Dynamic tenant navigation structure - loaded from backend
  readonly navSections = signal<NavSection[]>([]);

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private tenantService: TenantService,
    private router: Router,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTenantInfo();
    this.loadMenus();
  }

  /**
   * Load tenant information
   */
  loadTenantInfo(): void {
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

  /**
   * Load menus from backend based on user permissions
   */
  loadMenus(): void {
    this.loadingMenu.set(true);
    this.menuError.set(null);

    this.menuService.getDynamicTenantMenu().subscribe({
      next: (menu) => {
        this.navSections.set(menu);
        this.loadingMenu.set(false);
        // Expand first section by default
        if (menu.length > 0) {
          this.expandedSections.set(new Set([menu[0].title]));
        }
      },
      error: (error) => {
        console.error('Failed to load tenant menus:', error);
        this.menuError.set('Failed to load menu. Using fallback.');
        this.loadingMenu.set(false);
        
        // Use fallback menu
        const fallback = this.menuService.getFallbackTenantMenu();
        this.navSections.set(fallback);
        // Expand first section by default
        if (fallback.length > 0) {
          this.expandedSections.set(new Set([fallback[0].title]));
        }
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(open => !open);
  }

  toggleSection(sectionTitle: string): void {
    const expanded = new Set(this.expandedSections());
    if (expanded.has(sectionTitle)) {
      expanded.delete(sectionTitle);
    } else {
      expanded.add(sectionTitle);
    }
    this.expandedSections.set(expanded);
  }

  toggleItem(itemLabel: string): void {
    const expanded = new Set(this.expandedItems());
    if (expanded.has(itemLabel)) {
      expanded.delete(itemLabel);
    } else {
      expanded.add(itemLabel);
    }
    this.expandedItems.set(expanded);
  }

  isSectionExpanded(sectionTitle: string): boolean {
    return this.expandedSections().has(sectionTitle);
  }

  isItemExpanded(itemLabel: string): boolean {
    return this.expandedItems().has(itemLabel);
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

