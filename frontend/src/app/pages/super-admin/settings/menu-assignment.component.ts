import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';

interface Menu {
  id: string;
  name: string;
  icon?: string;
  path?: string;
  scope?: string;
  order_index?: number;
  is_active?: boolean;
}

interface RoleWithMenus {
  id: string;
  name: string;
  description?: string;
  assignedMenuIds: Set<string>;
}

@Component({
  selector: 'app-menu-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h2 class="text-sm font-bold text-white mb-4">📍 Menu Assignment</h2>
      
      <!-- Role Selection -->
      <div class="mb-4">
        <label class="block text-xs font-medium text-gray-300 mb-2">Select Role *</label>
        <select 
          [(ngModel)]="selectedRoleId"
          (change)="onRoleSelected()"
          class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white focus:border-purple-500 focus:outline-none">
          <option value="">-- Select a role to assign menus --</option>
          <option *ngFor="let role of roles()" [value]="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
        <p class="text-gray-400 text-xs">Loading menus...</p>
      </div>

      <!-- Menu Selection (when role selected) -->
      <div *ngIf="!loading() && selectedRoleId && availableMenus().length > 0">
        <!-- Menu Count -->
        <div class="mb-3 p-2 bg-purple-900/20 border border-purple-700/50 rounded text-xs text-purple-300">
          Selected: {{ (assignedMenuIds() | slice:0).length }} / {{ availableMenus().length }} menus
        </div>

        <!-- Select All / Deselect All -->
        <div class="flex gap-2 mb-4">
          <button 
            (click)="selectAllMenus()"
            class="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs rounded transition">
            ✓ Select All
          </button>
          <button 
            (click)="deselectAllMenus()"
            class="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs rounded transition">
            ✗ Deselect All
          </button>
        </div>

        <!-- Menu List Grouped by Scope -->
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div *ngFor="let scope of getMenusByScope() | keyvalue">
            <!-- Scope Header -->
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-semibold text-gray-400">{{ scope.key | titlecase }} Menus</span>
              <span class="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                {{ scope.value.length }}
              </span>
            </div>

            <!-- Menu Checkboxes -->
            <div class="space-y-1 pl-2">
              <label *ngFor="let menu of scope.value" class="flex items-center gap-2 cursor-pointer hover:bg-gray-800/30 p-1 rounded transition">
                <input 
                  type="checkbox"
                  [checked]="assignedMenuIds().has(menu.id)"
                  (change)="toggleMenu(menu.id)"
                  class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2" />
                <span class="text-gray-300 text-xs flex-1">
                  {{ menu.icon || '◆' }} {{ menu.name }}
                </span>
                <span *ngIf="menu.path" class="text-gray-500 text-xs">{{ menu.path }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Save / Cancel Buttons -->
        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-700">
          <button 
            (click)="cancelChanges()"
            class="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition flex-1">
            Cancel
          </button>
          <button 
            (click)="saveMenuAssignment()"
            [disabled]="saving()"
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg text-white text-xs font-semibold rounded transition disabled:opacity-50 flex-1">
            {{ saving() ? '⏳ Saving...' : '💾 Save Menu Assignment' }}
          </button>
        </div>

        <!-- Status Messages -->
        <div *ngIf="successMessage()" class="mt-2 p-2 bg-green-900/30 border border-green-700/50 rounded text-xs text-green-300">
          ✓ {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="mt-2 p-2 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-300">
          ✗ {{ errorMessage() }}
        </div>
      </div>

      <!-- No Role Selected -->
      <div *ngIf="!loading() && !selectedRoleId" class="text-center py-6">
        <p class="text-gray-500 text-xs">Select a role to manage its menu access</p>
      </div>

      <!-- Protected Role Notice -->
      <div *ngIf="selectedRoleId && isProtectedRole(selectedRoleId)" class="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-xs text-yellow-300">
        ℹ️ This is a protected system role. It automatically has access to all menus.
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MenuAssignmentComponent implements OnInit {
  readonly selectedRoleId = signal('');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  
  readonly roles = signal<RoleWithMenus[]>([]);
  readonly availableMenus = signal<Menu[]>([]);
  readonly assignedMenuIds = signal<Set<string>>(new Set());
  
  private readonly protectedRoles = ['Super Admin', 'Support Staff', 'Developer'];
  private originalAssignedMenuIds: Set<string> = new Set();

  constructor(private rbacService: RbacService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadAvailableMenus();
  }

  /**
   * Load all roles from backend
   */
  private loadRoles(): void {
    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success && response.roles) {
          const platformRoles = response.roles
            .filter((r: any) => r.scope === 'platform')
            .map((r: any) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              assignedMenuIds: new Set<string>()
            }));
          this.roles.set(platformRoles);
        }
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
        this.errorMessage.set('Failed to load roles');
      }
    });
  }

  /**
   * Load all available menus
   */
  private loadAvailableMenus(): void {
    this.rbacService.getAvailableMenus().subscribe({
      next: (response) => {
        if (response.success && response.menus) {
          this.availableMenus.set(response.menus);
        }
      },
      error: (error) => {
        console.error('Failed to load available menus:', error);
        this.errorMessage.set('Failed to load available menus');
      }
    });
  }

  /**
   * Handle role selection - load assigned menus for that role
   */
  onRoleSelected(): void {
    if (!this.selectedRoleId()) {
      this.assignedMenuIds.set(new Set());
      this.successMessage.set('');
      this.errorMessage.set('');
      return;
    }

    this.loading.set(true);
    this.rbacService.getRoleMenus(this.selectedRoleId()).subscribe({
      next: (response) => {
        if (response.success && response.menus) {
          const menuIds = new Set<string>(
            (response.menus as Menu[]).map((m: Menu) => m.id)
          );
          this.assignedMenuIds.set(menuIds);
          this.originalAssignedMenuIds = new Set<string>(Array.from(menuIds));
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Failed to load role menus:', error);
        this.errorMessage.set('Failed to load role menus');
        this.loading.set(false);
      }
    });
  }

  /**
   * Toggle a menu assignment
   */
  toggleMenu(menuId: string): void {
    const currentMenus = new Set(this.assignedMenuIds());
    if (currentMenus.has(menuId)) {
      currentMenus.delete(menuId);
    } else {
      currentMenus.add(menuId);
    }
    this.assignedMenuIds.set(currentMenus);
    this.successMessage.set('');
  }

  /**
   * Select all menus
   */
  selectAllMenus(): void {
    const allMenuIds = new Set(this.availableMenus().map(m => m.id));
    this.assignedMenuIds.set(allMenuIds);
    this.successMessage.set('');
  }

  /**
   * Deselect all menus
   */
  deselectAllMenus(): void {
    this.assignedMenuIds.set(new Set());
    this.successMessage.set('');
  }

  /**
   * Cancel changes - revert to original
   */
  cancelChanges(): void {
    this.assignedMenuIds.set(new Set(this.originalAssignedMenuIds));
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  /**
   * Save menu assignments
   */
  saveMenuAssignment(): void {
    if (!this.selectedRoleId()) {
      this.errorMessage.set('Please select a role');
      return;
    }

    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const menuIds = Array.from(this.assignedMenuIds());

    this.rbacService.assignMenusToRole(this.selectedRoleId(), menuIds).subscribe({
      next: (response) => {
        if (response.success) {
          this.originalAssignedMenuIds = new Set(menuIds);
          this.successMessage.set(`✓ Menu assignment saved for ${this.getRoleNameById(this.selectedRoleId())}`);
          this.saving.set(false);
          
          // Clear message after 3 seconds
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      },
      error: (error) => {
        console.error('Failed to save menu assignment:', error);
        this.errorMessage.set(error.error?.error || 'Failed to save menu assignment');
        this.saving.set(false);
      }
    });
  }

  /**
   * Check if a role is protected (system role)
   */
  isProtectedRole(roleId: string): boolean {
    const role = this.roles().find(r => r.id === roleId);
    return role ? this.protectedRoles.includes(role.name) : false;
  }

  /**
   * Get role name by ID
   */
  private getRoleNameById(roleId: string): string {
    const role = this.roles().find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  }

  /**
   * Group menus by scope for display
   */
  getMenusByScope(): Record<string, Menu[]> {
    const grouped: Record<string, Menu[]> = {};
    
    this.availableMenus().forEach(menu => {
      const scope = menu.scope || 'other';
      if (!grouped[scope]) {
        grouped[scope] = [];
      }
      grouped[scope].push(menu);
    });

    return grouped;
  }
}
