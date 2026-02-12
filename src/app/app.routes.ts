import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadComponent: () => import('./components/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: '**',
    redirectTo: 'lista'
  }
];
