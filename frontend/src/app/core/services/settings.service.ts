import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Setting {
  key: string;
  value: any;
  description?: string;
}

export interface SettingsResponse {
  success: boolean;
  settings?: Record<string, any>;
  setting?: Setting;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  /**
   * Get all settings
   */
  getSettings(): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(this.apiUrl);
  }

  /**
   * Get a single setting by key
   */
  getSetting(key: string): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(`${this.apiUrl}/${key}`);
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(settings: Record<string, any>): Observable<SettingsResponse> {
    return this.http.put<SettingsResponse>(this.apiUrl, { settings });
  }

  /**
   * Update a single setting
   */
  updateSetting(key: string, value: any): Observable<SettingsResponse> {
    return this.http.put<SettingsResponse>(`${this.apiUrl}/${key}`, { value });
  }

  /**
   * Test email configuration
   */
  testEmailConnection(config: {
    smtpHost: string;
    smtpPort: number;
    senderEmail: string;
  }): Observable<SettingsResponse> {
    return this.http.post<SettingsResponse>(`${this.apiUrl}/email/test`, config);
  }
}
