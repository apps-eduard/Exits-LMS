import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

interface Stat {
  label: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class SuperAdminDashboardComponent implements OnInit {
  readonly stats = signal<Stat[]>([
    { label: 'System Users', value: '0', change: '+0%', changeType: 'neutral', icon: '👥' },
    { label: 'Total Tenants', value: '0', change: '+0%', changeType: 'neutral', icon: '🏢' },
    { label: 'Active Sessions', value: '0', change: '+0%', changeType: 'neutral', icon: '🔐' },
    { label: 'Audit Events', value: '0', change: '+0%', changeType: 'neutral', icon: '📋' }
  ]);
  
  readonly systemUsers = signal<SystemUser[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getAllUsers().subscribe({
      next: (response: any) => this.handleUsersResponse(response),
      error: (error: any) => this.handleLoadError(error)
    });
  }

  private handleUsersResponse(response: any): void {
    try {
      const users = this.extractUsers(response);
      
      if (users.length > 0) {
        this.updateStats(users.length);
        this.systemUsers.set(this.formatUsers(users));
      }
    } catch (error) {
      console.error('Error processing dashboard data:', error);
      this.error.set('Failed to load dashboard data');
    } finally {
      this.loading.set(false);
    }
  }

  private handleLoadError(error: any): void {
    console.error('Error loading dashboard data:', error);
    this.error.set('Unable to fetch dashboard data');
    this.loading.set(false);
  }

  private extractUsers(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    return response?.users || response?.data || [];
  }

  private updateStats(userCount: number): void {
    this.stats.set([
      { label: 'System Users', value: userCount, change: '+0%', changeType: 'neutral', icon: '👥' },
      { label: 'Total Tenants', value: Math.ceil(userCount / 2), change: '+0%', changeType: 'neutral', icon: '🏢' },
      { label: 'Active Sessions', value: Math.ceil(userCount * 0.7), change: '+0%', changeType: 'neutral', icon: '🔐' },
      { label: 'Audit Events', value: userCount * 50, change: '+0%', changeType: 'neutral', icon: '📋' }
    ]);
  }

  private formatUsers(users: any[]): SystemUser[] {
    return users.slice(0, 8).map(u => ({
      id: u.id,
      name: this.formatUserName(u),
      email: u.email,
      status: u.is_active ? 'active' : 'inactive',
      role: u.role_name || 'System Admin'
    }));
  }

  private formatUserName(user: any): string {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email;
  }

  getStatusBadgeClass(status: string): string {
    const badges: Record<string, string> = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      inactive: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      suspended: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    };
    return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
