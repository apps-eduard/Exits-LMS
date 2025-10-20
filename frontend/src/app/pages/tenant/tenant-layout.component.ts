import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TenantService } from '../../core/services/tenant.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: NavItem[];
  description?: string;
  permission?: string;
}

interface NavSection {
  title: string;
  description?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-tenant-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './tenant-layout.component.html',
  styleUrls: ['./tenant-layout.component.scss']
})
export class TenantLayoutComponent implements OnInit {
  readonly sidebarOpen = signal(true);
  readonly showUserMenu = signal(false);
  readonly currentTenant = signal<any>(null);
  readonly tenantLoading = signal(true);
  readonly expandedSections = signal<Set<string>>(new Set());
  readonly expandedItems = signal<Set<string>>(new Set());
  
  currentUser: User | null = null;

  // Improved tenant navigation structure
  readonly navSections = signal<NavSection[]>([
    {
      title: 'Dashboard & Overview',
      description: 'Quick snapshot of daily activity',
      items: [
        { 
          label: 'Dashboard', 
          icon: '🏠', 
          route: '/tenant/dashboard',
          description: 'Daily activity overview'
        },
        {
          label: 'Analytics',
          icon: '📊',
          route: '/tenant/analytics',
          description: 'Performance trends and insights'
        }
      ]
    },
    {
      title: 'Customer Management',
      description: 'Manage borrowers and borrower profiles',
      items: [
        { 
          label: 'All Customers', 
          icon: '👥', 
          route: '/tenant/customers',
          description: 'View all borrowers under this tenant'
        },
        { 
          label: 'Add New Customer', 
          icon: '➕', 
          route: '/tenant/customers/create',
          description: 'Register new borrower'
        },
        { 
          label: 'Customer Profiles',
          icon: '👤',
          route: '/tenant/customers/profiles',
          description: 'Personal info, history, balances'
        },
        {
          label: 'Search & Filter',
          icon: '🔍',
          route: '/tenant/customers/search',
          description: 'Find by name, ID, or contact'
        }
      ]
    },
    {
      title: 'Loan Management',
      description: 'Create, approve, and track loans',
      items: [
        { 
          label: 'New Loan Application', 
          icon: '📝', 
          route: '/tenant/loans/create',
          description: 'Create or approve a loan'
        },
        { 
          label: 'Active Loans', 
          icon: '💰', 
          route: '/tenant/loans/active',
          description: 'Currently running loans',
          badge: 0
        },
        { 
          label: 'Pending Approvals', 
          icon: '⏳', 
          route: '/tenant/loans/pending',
          description: 'Awaiting approval',
          badge: 0
        },
        { 
          label: 'Fully Paid', 
          icon: '✅', 
          route: '/tenant/loans/paid',
          description: 'Closed/completed loans'
        },
        { 
          label: 'Overdue Loans', 
          icon: '⚠️', 
          route: '/tenant/loans/overdue',
          description: 'Past due date',
          badge: 0
        },
        {
          label: 'Loan Actions',
          icon: '⚙️',
          children: [
            { label: 'Approve', icon: '✔️', description: 'Approve pending loans' },
            { label: 'Reject', icon: '❌', description: 'Reject applications' },
            { label: 'Edit', icon: '✏️', description: 'Modify loan details' },
            { label: 'Renew', icon: '🔄', description: 'Renew loan terms' },
            { label: 'Print Contract', icon: '🖨️', description: 'Generate contract' }
          ],
          description: 'Loan operations'
        }
      ]
    },
    {
      title: 'Collections & Payments',
      description: 'Track payments and collections',
      items: [
        { 
          label: 'Record Payment', 
          icon: '💳', 
          route: '/tenant/payments/new',
          description: 'Record daily or automatic payment'
        },
        { 
          label: 'Payment History', 
          icon: '📋', 
          route: '/tenant/payments/history',
          description: 'All payment records per loan'
        },
        { 
          label: 'Collections Summary', 
          icon: '📊', 
          route: '/tenant/payments/summary',
          description: 'Daily, weekly, monthly summary'
        },
        {
          label: 'Export Reports',
          icon: '📥',
          route: '/tenant/payments/export',
          description: 'CSV/PDF financial reports'
        }
      ]
    },
    {
      title: 'Optional Features',
      description: 'Module-specific management',
      items: [
        { 
          label: 'Pawn/Collateral', 
          icon: '💍', 
          route: '/tenant/pawnshop',
          description: 'Pawned items, appraisals, redemption',
          permission: 'pawnshop'
        },
        { 
          label: 'BNPL Orders', 
          icon: '🛒', 
          route: '/tenant/bnpl',
          description: 'Buy-now-pay-later orders',
          permission: 'bnpl'
        }
      ]
    },
    {
      title: 'Reports & Analytics',
      description: 'Performance insights and trends',
      items: [
        { 
          label: 'Loan Performance', 
          icon: '📈', 
          route: '/tenant/reports/loans',
          description: 'Summary and trends'
        },
        { 
          label: 'Collection Efficiency', 
          icon: '💹', 
          route: '/tenant/reports/efficiency',
          description: 'Collection rate and metrics'
        },
        { 
          label: 'Customer Trends', 
          icon: '🎯', 
          route: '/tenant/reports/customers',
          description: 'Customer growth and segmentation'
        },
        {
          label: 'Export Financial Summary',
          icon: '📥',
          route: '/tenant/reports/export',
          description: 'Download comprehensive reports'
        },
        {
          label: 'Branch Comparison',
          icon: '🏢',
          route: '/tenant/reports/branches',
          description: 'Performance per branch',
          permission: 'multi-branch'
        },
        {
          label: 'Loan Officer Performance',
          icon: '👨‍💼',
          route: '/tenant/reports/officers',
          description: 'Per loan officer metrics'
        }
      ]
    },
    {
      title: 'Staff Management',
      description: 'Internal users and permissions',
      items: [
        { 
          label: 'All Users', 
          icon: '👥', 
          route: '/tenant/users',
          description: 'Manage internal staff'
        },
        { 
          label: 'Add User', 
          icon: '➕', 
          route: '/tenant/users/create',
          description: 'Register new staff member'
        },
        {
          label: 'Roles Setup',
          icon: '🔑',
          children: [
            { label: 'Manager', icon: '👔', description: 'Full access & approvals' },
            { label: 'Loan Officer', icon: '📋', description: 'Create & manage loans' },
            { label: 'Cashier', icon: '💳', description: 'Record payments' },
            { label: 'Viewer', icon: '👁️', description: 'Read-only access' }
          ],
          description: 'Role and permission management'
        },
        {
          label: 'Activity Tracking',
          icon: '📝',
          route: '/tenant/users/activity',
          description: 'Last login, actions, status'
        }
      ]
    },
    {
      title: 'Branch Management',
      description: 'Multi-branch configuration',
      items: [
        { 
          label: 'Branches', 
          icon: '🏢', 
          route: '/tenant/branches',
          description: 'Add/edit branches',
          permission: 'multi-branch'
        },
        { 
          label: 'Assign Staff', 
          icon: '👥', 
          route: '/tenant/branches/staff',
          description: 'Assign users to branches',
          permission: 'multi-branch'
        },
        {
          label: 'Branch Performance',
          icon: '📊',
          route: '/tenant/branches/performance',
          description: 'Monitor per branch',
          permission: 'multi-branch'
        }
      ]
    },
    {
      title: 'Settings',
      description: 'Organization and configuration',
      items: [
        { 
          label: 'Organization Profile', 
          icon: '🏢', 
          route: '/tenant/settings/profile',
          description: 'Company info, logo, address'
        },
        { 
          label: 'Loan Settings', 
          icon: '💰', 
          route: '/tenant/settings/loans',
          description: 'Interest rates, terms, penalties'
        },
        {
          label: 'Notification Settings',
          icon: '🔔',
          route: '/tenant/settings/notifications',
          description: 'SMS, email preferences'
        },
        {
          label: 'Integrations',
          icon: '🔗',
          route: '/tenant/settings/integrations',
          description: 'Payment gateways, SMS API'
        }
      ]
    },
    {
      title: 'Subscription & Billing',
      description: 'Plan and payment information',
      items: [
        { 
          label: 'Current Plan', 
          icon: '📋', 
          route: '/tenant/subscription/plan',
          description: 'Show active subscription details'
        },
        { 
          label: 'Renewal & Payment', 
          icon: '💳', 
          route: '/tenant/subscription/renewal',
          description: 'Renewal date, payment method'
        },
        {
          label: 'Upgrade/Downgrade',
          icon: '⬆️',
          route: '/tenant/subscription/change',
          description: 'Change subscription plan'
        }
      ]
    }
  ]);

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTenantInfo();
    this.expandedSections.set(new Set(['Dashboard & Overview']));
  }

  loadTenantInfo(): void {
    const user = this.authService.getCurrentUser();
    const tenantId = user?.tenantId;
    
    console.log('📍 [TENANT_LAYOUT] Loading tenant info for:', tenantId);
    
    if (tenantId) {
      this.tenantService.getTenantById(tenantId).subscribe({
        next: (response) => {
          if (response.success) {
            this.currentTenant.set(response.tenant);
            console.log('✅ [TENANT_LAYOUT] Tenant loaded:', response.tenant.name);
          }
          this.tenantLoading.set(false);
        },
        error: (error) => {
          console.error('❌ [TENANT_LAYOUT] Error loading tenant:', error);
          this.tenantLoading.set(false);
        }
      });
    } else {
      console.warn('⚠️ [TENANT_LAYOUT] No tenant ID found in user');
      this.tenantLoading.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(open => !open);
  }

  toggleSection(sectionTitle: string): void {
    const expanded = new Set(this.expandedSections());
    if (expanded.has(sectionTitle)) {
      expanded.delete(sectionTitle);
    } else {
      expanded.add(sectionTitle);
    }
    this.expandedSections.set(expanded);
  }

  toggleItem(itemLabel: string): void {
    const expanded = new Set(this.expandedItems());
    if (expanded.has(itemLabel)) {
      expanded.delete(itemLabel);
    } else {
      expanded.add(itemLabel);
    }
    this.expandedItems.set(expanded);
  }

  isSectionExpanded(sectionTitle: string): boolean {
    return this.expandedSections().has(sectionTitle);
  }

  isItemExpanded(itemLabel: string): boolean {
    return this.expandedItems().has(itemLabel);
  }

  getInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.firstName?.[0] || '';
    const last = this.currentUser.lastName?.[0] || '';
    return (first + last).toUpperCase();
  }

  getTenantInitials(): string {
    const tenant = this.currentTenant();
    if (!tenant?.name) return 'TA';
    return tenant.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getTenantName(): string {
    const tenant = this.currentTenant();
    return tenant?.name || 'Tenant Admin';
  }

  hasModule(moduleName: string): boolean {
    return this.authService.hasModule(moduleName);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

