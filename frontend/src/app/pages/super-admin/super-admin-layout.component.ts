import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './super-admin-layout.component.html',
  styleUrl: './super-admin-layout.component.scss'
})
export class SuperAdminLayoutComponent implements OnInit {
  readonly sidebarOpen = signal(true);
  readonly showUserMenu = signal(false);
  user: any = null;

  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: '📊', route: '/super-admin/dashboard', badge: 0 },
    { label: 'Tenants', icon: '🏢', route: '/super-admin/tenants', badge: 12 },
    { label: 'Users', icon: '👥', route: '/super-admin/users', badge: 0 },
    { label: 'Audit Logs', icon: '📋', route: '/super-admin/audit-logs', badge: 5 },
    { label: 'Settings', icon: '⚙️', route: '/super-admin/settings', badge: 0 }
  ]);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(open => !open);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.user) return 'SA';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
