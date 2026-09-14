import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { TrainingService } from '../../../core/training/training.service';
import { ApiError } from '../../../core/http/api-error';

interface PathRow {
  level: string; title: string; tagline: string; unlocked: boolean;
  progress: { done: number; total: number; percent: number };
  requirements: Array<{ key: string; label: string; action: string; met: boolean; courseId: string | null }>;
}

/**
 * @title Learning Paths — the 10 rank journeys.
 *
 * Each card is the gate to a rank: checklist + progress + lock state.
 * Derived from the same gate() that powers My Journey, so the checklists
 * never diverge. Unlock is rank-order — prior ranks must be earned.
 * OnPush + signals, fully typed, fail-soft.
 */
@Component({
  selector: 'async-learning-paths',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a routerLink="/dashboard/training">Academy</a> &gt;
        <span>Learning Paths</span>
      </div>
    </section>

    <section class="paths-page">
      <div class="page-head">
        <div>
          <h2>Learning Paths</h2>
          <p class="subtitle">10 ranks, one checklist each — unlock the next by earning the last.</p>
        </div>
        <a mat-button routerLink="/dashboard/training">Back to dashboard</a>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (paths().length > 0) {
        <div class="path-grid">
          @for (p of paths(); track p.level) {
            <mat-card class="path-card" [class.path-card--locked]="!p.unlocked" [class.path-card--done]="p.progress.percent === 100">
              <mat-card-content>
                <div class="path-top">
                  <strong>{{ p.title }}</strong>
                  @if (!p.unlocked) {
                    <mat-chip highlighted><mat-icon>lock</mat-icon> Locked</mat-chip>
                  } @else if (p.progress.percent === 100) {
                    <mat-chip highlighted><mat-icon>verified</mat-icon> Ready</mat-chip>
                  } @else {
                    <span class="muted">{{ p.progress.percent }}%</span>
                  }
                </div>
                <p class="muted">{{ p.tagline }}</p>
                @if (p.unlocked) {
                  <mat-progress-bar mode="determinate" [value]="p.progress.percent" />
                  @if (p.requirements.length > 0) {
                    <ul class="reqs">
                      @for (r of p.requirements; track r.key) {
                        <li [class.done]="r.met">
                          <mat-icon>{{ r.met ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                          <span>{{ r.label }}</span>
                          @if (r.courseId) {
                            <a mat-button [routerLink]="['/dashboard/training/courses', r.courseId]">Open</a>
                          }
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="muted">No extra requirements — keep building.</p>
                  }
                } @else {
                  <p class="muted">Finish the prior rank to unlock this path.</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .paths-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .page-head a { min-height: 44px; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .path-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.75em; }
    .path-card mat-card-content { display: flex; flex-direction: column; gap: 0.6em; }
    .path-card--locked { opacity: 0.65; }
    .path-card--done { border-left: 4px solid var(--dp-success); }
    .path-top { display: flex; justify-content: space-between; align-items: center; gap: 0.6em; }
    .path-top mat-chip mat-icon { font-size: 16px; height: 16px; width: 16px; }
    .reqs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .reqs li { display: flex; align-items: center; gap: 0.5em; padding: 0.35em 0; border-top: 1px solid var(--dp-line); }
    .reqs li:first-child { border-top: none; }
    .reqs li.done { opacity: 0.65; }
    .reqs li.done mat-icon { color: var(--dp-success); }
    .reqs li a { margin-left: auto; min-height: 44px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    html[data-theme='dark'] .error { color: #e89a9a; }
  `],
})
export class LearningPathsComponent implements OnInit {
  private readonly training = inject(TrainingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly paths = signal<PathRow[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.training
      .paths()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.paths.set(res.data ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
