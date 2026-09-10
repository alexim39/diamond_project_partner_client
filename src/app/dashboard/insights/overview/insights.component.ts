import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { ExportKind, ExportService } from '../../../core/analytics/export.service';
import { ActionPriority, DailyAction, Funnel, TeamAnalytics } from '../../../core/analytics/analytics.models';
import { ApiError } from '../../../core/http/api-error';

const PRIORITY_META: Record<ActionPriority, { label: string; color: string; text: string }> = {
  high: { label: 'Act now', color: '#ffcdd2', text: '#b71c1c' },
  medium: { label: 'Soon', color: '#ffecb3', text: '#7a5c00' },
  low: { label: 'FYI', color: '#e3f2fd', text: '#0d47a1' },
};

/**
 * @title Insights — action center, recruitment funnel, team health.
 *
 * Answers "what should I do today?" then shows the numbers behind it.
 * All metrics are server-computed; this page only renders.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-insights-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule,
    MatProgressBarModule, MatSelectModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Insights</span>
      </div>
    </section>

    <section class="insights-page">
      <div class="page-head">
        <div>
          <h2>Insights</h2>
          <p class="subtitle">What to do today — and the numbers behind it.</p>
        </div>
        <mat-form-field appearance="outline" class="window-field">
          <mat-label>Window</mat-label>
          <mat-select [value]="days()" (selectionChange)="setDays($event.value)">
            <mat-option [value]="7">Last 7 days</mat-option>
            <mat-option [value]="30">Last 30 days</mat-option>
            <mat-option [value]="90">Last 90 days</mat-option>
          </mat-select>
        </mat-form-field>
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

      <h3>Daily action center</h3>
      @if (actions().length > 0) {
        <ul class="action-list">
          @for (action of actions(); track action.id) {
            <li class="action-item" [class.action-item--high]="action.priority === 'high'">
              <mat-chip
                [style.background]="priority(action.priority).color"
                [style.color]="priority(action.priority).text"
                highlighted
              >{{ priority(action.priority).label }}</mat-chip>
              <div class="action-body">
                <strong>{{ action.title }}</strong>
                <span class="muted">{{ action.detail }} · {{ action.category }}</span>
              </div>
              @if (action.link) {
                <a mat-button [routerLink]="action.link">Open</a>
              }
            </li>
          }
        </ul>
      } @else if (!loading() && !error()) {
        <p class="empty">Nothing urgent — enjoy the quiet, or go prospecting.</p>
      }

      @if (goalSummary(); as gs) {
        <p class="goals-strip">
          <a routerLink="/dashboard/goals">Goals:</a>
          {{ gs.complete }}/{{ gs.total }} complete
          @if (gs.behind > 0) {
            · <strong class="behind">{{ gs.behind }} behind pace</strong>
          }
        </p>
      }

      <h3>Recruitment funnel <span class="muted">({{ funnel()?.days }}-day cohort)</span></h3>      @if (funnel(); as f) {
        <div class="funnel">
          @for (step of f.steps; track step.stage) {
            <div class="funnel-row">
              <span class="funnel-stage">{{ step.stage }}</span>
              <div class="funnel-track">
                <div class="funnel-fill" [style.width.%]="funnelWidth(step.count)"></div>
              </div>
              <span class="funnel-num">{{ step.count | number }}</span>
              <span class="muted funnel-rate">
                @if (step.stepRate !== null) {
                  {{ step.stepRate }}%@if (step.dropoff > 0) { · −{{ step.dropoff | number }} }
                } @else {
                  —
                }
              </span>
            </div>
          }
          <p class="muted">
            {{ f.entered | number }} entered · {{ f.converted | number }} converted ·
            @if (f.overallRate !== null) { {{ f.overallRate }}% overall · }
            {{ f.lost | number }} lost
          </p>
        </div>
      }

      <h3>Team health</h3>
      @if (team(); as src) {
        <p class="muted source-note">
          {{ src.source === 'snapshot' ? 'Overnight snapshot · refreshes nightly' : 'Computed live just now' }}
        </p>
      }
      @if (team(); as t) {
        <div class="stat-grid">
          <mat-card>
            <mat-card-content>
              <span class="stat-value">{{ t.health.score ?? '—' }}</span>
              <span class="stat-label">Health score</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <span class="stat-value">{{ t.recruits.current | number }}</span>
              <span class="stat-label">Recruits ({{ delta(t.recruits.deltaPct) }})</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <span class="stat-value">{{ t.teamVolume.current | number }}</span>
              <span class="stat-label">Team volume ({{ delta(t.teamVolume.deltaPct) }})</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <span class="stat-value">{{ t.downline.active | number }}/{{ t.downline.total | number }}</span>
              <span class="stat-label">Members active</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <span class="stat-value">{{ t.conversions | number }}</span>
              <span class="stat-label">Conversions</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <span class="stat-value">{{ t.goals.complete | number }}/{{ t.goals.total | number }}</span>
              <span class="stat-label">Goals complete</span>
            </mat-card-content>
          </mat-card>
        </div>
        @if (t.health.recommendations.length > 0) {
          <ul class="reco-list">
            @for (reco of t.health.recommendations; track reco) {
              <li><mat-icon>lightbulb</mat-icon><span>{{ reco }}</span></li>
            }
          </ul>
        }
      }

      <h3>Take your data</h3>
      <div class="exports">
        @for (item of exportKinds; track item.kind) {
          <button
            mat-button
            (click)="export(item.kind)"
            [disabled]="downloading() !== null"
          >
            <mat-icon>download</mat-icon>
            {{ downloading() === item.kind ? 'Preparing…' : item.label }}
          </button>
        }
        @if (exportError(); as err) {
          <span class="error" role="alert">{{ err }}</span>
        }
      </div>
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .insights-page { display: flex; flex-direction: column; gap: 1em; }
    .insights-page h3 { margin: 0.5em 0 0; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: #666; }
    .window-field { width: 180px; }
    .action-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .action-item { display: flex; gap: 0.9em; align-items: center; background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 0.7em 1em; }
    .action-item--high { border-left: 4px solid #d32f2f; }
    .action-body { flex: 1; display: flex; flex-direction: column; gap: 0.15em; }
    .funnel { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .funnel p { margin: 0.25em 0 0; }
    .funnel-row { display: grid; grid-template-columns: 130px 1fr 60px 130px; gap: 0.75em; align-items: center; }
    .funnel-stage { font-weight: 600; font-size: 0.9em; }
    .funnel-track { height: 18px; background: #f1f3f4; border-radius: 5px; overflow: hidden; }
    .funnel-fill { height: 100%; background: #3f51b5; border-radius: 5px; min-width: 2px; }
    .funnel-num { text-align: right; font-weight: 600; }
    .funnel-rate { font-size: 0.8em; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75em; }
    .stat-grid mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .stat-value { font-size: 1.5em; font-weight: 700; }
    .stat-label { color: #666; font-size: 0.85em; }
    .reco-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4em; }
    .reco-list li { display: flex; gap: 0.5em; align-items: flex-start; color: #555; }
    .reco-list mat-icon { color: #f9a825; font-size: 20px; height: 20px; width: 20px; }
    .muted { color: #777; font-size: 0.85em; }
    .source-note { margin: -0.5em 0 0; }
    .exports { display: flex; gap: 0.25em; flex-wrap: wrap; align-items: center; }
    .goals-strip { margin: 0; }
    .goals-strip a { text-decoration: none; font-weight: 600; }
    .behind { color: #d32f2f; }
    .error { color: #d32f2f; display: flex; align-items: center; gap: 0.5em; }
    .empty { color: #666; }
  `],
})
export class InsightsOverviewComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly exporter = inject(ExportService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly downloading = signal<ExportKind | null>(null);
  protected readonly exportError = signal<string | null>(null);
  protected readonly days = signal(30);
  protected readonly actions = signal<DailyAction[]>([]);
  protected readonly funnel = signal<Funnel | null>(null);
  protected readonly team = signal<TeamAnalytics | null>(null);
  protected readonly goalSummary = signal<{ total: number; complete: number; behind: number } | null>(null);

  protected readonly funnelMax = computed(() =>
    Math.max(1, ...(this.funnel()?.steps.map((s) => s.count) ?? [1])),
  );

  ngOnInit(): void {
    this.reload();
  }

  protected setDays(days: number): void {
    this.days.set(days);
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    // Single aggregation call — actions, funnel, team, goals in one round trip.
    this.analytics
      .overview(this.days())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actions.set(res.data?.actions?.actions ?? []);
          this.funnel.set(res.data?.funnel ?? null);
          this.team.set(res.data?.team ?? null);
          const g = res.data?.goals;
          this.goalSummary.set(g ? { total: g.total, complete: g.complete, behind: g.behind } : null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected priority(p: ActionPriority): { label: string; color: string; text: string } {
    return PRIORITY_META[p] ?? PRIORITY_META['low'];
  }

  protected funnelWidth(count: number): number {
    return Math.max(1, Math.round((count / this.funnelMax()) * 100));
  }

  protected delta(pct: number): string {
    return `${pct > 0 ? '+' : ''}${pct}% vs prior`;
  }

  protected readonly exportKinds: Array<{ kind: ExportKind; label: string }> = [
    { kind: 'team', label: 'Team roster' },
    { kind: 'pipeline', label: 'Pipeline' },
    { kind: 'commissions', label: 'Commissions' },
    { kind: 'reports-mine', label: 'My reports' },
    { kind: 'reports-team', label: 'Team reports' },
  ];

  protected export(kind: ExportKind): void {
    this.downloading.set(kind);
    this.exportError.set(null);
    this.exporter
      .download(kind)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.downloading.set(null),
        error: (err: ApiError) => {
          this.downloading.set(null);
          this.exportError.set(err.message);
        },
      });
  }
}
