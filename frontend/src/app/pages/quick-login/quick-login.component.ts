import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { ThemeService } from '../../core/services/theme.service';

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  emoji: string;
  cssClass: string;
}

@Component({
  selector: 'app-quick-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  // @ts-ignore - Angular warns about @ in template strings but it's safe here
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">⚡ Quick Login</h1>
          <p class="text-gray-400">Demo accounts for testing</p>
        </div>

        <div class="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl">
          
          <!-- Messages -->
          <div *ngIf="error" class="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            ❌ {{ error }}
          </div>

          <div *ngIf="successMessage" class="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
            {{ successMessage }}
          </div>

          <!-- Demo Accounts -->
          <div class="space-y-3 mb-6">
            <ng-container *ngFor="let account of demoAccounts">
              <button 
                type="button"
                (click)="quickLogin(account.email, account.password)"
                [disabled]="loggingIn"
                [class]="'w-full p-4 rounded-lg text-left transition-all ' + account.cssClass">
                <div class="flex items-center gap-3">
                  <div class="text-3xl">{{ account.emoji }}</div>
                  <div>
                    <p class="font-bold text-white">{{ account.label }}</p>
                    <p class="text-xs text-gray-400">{{ account.email }}</p>
                  </div>
                </div>
              </button>
            </ng-container>
          </div>

          <!-- Divider -->
          <div class="my-6 flex items-center gap-2 text-gray-500 text-xs">
            <div class="flex-1 h-px bg-gray-600"></div>
            <span>OR</span>
            <div class="flex-1 h-px bg-gray-600"></div>
          </div>

          <!-- Regular Login Link -->
          <a routerLink="/login" class="w-full block text-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
            📝 Regular Login
          </a>

          <!-- Helper -->
          <p class="mt-4 text-xs text-center text-gray-400">
            ℹ️ Click any account above to instantly login
          </p>
        </div>

        <!-- Theme Toggle -->
        <button 
          type="button"
          (click)="themeService.toggleDarkMode()" 
          class="mt-6 mx-auto block p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
          <svg *ngIf="!(themeService.darkMode$ | async)" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0112 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <svg *ngIf="(themeService.darkMode$ | async)" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class QuickLoginComponent implements OnInit {
  loggingIn = false;
  error = '';
  successMessage = '';

  demoAccounts: DemoAccount[] = [
    {
      label: 'Super Admin',
      email: 'admin@exits-lms.com',
      password: 'admin123',
      emoji: '👑',
      cssClass: 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-600/50 hover:border-purple-500 disabled:opacity-50'
    },
    {
      label: 'Tenant Admin',
      email: 'admin@demo-corp.com',
      password: 'tenant123',
      emoji: '🏢',
      cssClass: 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 border border-blue-600/50 hover:border-blue-500 disabled:opacity-50'
    }
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  quickLogin(email: string, password: string): void {
    this.loggingIn = true;
    this.error = '';
    this.successMessage = '';

    console.log('🚀 [QUICK_LOGIN] Logging in:', email);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ [QUICK_LOGIN] Success');
        this.successMessage = `✅ Logged in! Redirecting...`;
        
        setTimeout(() => {
          if (response.user.roleScope === 'platform') {
            this.router.navigate(['/super-admin']);
          } else {
            this.router.navigate(['/tenant']);
          }
        }, 500);
      },
      error: (err) => {
        console.error('❌ [QUICK_LOGIN] Error:', err);
        this.error = err.error?.error || 'Login failed. Please try again.';
        this.loggingIn = false;
      }
    });
  }
}

