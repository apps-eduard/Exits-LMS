import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RbacService, Role } from '../../../core/services/rbac.service';
import { UserService, User } from '../../../core/services/user.service';

interface RoleConfig {
  id?: string;
  name: string;
  scope: 'platform';
  description: string;
  permissions: string[];
}

// Permission hierarchy: parent -> child mapping
const PERMISSION_HIERARCHY: { [key: string]: string[] } = {
  // Tenant Management (4 children)
  'manage_tenants': [
    'view_tenants',
    'create_tenants',
    'edit_tenants',
    'delete_tenants'
  ],
  
  // System Settings (3 children)
  'manage_platform_settings': [
    'view_platform_settings',
    'edit_platform_settings',
    'export_settings'
  ],
  
    // Menu Management (2 children only - users can ONLY view and edit, NOT create/delete)
    'manage_menus': [
      'view_menus',
      'edit_menus'
    ],  // System Team (2 children)
  'manage_users': [
    'view_users',
    'edit_users'
  ]
};

@Component({
  selector: 'app-system-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './system-roles.component.html',
  styleUrl: './system-roles.component.scss'
})
export class SystemRolesComponent implements OnInit {
  // Signals
  readonly roles = signal<RoleConfig[]>([]);
  readonly users = signal<User[]>([]);
  readonly allPermissions = signal<any[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly selectedRole = signal<RoleConfig | null>(null);
  readonly showCreateForm = signal(false);
  readonly editMode = signal(false);
  readonly activeTab = signal<'roles' | 'permissions' | 'users'>('roles');
  readonly loadingUsers = signal(false);
  readonly loadingPermissions = signal(false);

  // Form
  roleForm: FormGroup;

  // Protected system roles that cannot be deleted
  private readonly protectedRoles = ['Super Admin'];

  constructor(
    private fb: FormBuilder,
    private rbacService: RbacService,
    private userService: UserService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadSystemRoles();
    this.loadAllPermissions();
  }

  private loadAllPermissions(): void {
    this.loadingPermissions.set(true);
    // Load only platform-scope permissions for system roles
    this.rbacService.getPermissionsByScope('platform').subscribe({
      next: (response) => {
        if (response.success && response.permissions) {
          this.allPermissions.set(response.permissions);
          console.log('✅ Platform permissions loaded:', response.permissions);
        }
        this.loadingPermissions.set(false);
      },
      error: (error) => {
        console.error('❌ Failed to load permissions:', error);
        this.loadingPermissions.set(false);
      }
    });
  }

  private loadSystemRoles(): void {
    this.loading.set(true);
    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('[SystemRolesComponent] All roles from API:', response.roles);
          
          // Filter only platform scope roles
          const platformRoles: RoleConfig[] = response.roles
            .filter((role: any) => {
              const isPlatform = role.scope === 'platform';
              console.log(`[SystemRolesComponent] Role: ${role.name}, Scope: ${role.scope}, IsPlatform: ${isPlatform}`);
              return isPlatform;
            })
            .map((role: any) => ({
              id: role.id,
              name: role.name,
              scope: 'platform' as const,
              description: role.description,
              permissions: role.permissions.map((p: any) => p.name || p)
            }));
          
          console.log('[SystemRolesComponent] Filtered platform roles:', platformRoles);
          this.roles.set(platformRoles);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load system roles:', error);
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
        scope: 'platform',
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
        'platform',
        formValue.description
      ).subscribe({
        next: (response) => {
          if (response.success && response.role) {
            const newRole: RoleConfig = {
              id: response.role.id,
              name: response.role.name,
              scope: 'platform',
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
      alert(`Cannot delete protected system role: "${role.name}"`);
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
      const permissions = [...role.permissions];
      const index = permissions.indexOf(permissionName);
      
      if (index > -1) {
        // REMOVING permission: Also remove all children
        permissions.splice(index, 1);
        
        // Remove all child permissions of this permission
        const childPermissions = PERMISSION_HIERARCHY[permissionName] || [];
        childPermissions.forEach(child => {
          const childIndex = permissions.indexOf(child);
          if (childIndex > -1) {
            permissions.splice(childIndex, 1);
          }
        });
      } else {
        // ADDING permission: Auto-add parent if it has one
        permissions.push(permissionName);
        
        // Check if this permission is a child of any parent
        for (const [parent, children] of Object.entries(PERMISSION_HIERARCHY)) {
          if (children.includes(permissionName)) {
            // This is a child permission, auto-add parent if not already present
            if (!permissions.includes(parent)) {
              permissions.push(parent);
            }
          }
        }
      }
      
      this.selectedRole.set({ ...role, permissions });
    }
  }

  hasPermission(permissionName: string): boolean {
    return this.selectedRole()?.permissions.includes(permissionName) ?? false;
  }

  /**
   * Check if a permission is a parent (has children)
   */
  isParentPermission(permissionName: string): boolean {
    return permissionName in PERMISSION_HIERARCHY;
  }

  /**
   * Check if a permission is a child (has a parent)
   */
  isChildPermission(permissionName: string): boolean {
    for (const [parent, children] of Object.entries(PERMISSION_HIERARCHY)) {
      if (children.includes(permissionName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get parent of a child permission
   */
  getParentOfChild(childName: string): string | null {
    for (const [parent, children] of Object.entries(PERMISSION_HIERARCHY)) {
      if (children.includes(childName)) {
        return parent;
      }
    }
    return null;
  }

  /**
   * Check if parent of this child is checked
   */
  isParentOfChildChecked(childName: string): boolean {
    const parent = this.getParentOfChild(childName);
    if (!parent) return true; // If no parent, it's standalone
    return this.hasPermission(parent);
  }

  /**
   * Get child permissions for a given parent
   */
  getChildPermissions(permissionName: string): string[] {
    return PERMISSION_HIERARCHY[permissionName] || [];
  }

  /**
   * Check if all children of a parent are checked
   */
  areAllChildrenChecked(parentName: string): boolean {
    const children = this.getChildPermissions(parentName);
    if (children.length === 0) return true;
    return children.every(child => this.hasPermission(child));
  }

  /**
   * Check if any child of a parent is checked
   */
  isAnyChildChecked(parentName: string): boolean {
    const children = this.getChildPermissions(parentName);
    return children.some(child => this.hasPermission(child));
  }

  /**
   * Check if parent can be unchecked (has no checked children)
   */
  canUncheckParent(parentName: string): boolean {
    return !this.isAnyChildChecked(parentName);
  }

  /**
   * Get count of visible permissions (only children, not parents)
   */
  getVisiblePermissionCount(permissions: any[]): number {
    return permissions.filter((p: any) => this.isChildPermission(p.name) || !this.isParentPermission(p.name)).length;
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
  getSystemPermissions() {
    return this.allPermissions();
  }

  getPermissionsByCategory() {
    const permissions = this.allPermissions();
    return {
      'Tenant Management': permissions.filter((p: any) => p.resource === 'tenants'),
      'User Management': permissions.filter((p: any) => p.resource === 'users'),
      'Audit & Compliance': permissions.filter((p: any) => p.resource === 'audit_logs'),
      'Platform Settings': permissions.filter((p: any) => p.resource === 'settings'),
    };
  }

  getAllPermissionCategories() {
    const categories: { [key: string]: any[] } = this.getPermissionsByCategory();
    return Object.entries(categories)
      .filter(([_, perms]) => perms && perms.length > 0)
      .map(([category, perms]) => ({ category, permissions: perms }));
  }

  // ========== USER ROLE MANAGEMENT ==========
  loadSystemUsers(): void {
    this.loadingUsers.set(true);
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.users || []);
          console.log('✅ System users loaded:', response.users);
        }
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error('❌ Failed to load system users:', error);
        this.loadingUsers.set(false);
      }
    });
  }

  userHasRole(user: User, roleName: string): boolean {
    return user.role_name === roleName;
  }

  assignRoleToUser(user: User, event: any): void {
    const roleName = event.target.value;
    if (!roleName) return;
    
    this.saving.set(true);
    const updateData = {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      roleName: roleName,
      is_active: user.is_active
    };

    this.userService.updateUser(user.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local users list
          const updatedUsers = this.users().map(u =>
            u.id === user.id ? { ...u, role_name: roleName } : u
          );
          this.users.set(updatedUsers);
          console.log(`✅ Role "${roleName}" assigned to user "${user.email}"`);
          this.saving.set(false);
        }
      },
      error: (error) => {
        console.error('❌ Failed to assign role:', error);
        this.saving.set(false);
        alert('Failed to assign role to user');
      }
    });
  }

  getActiveUserCount(): number {
    return this.users().filter(u => u.is_active).length;
  }

  getInactiveUserCount(): number {
    return this.users().filter(u => !u.is_active).length;
  }

  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      'Super Admin': 'bg-red-900/30 text-red-300 border border-red-700/50',
      'Support Staff': 'bg-blue-900/30 text-blue-300 border border-blue-700/50',
      'Developer': 'bg-purple-900/30 text-purple-300 border border-purple-700/50'
    };
    return colors[roleName] || 'bg-gray-700/30 text-gray-300 border border-gray-600/50';
  }

  getRoleIcon(roleName: string): string {
    const icons: { [key: string]: string } = {
      'Super Admin': '👑',
      'Support Staff': '🛠️',
      'Developer': '👨‍💻'
    };
    return icons[roleName] || '👤';
  }
}
