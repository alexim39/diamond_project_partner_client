import { Routes } from '@angular/router';
import { TrainingListComponent } from './list/training-list.component';
import { TrainingDetailComponent } from './detail/training-detail.component';

export const TrainingRoutes: Routes = [
  {
    path: '',
    component: TrainingListComponent,
    title: 'Training Center - IPO, QSG, SMO and Leadership',
  },
  {
    path: ':courseId',
    component: TrainingDetailComponent,
    title: 'Course - Lessons and certification',
  },
];
