import { Routes } from '@angular/router';

export const MONEY_LOAN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./components/customer-list.component').then(m => m.CustomerListComponent)
  }
];
