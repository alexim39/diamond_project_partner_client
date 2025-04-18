import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';

export const routes: Routes = [
  // { path: '', component: IndexComponent },
  { path: '', loadChildren: () => import('./index/index-routes').then(r => r.IndexRoutes) },
  //{ path: 'auth', loadChildren: () => import('./auth/auth-routes').then(r => r.authRoutes) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/partner/dashboard-routes').then(r => r.dashboardRoutes) },

  // should be the last path on routes
  {path: '**', component: PageNotFoundComponent}

];
