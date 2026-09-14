import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TrainingService } from '../../../core/training/training.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatRadioModule, RouterModule],
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
                  <button mat-button (click)="openQuiz(lesson.id)" [disabled]="completing() !== null">
                    {{ openLessonId() === lesson.id ? 'Hide quiz' : 'Take quiz' }}
                  </button>
                }
              </div>
              @if (!isDone(lesson.id) && lesson.videoUrl) {
                <div class="video-wrap">
                  <video
                    [src]="lesson.videoUrl"
                    controls
                    preload="metadata"
                    (timeupdate)="onVideoProgress(lesson.id, $event)"
                    (ended)="onVideoEnded(lesson.id)"
                  ></video>
                  <div class="video-progress">
                    <mat-progress-bar mode="determinate" [value]="watchPercent(lesson.id)" />
                    <span class="muted">{{ watchPercent(lesson.id) | number:'1.0-0' }}% watched</span>
                    @if (!watchedEnough(lesson.id)) {
                      <span class="muted"> · watch to 90% to unlock completion</span>
                    }
                  </div>
                </div>
              } @else if (lesson.videoUrl) {
                <div class="video-wrap">
                  <video [src]="lesson.videoUrl" controls preload="metadata"></video>
                </div>
              }
              @if (!lesson.videoUrl || watchedEnough(lesson.id)) {
                <p>{{ lesson.body }}</p>
              } @else {
                <p class="muted">Watch the video above first.</p>
              }
              @if ((!lesson.videoUrl || watchedEnough(lesson.id)) && lesson.takeaways.length > 0) {
                <ul class="takeaways">
                  @for (point of lesson.takeaways; track point) {
                    <li>{{ point }}</li>
                  }
                </ul>
              }
              @if (!isDone(lesson.id) && (watchedEnough(lesson.id) || !lesson.videoUrl)) {
                @if (openLessonId() === lesson.id && lesson.quiz?.length) {
                  <div class="quiz">
                    @for (q of lesson.quiz; track q.q; let qi = $index) {
                      <div class="quiz-q">
                        <strong>{{ q.q }}</strong>
                        <mat-radio-group [value]="answerFor(lesson.id, q.q)" (change)="pickAnswer(lesson.id, q.q, $event.value)">
                          @for (opt of q.options; track opt) {
                            <mat-radio-button [value]="q.options.indexOf(opt)">{{ opt }}</mat-radio-button>
                          }
                        </mat-radio-group>
                      </div>
                    }
                    @if (quizError(); as err) {
                      <p class="error" role="alert">{{ err }}</p>
                    }
                    <button mat-flat-button color="primary" (click)="complete(lesson.id)" [disabled]="completing() !== null || !canSubmit(lesson)">
                      {{ completing() === lesson.id ? 'Saving…' : 'Submit & mark complete' }}
                    </button>
                  </div>
                }
                @if (openLessonId() === lesson.id && !lesson.quiz?.length) {
                  <button mat-button (click)="complete(lesson.id)" [disabled]="completing() !== null">
                    {{ completing() === lesson.id ? 'Saving…' : 'Mark complete' }}
                  </button>
                }
                @if (openLessonId() !== lesson.id && !lesson.quiz?.length) {
                  <button mat-button (click)="complete(lesson.id)" [disabled]="completing() !== null">
                    {{ completing() === lesson.id ? 'Saving…' : 'Mark complete' }}
                  </button>
                }
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
    .video-wrap { margin: 0.75em 0; display: flex; flex-direction: column; gap: 0.5em; }
    .video-wrap video { width: 100%; max-height: 420px; border-radius: 8px; background: #000; }
    .video-progress { display: flex; align-items: center; gap: 0.5em; }
    .video-progress mat-progress-bar { flex: 1; }
    .quiz { margin-top: 0.75em; display: flex; flex-direction: column; gap: 0.75em; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.9em; }
    .quiz-q { display: flex; flex-direction: column; gap: 0.35em; }
    .quiz-q mat-radio-group { display: flex; flex-direction: column; gap: 0.15em; }
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
  protected readonly openLessonId = signal<string | null>(null);
  protected readonly quizError = signal<string | null>(null);
  private readonly answers = new Map<string, Map<string, number>>();
  protected readonly videoProgress = signal<Record<string, number>>({});
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

  protected watchPercent(lessonId: string): number {
    return this.videoProgress()[lessonId] ?? this.loadWatchPercent(lessonId);
  }

  protected watchedEnough(lessonId: string): boolean {
    return this.watchPercent(lessonId) >= 90;
  }

  protected onVideoProgress(lessonId: string, event: Event): void {
    const el = event.target as HTMLVideoElement;
    if (!el?.duration) return;
    const pct = Math.min(100, Math.round((el.currentTime / el.duration) * 100));
    const prev = this.watchPercent(lessonId);
    if (pct > prev) {
      this.saveWatchPercent(lessonId, pct);
      this.videoProgress.update((m) => ({ ...m, [lessonId]: pct }));
    }
  }

  protected onVideoEnded(lessonId: string): void {
    this.saveWatchPercent(lessonId, 100);
    this.videoProgress.update((m) => ({ ...m, [lessonId]: 100 }));
    const c = this.course();
    const lesson = c?.lessons.find((l) => l.id === lessonId) as { quiz?: Array<unknown> } | undefined;
    if (!lesson?.quiz?.length && !this.isDone(lessonId)) {
      this.complete(lessonId);
    }
  }

  private watchKey(lessonId: string): string {
    return `dp-training-watched:${this.courseId()}:${lessonId}`;
  }

  private loadWatchPercent(lessonId: string): number {
    try {
      const v = Number(localStorage.getItem(this.watchKey(lessonId)));
      return Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : 0;
    } catch { return 0; }
  }

  private saveWatchPercent(lessonId: string, pct: number): void {
    try { localStorage.setItem(this.watchKey(lessonId), String(Math.round(pct))); } catch {}
  }

  protected isDone(lessonId: string): boolean {
    return this.course()?.completedIds?.includes(lessonId) ?? false;
  }

  protected openQuiz(lessonId: string): void {
    this.openLessonId.set(this.openLessonId() === lessonId ? null : lessonId);
    this.quizError.set(null);
  }

  protected pickAnswer(lessonId: string, question: string, value: number): void {
    if (!this.answers.has(lessonId)) this.answers.set(lessonId, new Map());
    this.answers.get(lessonId)?.set(question, Number(value));
    this.quizError.set(null);
  }

  protected answerFor(lessonId: string, question: string): number | null {
    return this.answers.get(lessonId)?.get(question) ?? null;
  }

  protected canSubmit(lesson: { quiz?: Array<{ q: string }>; videoUrl?: string | null }): boolean {
    const quiz = (lesson as { quiz?: Array<{ q: string }> }).quiz ?? [];
    if (lesson.videoUrl && !this.watchedEnough((lesson as { id?: string }).id ?? '')) return false;
    if (quiz.length === 0) return true;
    const lessonId = (lesson as unknown as { id?: string })?.id ?? '';
    const map = this.answers.get(lessonId);
    return quiz.every((q) => map?.has(q.q) ?? false);
  }

  protected load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.training
      .course(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data ?? null;
          this.course.set(data);
          // Restore per-lesson video progress from localStorage so the
          // progress bar and unlock state survive navigations.
          const restored: Record<string, number> = {};
          for (const lesson of data?.lessons ?? []) {
            const id = (lesson as { id?: string }).id;
            if (id) {
              const pct = this.loadWatchPercent(id);
              if (pct > 0) restored[id] = pct;
            }
          }
          this.videoProgress.set(restored);
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
    const course = this.course();
    const target = course?.lessons.find((l) => l.id === lessonId) as unknown as { quiz?: Array<{ q: string; options: string[]; answer: number }>; videoUrl?: string | null } | undefined;
    const quizList = (target as { quiz?: Array<{ q: string; options: string[]; answer: number }> } | undefined)?.quiz ?? [] as Array<{ q: string; options: string[]; answer: number }>;
    // Client-side pre-check — server re-validates (never trust the client alone).
    if (target?.videoUrl && !this.watchedEnough(lessonId)) {
      this.quizError.set('Watch the video before submitting.');
      return;
    }
    if (quizList.length > 0) {
      const map = this.answers.get(lessonId);
      if (!quizList.every((q) => map?.has(q.q) ?? false)) {
        this.quizError.set('Answer every question before submitting.');
        return;
      }
    }
    this.completing.set(lessonId);
    this.notice.set(null);
    this.error.set(null);
    this.quizError.set(null);
    const answers = quizList.length > 0
      ? quizList.map((q) => Number(this.answers.get(lessonId)?.get(q.q) ?? -1))
      : undefined;
    this.training
      .completeLesson(id, lessonId, answers)
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
