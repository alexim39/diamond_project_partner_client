import { Routes } from '@angular/router';
import { NetworkTreeComponent } from './tree/tree.component';
import { OrgChartComponent } from './org/org.component';

export const NetworkRoutes: Routes = [
  {
    path: 'tree',
    component: NetworkTreeComponent,
    title: 'Network Tree - Visualize your downline',
  },
  {
    path: 'org',
    component: OrgChartComponent,
    title: 'Org Chart - Levels and span of control',
  },
];
