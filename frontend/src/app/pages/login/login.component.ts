import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface DemoAccount {
  email: string;
  password: string;
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  demoAccounts: DemoAccount[] = [
    {
      email: 'admin@exits-lms.com',
      password: 'admin123',
      label: '👑 Super Admin',
      icon: '👑',
      colorClass: 'blue'
    },
    {
      email: 'admin@demo.com',
      password: 'demo123',
      label: '🏢 Tenant Admin',
      icon: '🏢',
      colorClass: 'green'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  fillDemoAccount(account: DemoAccount): void {
    this.email = account.email;
    this.password = account.password;
    this.error = '';
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.user.roleScope === 'platform') {
          this.router.navigate(['/super-admin']);
        } else {
          this.router.navigate(['/tenant']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
