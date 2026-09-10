import { Routes } from '@angular/router';
import { InsightsOverviewComponent } from './overview/insights.component';

export const InsightsRoutes: Routes = [
  {
    path: '',
    component: InsightsOverviewComponent,
    title: 'Insights - Actions, funnel and team health',
  },
];
