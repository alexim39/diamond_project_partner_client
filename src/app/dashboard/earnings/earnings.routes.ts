import { Routes } from '@angular/router';
import { EarningsComponent } from './overview/earnings.component';

export const EarningsRoutes: Routes = [
  {
    path: '',
    component: EarningsComponent,
    title: 'My Earnings - Trends and ledger history',
  },
];
