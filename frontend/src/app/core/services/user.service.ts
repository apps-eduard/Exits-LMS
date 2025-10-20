import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  address?: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  tenant_name?: string;
  address_id?: string;
  street_address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  roleName: string;
  tenantId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  roleName?: string;
  is_active?: boolean;
  street_address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all platform users (super admin only)
   */
  getAllUsers(search?: string, role?: string, status?: string): Observable<any> {
    let params: any = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (status) params.status = status;
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new user
   */
  createUser(user: CreateUserRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  /**
   * Update user
   */
  updateUser(id: string, user: UpdateUserRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Enable/Disable user
   */
  toggleUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Reset user password
   */
  resetPassword(id: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  /**
   * Get available roles
   */
  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/roles/list`);
  }

  // ============ TENANT USER MANAGEMENT ============

  /**
   * Get current user profile (tenant scope)
   */
  getCurrentProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenant/me`);
  }

  /**
   * Get all users in tenant
   */
  getTenantUsers(search?: string, role?: string, status?: string): Observable<any> {
    let params: any = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (status) params.status = status;
    
    return this.http.get<any>(`${this.apiUrl}/tenant/users`, { params });
  }

  /**
   * Get tenant user by ID
   */
  getTenantUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenant/users/${id}`);
  }

  /**
   * Create tenant user
   */
  createTenantUser(user: CreateUserRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tenant/users`, user);
  }

  /**
   * Update tenant user
   */
  updateTenantUser(id: string, user: UpdateUserRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenant/users/${id}`, user);
  }

  /**
   * Toggle tenant user status
   */
  toggleTenantUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tenant/users/${id}/status`, { isActive });
  }

  /**
   * Delete tenant user
   */
  deleteTenantUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tenant/users/${id}`);
  }
}
