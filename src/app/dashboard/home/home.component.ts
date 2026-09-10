import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { BillingService } from '../../core/billing/billing.service';
import { AuthService } from '../../core/auth/auth.service';
import { DailyAction, DashboardOverview } from '../../core/analytics/analytics.models';
import { PerformanceData } from '../../core/billing/billing.models';
import { ApiError } from '../../core/http/api-error';

/**
 * @title Home — business command center.
 *
 * One round trip (`v1/dashboard/overview`) plus earnings: today's actions
 * first, then KPI snapshots for business, growth, network and earnings.
 * Every card answers one of the six UX questions and links to action.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, MatButtonModule, MatCardModule, MatChipsModule,
    MatIconModule, MatProgressBarModule, RouterModule,
  ],
  template: `
    <section class="home-page">
      <div class="greeting">
        <div>
          <p class="muted today">{{ today | date:'fullDate' }}</p>
          <h2>{{ greeting() }}{{ firstName() ? ', ' + firstName() : '' }}</h2>
          <p class="subtitle">{{ headline() }}</p>
        </div>
        <a mat-button routerLink="insights">Full insights</a>
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

      @if (overview(); as o) {
        <h3>Today's actions <span class="muted">({{ o.actions.total }})</span></h3>
        @if (topActions().length > 0) {
          <ul class="action-list">
            @for (action of topActions(); track action.id) {
              <li class="dp-card action-item" [class.action-item--high]="action.priority === 'high'">
                <div class="action-body">
                  <strong>{{ action.title }}</strong>
                  <span class="muted">{{ action.detail }}</span>
                </div>
                @if (action.link) {
                  <a mat-button [routerLink]="action.link">Take action</a>
                }
              </li>
            }
          </ul>
          @if (o.actions.total > topActions().length) {
            <a mat-button routerLink="insights">View all {{ o.actions.total }} actions</a>
          }
        } @else {
          <p class="empty">Nothing needs you right now. Momentum is yours to make.</p>
        }

        <h3>Business snapshot</h3>
        <div class="kpi-grid">
          <mat-card class="kpi">
            <mat-card-content>
              <mat-icon>groups</mat-icon>
              <span class="kpi-value">{{ o.team.downline.total | number }}</span>
              <span class="kpi-label">Team members ({{ o.team.downline.active | number }} active)</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="kpi">
            <mat-card-content>
              <mat-icon>person_add</mat-icon>
              <span class="kpi-value">{{ o.team.recruits.current | number }}</span>
              <span class="kpi-label">New recruits ({{ delta(o.team.recruits.deltaPct) }})</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="kpi">
            <mat-card-content>
              <mat-icon>filter_alt</mat-icon>
              <span class="kpi-value">@if (o.funnel.overallRate !== null) { {{ o.funnel.overallRate }}% } @else { — }</span>
              <span class="kpi-label">Funnel conversion ({{ o.funnel.entered | number }} in)</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="kpi">
            <mat-card-content>
              <mat-icon>favorite</mat-icon>
              <span class="kpi-value">{{ o.team.health.score ?? '—' }}</span>
              <span class="kpi-label">Team health</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="kpi">
            <mat-card-content>
              <mat-icon>flag</mat-icon>
              <span class="kpi-value">{{ o.goals.complete | number }}/{{ o.goals.total | number }}</span>
              <span class="kpi-label">
                Goals complete
                @if (o.goals.behind > 0) { · <strong class="behind">{{ o.goals.behind }} behind</strong> }
              </span>
            </mat-card-content>
          </mat-card>
          <mat-card class="kpi">
            <mat-card-content>
              <mat-icon>payments</mat-icon>
              <span class="kpi-value">{{ earnings()?.commissions?.Released | number }}</span>
              <span class="kpi-label">
                Released earnings
                @if (earnings(); as e) { · {{ e.commissions.Pending | number }} pending }
              </span>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="home-links">
          <a mat-button routerLink="prospects/pipeline">Pipeline</a>
          <a mat-button routerLink="network/tree">Network tree</a>
          <a mat-button routerLink="goals">Goals</a>
          <a mat-button routerLink="insights/team-reports">Team reports</a>
          <a mat-button routerLink="messages">Messages @if (o.notifications.unreadCount > 0) { ({{ o.notifications.unreadCount }}) }</a>
          <a mat-button routerLink="classic">Classic view</a>
        </div>
      }
    </section>
  `,
  styles: [`
    .home-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .home-page h3 { margin: 0.5em 0 0; }
    .greeting { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.75em; }
    .greeting h2 { margin: 0; font-size: 1.6em; }
    .today { margin: 0 0 0.2em; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75em; }
    .subtitle { margin: 0.3em 0 0; color: var(--dp-muted); }
    .action-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .action-item { display: flex; gap: 0.9em; align-items: center; padding: 0.7em 1em; }
    .action-item--high { border-left: 4px solid var(--dp-error); }
    .action-body { flex: 1; display: flex; flex-direction: column; gap: 0.15em; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75em; }
    .kpi mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .kpi mat-icon { color: var(--dp-gold); }
    .kpi-value { font-size: 1.5em; font-weight: 700; }
    .kpi-label { color: var(--dp-muted); font-size: 0.85em; }
    .behind { color: var(--dp-error); }
    .home-links { display: flex; gap: 0.25em; flex-wrap: wrap; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class HomeComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly billing = inject(BillingService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly overview = signal<DashboardOverview | null>(null);
  protected readonly earnings = signal<PerformanceData | null>(null);
  protected readonly today = new Date();

  protected greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  protected firstName(): string {
    return this.auth.currentUser()?.name?.split(' ')[0] ?? '';
  }

  protected topActions(): DailyAction[] {
    return (this.overview()?.actions.actions ?? []).slice(0, 5);
  }

  protected headline(): string {
    const o = this.overview();
    if (!o) return 'Loading your business…';
    const urgent = o.actions.actions.filter((a) => a.priority === 'high').length;
    if (urgent > 0) return `${urgent} item${urgent === 1 ? '' : 's'} need${urgent === 1 ? 's' : ''} you first.`;
    if (o.goals.behind > 0) return 'Calm inbox — but a goal needs pace.';
    return 'All clear. Today is a prospecting day.';
  }

  protected delta(pct: number): string {
    return `${pct > 0 ? '+' : ''}${pct}% vs prior`;
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ overview: this.analytics.overview(30), perf: this.billing.performance() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ overview, perf }) => {
          this.overview.set(overview.data ?? null);
          this.earnings.set(perf.data ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
