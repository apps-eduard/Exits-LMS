import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantProfileSettingsComponent } from './profile-settings.component';
import { TenantRolesComponent } from './tenant-roles.component';

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [CommonModule, TenantProfileSettingsComponent, TenantRolesComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class TenantSettingsComponent {
  readonly activeTab = signal<'profile' | 'roles'>('profile');

  setActiveTab(tab: 'profile' | 'roles'): void {
    this.activeTab.set(tab);
  }
}
