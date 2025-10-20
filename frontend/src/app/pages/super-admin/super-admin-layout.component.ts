import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: NavItem[];
  description?: string;
}

interface NavSection {
  title: string;
  description?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './super-admin-layout.component.html',
  styleUrl: './super-admin-layout.component.scss'
})
export class SuperAdminLayoutComponent implements OnInit {
  readonly sidebarOpen = signal(true);
  readonly showUserMenu = signal(false);
  readonly expandedSections = signal<Set<string>>(new Set());
  readonly expandedItems = signal<Set<string>>(new Set());
  user: any = null;

  // Improved navigation structure with better organization
  readonly navSections = signal<NavSection[]>([
    {
      title: 'Overview',
      description: 'System Dashboard & Quick Stats',
      items: [
        { 
          label: 'Dashboard', 
          icon: '🏠', 
          route: '/super-admin/dashboard',
          description: 'Quick stats: tenants, users, loans, system health'
        },
        { 
          label: 'Analytics', 
          icon: '📊', 
          route: '/super-admin/analytics',
          description: 'System-wide performance & trends'
        }
      ]
    },
    {
      title: 'Tenant Management',
      description: 'Manage all tenant companies',
      items: [
        { 
          label: 'All Tenants', 
          icon: '🏢', 
          route: '/super-admin/tenants',
          description: 'Complete tenant directory'
        },
        { 
          label: 'Active Tenants', 
          icon: '✅', 
          route: '/super-admin/tenants?status=active',
          description: 'Currently subscribed & operating'
        },
        { 
          label: 'Suspended Tenants', 
          icon: '⏸️', 
          route: '/super-admin/tenants?status=suspended',
          description: 'Overdue or inactive'
        },
        { 
          label: 'Create New Tenant', 
          icon: '➕', 
          route: '/super-admin/tenants/create',
          description: 'Register new company'
        },
        { 
          label: 'Tenant Profiles', 
          icon: '📋', 
          route: '/super-admin/tenants/profiles',
          description: 'Detailed tenant information'
        }
      ]
    },
    {
      title: 'Users & Access Control',
      description: 'Tenant admins, permissions, and roles',
      items: [
        { 
          label: 'Tenant Admins', 
          icon: '👤', 
          route: '/super-admin/tenant-admins',
          description: 'All tenant administrators'
        },
        { 
          label: 'Admin Actions',
          icon: '🔐',
          children: [
            { label: 'View Tenant', icon: '👁️', description: 'Access tenant details' },
            { label: 'Suspend/Activate', icon: '🔒', description: 'Control admin access' },
            { label: 'Reset Password', icon: '🔑', description: 'Force password reset' }
          ],
          description: 'Manage admin privileges'
        },
        { 
          label: 'Roles & Permissions', 
          icon: '👥', 
          route: '/super-admin/users/roles',
          description: 'RBAC configuration'
        }
      ]
    },
    {
      title: 'Subscriptions & Billing',
      description: 'Plans, payments, and renewals',
      items: [
        { 
          label: 'Pricing Plans', 
          icon: '💰', 
          route: '/super-admin/subscriptions/plans',
          description: 'Free, Basic, Pro, Enterprise'
        },
        { 
          label: 'Active Subscriptions', 
          icon: '📋', 
          route: '/super-admin/subscriptions',
          description: 'All current subscriptions'
        },
        { 
          label: 'Payment Status', 
          icon: '💳', 
          route: '/super-admin/subscriptions/payments',
          description: 'Payment tracking & status'
        },
        { 
          label: 'Renewals', 
          icon: '🔄', 
          route: '/super-admin/subscriptions/renewals',
          description: 'Upcoming renewals'
        }
      ]
    },
    {
      title: 'Reports & Analytics',
      description: 'System-wide insights and data',
      items: [
        { 
          label: 'System Reports', 
          icon: '📈', 
          route: '/super-admin/reports',
          description: 'Overall system performance'
        },
        { 
          label: 'Loan Analytics', 
          icon: '💵', 
          route: '/super-admin/reports/loans',
          description: 'Total loans, performance metrics'
        },
        { 
          label: 'Payment Tracking', 
          icon: '📊', 
          route: '/super-admin/reports/payments',
          description: 'Collections and payment reports'
        },
        { 
          label: 'Usage by Plan', 
          icon: '📉', 
          route: '/super-admin/reports/usage',
          description: 'Feature usage per subscription'
        },
        { 
          label: 'Tenant Performance', 
          icon: '🎯', 
          route: '/super-admin/reports/tenant-performance',
          description: 'Most active tenants & trends'
        }
      ]
    },
    {
      title: 'System Settings',
      description: 'Configuration and administration',
      items: [
        { 
          label: 'System Settings', 
          icon: '⚙️', 
          route: '/super-admin/settings',
          description: 'General configuration'
        },
        { 
          label: 'Role Management', 
          icon: '👑', 
          route: '/super-admin/settings/roles',
          description: 'Create & manage roles, permissions & menu access'
        },
        { 
          label: 'Email Templates', 
          icon: '✉️', 
          route: '/super-admin/settings/email-templates',
          description: 'Onboarding, alerts, notifications'
        },
        { 
          label: 'Global Configuration', 
          icon: '🌐', 
          route: '/super-admin/settings/global-config',
          description: 'Currency, timezone, branding'
        },
        { 
          label: 'Branding', 
          icon: '🎨', 
          route: '/super-admin/settings/branding',
          description: 'Logos and visual settings'
        }
      ]
    },
    {
      title: 'System Team',
      description: 'Internal users and support staff',
      items: [
        { 
          label: 'Team Members', 
          icon: '👔', 
          route: '/super-admin/users',
          description: 'Support staff, developers'
        },
        {
          label: 'User Management',
          icon: '⚙️',
          children: [
            { label: 'Add User', icon: '➕', route: '/super-admin/users/create', description: 'Register new team member' },
            { label: 'Edit User', icon: '✏️', route: '/super-admin/users/edit', description: 'Modify user details' },
            { label: 'Deactivate', icon: '⛔', route: '/super-admin/users/deactivate', description: 'Disable user account' },
            { label: 'Assign Role', icon: '🔐', route: '/super-admin/users/roles', description: 'Change user role' }
          ],
          description: 'Manage team member accounts'
        },
        { 
          label: 'Activity Logs', 
          icon: '📝', 
          route: '/super-admin/logs',
          description: 'Team member actions'
        }
      ]
    },
    {
      title: 'Monitoring & Compliance',
      description: 'Alerts, logs, and security',
      items: [
        { 
          label: 'Notifications Center', 
          icon: '🔔', 
          route: '/super-admin/notifications',
          description: 'System alerts and events'
        },
        { 
          label: 'Audit Logs', 
          icon: '📋', 
          route: '/super-admin/audit-logs',
          description: 'Critical activities (compliance)'
        },
        { 
          label: 'System Health', 
          icon: '❤️', 
          route: '/super-admin/system-health',
          description: 'Database, API, backup status'
        },
        { 
          label: 'Security Events', 
          icon: '🛡️', 
          route: '/super-admin/security',
          description: 'Failed logins, suspicious activity'
        }
      ]
    }
  ]);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    // Expand first section by default
    this.expandedSections.set(new Set(['Overview']));
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.user) return 'SA';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
