import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  subscription_plan?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
  modules?: { module: string; enabled: boolean }[];
  address_id?: string;
  street_address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

export interface CreateTenantRequest {
  name: string;
  subdomain?: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail?: string;
  contactPhone?: string;
  subscriptionPlan?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminFirstName?: string;
  adminLastName?: string;
  street_address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getAllTenants(search?: string, status?: string): Observable<any> {
    let params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getTenantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTenant(tenant: CreateTenantRequest): Observable<any> {
    console.log('🌐 [TENANT_SERVICE] Making POST request to:', this.apiUrl);
    console.log('📦 [REQUEST_PAYLOAD]', tenant);
    
    return this.http.post<any>(this.apiUrl, tenant);
  }

  updateTenant(id: string, tenant: Partial<Tenant>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, tenant);
  }

  toggleModule(tenantId: string, moduleName: string, isEnabled: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${tenantId}/modules`, {
      moduleName,
      isEnabled
    });
  }

  getTenantUsers(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tenantId}/users`);
  }
}
