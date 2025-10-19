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
        path: 'users',
        loadComponent: () => import('./pages/super-admin/users/user-management.component').then(m => m.UserManagementComponent)
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
        path: 'settings',
        loadComponent: () => import('./pages/super-admin/settings/settings.component').then(m => m.SettingsComponent)
      }
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
        path: 'customers',
        loadComponent: () => import('./pages/tenant/customers/tenant-customers.component').then(m => m.TenantCustomersComponent)
      },
      {
        path: 'customers-loans',
        loadChildren: () => import('./modules/money-loan/money-loan.routes').then(m => m.MONEY_LOAN_ROUTES)
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
