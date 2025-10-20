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
    const convertToNavItem = (menu: Menu, includeChildren: boolean = true): NavItem => {
      // Parse route and query parameters
      let route = menu.route;
      let queryParams: Record<string, string> = {};
      
      if (route && route.includes('?')) {
        const [path, queryString] = route.split('?');
        route = path;
        
        // Parse query string to object
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          queryParams[key] = value;
        });
      }
      
      const item: NavItem = {
        id: menu.id || menu.slug,
        label: menu.name,
        icon: menu.icon || '📋',
        route: route,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        description: menu.route,
        permission: undefined,
        visible: menu.isActive
      };
      
      // Recursively convert children if they exist and includeChildren is true
      if (includeChildren && menu.children && menu.children.length > 0) {
        item.children = menu.children.map(child => convertToNavItem(child, true));
      }
      
      return item;
    };
    
    // Each root menu becomes a section
    menus.forEach((menu, index) => {
      // If menu has children, create section with children as items (no nesting)
      if (menu.children && menu.children.length > 0) {
        const section: NavSection = {
          id: menu.slug,
          title: menu.name,
          description: menu.route || '',
          order: menu.orderIndex !== undefined && menu.orderIndex !== null ? menu.orderIndex : index,
          // Children become direct items (no nested parent, no recursive children)
          items: menu.children.map(child => convertToNavItem(child, false))
        };
        sections.push(section);
      } else {
        // If no children, create a section with the menu itself as the only item
        const section: NavSection = {
          id: menu.slug,
          title: menu.name,
          description: menu.route || '',
          order: menu.orderIndex !== undefined && menu.orderIndex !== null ? menu.orderIndex : index,
          items: [convertToNavItem(menu, false)]
        };
        sections.push(section);
      }
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
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Main dashboard overview',
        order: 1,
        items: [
          { 
            label: 'Dashboard', 
            icon: '🏠', 
            route: '/super-admin/dashboard',
            description: 'Quick stats: tenants, users, loans, system health'
          }
        ]
      },
      {
        id: 'audit-logs',
        title: 'Audit Logs',
        description: 'System activity tracking',
        order: 2,
        items: [
          { 
            label: 'Audit Logs', 
            icon: '📝', 
            route: '/super-admin/audit-logs',
            description: 'System-wide activity log'
          }
        ]
      },
      {
        id: 'tenants',
        title: 'All Tenants',
        description: 'Manage all tenant organizations',
        order: 3,
        items: [
          { 
            label: 'All Tenants', 
            icon: '🏢', 
            route: '/super-admin/tenants',
            description: 'View and manage all tenant organizations'
          },
          { 
            label: 'Tenant Requests', 
            icon: '📋', 
            route: '/super-admin/tenant-requests',
            description: 'Review new tenant applications'
          },
          { 
            label: 'Tenant Analytics', 
            icon: '📊', 
            route: '/super-admin/tenant-analytics',
            description: 'Tenant usage and performance metrics'
          }
        ]
      },
      {
        id: 'system-analytics',
        title: 'System Analytics',
        description: 'Platform-wide statistics',
        order: 4,
        items: [
          { 
            label: 'System Overview', 
            icon: '📈', 
            route: '/super-admin/analytics/overview',
            description: 'Overall system performance'
          },
          { 
            label: 'User Activity', 
            icon: '👤', 
            route: '/super-admin/analytics/users',
            description: 'User engagement statistics'
          },
          { 
            label: 'Revenue Reports', 
            icon: '💰', 
            route: '/super-admin/analytics/revenue',
            description: 'Financial analytics and reports'
          }
        ]
      },
      {
        id: 'subscriptions',
        title: 'All Subscriptions',
        description: 'Manage subscription plans',
        order: 5,
        items: [
          { 
            label: 'Active Subscriptions', 
            icon: '✅', 
            route: '/super-admin/subscriptions/active',
            description: 'View active subscription plans'
          },
          { 
            label: 'Plan Management', 
            icon: '�', 
            route: '/super-admin/subscriptions/plans',
            description: 'Create and manage subscription tiers'
          },
          { 
            label: 'Billing History', 
            icon: '💳', 
            route: '/super-admin/subscriptions/billing',
            description: 'Transaction and payment records'
          }
        ]
      },
      {
        id: 'notifications',
        title: 'System Notifications',
        description: 'Platform-wide alerts',
        order: 6,
        items: [
          { 
            label: 'Send Notification', 
            icon: '📢', 
            route: '/super-admin/notifications/send',
            description: 'Broadcast messages to users'
          },
          { 
            label: 'Notification History', 
            icon: '📬', 
            route: '/super-admin/notifications/history',
            description: 'Past notifications log'
          }
        ]
      },
      {
        id: 'health-check',
        title: 'Health Check',
        description: 'System diagnostics',
        order: 7,
        items: [
          { 
            label: 'System Status', 
            icon: '💚', 
            route: '/super-admin/health/status',
            description: 'Server and service health'
          },
          { 
            label: 'Database Monitor', 
            icon: '🗄️', 
            route: '/super-admin/health/database',
            description: 'Database performance metrics'
          },
          { 
            label: 'Error Logs', 
            icon: '🚨', 
            route: '/super-admin/health/errors',
            description: 'System error tracking'
          }
        ]
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Configuration and administration',
        order: 8,
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
          },
          { 
            label: 'Email Templates', 
            icon: '✉️', 
            route: '/super-admin/settings/email-templates',
            description: 'Customize system email templates'
          },
          { 
            label: 'System Settings', 
            icon: '⚙️', 
            route: '/super-admin/settings/general',
            description: 'General platform configuration'
          },
          { 
            label: 'API Settings', 
            icon: '🔌', 
            route: '/super-admin/settings/api',
            description: 'API keys and integrations'
          }
        ]
      },
      {
        id: 'system-users',
        title: 'System Users',
        description: 'Platform administrators',
        order: 9,
        items: [
          { 
            label: 'System Users', 
            icon: '👨‍💼', 
            route: '/super-admin/users',
            description: 'Manage platform admin users'
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
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Main dashboard overview',
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
        id: 'customers',
        title: 'Customers',
        description: 'Customer management',
        order: 2,
        items: [
          { 
            label: 'All Customers', 
            icon: '👥', 
            route: '/tenant/customers',
            description: 'View and manage all customers'
          },
          { 
            label: 'Add Customer', 
            icon: '➕', 
            route: '/tenant/customers/create',
            description: 'Register new customer'
          },
          { 
            label: 'Customer Groups', 
            icon: '👨‍👩‍👧‍👦', 
            route: '/tenant/customers/groups',
            description: 'Organize customers into groups'
          }
        ]
      },
      {
        id: 'loans',
        title: 'Loans',
        description: 'Loan management',
        order: 3,
        items: [
          { 
            label: 'All Loans', 
            icon: '💰', 
            route: '/tenant/loans',
            description: 'View and manage all loans'
          },
          { 
            label: 'New Loan', 
            icon: '📝', 
            route: '/tenant/loans/create',
            description: 'Create new loan application'
          },
          { 
            label: 'Loan Requests', 
            icon: '📋', 
            route: '/tenant/loans/requests',
            description: 'Pending loan applications'
          },
          { 
            label: 'Repayment Schedule', 
            icon: '📅', 
            route: '/tenant/loans/schedule',
            description: 'Track payment schedules'
          }
        ]
      },
      {
        id: 'payments',
        title: 'Payments',
        description: 'Payment processing',
        order: 4,
        items: [
          { 
            label: 'All Payments', 
            icon: '💳', 
            route: '/tenant/payments',
            description: 'View payment history'
          },
          { 
            label: 'Record Payment', 
            icon: '✅', 
            route: '/tenant/payments/record',
            description: 'Add new payment record'
          },
          { 
            label: 'Overdue Payments', 
            icon: '⚠️', 
            route: '/tenant/payments/overdue',
            description: 'Track late payments'
          }
        ]
      },
      {
        id: 'reports',
        title: 'Reports & Analytics',
        description: 'Business intelligence',
        order: 5,
        items: [
          { 
            label: 'Financial Reports', 
            icon: '📊', 
            route: '/tenant/reports/financial',
            description: 'Income and expense reports'
          },
          { 
            label: 'Loan Analytics', 
            icon: '📈', 
            route: '/tenant/reports/loans',
            description: 'Loan performance metrics'
          },
          { 
            label: 'Customer Analytics', 
            icon: '👤', 
            route: '/tenant/reports/customers',
            description: 'Customer behavior insights'
          },
          { 
            label: 'Export Data', 
            icon: '📥', 
            route: '/tenant/reports/export',
            description: 'Download reports and data'
          }
        ]
      },
      {
        id: 'collections',
        title: 'Collections',
        description: 'Debt collection management',
        order: 6,
        items: [
          { 
            label: 'Collection Queue', 
            icon: '📞', 
            route: '/tenant/collections/queue',
            description: 'Accounts requiring follow-up'
          },
          { 
            label: 'Collection History', 
            icon: '📜', 
            route: '/tenant/collections/history',
            description: 'Past collection activities'
          }
        ]
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Communication center',
        order: 7,
        items: [
          { 
            label: 'Send SMS', 
            icon: '💬', 
            route: '/tenant/notifications/sms',
            description: 'Send text messages to customers'
          },
          { 
            label: 'Send Email', 
            icon: '✉️', 
            route: '/tenant/notifications/email',
            description: 'Send email notifications'
          },
          { 
            label: 'Notification History', 
            icon: '📬', 
            route: '/tenant/notifications/history',
            description: 'View sent notifications'
          }
        ]
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Tenant configuration',
        order: 8,
        items: [
          { 
            label: 'Tenant Profile', 
            icon: '🏢', 
            route: '/tenant/settings/profile',
            description: 'Organization information'
          },
          { 
            label: 'Tenant Roles', 
            icon: '�', 
            route: '/tenant/settings/roles',
            description: 'Manage tenant roles'
          },
          { 
            label: 'Users', 
            icon: '👤', 
            route: '/tenant/users',
            description: 'Manage tenant users'
          },
          { 
            label: 'Loan Products', 
            icon: '💼', 
            route: '/tenant/settings/loan-products',
            description: 'Configure loan types and terms'
          },
          { 
            label: 'Interest Rates', 
            icon: '📊', 
            route: '/tenant/settings/interest-rates',
            description: 'Set interest rate policies'
          },
          { 
            label: 'Email Templates', 
            icon: '📧', 
            route: '/tenant/settings/email-templates',
            description: 'Customize notification templates'
          },
          { 
            label: 'Payment Methods', 
            icon: '💳', 
            route: '/tenant/settings/payment-methods',
            description: 'Configure accepted payment types'
          }
        ]
      },
      {
        id: 'staff',
        title: 'Staff',
        description: 'Staff management',
        order: 9,
        items: [
          { 
            label: 'Staff Members', 
            icon: '👨‍💼', 
            route: '/tenant/users',
            description: 'Manage staff accounts'
          }
        ]
      }
    ];
  }
}
