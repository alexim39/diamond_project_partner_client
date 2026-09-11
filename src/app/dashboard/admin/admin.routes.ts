import { Routes } from '@angular/router';
import { ManageRolesComponent } from './roles/roles.component';
import { PayoutQueueComponent } from './payouts/payouts.component';
import { OversightComponent } from './oversight/oversight.component';
import { adminGuard, g8Guard } from '../../core/auth/role.guard';

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
  {
    // Ladder-gated, not role-gated: G8 is a journey level, not a user role.
    path: 'oversight',
    component: OversightComponent,
    canActivate: [g8Guard],
    title: 'Oversight - Organization leadership',
  },
];
