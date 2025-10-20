import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RbacService, Role } from '../../../core/services/rbac.service';

interface MenuItem {
  id: string;
  label: string;
  section: string;
  route?: string;
  hasChildren: boolean;
}

interface RoleConfig {
  id?: string;
  name: string;
  scope: 'platform' | 'tenant';
  description: string;
  menuVisibility: {
    [menuId: string]: boolean;
  };
  permissions: string[];
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {
  // Signals
  readonly roles = signal<RoleConfig[]>([]);
  readonly menuItems = signal<MenuItem[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly selectedRole = signal<RoleConfig | null>(null);
  readonly showCreateForm = signal(false);
  readonly editMode = signal(false);
  readonly activeTab = signal<'roles' | 'menus' | 'permissions'>('roles');

  // Form
  roleForm: FormGroup;

  // Menu structure for reference
  private readonly defaultMenuItems = [
    // Super Admin Menus
    { id: 'overview', label: 'Overview', section: 'Overview', hasChildren: false },
    { id: 'analytics', label: 'Analytics', section: 'Overview', hasChildren: false },
    { id: 'tenants', label: 'All Tenants', section: 'Tenant Management', hasChildren: false },
    { id: 'tenant-create', label: 'Create New Tenant', section: 'Tenant Management', hasChildren: false },
    { id: 'tenant-admins', label: 'Tenant Admins', section: 'Users & Access Control', hasChildren: false },
    { id: 'roles-perms', label: 'Roles & Permissions', section: 'Users & Access Control', hasChildren: false },
    { id: 'pricing-plans', label: 'Pricing Plans', section: 'Subscriptions & Billing', hasChildren: false },
    { id: 'subscriptions', label: 'Active Subscriptions', section: 'Subscriptions & Billing', hasChildren: false },
    { id: 'system-reports', label: 'System Reports', section: 'Reports & Analytics', hasChildren: false },
    { id: 'system-settings', label: 'System Settings', section: 'System Settings', hasChildren: false },
    { id: 'team-members', label: 'Team Members', section: 'System Team', hasChildren: false },
    { id: 'audit-logs', label: 'Audit Logs', section: 'Monitoring & Compliance', hasChildren: false },
    { id: 'system-health', label: 'System Health', section: 'Monitoring & Compliance', hasChildren: false },
  ];

  constructor(
    private fb: FormBuilder,
    private rbacService: RbacService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      scope: ['platform', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.initializeMenuItems();
  }

  private loadRoles(): void {
    this.loading.set(true);
    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          // Convert to RoleConfig format with menu visibility
          const roleConfigs: RoleConfig[] = response.roles.map(role => ({
            id: role.id,
            name: role.name,
            scope: role.scope,
            description: role.description,
            menuVisibility: this.getDefaultMenuVisibility(role.name),
            permissions: role.permissions.map(p => p.name)
          }));
          this.roles.set(roleConfigs);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
        this.loading.set(false);
      }
    });
  }

  private initializeMenuItems(): void {
    this.menuItems.set(this.defaultMenuItems);
  }

  private getDefaultMenuVisibility(roleName: string): { [key: string]: boolean } {
    const visibility: { [key: string]: boolean } = {};

    // Default visibility rules
    this.defaultMenuItems.forEach(item => {
      switch (roleName) {
        case 'Super Admin':
          visibility[item.id] = true; // All visible
          break;
        case 'Support Staff':
          // Limited access
          visibility[item.id] = ['team-members', 'audit-logs', 'tenant-admins', 'analytics'].includes(item.id);
          break;
        case 'Developer':
          // Technical access
          visibility[item.id] = ['system-settings', 'audit-logs', 'system-health', 'analytics'].includes(item.id);
          break;
        default:
          visibility[item.id] = false;
      }
    });

    return visibility;
  }

  // Role Management Methods
  createNewRole(): void {
    this.editMode.set(false);
    this.selectedRole.set(null);
    this.roleForm.reset({ scope: 'platform' });
    this.showCreateForm.set(true);
  }

  editRole(role: RoleConfig): void {
    this.editMode.set(true);
    this.selectedRole.set(role);
    this.roleForm.patchValue({
      name: role.name,
      scope: role.scope,
      description: role.description,
    });
    this.showCreateForm.set(true);
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving.set(true);
    const formValue = this.roleForm.value;

    if (this.editMode() && this.selectedRole()) {
      // Update role
      const updated: RoleConfig = {
        ...this.selectedRole()!,
        ...formValue
      };
      
      // In a real app, this would call the backend
      const currentRoles = this.roles();
      const updatedRoles = currentRoles.map(r => 
        r.id === updated.id ? updated : r
      );
      this.roles.set(updatedRoles);
    } else {
      // Create new role
      const newRole: RoleConfig = {
        id: `role-${Date.now()}`,
        ...formValue,
        menuVisibility: this.getDefaultMenuVisibility(formValue.name),
        permissions: []
      };

      this.roles.set([...this.roles(), newRole]);
    }

    this.saving.set(false);
    this.showCreateForm.set(false);
    this.roleForm.reset();
  }

  deleteRole(role: RoleConfig): void {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roles.set(this.roles().filter(r => r.id !== role.id));
    }
  }

  cancelForm(): void {
    this.showCreateForm.set(false);
    this.roleForm.reset();
  }

  // Menu Visibility Methods
  selectRoleForMenuConfig(role: RoleConfig): void {
    this.selectedRole.set(role);
    this.activeTab.set('menus');
  }

  toggleMenuVisibility(menuId: string): void {
    const role = this.selectedRole();
    if (role) {
      role.menuVisibility[menuId] = !role.menuVisibility[menuId];
      this.selectedRole.set({ ...role });
    }
  }

  isMenuVisible(menuId: string): boolean {
    return this.selectedRole()?.menuVisibility[menuId] ?? false;
  }

  getMenusBySection(): { [key: string]: MenuItem[] } {
    const grouped: { [key: string]: MenuItem[] } = {};
    
    this.menuItems().forEach(item => {
      if (!grouped[item.section]) {
        grouped[item.section] = [];
      }
      grouped[item.section].push(item);
    });

    return grouped;
  }

  getSectionOrder(): string[] {
    return [
      'Overview',
      'Tenant Management',
      'Users & Access Control',
      'Subscriptions & Billing',
      'Reports & Analytics',
      'System Settings',
      'System Team',
      'Monitoring & Compliance'
    ];
  }

  // Permission Methods
  togglePermission(permissionName: string): void {
    const role = this.selectedRole();
    if (role) {
      const permissions = role.permissions;
      const index = permissions.indexOf(permissionName);
      
      if (index > -1) {
        permissions.splice(index, 1);
      } else {
        permissions.push(permissionName);
      }
      
      this.selectedRole.set({ ...role, permissions: [...permissions] });
    }
  }

  hasPermission(permissionName: string): boolean {
    return this.selectedRole()?.permissions.includes(permissionName) ?? false;
  }

  // Utility Methods
  getVisibilityCount(role: RoleConfig): number {
    return Object.values(role.menuVisibility).filter(v => v).length;
  }

  getPermissionCount(role: RoleConfig): number {
    return role.permissions.length;
  }

  isFormInvalid(fieldName: string): boolean {
    const control = this.roleForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(fieldName: string): string {
    const control = this.roleForm.get(fieldName);
    if (control?.hasError('required')) return `${fieldName} is required`;
    if (control?.hasError('minlength')) return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    return '';
  }
}
