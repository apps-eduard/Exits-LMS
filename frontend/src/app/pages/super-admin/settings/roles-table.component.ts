import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../../core/services/rbac.service';

// Roles table component using table structure
@Component({
  selector: 'app-roles-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-table.component.html'
})
export class RolesTableComponent {
  @Input() roles: Role[] = [];
  @Output() editRequested = new EventEmitter<Role>();
  @Output() deleteRequested = new EventEmitter<Role>();

  private readonly protectedRoles = ['Super Admin', 'Support Staff', 'Developer'];

  isProtectedRole(roleName: string): boolean {
    return this.protectedRoles.includes(roleName);
  }

  editRole(role: Role): void {
    this.editRequested.emit(role);
  }

  deleteRole(role: Role): void {
    this.deleteRequested.emit(role);
  }
}
