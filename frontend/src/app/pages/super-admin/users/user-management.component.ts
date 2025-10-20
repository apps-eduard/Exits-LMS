import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../core/services/user.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  readonly users = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);
  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly toggling: { [key: string]: boolean } = {};

  searchTerm = signal('');
  roleFilter = signal('all');
  statusFilter = signal('all');

  private filterSubject = new Subject<void>();

  readonly roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Support Staff', label: 'Support Staff' },
    { value: 'Developer', label: 'Developer' }
  ];

  readonly statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  constructor(private userService: UserService) {
    // Debounce filter changes to prevent excessive API calls
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.users || []);
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(event?: Event): void {
    if (event) {
      const input = event.target as HTMLInputElement;
      this.searchTerm.set(input.value);
    }
    this.filterSubject.next();
  }

  onRoleFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.roleFilter.set(select.value);
    this.filterSubject.next();
  }

  onStatusFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter.set(select.value);
    this.filterSubject.next();
  }

  applyFilters(): void {
    let filtered = this.users();

    // Search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(u => {
        const firstName = u.first_name?.toLowerCase() || '';
        const lastName = u.last_name?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        return u.email.toLowerCase().includes(term) || fullName.includes(term);
      });
    }

    // Role filter
    if (this.roleFilter() !== 'all') {
      filtered = filtered.filter(u => u.role_name === this.roleFilter());
    }

    // Status filter
    if (this.statusFilter() !== 'all') {
      const isActive = this.statusFilter() === 'active';
      filtered = filtered.filter(u => u.is_active === isActive);
    }

    this.filteredUsers.set(filtered);
  }

  toggleUserStatus(user: User): void {
    this.toggling[user.id] = true;
    this.userService.toggleUserStatus(user.id, !user.is_active).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local state
          const updatedUsers = this.users().map(u =>
            u.id === user.id ? { ...u, is_active: !u.is_active } : u
          );
          this.users.set(updatedUsers);
          this.applyFilters();
        }
        this.toggling[user.id] = false;
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.toggling[user.id] = false;
      }
    });
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'Super Admin': 'bg-red-900/30 text-red-300',
      'Support Staff': 'bg-blue-900/30 text-blue-300',
      'Developer': 'bg-purple-900/30 text-purple-300'
    };
    return colors[role] || 'bg-gray-700/30 text-gray-300';
  }

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      'Super Admin': '👑',
      'Support Staff': '�',
      'Developer': '👨‍�'
    };
    return icons[role] || '👤';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getFullName(user: User): string {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getActiveCount(): number {
    return this.filteredUsers().filter(u => u.is_active).length;
  }
}