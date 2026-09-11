import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TrainingService } from '../../../core/training/training.service';
import { CourseDetail } from '../../../core/training/training.models';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Course detail — read lessons, complete them, earn the certificate.
 *
 * Completing the final lesson mints the certificate and checks the
 * linked ladder milestone in the same request. OnPush + signals, typed.
 */
@Component({
  selector: 'async-training-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a routerLink="../">Training Center</a> &gt;
        <span>{{ course()?.title ?? 'Course' }}</span>
      </div>
    </section>

    <section class="course-page">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      @if (course(); as c) {
        <div class="course-head">
          <div>
            <h2>{{ c.title }}</h2>
            <p class="subtitle">{{ c.tagline }}</p>
          </div>
          @if (c.certified) {
            <p class="certified"><mat-icon>verified</mat-icon> Certified</p>
          } @else {
            <p class="muted">{{ c.done }}/{{ c.total }} lessons</p>
          }
        </div>
        <mat-progress-bar mode="determinate" [value]="c.percent" />

        <ol class="lessons">
          @for (lesson of c.lessons; track lesson.id) {
            <li class="dp-card lesson" [class.lesson--done]="isDone(lesson.id)">
              <div class="lesson-top">
                <strong>{{ lesson.title }}</strong>
                @if (isDone(lesson.id)) {
                  <mat-icon class="done-icon">check_circle</mat-icon>
                } @else {
                  <button mat-button (click)="complete(lesson.id)" [disabled]="completing() !== null">
                    {{ completing() === lesson.id ? 'Saving…' : 'Mark complete' }}
                  </button>
                }
              </div>
              <p>{{ lesson.body }}</p>
              @if (lesson.takeaways.length > 0) {
                <ul class="takeaways">
                  @for (point of lesson.takeaways; track point) {
                    <li>{{ point }}</li>
                  }
                </ul>
              }
            </li>
          }
        </ol>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .course-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .course-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1em; flex-wrap: wrap; }
    .course-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .certified { display: flex; align-items: center; gap: 0.3em; color: var(--dp-success); font-weight: 600; margin: 0; }
    .lessons { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; counter-reset: lesson; }
    .lesson { padding: 1em; }
    .lesson p { margin: 0.5em 0; line-height: 1.6; }
    .lesson-top { display: flex; justify-content: space-between; align-items: center; gap: 0.75em; flex-wrap: wrap; }
    .done-icon { color: var(--dp-success); }
    .takeaways { margin: 0.5em 0 0; padding-left: 1.2em; color: var(--dp-muted); font-size: 0.9em; display: flex; flex-direction: column; gap: 0.2em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .notice { color: var(--dp-success); }
  `],
})
export class TrainingDetailComponent implements OnInit {
  private readonly training = inject(TrainingService);
  private readonly routes = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly completing = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly course = signal<CourseDetail | null>(null);

  ngOnInit(): void {
    this.routes.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('courseId');
        if (id) this.load(id);
      });
  }

  protected courseId(): string {
    return this.routes.snapshot.paramMap.get('courseId') ?? '';
  }

  protected isDone(lessonId: string): boolean {
    return this.course()?.completedIds?.includes(lessonId) ?? false;
  }

  protected load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.training
      .course(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.course.set(res.data ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected reload(): void {
    const id = this.courseId();
    if (id) this.load(id);
  }

  protected complete(lessonId: string): void {
    const id = this.courseId();
    if (!id) return;
    this.completing.set(lessonId);
    this.notice.set(null);
    this.error.set(null);
    this.training
      .completeLesson(id, lessonId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.completing.set(null);
          if (res.data?.certified) {
            this.notice.set(
              res.data.milestoneChecked
                ? `Certified — your ${res.data.milestoneChecked.toUpperCase()} milestone is checked on the ladder.`
                : 'Certified — well done.',
            );
          }
          this.reload();
        },
        error: (err: ApiError) => {
          this.completing.set(null);
          this.error.set(err.message);
        },
      });
  }
}
