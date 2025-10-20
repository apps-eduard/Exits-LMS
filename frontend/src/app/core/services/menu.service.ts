import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
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
  
  // Cached menu configurations
  private platformMenuCache = signal<NavSection[] | null>(null);
  private tenantMenuCache = signal<NavSection[] | null>(null);
  
  // For real-time updates
  private platformMenuSubject = new BehaviorSubject<NavSection[]>([]);
  private tenantMenuSubject = new BehaviorSubject<NavSection[]>([]);
  
  public platformMenu$ = this.platformMenuSubject.asObservable();
  public tenantMenu$ = this.tenantMenuSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get platform/super-admin menu
   */
  getPlatformMenu(): Observable<NavSection[]> {
    console.log('[MENU_SERVICE] 🔍 getPlatformMenu called, cache status:', {
      isCached: !!this.platformMenuCache()
    });
    
    // Return cached if available
    if (this.platformMenuCache()) {
      console.log('[MENU_SERVICE] ✅ Returning cached platform menu');
      return new Observable(observer => {
        observer.next(this.platformMenuCache()!);
        observer.complete();
      });
    }

    // Fetch from API
    console.log('[MENU_SERVICE] 🌐 Fetching platform menu from API:', `${this.apiUrl}/platform`);
    return this.http.get<NavSection[]>(`${this.apiUrl}/platform`).pipe(
      tap(menu => {
        console.log('[MENU_SERVICE] 📥 API Response received:', {
          sections: menu.length,
          items: menu.reduce((sum, s) => sum + s.items.length, 0)
        });
        this.platformMenuCache.set(menu);
        this.platformMenuSubject.next(menu);
      })
    );
  }

  /**
   * Get tenant menu with role-based filtering
   */
  getTenantMenu(roleScope: 'tenant' = 'tenant'): Observable<NavSection[]> {
    // Return cached if available
    if (this.tenantMenuCache()) {
      return new Observable(observer => {
        observer.next(this.tenantMenuCache()!);
        observer.complete();
      });
    }

    // Fetch from API with role scope
    return this.http.get<NavSection[]>(`${this.apiUrl}/tenant`, {
      params: { scope: roleScope }
    }).pipe(
      tap(menu => {
        this.tenantMenuCache.set(menu);
        this.tenantMenuSubject.next(menu);
      })
    );
  }

  /**
   * Get menu for a specific role
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
   * Create new menu
   */
  createMenu(menu: NavSection): Observable<NavSection> {
    return this.http.post<NavSection>(this.apiUrl, menu).pipe(
      tap(() => {
        this.invalidateCache();
      })
    );
  }

  /**
   * Update menu
   */
  updateMenu(menuId: string, menu: Partial<NavSection>): Observable<NavSection> {
    return this.http.put<NavSection>(`${this.apiUrl}/${menuId}`, menu).pipe(
      tap(() => {
        this.invalidateCache();
      })
    );
  }

  /**
   * Delete menu
   */
  deleteMenu(menuId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${menuId}`).pipe(
      tap(() => {
        this.invalidateCache();
      })
    );
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
