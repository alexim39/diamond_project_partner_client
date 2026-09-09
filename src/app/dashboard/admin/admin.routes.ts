import { Routes } from '@angular/router';
import { ManageRolesComponent } from './roles/roles.component';
import { PayoutQueueComponent } from './payouts/payouts.component';
import { adminGuard } from '../../core/auth/role.guard';

export const AdminRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      {
        path: 'roles',
        component: ManageRolesComponent,
        title: 'Manage Roles - Admin console',
      },
      {
        path: 'payouts',
        component: PayoutQueueComponent,
        title: 'Payout Queue - Release commissions',
      },
    ],
  },
];
