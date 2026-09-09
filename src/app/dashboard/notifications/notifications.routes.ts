import { Routes } from '@angular/router';
import { NotificationsCenterComponent } from './center/center.component';

export const NotificationsRoutes: Routes = [
  {
    path: 'center',
    component: NotificationsCenterComponent,
    title: 'Notifications - Follow-ups, payouts and conversions',
  },
];
