import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GoalService } from '../../../core/goals/goal.service';
import { GOAL_KIND_LABELS, Goal, GoalKind, TrendBucket } from '../../../core/goals/goal.models';
import { ApiError } from '../../../core/http/api-error';

const UNIT_LABELS: Record<GoalKind, string> = {
  sales: 'sales volume',
  recruitment: 'recruits',
  team_volume: 'team volume',
  conversion: 'conversions',
};

const toInputDate = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * @title My goals — target definitions with live progress + sales trends.
 *
 * Progress numerators are computed server-side from source aggregates
 * (orders, recruits, prospects, network) — this page only renders them.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-goals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, MatButtonModule, MatChipsModule, MatIconModule, MatInputModule,
    MatProgressBarModule, MatSelectModule, ReactiveFormsModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>My Goals</span>
      </div>
    </section>

    <section class="goals-page">
      <div class="page-head">
        <div>
          <h2>My Goals</h2>
          <p class="subtitle">
            @if (completeCount() > 0) {
              <strong class="done">{{ completeCount() }} complete.</strong>
            }
            @if (behindCount() > 0) {
              <strong class="behind">{{ behindCount() }} behind pace.</strong>
            }
            @if (completeCount() === 0 && behindCount() === 0 && !loading()) {
              Set a target below to start tracking.
            }
          </p>
        </div>
        <button mat-button (click)="toggleForm()">{{ showForm() ? 'Cancel' : 'New goal' }}</button>
      </div>

      @if (showForm()) {
        <form class="goal-form" [formGroup]="form" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g. September sales push" maxlength="120" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Goal type</mat-label>
            <mat-select formControlName="kind">
              @for (k of kinds; track k) {
                <mat-option [value]="k">{{ kindLabel(k) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Target</mat-label>
            <input matInput type="number" min="1" formControlName="target" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Start</mat-label>
            <input matInput type="date" formControlName="startDate" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End</mat-label>
            <input matInput type="date" formControlName="endDate" />
          </mat-form-field>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save goal' }}
            </button>
            @if (formError(); as err) {
              <span class="error" role="alert">{{ err }}</span>
            }
          </div>
        </form>
      }

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (goals().length > 0) {
        <ul class="goal-list">
          @for (goal of goals(); track goal.id) {
            <li class="goal-card" [class.goal-card--complete]="goal.progress.complete">
              <div class="goal-top">
                <div>
                  <strong>{{ goal.title }}</strong>
                  <span class="muted"> · {{ kindLabel(goal.kind) }}</span>
                </div>
                <mat-chip
                  [style.background]="status(goal).color"
                  [style.color]="status(goal).text"
                  highlighted
                >{{ status(goal).label }}</mat-chip>
              </div>
              <mat-progress-bar mode="determinate" [value]="goal.progress.percent" />
              <div class="goal-meta">
                <span>{{ goal.progress.current | number }} / {{ goal.target | number }} {{ unit(goal.kind) }}</span>
                <span class="muted">{{ goal.progress.daysLeft }} days left</span>
                <button
                  mat-button
                  color="warn"
                  (click)="remove(goal.id)"
                  [disabled]="deletingId() === goal.id"
                  aria-label="Delete {{ goal.title }}"
                >Delete</button>
              </div>
            </li>
          }
        </ul>
      } @else if (!loading() && !error()) {
        <p class="empty">No goals yet — create your first one above.</p>
      }

      @if (trends().length > 0) {
        <div class="trends">
          <h3>Sales trend — last {{ trends().length }} months</h3>
          <div class="bars" role="img" aria-label="Monthly personal sales volume">
            @for (b of trends(); track b.label) {
              <div class="bar-col">
                <div class="bar-track">
                  <div class="bar-fill" [style.height.%]="barHeight(b)"></div>
                </div>
                <span class="bar-label">{{ b.label }}</span>
                <span class="bar-value">{{ b.total | number }}</span>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .goals-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: #666; }
    .done { color: #1b5e20; }
    .behind { color: #d32f2f; }
    .goal-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75em; background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; grid-column: 1 / -1; }
    .goal-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .goal-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.6em; }
    .goal-card--complete { border-left: 4px solid #2e7d32; }
    .goal-top { display: flex; justify-content: space-between; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .goal-meta { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; font-size: 0.9em; }
    .muted { color: #777; font-size: 0.85em; }
    .error { color: #d32f2f; }
    .empty { color: #666; }
    .trends { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1em; }
    .trends h3 { margin: 0 0 0.75em; font-size: 1em; }
    .bars { display: flex; gap: 1em; align-items: stretch; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25em; }
    .bar-track { height: 120px; width: 100%; max-width: 64px; background: #f1f3f4; border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; }
    .bar-fill { width: 100%; background: #3f51b5; border-radius: 6px 6px 0 0; min-height: 2px; }
    .bar-label { font-size: 0.8em; color: #555; }
    .bar-value { font-size: 0.8em; font-weight: 600; }
  `],
})
export class GoalsComponent implements OnInit {
  private readonly goalsApi = inject(GoalService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly goals = signal<Goal[]>([]);
  protected readonly trends = signal<TrendBucket[]>([]);

  protected readonly kinds: GoalKind[] = ['sales', 'recruitment', 'team_volume', 'conversion'];

  protected readonly completeCount = computed(() => this.goals().filter((g) => g.progress.complete).length);
  protected readonly behindCount = computed(
    () => this.goals().filter((g) => !g.progress.complete && !g.progress.onTrack).length,
  );
  protected readonly maxTrend = computed(() => Math.max(1, ...this.trends().map((b) => b.total)));

  protected readonly form = this.fb.nonNullable.group({
    title: [''],
    kind: ['sales' as GoalKind, Validators.required],
    target: [100, [Validators.required, Validators.min(1)]],
    startDate: [toInputDate(new Date()), Validators.required],
    endDate: [toInputDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)), Validators.required],
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ goals: this.goalsApi.mine(), trends: this.goalsApi.trends() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ goals, trends }) => {
          this.goals.set(goals.data ?? []);
          this.trends.set(trends.data?.buckets ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected toggleForm(): void {
    this.showForm.set(!this.showForm());
    this.formError.set(null);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set(null);
    const v = this.form.getRawValue();
    this.goalsApi
      .create({ title: v.title.trim(), kind: v.kind, target: Number(v.target), startDate: v.startDate, endDate: v.endDate })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.reload();
        },
        error: (err: ApiError) => {
          this.saving.set(false);
          this.formError.set(err.message);
        },
      });
  }

  protected remove(id: string): void {
    this.deletingId.set(id);
    this.goalsApi
      .remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId.set(null);
          this.goals.set(this.goals().filter((g) => g.id !== id));
        },
        error: (err: ApiError) => {
          this.deletingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected kindLabel(kind: GoalKind): string {
    return GOAL_KIND_LABELS[kind] ?? kind;
  }

  protected unit(kind: GoalKind): string {
    return UNIT_LABELS[kind] ?? '';
  }

  protected status(goal: Goal): { label: string; color: string; text: string } {
    if (goal.progress.complete) return { label: 'Complete', color: '#c8e6c9', text: '#1b5e20' };
    if (goal.progress.daysLeft === 0) return { label: 'Ended', color: '#e0e0e0', text: '#424242' };
    return goal.progress.onTrack
      ? { label: 'On track', color: '#bbdefb', text: '#0d47a1' }
      : { label: 'Behind pace', color: '#ffcdd2', text: '#b71c1c' };
  }

  protected barHeight(bucket: TrendBucket): number {
    return Math.max(2, Math.round((bucket.total / this.maxTrend()) * 100));
  }
}
