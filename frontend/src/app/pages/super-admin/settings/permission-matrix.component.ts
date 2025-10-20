import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RbacService, Role } from '../../../core/services/rbac.service';
import { RolesTableComponent } from './roles-table.component';

interface Menu {
  id: string;
  name: string;
  slug: string;
  icon: string;
  route: string;
  scope: 'platform' | 'tenant';
  isActive: boolean;
  orderIndex: number;
  parentMenuId?: string;
  tenantId?: string;
}

interface RoleMenuMatrix {
  [roleId: string]: Set<string>;
}

interface MenuGroup {
  scope: 'platform' | 'tenant';
  menus: Menu[];
}

@Component({
  selector: "app-permission-matrix",
  standalone: true,
  imports: [CommonModule, TitleCasePipe, ReactiveFormsModule, RolesTableComponent],
  templateUrl: "./permission-matrix.component.html",
  styles: []
})
export class PermissionMatrixComponent implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly allMenus = signal<Menu[]>([]);
  readonly platformRoles = signal<Role[]>([]);
  readonly matrix = signal<RoleMenuMatrix>({});
  readonly originalMatrix = signal<RoleMenuMatrix>({});
  readonly activeTab = signal<"roles" | "matrix">("roles");
  readonly showCreateForm = signal(false);
  readonly editMode = signal(false);
  readonly selectedRole = signal<Role | null>(null);

  roleForm: FormGroup;

  private readonly protectedRoles = ["Super Admin", "Support Staff", "Developer"];

  constructor(
    private rbacService: RbacService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadMatrix();
  }

  createNewRole(): void {
    this.editMode.set(false);
    this.selectedRole.set(null);
    this.roleForm.reset();
    this.showCreateForm.set(true);
  }

  editRoleDetails(role: Role): void {
    if (this.isProtectedRole(role.name)) {
      alert("Cannot edit protected system roles");
      return;
    }

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
      this.roleForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.roleForm.value;

    if (this.editMode() && this.selectedRole()) {
      const roleId = this.selectedRole()!.id;
      this.rbacService.updateRole(roleId, {
        name: formValue.name,
        description: formValue.description
      }).subscribe({
        next: () => {
          console.log("✅ Role updated successfully");
          this.cancelForm();
          this.loadMatrix();
          this.saving.set(false);
        },
        error: (error) => {
          console.error("❌ Failed to update role:", error);
          alert("Failed to update role. Please try again.");
          this.saving.set(false);
        }
      });
    } else {
      this.rbacService.createRole(formValue.name, "platform", formValue.description).subscribe({
        next: () => {
          console.log("✅ Role created successfully");
          this.cancelForm();
          this.loadMatrix();
          this.saving.set(false);
        },
        error: (error) => {
          console.error("❌ Failed to create role:", error);
          alert("Failed to create role. Please try again.");
          this.saving.set(false);
        }
      });
    }
  }

  deleteRole(role: Role): void {
    if (this.isProtectedRole(role.name)) {
      alert("Cannot delete protected system roles");
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    this.saving.set(true);
    this.rbacService.deleteRole(role.id).subscribe({
      next: () => {
        console.log("✅ Role deleted successfully");
        this.loadMatrix();
        this.saving.set(false);
      },
      error: (error) => {
        console.error("❌ Failed to delete role:", error);
        alert("Failed to delete role. Please try again.");
        this.saving.set(false);
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm.set(false);
    this.editMode.set(false);
    this.selectedRole.set(null);
    this.roleForm.reset();
  }

  loadMatrix(): void {
    this.loading.set(true);
    console.log('[MenuMatrix] Loading menus and roles...');

    Promise.all([
      this.rbacService.getAllRoles().toPromise(),
      this.http.get<any>('/api/menus?scope=platform').toPromise()
    ]).then(([rolesResponse, menusResponse]) => {
      if (rolesResponse?.success && Array.isArray(menusResponse)) {
        const platformRoles = rolesResponse.roles.filter((r: Role) => r.scope === "platform");
        this.platformRoles.set(platformRoles);
        this.allMenus.set(menusResponse);

        console.log(`[MenuMatrix] Loaded ${platformRoles.length} roles and ${menusResponse.length} menus`);

        // Load role-menu assignments
        this.loadRoleMenuAssignments(platformRoles);
      }
      this.loading.set(false);
    }).catch(error => {
      console.error("Failed to load menu matrix:", error);
      this.loading.set(false);
    });
  }

  private loadRoleMenuAssignments(roles: Role[]): void {
    console.log('[MenuMatrix] Loading role-menu assignments...');
    
    const matrix: RoleMenuMatrix = {};
    
    // Initialize matrix with empty sets
    roles.forEach((role: Role) => {
      matrix[role.id] = new Set<string>();
    });

    // For protected roles, assign all menus
    roles.forEach((role: Role) => {
      if (this.isProtectedRole(role.name)) {
        const allMenuIds = this.allMenus().map(m => m.id);
        matrix[role.id] = new Set(allMenuIds);
      }
    });

    // Fetch role-menu assignments from database
    this.http.get<any>('/api/roles/menus').subscribe({
      next: (response) => {
        if (response && response.roleMenus) {
          response.roleMenus.forEach((assignment: any) => {
            if (matrix[assignment.role_id]) {
              matrix[assignment.role_id].add(assignment.menu_id);
            }
          });
        }
        this.matrix.set(matrix);
        this.originalMatrix.set(JSON.parse(JSON.stringify(
          Object.fromEntries(Object.entries(matrix).map(([k, v]) => [k, Array.from(v)]))
        )));
        console.log('[MenuMatrix] Role-menu assignments loaded');
      },
      error: (error) => {
        console.error('[MenuMatrix] Error loading role-menu assignments:', error);
        // Set matrix with just what we have
        this.matrix.set(matrix);
        this.originalMatrix.set(JSON.parse(JSON.stringify(
          Object.fromEntries(Object.entries(matrix).map(([k, v]) => [k, Array.from(v)]))
        )));
      }
    });
  }

  toggleMenu(roleId: string, menuId: string): void {
    const currentMatrix = this.matrix();
    const roleMenus = currentMatrix[roleId] || new Set();
    
    if (roleMenus.has(menuId)) {
      roleMenus.delete(menuId);
      
      // If unchecking a parent menu, uncheck all child menus
      const childMenus = this.getChildMenus(menuId);
      childMenus.forEach(child => roleMenus.delete(child.id));
    } else {
      roleMenus.add(menuId);
      
      // If checking a menu, check its parent menu (if exists)
      const menu = this.allMenus().find(m => m.id === menuId);
      if (menu?.parentMenuId) {
        roleMenus.add(menu.parentMenuId);
      }
    }

    currentMatrix[roleId] = roleMenus;
    this.matrix.set({ ...currentMatrix });
  }

  toggleAllMenusForRole(roleId: string): void {
    const currentMatrix = this.matrix();
    const roleMenus = currentMatrix[roleId] || new Set();
    
    if (this.areAllMenusEnabledForRole(roleId)) {
      currentMatrix[roleId] = new Set();
    } else {
      const allMenuIds = this.allMenus().map(m => m.id);
      currentMatrix[roleId] = new Set(allMenuIds);
    }

    this.matrix.set({ ...currentMatrix });
  }

  async saveAllChanges(): Promise<void> {
    if (!this.hasChanges() || this.saving()) return;

    this.saving.set(true);
    const currentMatrix = this.matrix();

    try {
      console.log('[MenuMatrix] Saving menu assignments...');
      
      const promises = Object.entries(currentMatrix).map(([roleId, menuIds]) => {
        const menuIdArray = Array.from(menuIds);
        console.log(`[MenuMatrix] Saving ${menuIdArray.length} menus for role ${roleId}`);
        
        return this.http.post(`/api/roles/${roleId}/menus`, {
          menuIds: menuIdArray
        }).toPromise();
      });

      await Promise.all(promises);

      console.log("✅ Menu assignments saved successfully");
      this.originalMatrix.set(JSON.parse(JSON.stringify(
        Object.fromEntries(Object.entries(currentMatrix).map(([k, v]) => [k, Array.from(v)]))
      )));
      this.loadMatrix();
    } catch (error) {
      console.error("❌ Failed to save menu assignments:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      this.saving.set(false);
    }
  }

  hasMenu(roleId: string, menuId: string): boolean {
    const roleMenus = this.matrix()[roleId];
    return roleMenus ? roleMenus.has(menuId) : false;
  }

  areAllMenusEnabledForRole(roleId: string): boolean {
    const roleMenus = this.matrix()[roleId];
    if (!roleMenus) return false;
    return this.allMenus().every(m => roleMenus.has(m.id));
  }

  getRolePermissionCount(roleId: string): number {
    const rolePerms = this.matrix()[roleId];
    return rolePerms ? rolePerms.size : 0;
  }

  getRoleMenuCount(roleId: string): number {
    const roleMenus = this.matrix()[roleId];
    return roleMenus ? roleMenus.size : 0;
  }

  hasChanges(): boolean {
    const current = this.matrix();
    const original = this.originalMatrix();

    return JSON.stringify(Object.fromEntries(Object.entries(current).map(([k, v]) => [k, Array.from(v).sort()]).sort())) !==
           JSON.stringify(original);
  }

  getChangeCount(): number {
    let count = 0;
    const current = this.matrix();
    const original = this.originalMatrix();

    Object.keys(current).forEach(roleId => {
      const currentMenus = Array.from(current[roleId]).sort();
      const originalMenus = original[roleId] ? Array.from(original[roleId]).sort() : [];

      if (JSON.stringify(currentMenus) !== JSON.stringify(originalMenus)) {
        count++;
      }
    });

    return count;
  }

  getProtectedRoleCount(): number {
    return this.platformRoles().filter(r => this.isProtectedRole(r.name)).length;
  }

  getMenuGroups(): MenuGroup[] {
    const grouped = new Map<'platform' | 'tenant', Menu[]>();

    this.allMenus().forEach(menu => {
      if (!grouped.has(menu.scope)) {
        grouped.set(menu.scope, []);
      }
      grouped.get(menu.scope)!.push(menu);
    });

    return Array.from(grouped.entries())
      .map(([scope, menus]) => ({
        scope,
        menus: menus.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      }))
      .sort((a, b) => a.scope === 'platform' ? -1 : 1);
  }

  getChildMenus(parentMenuId: string): Menu[] {
    return this.allMenus().filter(m => m.parentMenuId === parentMenuId);
  }

  isParentMenu(menuId: string): boolean {
    return this.allMenus().some(m => m.parentMenuId === menuId);
  }

  isChildMenu(menuId: string): boolean {
    const menu = this.allMenus().find(m => m.id === menuId);
    return !!menu?.parentMenuId;
  }

  isParentPermission(permissionName: string): boolean {
    return this.isParentMenu(permissionName);
  }

  isChildPermission(permissionName: string): boolean {
    return this.isChildMenu(permissionName);
  }

  isProtectedRole(roleName: string): boolean {
    return this.protectedRoles.includes(roleName);
  }

  formatPermissionName(name: string): string {
    return name.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }

  getResourceIcon(resource: string): string {
    const icons: { [key: string]: string } = {
      "platform": "🏢",
      "tenant": "�",
    };
    return icons[resource] || "📄";
  }

  getMenuIcon(menu: Menu): string {
    return menu.icon || '�';
  }

  getScopeIcon(scope: string): string {
    return scope === 'platform' ? '🏢' : '�';
  }
}
