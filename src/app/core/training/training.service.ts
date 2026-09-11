import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { CertificatesEnvelope, CompleteEnvelope, CourseEnvelope, CoursesEnvelope } from './training.models';

/** Training Center → backend `/v1/training/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly api = inject(ApiClient);

  courses(): Observable<CoursesEnvelope> {
    return this.api.get<CoursesEnvelope>('v1/training/courses');
  }

  course(courseId: string): Observable<CourseEnvelope> {
    return this.api.get<CourseEnvelope>(`v1/training/courses/${courseId}`);
  }

  completeLesson(courseId: string, lessonId: string): Observable<CompleteEnvelope> {
    return this.api.post<CompleteEnvelope>(`v1/training/courses/${courseId}/lessons/${lessonId}/complete`, {});
  }

  certificates(): Observable<CertificatesEnvelope> {
    return this.api.get<CertificatesEnvelope>('v1/training/mine/certificates');
  }
}
