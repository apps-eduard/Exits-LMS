import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permission {
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  description: string;
}

export interface Role {
  id: string;
  name: string;
  scope: 'platform' | 'tenant';
  description: string;
  permissions: Permission[];
}

export interface RolePermissionMatrix {
  [roleName: string]: {
    [resource: string]: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }
  }
}

// Standard permissions that map to backend
export const STANDARD_PERMISSIONS = {
  // Tenant Management
  MANAGE_TENANTS: 'manage_tenants',
  VIEW_TENANTS: 'view_tenants',
  
  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Audit & Logs
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  
  // Platform Settings
  MANAGE_PLATFORM_SETTINGS: 'manage_platform_settings',
  
  // Customers
  MANAGE_CUSTOMERS: 'manage_customers',
  VIEW_CUSTOMERS: 'view_customers',
  
  // Loans
  MANAGE_LOANS: 'manage_loans',
  APPROVE_LOANS: 'approve_loans',
  VIEW_LOANS: 'view_loans',
  
  // Payments
  PROCESS_PAYMENTS: 'process_payments',
  VIEW_PAYMENTS: 'view_payments',
  
  // Loan Products
  MANAGE_LOAN_PRODUCTS: 'manage_loan_products',
  
  // BNPL
  MANAGE_BNPL_MERCHANTS: 'manage_bnpl_merchants',
  MANAGE_BNPL_ORDERS: 'manage_bnpl_orders',
  VIEW_BNPL_ORDERS: 'view_bnpl_orders',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
};

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private apiUrl = '/api';
  roles = signal<Role[]>([]);
  permissions = signal<Permission[]>([]);

  constructor(private http: HttpClient) {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.http.get<{ success: boolean; roles: Role[] }>(`${this.apiUrl}/roles`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.roles.set(response.roles);
          }
        },
        error: (err) => console.error('Failed to load roles:', err)
      });
  }

  loadPermissions(): void {
    this.http.get<{ success: boolean; permissions: Permission[] }>(`${this.apiUrl}/permissions`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.permissions.set(response.permissions);
          }
        },
        error: (err) => console.error('Failed to load permissions:', err)
      });
  }

  /**
   * Get all roles
   */
  getAllRoles(): Observable<{ success: boolean; roles: Role[] }> {
    return this.http.get<{ success: boolean; roles: Role[] }>(`${this.apiUrl}/roles`);
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): Observable<{ success: boolean; permissions: Permission[] }> {
    return this.http.get<{ success: boolean; permissions: Permission[] }>(`${this.apiUrl}/permissions`);
  }

  /**
   * Get permissions by scope (platform or tenant)
   */
  getPermissionsByScope(scope: 'platform' | 'tenant'): Observable<{ success: boolean; permissions: Permission[] }> {
    return this.http.get<{ success: boolean; permissions: Permission[] }>(`${this.apiUrl}/permissions?scope=${scope}`);
  }

  /**
   * Get role by ID with permissions
   */
  getRoleById(roleId: string): Observable<{ success: boolean; role: Role }> {
    return this.http.get<{ success: boolean; role: Role }>(`${this.apiUrl}/roles/${roleId}`);
  }

  /**
   * Get permission matrix showing which roles have which permissions
   */
  getPermissionMatrix(): Observable<{ success: boolean; matrix: RolePermissionMatrix }> {
    return this.http.get<{ success: boolean; matrix: RolePermissionMatrix }>(`${this.apiUrl}/rbac/matrix`);
  }

  /**
   * Assign permissions to a role
   */
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles/${roleId}/permissions`, { permissionIds });
  }

  /**
   * Remove permissions from a role
   */
  removePermissionsFromRole(roleId: string, permissionIds: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${roleId}/permissions`, { 
      body: { permissionIds }
    });
  }

  /**
   * Create a new role
   */
  createRole(roleName: string, scope: 'platform' | 'tenant', description: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, { 
      name: roleName, 
      scope, 
      description 
    });
  }

  /**
   * Update role
   */
  updateRole(roleId: string, updates: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${roleId}`, updates);
  }

  /**
   * Delete role
   */
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${roleId}`);
  }

  /**
   * Get all permissions grouped by resource
   */
  getPermissionsByResource(): Observable<{ success: boolean; byResource: any }> {
    return this.http.get<{ success: boolean; byResource: any }>(`${this.apiUrl}/rbac/permissions-by-resource`);
  }

  /**
   * Check if user has specific permission (for UI conditionals)
   */
  hasPermission(permission: string, userPermissions: Permission[]): boolean {
    return userPermissions.some(p => p.name === permission);
  }

  /**
   * Check if user has any of the required permissions
   */
  hasAnyPermission(permissions: string[], userPermissions: Permission[]): boolean {
    return permissions.some(p => userPermissions.some(up => up.name === p));
  }

  /**
   * Check if user has all required permissions
   */
  hasAllPermissions(permissions: string[], userPermissions: Permission[]): boolean {
    return permissions.every(p => userPermissions.some(up => up.name === p));
  }
}
