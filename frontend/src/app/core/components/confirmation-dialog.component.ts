import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ConfirmationDialogService, ConfirmationConfig } from '../services/confirmation-dialog.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen$ | async as _" 
         [@fadeInOut]
         class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" (click)="onCancel()"></div>

      <!-- Dialog Container -->
      <div [@scaleInOut] [ngClass]="getDialogClasses()" class="relative rounded-lg shadow-2xl max-w-md w-full mx-4 border">
        <!-- Header -->
        <div class="px-6 pt-6 pb-3">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div [ngClass]="getIconClasses()">
              <svg *ngIf="config?.icon === 'warning'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <svg *ngIf="config?.icon === 'question'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <svg *ngIf="config?.icon === 'success'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg *ngIf="config?.icon === 'error'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <svg *ngIf="config?.icon === 'info'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Title -->
            <div class="flex-1">
              <h3 [ngClass]="getTitleClasses()">{{ config?.title }}</h3>
            </div>
          </div>
        </div>

        <!-- Message -->
        <div class="px-6 pb-4">
          <p [ngClass]="getMessageClasses()">{{ config?.message }}</p>
        </div>

        <!-- Actions -->
        <div [ngClass]="getActionsClasses()" class="px-6 py-4 border-t rounded-b-lg flex gap-3 justify-end">
          <button 
            (click)="onCancel()"
            [ngClass]="getCancelButtonClasses()">
            {{ config?.cancelText || 'Cancel' }}
          </button>
          <button 
            (click)="onConfirm()"
            [ngClass]="getConfirmButtonClasses()">
            {{ config?.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleInOut', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ])
  ],
  styles: []
})
export class ConfirmationDialogComponent implements OnInit {
  isOpen$;
  config: ConfirmationConfig | null = null;
  isDarkMode$ = this.themeService.darkMode$;

  constructor(
    private confirmationService: ConfirmationDialogService,
    private themeService: ThemeService
  ) {
    this.isOpen$ = this.confirmationService.isOpen$;
  }

  ngOnInit(): void {
    this.confirmationService.config$.subscribe((config) => {
      this.config = config;
    });
  }

  onConfirm(): void {
    this.confirmationService.resolve(true);
  }

  onCancel(): void {
    this.confirmationService.resolve(false);
  }

  getDialogClasses(): string {
    if (this.isDarkMode) {
      return 'bg-gray-800 border-gray-700';
    }
    return 'bg-white border-gray-200';
  }

  getTitleClasses(): string {
    const baseClasses = 'text-lg font-semibold';
    if (this.isDarkMode) {
      return `${baseClasses} text-white`;
    }
    return `${baseClasses} text-gray-900`;
  }

  getMessageClasses(): string {
    const baseClasses = 'text-sm leading-relaxed';
    if (this.isDarkMode) {
      return `${baseClasses} text-gray-300`;
    }
    return `${baseClasses} text-gray-700`;
  }

  getActionsClasses(): string {
    if (this.isDarkMode) {
      return 'bg-gray-900/50 border-gray-700';
    }
    return 'bg-gray-50 border-gray-200';
  }

  getCancelButtonClasses(): string {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors';
    if (this.isDarkMode) {
      return `${baseClasses} text-gray-300 bg-gray-700 hover:bg-gray-600`;
    }
    return `${baseClasses} text-gray-700 bg-gray-200 hover:bg-gray-300`;
  }

  getIconClasses(): string {
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0';
    
    switch (this.config?.icon) {
      case 'warning':
        return `${baseClasses} bg-yellow-500/20 text-yellow-400`;
      case 'error':
        return `${baseClasses} bg-red-500/20 text-red-400`;
      case 'success':
        return `${baseClasses} bg-green-500/20 text-green-400`;
      case 'info':
        return `${baseClasses} bg-blue-500/20 text-blue-400`;
      default:
        return `${baseClasses} bg-purple-500/20 text-purple-400`;
    }
  }

  getConfirmButtonClasses(): string {
    const baseClasses = 'text-white px-4 py-2 text-sm font-medium rounded-md transition-colors';
    
    switch (this.config?.confirmClass) {
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700`;
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700`;
      case 'info':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700`;
      default:
        return `${baseClasses} bg-purple-600 hover:bg-purple-700`;
    }
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
