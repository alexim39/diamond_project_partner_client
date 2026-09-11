import { Routes } from '@angular/router';
import { CommunityFeedComponent } from './feed/community-feed.component';

export const CommunityRoutes: Routes = [
  {
    path: '',
    component: CommunityFeedComponent,
    title: 'Community - Team feed and recognition',
  },
];
