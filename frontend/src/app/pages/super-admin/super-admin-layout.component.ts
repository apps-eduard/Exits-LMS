import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MenuService, NavSection } from '../../core/services/menu.service';
import { ComingSoonService } from '../../core/services/coming-soon.service';
import { ComingSoonModalComponent } from '../../shared/components/coming-soon-modal.component';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ComingSoonModalComponent],
  templateUrl: './super-admin-layout.component.html',
  styleUrl: './super-admin-layout.component.scss'
})
export class SuperAdminLayoutComponent implements OnInit {
  readonly sidebarOpen = signal(true);
  readonly showUserMenu = signal(false);
  readonly expandedSections = signal<Set<string>>(new Set());
  readonly expandedItems = signal<Set<string>>(new Set());
  readonly loadingMenu = signal(false);
  readonly menuError = signal<string | null>(null);
  user: any = null;

  // Dynamic navigation structure - loaded from backend
  readonly navSections = signal<NavSection[]>([]);

  // Coming soon features - routes that should show the modal
  private readonly comingSoonRoutes = [
    '/super-admin/metrics',
    '/super-admin/errors',
    '/super-admin/jobs',
    '/super-admin/notifications',
    '/super-admin/alerts',
    '/super-admin/announcements',
    '/super-admin/subscriptions',
    '/super-admin/plans',
    '/super-admin/invoices',
    '/super-admin/payments',
    '/super-admin/analytics',
    '/super-admin/reports/revenue',
    '/super-admin/reports/user-activity',
    '/super-admin/reports/tenant-usage'
  ];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private menuService: MenuService,
    public comingSoonService: ComingSoonService
  ) {}

  ngOnInit(): void {
    console.log('[SUPER_ADMIN_LAYOUT] 🎯 Component initialized');
    this.authService.currentUser$.subscribe(user => {
      console.log('[SUPER_ADMIN_LAYOUT] 👤 User loaded:', { 
        id: user?.id, 
        email: user?.email,
        isLoaded: !!user 
      });
      this.user = user;
      // Load menus when user is loaded
      if (user) {
        this.loadMenus();
      }
    });
  }

  /**
   * Load menus from backend based on user permissions
   */
  loadMenus(): void {
    console.log('[SUPER_ADMIN_LAYOUT] 📋 Loading platform menus filtered by user role...');
    this.loadingMenu.set(true);
    this.menuError.set(null);

    // Use user-specific menu from database
    this.menuService.getDynamicPlatformMenuForUser().subscribe({
      next: (menu) => {
        console.log('[SUPER_ADMIN_LAYOUT] ✅ User-specific platform menu loaded:', {
          sections: menu.length,
          items: menu.reduce((sum, s) => sum + s.items.length, 0),
          menu: menu
        });
        this.navSections.set(menu);
        this.loadingMenu.set(false);
        // Expand first section by default
        if (menu.length > 0) {
          this.expandedSections.set(new Set([menu[0].title]));
        }
      },
      error: (error) => {
        console.error('[SUPER_ADMIN_LAYOUT] ❌ Failed to load user menus:', error);
        this.menuError.set('Failed to load menu from database.');
        this.loadingMenu.set(false);
        
        // Show empty sidebar (no menus assigned)
        this.navSections.set([]);
      }
    });
  }

  /**
   * Refresh menus - useful after menu assignments change
   */
  refreshMenus(): void {
    console.log('[SUPER_ADMIN_LAYOUT] � Refreshing menus...');
    this.loadMenus();
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.user) return 'SA';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  /**
   * Handle menu item click - check if it's a coming soon feature
   */
  handleMenuClick(event: Event, route: string | undefined): void {
    // Guard against undefined routes
    if (!route) return;
    
    // Extract base route without query params
    const baseRoute = route.split('?')[0];
    
    if (this.comingSoonRoutes.includes(baseRoute)) {
      event.preventDefault();
      event.stopPropagation();
      
      // Map route to feature key
      const featureKey = this.getFeatureKeyFromRoute(baseRoute);
      this.comingSoonService.showComingSoon(featureKey);
    }
  }

  /**
   * Map route to feature key for coming soon modal
   */
  private getFeatureKeyFromRoute(route: string): string {
    const routeMap: Record<string, string> = {
      '/super-admin/metrics': 'performance-metrics',
      '/super-admin/errors': 'error-logs',
      '/super-admin/jobs': 'background-jobs',
      '/super-admin/notifications': 'notifications',
      '/super-admin/alerts': 'alerts',
      '/super-admin/announcements': 'announcements',
      '/super-admin/subscriptions': 'subscriptions',
      '/super-admin/plans': 'subscription-plans',
      '/super-admin/invoices': 'invoices',
      '/super-admin/payments': 'payments',
      '/super-admin/analytics': 'system-analytics',
      '/super-admin/reports/revenue': 'revenue-reports',
      '/super-admin/reports/user-activity': 'user-activity-reports',
      '/super-admin/reports/tenant-usage': 'tenant-usage-reports'
    };
    
    return routeMap[route] || 'default';
  }
}
