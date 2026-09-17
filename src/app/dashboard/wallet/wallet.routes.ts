import { Routes } from '@angular/router';
import { WalletDashboardComponent } from './dashboard/wallet-dashboard.component';
import { WalletHistoryComponent } from './history/wallet-history.component';

export const WalletRoutes: Routes = [
  {
    path: '',
    component: WalletDashboardComponent,
    title: 'Wallet - Balance, flows and doors',
  },
  {
    path: 'history',
    component: WalletHistoryComponent,
    title: 'Transaction History - Every naira',
  },
];
