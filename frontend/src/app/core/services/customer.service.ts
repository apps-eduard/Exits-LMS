import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  status: 'active' | 'inactive';
  loan_count?: number;
  total_outstanding?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  idNumber?: string;
}

export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  idNumber?: string;
  status?: string;
}

export interface CustomerSummary {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  total_loans: number;
  active_loans: number;
  total_outstanding: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  /**
   * Get all customers for the tenant
   */
  getAllCustomers(search?: string, status?: string): Observable<any> {
    let params: any = {};
    if (search) params.search = search;
    if (status) params.status = status;
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new customer
   */
  createCustomer(customer: CreateCustomerRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }

  /**
   * Update customer
   */
  updateCustomer(id: string, customer: UpdateCustomerRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, customer);
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get customer statistics
   */
  getCustomersSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/summary`);
  }
}
