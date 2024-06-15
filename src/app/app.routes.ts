import { Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { PageNotFoundComponent } from './page-not-found.component';

export const routes: Routes = [
    { path: '', component: IndexComponent },
    { path: 'auth', loadChildren: () => import('./auth/auth-routes').then(r => r.authRoutes) },

    // should be the last path on routes
  {path: '**', component: PageNotFoundComponent}

];
