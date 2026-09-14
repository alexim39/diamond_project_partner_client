import { Routes } from '@angular/router';
import { AcademyDashboardComponent } from './dashboard/academy-dashboard.component';
import { LearningPathsComponent } from './paths/learning-paths.component';
import { TrainingLibraryComponent } from './library/training-library.component';
import { TrainingAnalyticsComponent } from './analytics/training-analytics.component';
import { MyCoachComponent } from './coach/my-coach.component';
import { TrainingListComponent } from './list/training-list.component';
import { TrainingDetailComponent } from './detail/training-detail.component';

export const TrainingRoutes: Routes = [
  {
    path: '',
    component: AcademyDashboardComponent,
    title: 'Leadership Academy & Development Center - Your learning journey',
  },
  {
    path: 'paths',
    component: LearningPathsComponent,
    title: 'Learning Paths - 10 rank journeys',
  },
  {
    path: 'library',
    component: TrainingLibraryComponent,
    title: 'Training Library - Search and bookmarks',
  },
  {
    path: 'analytics',
    component: TrainingAnalyticsComponent,
    title: 'Training Analytics - Completion and pipeline',
  },
  {
    path: 'coach',
    component: MyCoachComponent,
    title: 'My Coach - Mentorship and notes',
  },
  {
    path: 'courses',
    component: TrainingListComponent,
    title: 'Courses - IPO, QSG, SMO and Leadership',
  },
  {
    path: ':courseId',
    component: TrainingDetailComponent,
    title: 'Course - Lessons and certification',
  },
];
