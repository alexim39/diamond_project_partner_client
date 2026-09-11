import { Routes } from '@angular/router';
import { CommunityFeedComponent } from './feed/community-feed.component';
import { CommunityEventsComponent } from './events/events.component';

export const CommunityRoutes: Routes = [
  {
    path: '',
    component: CommunityFeedComponent,
    title: 'Community - Team feed and recognition',
  },
  {
    path: 'events',
    component: CommunityEventsComponent,
    title: 'Community Events - Gatherings and RSVP',
  },
];
