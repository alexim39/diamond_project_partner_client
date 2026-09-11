import { Routes } from '@angular/router';
import { CampaignRoiComponent } from './roi/roi.component';

export const MarketingRoutes: Routes = [
  {
    path: 'roi',
    component: CampaignRoiComponent,
    title: 'Campaign ROI - Spend vs recruits',
  },
];
