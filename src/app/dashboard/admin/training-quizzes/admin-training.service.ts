import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../core/auth/auth.models';

export interface AdminQuizCatalog {
  id: string;
  title: string;
  lessons: Array<{ id: string; title: string; quizCount: number }>;
}

export interface AdminQuizRow {
  courseId: string;
  lessonId: string;
  quiz: Array<{ q: string; options: string[]; answer: number }>;
}

@Injectable({ providedIn: 'root' })
export class AdminTrainingService {
  private readonly api = inject(ApiClient);

  catalog(): Observable<ApiEnvelope<AdminQuizCatalog[]>> {
    return this.api.get<ApiEnvelope<AdminQuizCatalog[]>>('v1/admin/training/catalog');
  }

  list(): Observable<ApiEnvelope<AdminQuizRow[]>> {
    return this.api.get<ApiEnvelope<AdminQuizRow[]>>('v1/admin/training/quizzes');
  }

  save(courseId: string, lessonId: string, quiz: AdminQuizRow['quiz']): Observable<ApiEnvelope<AdminQuizRow>> {
    return this.api.put<ApiEnvelope<AdminQuizRow>>(`v1/admin/training/courses/${courseId}/lessons/${lessonId}/quiz`, quiz);
  }
}
