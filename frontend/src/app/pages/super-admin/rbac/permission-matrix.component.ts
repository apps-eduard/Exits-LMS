import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RbacService, Role, Permission, RolePermissionMatrix } from '../../../core/services/rbac.service';

interface MatrixRow {
  resource: string;
  actions: {
    create: { [roleName: string]: boolean };
    read: { [roleName: string]: boolean };
    update: { [roleName: string]: boolean };
    delete: { [roleName: string]: boolean };
  }
}

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 lg:p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white mb-2">RBAC Permission Matrix</h1>
        <p class="text-sm text-gray-400">Visual representation of role permissions across all resources</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Matrix Table -->
      <div *ngIf="!loading()" class="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <!-- Header Row -->
            <thead class="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th class="px-3 py-3 text-left text-gray-400 font-semibold sticky left-0 bg-gray-900/50 z-10 min-w-[200px]">Resource / Action</th>
                <th *ngFor="let role of roles()" class="px-3 py-3 text-center text-gray-400 font-semibold min-w-[150px]">
                  <div class="flex flex-col items-center">
                    <span class="font-bold">{{ role.name }}</span>
                    <span class="text-xs text-gray-500">({{ role.scope }})</span>
                  </div>
                </th>
              </tr>
            </thead>

            <!-- Body Rows -->
            <tbody>
              <ng-container *ngFor="let row of matrixRows(); let i = index">
                <!-- Resource Group Header -->
                <tr class="bg-gray-800/30 border-b border-gray-700 hover:bg-gray-800/50">
                  <td [attr.colspan]="roles().length + 1" class="px-3 py-2">
                    <span class="font-semibold text-blue-400">📦 {{ row.resource }}</span>
                  </td>
                </tr>

                <!-- Action Rows -->
                <tr *ngFor="let action of getActionArray()" class="border-b border-gray-700 hover:bg-gray-700/30">
                  <!-- Action Label -->
                  <td class="px-3 py-2 text-gray-300 sticky left-0 bg-gray-800/50 z-10">
                    <span class="flex items-center gap-2">
                      <span [ngClass]="getActionColor(action)">
                        {{ getActionIcon(action) }}
                      </span>
                      {{ action | titlecase }}
                    </span>
                  </td>

                  <!-- Permission Checkboxes -->
                  <td *ngFor="let role of roles()" class="px-3 py-2 text-center">
                    <div class="flex justify-center">
                      <div *ngIf="getPermission(row, action, role.name)" class="bg-green-900/30 text-green-400 border border-green-600/50 rounded px-2 py-1">
                        ✓ Allowed
                      </div>
                      <div *ngIf="!getPermission(row, action, role.name)" class="bg-gray-700/30 text-gray-400">
                        ✗ Denied
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h3 class="text-sm font-bold text-white mb-3">Legend</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-green-400">✚</span>
            <span class="text-gray-400">Create - Add new records</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-blue-400">👁️</span>
            <span class="text-gray-400">Read - View records</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-yellow-400">✏️</span>
            <span class="text-gray-400">Update - Modify records</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-red-400">🗑️</span>
            <span class="text-gray-400">Delete - Remove records</span>
          </div>
        </div>
      </div>

      <!-- Permission Summary -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ng-container *ngFor="let role of roles()">
          <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 class="font-bold text-white mb-3">{{ role.name }}</h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between text-gray-400">
                <span>Total Permissions:</span>
                <span class="text-blue-400 font-bold">{{ countRolePermissions(role.name) }}</span>
              </div>
              <div class="flex justify-between text-gray-400">
                <span>Resources:</span>
                <span class="text-blue-400 font-bold">{{ countRoleResources(role.name) }}</span>
              </div>
              <div class="flex justify-between text-gray-400">
                <span>Scope:</span>
                <span [ngClass]="role.scope === 'platform' ? 'text-purple-400' : 'text-green-400'">{{ role.scope | titlecase }}</span>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PermissionMatrixComponent implements OnInit {
  roles = signal<Role[]>([]);
  matrixRows = signal<MatrixRow[]>([]);
  loading = signal(true);

  constructor(private rbacService: RbacService) {}

  ngOnInit(): void {
    this.loadMatrixData();
  }

  getActionArray(): string[] {
    return ['create', 'read', 'update', 'delete'];
  }

  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      create: '✚',
      read: '👁️',
      update: '✏️',
      delete: '🗑️'
    };
    return icons[action] || '';
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      create: 'text-green-400',
      read: 'text-blue-400',
      update: 'text-yellow-400',
      delete: 'text-red-400'
    };
    return colors[action] || '';
  }

  getPermission(row: MatrixRow, action: string, roleName: string): boolean {
    const actions = row.actions as any;
    return actions[action]?.[roleName] ?? false;
  }

  private loadMatrixData(): void {
    this.loading.set(true);

    this.rbacService.getAllRoles().subscribe({
      next: (response) => {
        if (response.success) {
          this.roles.set(response.roles);
          this.buildMatrix(response.roles);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
        this.loading.set(false);
      }
    });
  }

  private buildMatrix(roles: Role[]): void {
    // Group permissions by resource
    const resourceMap = new Map<string, Set<string>>();
    
    roles.forEach(role => {
      role.permissions.forEach(perm => {
        if (!resourceMap.has(perm.resource)) {
          resourceMap.set(perm.resource, new Set());
        }
        resourceMap.get(perm.resource)!.add(perm.name);
      });
    });

    // Build matrix rows
    const rows: MatrixRow[] = [];
    resourceMap.forEach((permissions, resource) => {
      const row: MatrixRow = {
        resource,
        actions: {
          create: {},
          read: {},
          update: {},
          delete: {}
        }
      };

      roles.forEach(role => {
        const rolePermNames = new Set(role.permissions.map(p => p.name));
        (row.actions.create as any)[role.name] = rolePermNames.has(`create_${resource}`);
        (row.actions.read as any)[role.name] = rolePermNames.has(`view_${resource}`) || rolePermNames.has(`read_${resource}`);
        (row.actions.update as any)[role.name] = rolePermNames.has(`update_${resource}`) || rolePermNames.has(`manage_${resource}`);
        (row.actions.delete as any)[role.name] = rolePermNames.has(`delete_${resource}`) || rolePermNames.has(`manage_${resource}`);
      });

      rows.push(row);
    });

    this.matrixRows.set(rows.sort((a, b) => a.resource.localeCompare(b.resource)));
  }

  countRolePermissions(roleName: string): number {
    return this.matrixRows().reduce((count, row) => {
      return count + 
        ((row.actions.create as any)[roleName] ? 1 : 0) +
        ((row.actions.read as any)[roleName] ? 1 : 0) +
        ((row.actions.update as any)[roleName] ? 1 : 0) +
        ((row.actions.delete as any)[roleName] ? 1 : 0);
    }, 0);
  }

  countRoleResources(roleName: string): number {
    return this.matrixRows().filter(row => 
      (row.actions.create as any)[roleName] ||
      (row.actions.read as any)[roleName] ||
      (row.actions.update as any)[roleName] ||
      (row.actions.delete as any)[roleName]
    ).length;
  }
}
