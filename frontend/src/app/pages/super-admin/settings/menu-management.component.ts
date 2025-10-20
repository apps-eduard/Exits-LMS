import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService, Menu } from '../../../core/services/menu.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="menu-management-container" [class.with-panel]="showForm()">
      <!-- Main Content Area -->
      <div class="main-content">
        <div class="header">
          <h2>Menu Management</h2>
          <p class="subtitle">Create, organize, and manage application menus</p>
        </div>

        <!-- Scope Tabs -->
        <div class="tabs">
          <button 
            class="tab" 
            [class.active]="currentScope() === 'platform'"
            (click)="switchScope('platform')"
          >
            <span class="tab-icon">🏢</span>
            Platform Menus ({{ getPlatformCount() }})
          </button>
          <button 
            class="tab" 
            [class.active]="currentScope() === 'tenant'"
            (click)="switchScope('tenant')"
          >
            <span class="tab-icon">👥</span>
            Tenant Menus ({{ getTenantCount() }})
          </button>
        </div>

        <!-- Menu List Section -->
        <div class="section">
          <!-- Loading State -->
          <div *ngIf="isLoading()" class="loading">
            <p>Loading menus...</p>
          </div>

          <!-- Menu Tree View -->
          <div *ngIf="!isLoading() && getFilteredMenus().length > 0" class="menu-tree">
            <div *ngFor="let menu of getFilteredMenus()" class="menu-item-root">
              <div class="menu-item-content" [class.editing]="editingMenu()?.id === menu.id">
                <span class="menu-icon">{{ menu.icon || '📋' }}</span>
                <div class="menu-info">
                  <h4>{{ menu.name }}</h4>
                  <p class="slug">{{ menu.slug }} • Order: {{ menu.orderIndex }}</p>
                </div>
                <div class="menu-meta">
                  <span class="badge" *ngIf="!menu.isActive" style="background-color: #ccc;">Inactive</span>
                  <span class="children-count" *ngIf="menu.children && menu.children.length > 0">
                    {{ menu.children.length }} child{{ menu.children.length > 1 ? 'ren' : '' }}
                  </span>
                </div>
                <div class="menu-actions">
                  <button class="btn-sm btn-edit" (click)="editMenu(menu)">
                    <span>✏️</span> Edit
                  </button>
                </div>
              </div>

              <!-- Child Menus -->
              <div *ngIf="menu.children && menu.children.length > 0" class="menu-children">
                <div *ngFor="let child of menu.children" 
                     class="menu-item-child" 
                     [class.editing]="editingMenu()?.id === child.id">
                  <span class="connector">└─</span>
                  <span class="menu-icon">{{ child.icon || '📄' }}</span>
                  <div class="menu-info">
                    <h5>{{ child.name }}</h5>
                    <p class="slug">{{ child.slug }} • Order: {{ child.orderIndex }}</p>
                  </div>
                  <div class="menu-meta">
                    <span class="badge" *ngIf="!child.isActive" style="background-color: #ccc;">Inactive</span>
                  </div>
                  <div class="menu-actions">
                    <button class="btn-sm btn-edit" (click)="editMenu(child)">
                      <span>✏️</span> Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading() && getFilteredMenus().length === 0" class="empty-state">
            <p>No {{ currentScope() }} menus available.</p>
          </div>
        </div>
      </div>

      <!-- Side Panel for Editing -->
      <div class="side-panel" [class.open]="showForm()">
        <div class="panel-header">
          <h3>
            <span class="panel-icon">✏️</span>
            Edit Menu
          </h3>
          <button class="btn-close" (click)="closeForm()" title="Close panel">✕</button>
        </div>

        <div class="panel-content">
          <form [formGroup]="menuForm" (ngSubmit)="submitForm()">
            <div class="form-group">
              <label>Menu Name *</label>
              <input 
                type="text" 
                formControlName="name" 
                placeholder="e.g., Dashboard, Settings"
                class="form-input"
              >
              <span class="error" *ngIf="menuForm.get('name')?.hasError('required') && menuForm.get('name')?.touched">
                Name is required
              </span>
            </div>

            <div class="form-group">
              <label>Slug *</label>
              <input 
                type="text" 
                formControlName="slug" 
                placeholder="e.g., dashboard, settings"
                class="form-input"
              >
              <span class="error" *ngIf="menuForm.get('slug')?.hasError('required') && menuForm.get('slug')?.touched">
                Slug is required
              </span>
            </div>

            <div class="form-group">
              <label>Scope *</label>
              <select formControlName="scope" class="form-select">
                <option value="platform">Platform</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>

            <div class="form-group">
              <label>Parent Menu</label>
              <select formControlName="parentMenuId" class="form-select">
                <option [value]="null">None (Root Menu)</option>
                <option *ngFor="let menu of getRootMenusForScope()" [value]="menu.id">
                  {{ menu.name }}
                </option>
              </select>
              <span class="help-text">Set parent to create a submenu</span>
            </div>

            <div class="form-group">
              <label>Icon</label>
              <div class="icon-selector">
                <div class="icon-preview">
                  {{ selectedIcon() || '📋' }}
                </div>
                <select (change)="onIconChange($event)" class="form-select" [value]="selectedIcon()">
                  <option value="">Select Icon</option>
                  <option *ngFor="let icon of getAvailableIcons()" [value]="icon">
                    {{ icon }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Route (Read-only)</label>
              <input 
                type="text" 
                formControlName="route" 
                placeholder="e.g., /super-admin/dashboard"
                class="form-input"
                readonly
                title="Route is managed by the system and cannot be edited"
              >
              <span class="help-text">Frontend route path (managed by system)</span>
            </div>

            <div class="form-group">
              <label>Display Order</label>
              <input 
                type="number" 
                formControlName="orderIndex" 
                placeholder="e.g., 1, 2, 3..."
                class="form-input"
                min="0"
              >
              <span class="help-text">Lower numbers appear first</span>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="isActive"
                  class="form-checkbox"
                >
                <span>Active (visible in navigation)</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="!menuForm.valid || isSaving()">
                {{ isSaving() ? 'Saving...' : 'Update Menu' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Overlay when panel is open -->
      <div class="overlay" *ngIf="showForm()" (click)="closeForm()"></div>
    </div>
  `,
  styles: [`
    .menu-management-container {
      display: flex;
      height: calc(100vh - 120px);
      background: #f5f5f5;
      position: relative;
    }

    .menu-management-container.with-panel .main-content {
      margin-right: 420px;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      transition: margin-right 0.3s ease;
      background: #fff;
      border-radius: 8px;
      margin: 16px;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #333;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e0e0e0;
    }

    .tab {
      padding: 12px 24px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      margin-bottom: -2px;
    }

    .tab:hover {
      color: #0066cc;
      background-color: #f5f5f5;
    }

    .tab.active {
      color: #0066cc;
      border-bottom-color: #0066cc;
      font-weight: 600;
    }

    .tab-icon {
      font-size: 18px;
    }

    /* Section */
    .section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background: #fff;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    /* Menu Tree */
    .menu-tree {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .menu-item-root {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 16px;
      background-color: #fafafa;
      transition: all 0.2s;
    }

    .menu-item-root:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .menu-item-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .menu-item-content.editing {
      background-color: #e3f2fd;
      border: 2px solid #0066cc;
    }

    .menu-item-content:hover {
      background-color: #f0f0f0;
    }

    .menu-icon {
      font-size: 24px;
      min-width: 32px;
      text-align: center;
    }

    .menu-info {
      flex: 1;
      min-width: 0;
    }

    .menu-info h4,
    .menu-info h5 {
      margin: 0;
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }

    .menu-info h5 {
      font-size: 14px;
    }

    .slug {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #999;
      font-family: 'Courier New', monospace;
    }

    .menu-meta {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
      background-color: #999;
    }

    .children-count {
      font-size: 12px;
      color: #666;
      padding: 2px 8px;
      background-color: #e0e0e0;
      border-radius: 10px;
    }

    .menu-actions {
      display: flex;
      gap: 6px;
    }

    .btn-sm {
      background-color: #fff;
      color: #333;
      border: 1px solid #ddd;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }

    .btn-sm:hover {
      background-color: #0066cc;
      color: white;
      border-color: #0066cc;
    }

    .btn-edit.editing {
      background-color: #0066cc;
      color: white;
      border-color: #0066cc;
    }

    /* Menu Children */
    .menu-children {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .menu-item-child {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background-color: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      transition: all 0.2s;
    }

    .menu-item-child.editing {
      background-color: #e3f2fd;
      border: 2px solid #0066cc;
    }

    .menu-item-child:hover {
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .connector {
      color: #999;
      font-size: 14px;
      min-width: 20px;
    }

    /* Side Panel */
    .side-panel {
      position: fixed;
      right: -420px;
      top: 0;
      width: 420px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 16px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }

    .side-panel.open {
      right: 0;
    }

    .panel-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f9f9f9;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-icon {
      font-size: 20px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background-color: #f0f0f0;
      color: #333;
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    /* Overlay */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .form-input,
    .form-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .form-input:read-only {
      background-color: #f5f5f5;
      color: #666;
      cursor: not-allowed;
      border-color: #e0e0e0;
    }

    .form-input:read-only:focus {
      border-color: #e0e0e0;
      box-shadow: none;
    }

    .form-checkbox {
      margin-right: 8px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      font-weight: normal;
      cursor: pointer;
      padding: 8px 0;
    }

    .checkbox-label span {
      user-select: none;
    }

    .error {
      display: block;
      color: #d32f2f;
      font-size: 12px;
      margin-top: 6px;
    }

    .help-text {
      display: block;
      color: #666;
      font-size: 12px;
      margin-top: 6px;
      font-style: italic;
    }

    .icon-selector {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .icon-preview {
      font-size: 32px;
      min-width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
    }

    .icon-selector select {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .btn-primary {
      background-color: #0066cc;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0052a3;
      box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background-color: #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .side-panel {
        width: 100%;
        right: -100%;
      }
      
      .menu-management-container.with-panel .main-content {
        margin-right: 0;
      }
    }

    /* Dark Mode Support */
    :host-context(.dark) .menu-management-container,
    :host-context(.dark) .main-content,
    :host-context(.dark) .section {
      background-color: #1e1e1e;
      color: #e0e0e0;
    }

    :host-context(.dark) .header h2,
    :host-context(.dark) .menu-info h4,
    :host-context(.dark) .menu-info h5 {
      color: #e0e0e0;
    }

    :host-context(.dark) .subtitle,
    :host-context(.dark) .slug,
    :host-context(.dark) .help-text {
      color: #999;
    }

    :host-context(.dark) .menu-item-root,
    :host-context(.dark) .section {
      background-color: #2a2a2a;
      border-color: #404040;
    }

    :host-context(.dark) .menu-item-child {
      background-color: #252525;
      border-color: #404040;
    }

    :host-context(.dark) .menu-item-content:hover,
    :host-context(.dark) .menu-item-child:hover {
      background-color: #333;
    }

    :host-context(.dark) .side-panel,
    :host-context(.dark) .panel-header {
      background-color: #1e1e1e;
      border-color: #404040;
    }

    :host-context(.dark) .panel-content {
      background-color: #1e1e1e;
    }

    :host-context(.dark) .form-input,
    :host-context(.dark) .form-select {
      background-color: #2a2a2a;
      border-color: #404040;
      color: #e0e0e0;
    }

    :host-context(.dark) .form-input:focus,
    :host-context(.dark) .form-select:focus {
      border-color: #0066cc;
      background-color: #333;
    }

    :host-context(.dark) .form-input:read-only {
      background-color: #252525;
      color: #888;
      border-color: #404040;
    }

    :host-context(.dark) .icon-preview {
      background-color: #2a2a2a;
      border-color: #404040;
    }

    :host-context(.dark) .btn-sm {
      background-color: #333;
      border-color: #404040;
      color: #e0e0e0;
    }

    :host-context(.dark) .btn-sm:hover {
      background-color: #0066cc;
      border-color: #0066cc;
    }

    :host-context(.dark) .btn-secondary {
      background-color: #333;
      border-color: #404040;
      color: #e0e0e0;
    }

    :host-context(.dark) .btn-secondary:hover {
      background-color: #404040;
    }

    :host-context(.dark) .btn-close:hover {
      background-color: #333;
      color: #e0e0e0;
    }

    :host-context(.dark) .tab {
      color: #999;
    }

    :host-context(.dark) .tab:hover {
      color: #0066cc;
      background-color: #2a2a2a;
    }

    :host-context(.dark) .tab.active {
      color: #0066cc;
    }

    :host-context(.dark) .tabs {
      border-bottom-color: #404040;
    }

    :host-context(.dark) .menu-children {
      border-top-color: #404040;
    }

    :host-context(.dark) .form-actions {
      border-top-color: #404040;
    }

    :host-context(.dark) .overlay {
      background-color: rgba(0, 0, 0, 0.7);
    }

    :host-context(.dark) .menu-item-content.editing,
    :host-context(.dark) .menu-item-child.editing {
      background-color: #1a3a5c;
      border-color: #0066cc;
    }
  `]
})
export class MenuManagementComponent implements OnInit {
  menuForm: FormGroup;
  allMenus = signal<Menu[]>([]);
  menuTree = signal<Menu[]>([]);
  showForm = signal(false);
  editingMenu = signal<Menu | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  selectedIcon = signal<string>('');
  currentScope = signal<'platform' | 'tenant'>('platform');

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService
  ) {
    this.menuForm = this.createForm();
  }

  ngOnInit() {
    this.loadMenus();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      scope: ['platform', Validators.required],
      parentMenuId: [null],
      icon: [''],
      route: [''],
      orderIndex: [0],
      isActive: [true]
    });
  }

  loadMenus() {
    this.isLoading.set(true);
    
    // Load both platform and tenant menus
    this.menuService.getMenuTree().subscribe({
      next: (allMenus) => {
        this.allMenus.set(allMenus);
        this.updateMenuTree();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.isLoading.set(false);
      }
    });
  }

  updateMenuTree() {
    const filtered = this.allMenus().filter(m => m.scope === this.currentScope());
    this.menuTree.set(filtered);
  }

  switchScope(scope: 'platform' | 'tenant') {
    this.currentScope.set(scope);
    this.updateMenuTree();
    this.closeForm(); // Close form when switching scopes
  }

  getFilteredMenus(): Menu[] {
    return this.menuTree();
  }

  getPlatformCount(): number {
    return this.allMenus().filter(m => m.scope === 'platform').length;
  }

  getTenantCount(): number {
    return this.allMenus().filter(m => m.scope === 'tenant').length;
  }

  editMenu(menu: Menu) {
    this.editingMenu.set(menu);
    this.menuForm.patchValue({
      name: menu.name,
      slug: menu.slug,
      scope: menu.scope,
      parentMenuId: menu.parentMenuId || null,
      icon: menu.icon || '',
      route: menu.route || '',
      orderIndex: menu.orderIndex || 0,
      isActive: menu.isActive !== false
    });
    this.selectedIcon.set(menu.icon || '');
    this.showForm.set(true);
    
    // Scroll to top of form in side panel
    setTimeout(() => {
      const panel = document.querySelector('.panel-content');
      if (panel) {
        panel.scrollTop = 0;
      }
    }, 100);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingMenu.set(null);
    this.menuForm.reset(this.createForm().value);
    this.selectedIcon.set('');
  }

  submitForm() {
    if (!this.menuForm.valid || !this.editingMenu()) return;

    const formValue = this.menuForm.value;
    formValue.icon = this.selectedIcon();

    this.isSaving.set(true);
    const menuId = this.editingMenu()!.id!;
    
    this.menuService.updateMenu(menuId, formValue).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.loadMenus();
        this.closeForm();
      },
      error: (error) => {
        console.error('Error updating menu:', error);
        this.isSaving.set(false);
      }
    });
  }

  getRootMenusForScope(): Menu[] {
    // Get root menus for the current scope being edited
    const scope = this.menuForm.get('scope')?.value || 'platform';
    return this.allMenus().filter(m => !m.parentMenuId && m.scope === scope);
  }

  getRootMenus(): Menu[] {
    return this.menuTree().filter(m => !m.parentMenuId);
  }

  getAvailableIcons(): string[] {
    return this.menuService.getAvailableIcons();
  }

  onIconChange(event: any) {
    this.selectedIcon.set(event.target?.value || '');
  }
}
