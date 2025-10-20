import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Dynamic Menu Interface
export interface Menu {
  id?: string;
  name: string;
  slug: string;
  parentMenuId?: string | null;
  icon?: string;
  route?: string;
  scope: 'platform' | 'tenant';
  orderIndex?: number;
  isActive?: boolean;
  tenantId?: string | null;
  children?: Menu[];
  createdAt?: string;
  updatedAt?: string;
}

// Legacy Menu Interface (for backward compatibility)
export interface NavItem {
  id?: string;
  label: string;
  icon: string;
  route?: string;
  queryParams?: Record<string, string | number | boolean>;
  badge?: number;
  children?: NavItem[];
  description?: string;
  permission?: string;
  visible?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  description?: string;
  items: NavItem[];
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menus`;
  
  // Dynamic menu state
  private dynamicMenus = signal<Menu[]>([]);
  private menuTree = signal<Menu[]>([]);
  private selectedMenu = signal<Menu | null>(null);
  
  // Cached menu configurations
  private platformMenuCache = signal<NavSection[] | null>(null);
  private tenantMenuCache = signal<NavSection[] | null>(null);
  
  // For real-time updates
  private platformMenuSubject = new BehaviorSubject<NavSection[]>([]);
  private tenantMenuSubject = new BehaviorSubject<NavSection[]>([]);
  private dynamicMenusSubject = new BehaviorSubject<Menu[]>([]);
  
  public platformMenu$ = this.platformMenuSubject.asObservable();
  public tenantMenu$ = this.tenantMenuSubject.asObservable();
  public dynamicMenus$ = this.dynamicMenusSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============== DYNAMIC MENU CRUD OPERATIONS ==============

  /**
   * Get all dynamic menus (with optional scope filtering)
   */
  getMenus(scope?: 'platform' | 'tenant'): Observable<Menu[]> {
    const params = scope ? `?scope=${scope}` : '';
    return this.http.get<Menu[]>(`${this.apiUrl}${params}`).pipe(
      tap(menus => {
        this.dynamicMenus.set(menus);
        this.dynamicMenusSubject.next(menus);
      })
    );
  }

  /**
   * Get hierarchical menu tree
   */
  getMenuTree(scope?: 'platform' | 'tenant'): Observable<Menu[]> {
    const params = scope ? `?scope=${scope}` : '';
    return this.http.get<Menu[]>(`${this.apiUrl}/tree${params}`).pipe(
      tap(tree => {
        this.menuTree.set(tree);
      })
    );
  }

  /**
   * Get menu by ID
   */
  getMenuById(id: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.apiUrl}/${id}`).pipe(
      tap(menu => {
        this.selectedMenu.set(menu);
      })
    );
  }

  /**
   * Get children of a menu
   */
  getMenuChildren(parentId: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/${parentId}/children`);
  }

  /**
   * Create a new menu
   */
  createMenu(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(this.apiUrl, menu).pipe(
      tap(newMenu => {
        const menus = this.dynamicMenus();
        this.dynamicMenus.set([...menus, newMenu]);
        this.dynamicMenusSubject.next(this.dynamicMenus());
      })
    );
  }

  /**
   * Update a menu
   */
  updateMenu(id: string, menu: Partial<Menu>): Observable<Menu> {
    return this.http.put<Menu>(`${this.apiUrl}/${id}`, menu).pipe(
      tap(updatedMenu => {
        const menus = this.dynamicMenus().map(m => m.id === id ? updatedMenu : m);
        this.dynamicMenus.set(menus);
        this.dynamicMenusSubject.next(menus);
        if (this.selectedMenu()?.id === id) {
          this.selectedMenu.set(updatedMenu);
        }
      })
    );
  }

  /**
   * Delete a menu
   */
  deleteMenu(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const menus = this.dynamicMenus().filter(m => m.id !== id);
        this.dynamicMenus.set(menus);
        this.dynamicMenusSubject.next(menus);
        if (this.selectedMenu()?.id === id) {
          this.selectedMenu.set(null);
        }
      })
    );
  }

  /**
   * Reorder menus
   */
  reorderMenus(menus: Array<{ id: string }>): Observable<any> {
    return this.http.post(`${this.apiUrl}/reorder`, { menus });
  }

  // ============== LEGACY MENU ENDPOINTS ==============

  /**
   * Get platform/super-admin menu (legacy static endpoint)
   */
  getPlatformMenu(): Observable<NavSection[]> {
    // Return cached if available
    if (this.platformMenuCache()) {
      return new Observable(observer => {
        observer.next(this.platformMenuCache()!);
        observer.complete();
      });
    }

    // Fetch from API
    return this.http.get<NavSection[]>(`${this.apiUrl}/static/platform`).pipe(
      tap(menu => {
        this.platformMenuCache.set(menu);
        this.platformMenuSubject.next(menu);
      })
    );
  }

  /**
   * Get tenant menu (legacy static endpoint)
   */
  getTenantMenu(roleScope: 'tenant' = 'tenant'): Observable<NavSection[]> {
    // Return cached if available
    if (this.tenantMenuCache()) {
      return new Observable(observer => {
        observer.next(this.tenantMenuCache()!);
        observer.complete();
      });
    }

    // Fetch from API
    return this.http.get<NavSection[]>(`${this.apiUrl}/static/tenant`, {
      params: { scope: roleScope }
    }).pipe(
      tap(menu => {
        this.tenantMenuCache.set(menu);
        this.tenantMenuSubject.next(menu);
      })
    );
  }

  /**
   * Get menu for a specific role (legacy)
   */
  getMenuForRole(role: string, scope: 'platform' | 'tenant' = 'platform'): Observable<NavSection[]> {
    return this.http.get<NavSection[]>(`${this.apiUrl}/role/${role}`, {
      params: { scope }
    }).pipe(
      tap(menu => {
        if (scope === 'platform') {
          this.platformMenuCache.set(menu);
          this.platformMenuSubject.next(menu);
        } else {
          this.tenantMenuCache.set(menu);
          this.tenantMenuSubject.next(menu);
        }
      })
    );
  }

  /**
   * Get all available menus (admin only)
   */
  getAllMenus(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  /**
   * Invalidate cache to force refresh
   */
  invalidateCache(): void {
    this.platformMenuCache.set(null);
    this.tenantMenuCache.set(null);
  }

  /**
   * Filter menu items by permission
   */
  filterMenuByPermissions(menu: NavSection[], userPermissions: string[]): NavSection[] {
    return menu.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // If no permission required, show it
        if (!item.permission) return true;
        // If permission is required, check if user has it
        return userPermissions.includes(item.permission);
      }).map(item => ({
        ...item,
        children: item.children?.filter(child => {
          if (!child.permission) return true;
          return userPermissions.includes(child.permission);
        })
      }))
    })).filter(section => section.items.length > 0);
  }

  /**
   * Get available icons for menu selection
   */
  getAvailableIcons(): string[] {
    return [
      '🏠', '👥', '⚙️', '📝', '📊', '💰', '🏢', '👑', '🔐',
      '📋', '✅', '⏳', '❌', '💳', '✔️', '🆔', '🎯', '📈',
      '📉', '💡', '🔔', '📧', '📱', '🌐', '⭐', '🎁', '🎉',
      '🔑', '🚀', '💼', '📞', '🗂️', '🔍', '📌', '📍', '🗺️',
      '⬅️', '➡️', '⬆️', '⬇️', '➕', '➖', '✕', '↩️', '↪️'
    ];
  }

  /**
   * Convert dynamic menu tree to legacy NavSection format for sidebar
   * The backend now returns a TREE structure with children already nested
   */
  convertMenuTreeToNavSections(menus: Menu[]): NavSection[] {
    console.log('[MENU_SERVICE] 🔄 Converting menu tree to NavSections:', menus);
    
    const sections: NavSection[] = [];
    
    // Helper function to recursively convert a menu and its children to NavItem
    const convertToNavItem = (menu: Menu): NavItem => {
      const item: NavItem = {
        id: menu.id || menu.slug,
        label: menu.name,
        icon: menu.icon || '📋',
        route: menu.route,
        description: menu.route,
        permission: undefined,
        visible: menu.isActive
      };
      
      // Recursively convert children if they exist
      if (menu.children && menu.children.length > 0) {
        item.children = menu.children.map(child => convertToNavItem(child));
      }
      
      return item;
    };
    
    // Each root menu becomes a section
    menus.forEach(menu => {
      const section: NavSection = {
        id: menu.slug,
        title: menu.name,
        description: menu.route || '',
        order: menu.orderIndex || 0,
        items: [convertToNavItem(menu)]
      };
      
      sections.push(section);
    });

    // Sort by order
    sections.sort((a, b) => a.order - b.order);
    
    console.log('[MENU_SERVICE] ✅ Converted to NavSections:', {
      sections: sections.length,
      totalItems: sections.reduce((sum, s) => sum + s.items.length, 0)
    });
    
    return sections;
  }

  /**
   * Get dynamic platform menu from database
   */
  getDynamicPlatformMenu(): Observable<NavSection[]> {
    console.log('[MENU_SERVICE] 📋 Loading dynamic platform menus from database...');
    
    return this.getMenuTree('platform').pipe(
      map(menus => {
        console.log('[MENU_SERVICE] 📊 Converting menu tree to nav sections:', menus);
        const sections = this.convertMenuTreeToNavSections(menus);
        console.log('[MENU_SERVICE] ✅ Converted sections:', sections);
        
        // Cache the result
        this.platformMenuCache.set(sections);
        this.platformMenuSubject.next(sections);
        
        return sections;
      }),
      catchError(error => {
        console.error('[MENU_SERVICE] ❌ Failed to load dynamic menus:', error);
        // Fallback to static menu
        console.log('[MENU_SERVICE] 📦 Using fallback menu');
        const fallback = this.getFallbackPlatformMenu();
        this.platformMenuCache.set(fallback);
        this.platformMenuSubject.next(fallback);
        return of(fallback);
      })
    );
  }

  /**
   * Get dynamic tenant menu from database
   */
  getDynamicTenantMenu(): Observable<NavSection[]> {
    console.log('[MENU_SERVICE] 📋 Loading dynamic tenant menus from database...');
    
    return this.getMenuTree('tenant').pipe(
      map(menus => {
        console.log('[MENU_SERVICE] 📊 Converting menu tree to nav sections:', menus);
        const sections = this.convertMenuTreeToNavSections(menus);
        console.log('[MENU_SERVICE] ✅ Converted sections:', sections);
        
        // Cache the result
        this.tenantMenuCache.set(sections);
        this.tenantMenuSubject.next(sections);
        
        return sections;
      }),
      catchError(error => {
        console.error('[MENU_SERVICE] ❌ Failed to load dynamic menus:', error);
        // Fallback to static menu
        console.log('[MENU_SERVICE] 📦 Using fallback menu');
        const fallback = this.getFallbackTenantMenu();
        this.tenantMenuCache.set(fallback);
        this.tenantMenuSubject.next(fallback);
        return of(fallback);
      })
    );
  }

  /**
   * Get fallback menu (hardcoded as fallback)
   */
  getFallbackPlatformMenu(): NavSection[] {
    return [
      {
        id: 'overview',
        title: 'Overview',
        description: 'System Dashboard & Quick Stats',
        order: 1,
        items: [
          { 
            label: 'Dashboard', 
            icon: '🏠', 
            route: '/super-admin/dashboard',
            description: 'Quick stats: tenants, users, loans, system health'
          },
          { 
            label: 'Audit Logs', 
            icon: '📝', 
            route: '/super-admin/audit-logs',
            description: 'System-wide activity log'
          }
        ]
      },
      {
        id: 'settings',
        title: 'System Settings',
        description: 'Configuration and administration',
        order: 2,
        items: [
          { 
            label: 'System Roles', 
            icon: '👑', 
            route: '/super-admin/settings/system-roles',
            description: 'Create & manage platform roles and permissions'
          },
          { 
            label: 'Menu Management', 
            icon: '🎨', 
            route: '/super-admin/settings/menus',
            description: 'Configure and organize application menus'
          },
          { 
            label: 'Users', 
            icon: '👥', 
            route: '/super-admin/users',
            description: 'Manage system users'
          }
        ]
      }
    ];
  }

  /**
   * Get fallback menu for tenant
   */
  getFallbackTenantMenu(): NavSection[] {
    return [
      {
        id: 'overview',
        title: 'Dashboard & Overview',
        description: 'Quick snapshot of daily activity',
        order: 1,
        items: [
          { 
            label: 'Dashboard', 
            icon: '🏠', 
            route: '/tenant/dashboard',
            description: 'Daily activity overview'
          }
        ]
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Tenant configuration',
        order: 2,
        items: [
          { 
            label: 'Tenant Roles', 
            icon: '👥', 
            route: '/tenant/settings/roles',
            description: 'Manage tenant roles'
          },
          { 
            label: 'Users', 
            icon: '👤', 
            route: '/tenant/users',
            description: 'Manage tenant users'
          }
        ]
      }
    ];
  }
}
