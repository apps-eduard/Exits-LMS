import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RbacService, Role } from '../../../core/services/rbac.service';

interface RoleConfig {
  id?: string;
  name: string;
  scope: 'tenant';
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-tenant-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-roles.component.html',
  styleUrl: './tenant-roles.component.scss'
})
export class TenantRolesComponent implements OnInit {
  // Signals
  readonly roles = signal<RoleConfig[]>([]);
  readonly allPermissions = signal<any[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly selectedRole = signal<RoleConfig | null>(null);
  readonly showCreateForm = signal(false);
  readonly editMode = signal(false);
  readonly activeTab = signal<'roles' | 'permissions'>('roles');
  readonly loadingPermissions = signal(false);

  // Form
  roleForm: FormGroup;

  // Protected tenant roles that cannot be deleted
  private readonly protectedRoles = ['tenant-admin'];

  constructor(
    private fb: FormBuilder,
    private rbacService: RbacService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadTenantRoles();
    this.loadAllPermissions();
  }

  private loadAllPermissions(): void {
    this.loadingPermissions.set(true);
    this.rbacService.getAllPermissions().subscribe({
      next: (response) => {
        if (response.success && response.permissions) {
          // Filter only tenant-scoped permissions (exclude platform-only)
          const tenantPerms = response.permissions.filter((p: any) => 
            p.resource !== 'tenants' && p.resource !== 'settings'
          );
          this.allPermissions.set(tenantPerms);
          console.log('✅ Tenant permissions loaded:', tenantPerms);
        }
        this.loadingPermissions.set(false);
      },
      error: (error) => {
        console.error('❌ Failed to load permissions:', error);
        this.loadingPermissions.set(false);
      }
    });
  }

  private loadTenantRoles(): void {
    this.loading.set(true);
    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('[TenantRolesComponent] All roles from API:', response.roles);
          
          // Filter only tenant scope roles
          const tenantRoles: RoleConfig[] = response.roles
            .filter((role: any) => {
              const isTenant = role.scope === 'tenant';
              console.log(`[TenantRolesComponent] Role: ${role.name}, Scope: ${role.scope}, IsTenant: ${isTenant}`);
              return isTenant;
            })
            .map((role: any) => ({
              id: role.id,
              name: role.name,
              scope: 'tenant' as const,
              description: role.description,
              permissions: role.permissions.map((p: any) => p.name || p)
            }));
          
          console.log('[TenantRolesComponent] Filtered tenant roles:', tenantRoles);
          this.roles.set(tenantRoles);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load tenant roles:', error);
        this.loading.set(false);
      }
    });
  }

  // Role Management Methods
  createNewRole(): void {
    this.editMode.set(false);
    this.selectedRole.set(null);
    this.roleForm.reset();
    this.showCreateForm.set(true);
  }

  editRole(role: RoleConfig): void {
    this.editMode.set(true);
    this.selectedRole.set(role);
    this.roleForm.patchValue({
      name: role.name,
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
      // Update role via API
      const roleId = this.selectedRole()!.id!;
      this.rbacService.updateRole(roleId, {
        name: formValue.name,
        scope: 'tenant',
        description: formValue.description
      }).subscribe({
        next: (response) => {
          if (response.success) {
            const updated: RoleConfig = {
              ...this.selectedRole()!,
              ...formValue
            };
            
            const currentRoles = this.roles();
            const updatedRoles = currentRoles.map(r => 
              r.id === updated.id ? updated : r
            );
            this.roles.set(updatedRoles);
            
            this.saving.set(false);
            this.showCreateForm.set(false);
            this.roleForm.reset();
            console.log('✅ Role updated successfully');
          }
        },
        error: (error) => {
          console.error('❌ Failed to update role:', error);
          this.saving.set(false);
          alert('Failed to update role');
        }
      });
    } else {
      // Create new role via API
      this.rbacService.createRole(
        formValue.name,
        'tenant',
        formValue.description
      ).subscribe({
        next: (response) => {
          if (response.success && response.role) {
            const newRole: RoleConfig = {
              id: response.role.id,
              name: response.role.name,
              scope: 'tenant',
              description: response.role.description,
              permissions: response.role.permissions?.map((p: any) => p.name || p) || []
            };

            this.roles.set([...this.roles(), newRole]);
            
            this.saving.set(false);
            this.showCreateForm.set(false);
            this.roleForm.reset();
            console.log('✅ Role created successfully');
          }
        },
        error: (error) => {
          console.error('❌ Failed to create role:', error);
          this.saving.set(false);
          alert('Failed to create role');
        }
      });
    }
  }

  deleteRole(role: RoleConfig): void {
    if (this.isProtectedRole(role.name)) {
      alert(`Cannot delete protected tenant role: "${role.name}"`);
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roles.set(this.roles().filter(r => r.id !== role.id));
    }
  }

  isProtectedRole(roleName: string): boolean {
    return this.protectedRoles.includes(roleName);
  }

  canDeleteRole(role: RoleConfig): boolean {
    return !this.isProtectedRole(role.name);
  }

  cancelForm(): void {
    this.showCreateForm.set(false);
    this.roleForm.reset();
  }

  // Permission Methods
  selectRoleForPermissions(role: RoleConfig): void {
    this.selectedRole.set(role);
    this.activeTab.set('permissions');
  }

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

  // Permission utility
  getTenantPermissions() {
    return this.allPermissions();
  }

  getPermissionsByCategory() {
    const permissions = this.allPermissions();
    return {
      'User Management': permissions.filter((p: any) => p.resource === 'users'),
      'Customer Management': permissions.filter((p: any) => p.resource === 'customers'),
      'Loan Management': permissions.filter((p: any) => ['loans', 'loan_products'].includes(p.resource)),
      'Payment Management': permissions.filter((p: any) => p.resource === 'payments'),
      'BNPL Management': permissions.filter((p: any) => ['bnpl_merchants', 'bnpl_orders'].includes(p.resource)),
      'Reports & Analytics': permissions.filter((p: any) => p.resource === 'reports'),
    };
  }

  getAllPermissionCategories() {
    const categories: { [key: string]: any[] } = this.getPermissionsByCategory();
    return Object.entries(categories)
      .filter(([_, perms]) => perms && perms.length > 0)
      .map(([category, perms]) => ({ category, permissions: perms }));
  }
}
