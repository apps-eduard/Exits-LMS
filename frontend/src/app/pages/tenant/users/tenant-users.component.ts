import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-tenant-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-users.component.html',
  styleUrls: ['./tenant-users.component.scss']
})
export class TenantUsersComponent implements OnInit {
  readonly users = signal<any[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly filterRole = signal('');
  readonly filterStatus = signal('');

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getTenantUsers(
      this.searchQuery(),
      this.filterRole(),
      this.filterStatus()
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.users);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  createUser(): void {
    this.router.navigate(['/tenant/users/create']);
  }

  editUser(user: any): void {
    this.router.navigate([`/tenant/users/${user.id}/edit`]);
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.is_active;
    this.userService.toggleTenantUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          user.is_active = newStatus;
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
      }
    });
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.userService.deleteTenantUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }
}
