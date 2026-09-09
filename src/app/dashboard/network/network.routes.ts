import { Routes } from '@angular/router';
import { NetworkTreeComponent } from './tree/tree.component';

export const NetworkRoutes: Routes = [
  {
    path: 'tree',
    component: NetworkTreeComponent,
    title: 'Network Tree - Visualize your downline',
  },
];
