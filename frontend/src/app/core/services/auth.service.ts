import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleScope: string;
  tenantId?: string;
  enabledModules?: string[];
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('currentUser');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasScope(scope: string): boolean {
    const user = this.getCurrentUser();
    return user?.roleScope === scope;
  }

  hasModule(moduleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.enabledModules?.includes(moduleName) || false;
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response: any) => {
          if (response.success) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/profile`);
  }

  updateProfile(profileData: { firstName: string; lastName: string; phone?: string; email?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/profile`, profileData)
      .pipe(
        tap((response: any) => {
          if (response.success && response.user) {
            // Update current user in localStorage and subject
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
              };
              if (response.user.email) {
                updatedUser.email = response.user.email;
              }
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              this.currentUserSubject.next(updatedUser);
            }
          }
        })
      );
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/change-password`, passwordData);
  }
}
