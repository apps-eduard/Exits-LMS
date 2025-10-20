import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MenuService, NavSection } from '../../core/services/menu.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
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

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
    private menuService: MenuService
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
    console.log('[SUPER_ADMIN_LAYOUT] 📋 Loading platform menus...');
    this.loadingMenu.set(true);
    this.menuError.set(null);

    this.menuService.getPlatformMenu().subscribe({
      next: (menu) => {
        console.log('[SUPER_ADMIN_LAYOUT] ✅ Platform menu loaded:', {
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
        console.error('[SUPER_ADMIN_LAYOUT] ❌ Failed to load platform menus:', error);
        this.menuError.set('Failed to load menu. Using fallback.');
        this.loadingMenu.set(false);
        
        // Use fallback menu
        const fallback = this.menuService.getFallbackPlatformMenu();
        console.log('[SUPER_ADMIN_LAYOUT] 📦 Using fallback menu:', fallback);
        this.navSections.set(fallback);
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.user) return 'SA';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
