import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string; // 'danger' | 'warning' | 'success' | 'info'
  icon?: string; // 'warning' | 'question' | 'info' | 'success' | 'error'
}

export interface ConfirmationResult {
  confirmed: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<ConfirmationConfig | null>(null);
  private resultSubject = new BehaviorSubject<ConfirmationResult | null>(null);

  isOpen$ = this.isOpenSubject.asObservable();
  config$ = this.configSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  confirm(config: ConfirmationConfig): Promise<ConfirmationResult> {
    return new Promise((resolve) => {
      // Set default values
      const fullConfig: ConfirmationConfig = {
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        confirmClass: 'danger',
        icon: 'question',
        ...config
      };

      this.configSubject.next(fullConfig);
      this.isOpenSubject.next(true);

      // Subscribe to next result
      const subscription = this.result$.subscribe((result) => {
        if (result !== null) {
          this.isOpenSubject.next(false);
          this.configSubject.next(null);
          subscription.unsubscribe();
          resolve(result);
        }
      });
    });
  }

  resolve(confirmed: boolean, data?: any): void {
    this.resultSubject.next({ confirmed, data });
    this.resultSubject.next(null); // Reset for next use
  }

  close(): void {
    this.isOpenSubject.next(false);
    this.configSubject.next(null);
    this.resultSubject.next(null);
  }
}
