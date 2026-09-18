import { Routes } from '@angular/router';
import { CampaignRoiComponent } from './roi/roi.component';
import { MarketingHomeComponent } from './home/marketing-home.component';

export const MarketingRoutes: Routes = [
  {
    path: '',
    component: MarketingHomeComponent,
    title: 'Marketing - Promote, measure and referrals',
  },
  {
    path: 'roi',
    component: CampaignRoiComponent,
    title: 'Campaign ROI - Spend vs recruits',
  },
];
