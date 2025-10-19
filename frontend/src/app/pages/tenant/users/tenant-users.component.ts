import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-tenant-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tenant-users.component.html',
  styleUrls: ['./tenant-users.component.scss']
})
export class TenantUsersComponent implements OnInit {
  readonly users = signal<any[]>([]);
  readonly loading = signal(false);
  readonly roles = signal<any[]>([]);
  readonly showModal = signal(false);
  readonly modalMode = signal<'create' | 'edit'>('create');
  readonly selectedUser = signal<any>(null);
  readonly searchQuery = signal('');
  readonly filterRole = signal('');
  readonly filterStatus = signal('');

  // Philippine Provinces
  readonly philippineProvinces = [
    'Abruzzo', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique',
    'Apayao', 'Aurora', 'Bataan', 'Batangas', 'Batanes', 'Benguet', 'Biliran', 'Bohol',
    'Bukidnon', 'Bulacan', 'Calabarzon', 'Camarines Norte', 'Camarines Sur', 'Camiguin',
    'Capiz', 'Catanduanes', 'Cavite', 'Cebu', 'Compostela Valley', 'Cotabato',
    'Davao City', 'Davao del Norte', 'Davao del Sur', 'Davao Oriental',
    'Eastern Visayas', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo',
    'Isabelal', 'Kalinga', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte',
    'La Union', 'Manila', 'Marinduque', 'Masbate', 'Mindanao', 'Misamis Oriental',
    'Misamis Occidental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental',
    'Northern Mindanao', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
    'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
    'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor', 'Soccsksargen', 'Southern Leyte',
    'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi',
    'Benguet', 'Quirino', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'
  ];

  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      status: ['active', Validators.required],
      // Philippine Address Fields
      streetAddress: [''],
      barangay: [''],
      city: [''],
      province: [''],
      region: [''],
      postalCode: [''],
      country: ['Philippines']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
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

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (response) => {
        if (response.success) {
          // Filter for tenant roles only
          const tenantRoles = response.roles.filter((r: any) => r.scope === 'tenant');
          this.roles.set(tenantRoles);
        }
      },
      error: (error) => console.error('Error loading roles:', error)
    });
  }

  onSearch(): void {
    this.loadUsers();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.userForm.reset();
    this.selectedUser.set(null);
    this.showModal.set(true);
  }

  openEditModal(user: any): void {
    this.modalMode.set('edit');
    this.selectedUser.set(user);
    this.userForm.patchValue({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      streetAddress: user.street_address || '',
      barangay: user.barangay || '',
      city: user.city || '',
      province: user.province || '',
      region: user.region || '',
      postalCode: user.postal_code || '',
      country: user.country || 'Philippines'
    });
    // Remove password requirement for edit
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.userForm.reset();
    this.selectedUser.set(null);
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      alert('Please fill in all required fields');
      return;
    }

    const formData = this.userForm.value;

    if (this.modalMode() === 'create') {
      this.createUser(formData);
    } else {
      this.updateUser(this.selectedUser().id, formData);
    }
  }

  createUser(data: any): void {
    this.loading.set(true);
    this.userService.createTenantUser(data).subscribe({
      next: (response) => {
        if (response.success) {
          alert('User created successfully');
          this.closeModal();
          this.loadUsers();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert(error.error?.error || 'Error creating user');
        this.loading.set(false);
      }
    });
  }

  updateUser(userId: string, data: any): void {
    this.loading.set(true);
    // Remove password if empty for update
    if (!data.password) {
      delete data.password;
    }
    this.userService.updateTenantUser(userId, data).subscribe({
      next: (response) => {
        if (response.success) {
          alert('User updated successfully');
          this.closeModal();
          this.loadUsers();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert(error.error?.error || 'Error updating user');
        this.loading.set(false);
      }
    });
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.is_active;
    this.userService.toggleTenantUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          user.is_active = newStatus;
          alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        alert(error.error?.error || 'Error toggling user status');
      }
    });
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.userService.deleteTenantUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('User deleted successfully');
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert(error.error?.error || 'Error deleting user');
        }
      });
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-secondary';
  }
}
