import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'quick-login',
    loadComponent: () => import('./pages/quick-login/quick-login.component').then(m => m.QuickLoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'super-admin',
    canActivate: [authGuard, roleGuard],
    data: { requiredScope: 'platform' },
    loadComponent: () => import('./pages/super-admin/super-admin-layout.component').then(m => m.SuperAdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/super-admin/dashboard/dashboard.component').then(m => m.SuperAdminDashboardComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./pages/super-admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      {
        path: 'system-logs',
        loadComponent: () => import('./pages/super-admin/system-logs/system-logs.component').then(m => m.SystemLogsComponent)
      },
      {
        path: 'tenants',
        loadComponent: () => import('./pages/super-admin/tenants/tenant-list.component').then(m => m.TenantListComponent)
      },
      {
        path: 'tenants/create',
        loadComponent: () => import('./pages/super-admin/tenants/tenant-form.component').then(m => m.TenantFormComponent)
      },
      {
        path: 'tenants/:id',
        loadComponent: () => import('./pages/super-admin/tenants/tenant-detail.component').then(m => m.TenantDetailComponent)
      },
      {
        path: 'tenants/:id/edit',
        loadComponent: () => import('./pages/super-admin/tenants/tenant-form.component').then(m => m.TenantFormComponent)
      },
      {
        path: 'tenant-requests',
        loadComponent: () => import('./pages/super-admin/tenants/tenant-requests.component').then(m => m.TenantRequestsComponent)
      },
      {
        path: 'tenant-analytics',
        loadComponent: () => import('./pages/super-admin/analytics/tenant-analytics.component').then(m => m.TenantAnalyticsComponent)
      },
      // Analytics Routes
      {
        path: 'analytics/overview',
        loadComponent: () => import('./pages/super-admin/analytics/system-overview.component').then(m => m.SystemOverviewComponent)
      },
      {
        path: 'analytics/users',
        loadComponent: () => import('./pages/super-admin/analytics/user-activity.component').then(m => m.UserActivityComponent)
      },
      {
        path: 'analytics/revenue',
        loadComponent: () => import('./pages/super-admin/analytics/revenue-reports.component').then(m => m.RevenueReportsComponent)
      },
      // Subscriptions Routes
      {
        path: 'subscriptions/active',
        loadComponent: () => import('./pages/super-admin/subscriptions/active-subscriptions.component').then(m => m.ActiveSubscriptionsComponent)
      },
      {
        path: 'subscriptions/plans',
        loadComponent: () => import('./pages/super-admin/subscriptions/plan-management.component').then(m => m.PlanManagementComponent)
      },
      {
        path: 'subscriptions/billing',
        loadComponent: () => import('./pages/super-admin/subscriptions/billing-history.component').then(m => m.BillingHistoryComponent)
      },
      // Notifications Routes
      {
        path: 'notifications/send',
        loadComponent: () => import('./pages/super-admin/notifications/send-notification.component').then(m => m.SendNotificationComponent)
      },
      {
        path: 'notifications/history',
        loadComponent: () => import('./pages/super-admin/notifications/notification-history.component').then(m => m.NotificationHistoryComponent)
      },
      // Health Check Routes
      {
        path: 'health/status',
        loadComponent: () => import('./pages/super-admin/health/system-status.component').then(m => m.SystemStatusComponent)
      },
      {
        path: 'health/database',
        loadComponent: () => import('./pages/super-admin/health/database-monitor.component').then(m => m.DatabaseMonitorComponent)
      },
      {
        path: 'health/errors',
        loadComponent: () => import('./pages/super-admin/health/error-logs.component').then(m => m.ErrorLogsComponent)
      },
      // Team Members Route
      {
        path: 'team',
        loadComponent: () => import('./pages/super-admin/team/team-members.component').then(m => m.TeamMembersComponent)
      },
      // Settings Routes
      {
        path: 'settings/general',
        loadComponent: () => import('./pages/super-admin/settings/general-settings.component').then(m => m.GeneralSettingsComponent)
      },
      {
        path: 'settings/api',
        loadComponent: () => import('./pages/super-admin/settings/api-settings.component').then(m => m.ApiSettingsComponent)
      },
      {
        path: 'users/activity',
        loadComponent: () => import('./pages/super-admin/users/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent)
      },
      {
        path: 'users/create',
        loadComponent: () => import('./pages/super-admin/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/super-admin/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/super-admin/users/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'settings/roles',
        loadComponent: () => import('./pages/super-admin/settings/permission-matrix.component').then(m => m.PermissionMatrixComponent)
      },
      {
        path: 'settings/menus',
        loadComponent: () => import('./pages/super-admin/settings/menu-management.component').then(m => m.MenuManagementComponent)
      },
      {
        path: 'settings/email-templates',
        loadComponent: () => import('./pages/super-admin/settings/email-templates.component').then(m => m.EmailTemplatesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/super-admin/settings/settings.component').then(m => m.SettingsComponent)
      },
    ]
  },
  {
    path: 'tenant',
    canActivate: [authGuard, roleGuard],
    data: { requiredScope: 'tenant' },
    loadComponent: () => import('./pages/tenant/tenant-layout.component').then(m => m.TenantLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/tenant/dashboard/dashboard.component').then(m => m.TenantDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/tenant/dashboard/dashboard.component').then(m => m.TenantDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/tenant/users/tenant-users.component').then(m => m.TenantUsersComponent)
      },
      {
        path: 'users/create',
        loadComponent: () => import('./pages/tenant/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/tenant/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/tenant/customers/tenant-customers.component').then(m => m.TenantCustomersComponent)
      },
      {
        path: 'customers/create',
        loadComponent: () => import('./pages/tenant/customers/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () => import('./pages/tenant/customers/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'customers-loans',
        loadChildren: () => import('./modules/money-loan/money-loan.routes').then(m => m.MONEY_LOAN_ROUTES)
      },
      {
        path: 'settings/roles',
        loadComponent: () => import('./pages/tenant/settings/tenant-roles.component').then(m => m.TenantRolesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/tenant/settings/settings.component').then(m => m.TenantSettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
