import { Routes } from '@angular/router';
import { ManageRolesComponent } from './roles/roles.component';
import { PayoutQueueComponent } from './payouts/payouts.component';
import { AdminCampaignsComponent } from './campaigns/admin-campaigns.component';
import { AdminWithdrawalsComponent } from './withdrawals/admin-withdrawals.component';
import { AdminReservationsComponent } from './reservations/admin-reservations.component';
import { AdminOrdersComponent } from './orders/admin-orders.component';
import { AdminTrainingQuizzesComponent } from './training-quizzes/admin-training-quizzes.component';
import { AdminAuditComponent } from './audit/admin-audit.component';
import { AdminTicketsComponent } from './tickets/admin-tickets.component';
import { AdminModerationComponent } from './moderation/admin-moderation.component';
import { AdminBroadcastComponent } from './broadcast/admin-broadcast.component';
import { AdminPlanComponent } from './plan/admin-plan.component';
import { AdminProductsComponent } from './products/admin-products.component';
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
      {
        path: 'campaigns',
        component: AdminCampaignsComponent,
        title: 'Ad Campaigns - Run or refund held campaigns',
      },
      {
        path: 'withdrawals',
        component: AdminWithdrawalsComponent,
        title: 'Withdrawals - Pay or refund requests',
      },
      {
        path: 'reservations',
        component: AdminReservationsComponent,
        title: 'Reservation Codes - Review legacy codes',
      },
      {
        path: 'orders',
        component: AdminOrdersComponent,
        title: 'Product Orders - Fulfill or refund orders',
      },
      {
        path: 'training-quizzes',
        component: AdminTrainingQuizzesComponent,
        title: 'Training Quizzes - Edit course questions',
      },
      {
        path: 'audit',
        component: AdminAuditComponent,
        title: 'Audit Log - Admin action history',
      },
      {
        path: 'tickets',
        component: AdminTicketsComponent,
        title: 'Support Tickets - Member request inbox',
      },
      {
        path: 'moderation',
        component: AdminModerationComponent,
        title: 'Moderation - Reported community posts',
      },
      {
        path: 'broadcast',
        component: AdminBroadcastComponent,
        title: 'Broadcast - Platform-wide notices',
      },
      {
        path: 'plan',
        component: AdminPlanComponent,
        title: 'Commission Plan - Unilevel rates',
      },
      {
        path: 'products',
        component: AdminProductsComponent,
        title: 'Products - Catalog editor',
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
