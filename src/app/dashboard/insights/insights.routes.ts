import { Routes } from '@angular/router';
import { InsightsOverviewComponent } from './overview/insights.component';
import { TeamReportsComponent } from './team-reports/team-reports.component';

export const InsightsRoutes: Routes = [
  {
    path: '',
    component: InsightsOverviewComponent,
    title: 'Insights - Actions, funnel and team health',
  },
  {
    path: 'team-reports',
    component: TeamReportsComponent,
    title: 'Team Reports - Report up, request down',
  },
];
