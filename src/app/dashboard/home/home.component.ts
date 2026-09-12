import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { BillingService } from '../../core/billing/billing.service';
import { AuthService } from '../../core/auth/auth.service';
import { CommunityService } from '../../core/community/community.service';
import { ProgressionService } from '../../core/progression/progression.service';
import { DailyAction, DashboardOverview } from '../../core/analytics/analytics.models';
import { PerformanceData } from '../../core/billing/billing.models';
import { FeedPost } from '../../core/community/community.models';
import { Journey, levelRank } from '../../core/progression/progression.models';
import { ApiError } from '../../core/http/api-error';

/**
 * @title Home — daily operating center.
 *
 * Priority order: what to do today, what's happening, where I stand on
 * the ladder, then business numbers. Journey + community ride along with
 * the overview call but fail soft so the page never blanks on them.
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
      @if (profileIncomplete() && !bannerDismissed()) {
        <div class="profile-banner" role="status">
          <mat-icon>account_circle</mat-icon>
          <p>Your profile setup is incomplete — add your phone number and address so your upline and prospects can reach you.</p>
          <a mat-button routerLink="settings/profiles">Complete profile</a>
          <button mat-icon-button (click)="bannerDismissed.set(true)" aria-label="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
      <div class="greeting">
        <div>
          <p class="eyebrow">Today · Daily Action Center</p>
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
        @if (roleFocus(); as focus) {
          <p class="role-focus" role="note"><mat-icon>flag</mat-icon> {{ focus }}</p>
        }
        <div class="home-section" [style.order]="sectionOrder('actions')">
          <h3>What should I do today? <span class="muted">({{ o.actions.total }})</span></h3>
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
        </div>

        <div class="home-section" [style.order]="sectionOrder('community')">
          <h3>What's happening</h3>
          @if (communityPosts().length > 0) {
            <ul class="preview-list">
              @for (post of communityPosts(); track post.id) {
                <li class="dp-card preview-item">
                  <div class="preview-top">
                    <strong>{{ post.author?.name ?? 'Teammate' }}</strong>
                    <span class="muted">{{ post.likeCount ?? 0 }} likes · {{ post.commentCount ?? 0 }} comments</span>
                  </div>
                  @if (post.title) {
                    <strong>{{ post.title }}</strong>
                  }
                  <p class="muted">{{ previewText(post.body) }}</p>
                </li>
              }
            </ul>
            <a mat-button routerLink="community">Open community</a>
          } @else if (!loading()) {
            <p class="empty">Quiet here — <a routerLink="community">be the first to post</a>.</p>
          }
        </div>

        @if (journey(); as j) {
          <div class="home-section" [style.order]="sectionOrder('journey')">
            <h3>Where I stand</h3>
            <div class="dp-card journey-strip">
              <div class="journey-top">
                <div>
                  <span class="muted">My level</span>
                  <strong class="journey-level">{{ j.levelLabel }}</strong>
                </div>
                @if (j.nextLabel) {
                  <span class="muted">Next: {{ j.nextLabel }} · {{ j.percent }}%</span>
                } @else {
                  <span class="muted">Top of the ladder</span>
                }
              </div>
              @if (j.next) {
                <mat-progress-bar mode="determinate" [value]="j.percent" />
              }
              <a mat-button routerLink="progress">See my next steps</a>
            </div>
          </div>
        }

        <div class="home-section" [style.order]="sectionOrder('business')">
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
        </div>

      }
    </section>
  `,
  styles: [`
    .home-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .home-page h3 { margin: 0.5em 0 0; }
    .greeting { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.75em; }
    .greeting h2 { margin: 0; font-size: 1.6em; }
    .today { margin: 0 0 0.2em; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.8em; }
    .eyebrow { margin: 0 0 0.3em; font-size: 0.78em; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dp-gold-ink); }
    .profile-banner { display: flex; align-items: center; gap: 0.75em; background: var(--dp-info-bg); border: 1px solid var(--dp-info); border-radius: 10px; padding: 0.7em 0.9em; margin: 1em 0; }
    .profile-banner mat-icon { color: var(--dp-info); flex: none; }
    .profile-banner p { margin: 0; flex: 1; font-size: 0.9em; }
    .profile-banner a { flex: none; min-height: 44px; }
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
    .role-focus { display: flex; align-items: center; gap: 0.4em; margin: 0; color: var(--dp-gold-ink); font-weight: 600; font-size: 0.9em; }
    .role-focus mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .home-section { display: flex; flex-direction: column; gap: 0.6em; }
    .preview-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .preview-item { padding: 0.7em 1em; display: flex; flex-direction: column; gap: 0.25em; }
    .preview-item p { margin: 0; }
    .preview-top { display: flex; justify-content: space-between; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .journey-strip { padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.6em; }
    .journey-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1em; flex-wrap: wrap; }
    .journey-level { display: block; font-size: 1.3em; margin-top: 0.15em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class HomeComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  private readonly billing = inject(BillingService);
  private readonly auth = inject(AuthService);
  private readonly progress = inject(ProgressionService);
  private readonly community = inject(CommunityService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly overview = signal<DashboardOverview | null>(null);
  protected readonly earnings = signal<PerformanceData | null>(null);
  protected readonly journey = signal<Journey | null>(null);
  protected readonly communityPosts = signal<FeedPost[]>([]);
  protected readonly today = new Date();
  protected readonly bannerDismissed = signal(false);

  /** Required for onboarding: phone + street/city/state (picture stays optional). */
  protected profileIncomplete(): boolean {
    const u = (this.auth.currentUser() ?? {}) as { phone?: unknown; address?: { street?: unknown; city?: unknown; state?: unknown } };
    const filled = (v: unknown): boolean => String(v ?? '').trim().length > 0;
    return !filled(u.phone)
      || !filled(u.address?.street) || !filled(u.address?.city) || !filled(u.address?.state);
  }

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

  protected previewText(body: string): string {
    const text = String(body ?? '').trim();
    return text.length > 140 ? `${text.slice(0, 139)}…` : text;
  }

  /** Rank 0-9 on the Diamond ladder (0 when journey not loaded yet). */
  protected journeyRank(): number {
    return levelRank(this.journey()?.level);
  }

  /**
   * Role-based section order — actions always first, the rest follows
   * what matters at this rank: early ranks learn, mid ranks build,
   * senior ranks oversee.
   */
  protected sectionOrder(section: 'actions' | 'journey' | 'community' | 'business'): number {
    if (section === 'actions') return 1;
    const rank = this.journeyRank();
    if (rank <= 3) {
      // Prospect → Qualified Active: learn, convert, stay close to the team.
      return section === 'journey' ? 2 : section === 'community' ? 3 : 4;
    }
    if (rank <= 5) {
      // Active / Kingsman: build the team, numbers matter more than chat.
      return section === 'journey' ? 2 : section === 'business' ? 3 : 4;
    }
    // ECL and above: oversee the business first, ladder is nearly climbed.
    return section === 'business' ? 2 : section === 'community' ? 3 : 4;
  }

  /** One-line focus for this rank — plain words, no jargon. */
  protected roleFocus(): string | null {
    if (!this.journey()) return null;
    const rank = this.journeyRank();
    if (rank <= 0) return 'Focus: learning how the business works';
    if (rank === 1) return 'Focus: IPO, QSG and your first recruit';
    if (rank <= 3) return 'Focus: finishing qualification';
    if (rank === 4) return 'Focus: prospecting and team building';
    if (rank === 5) return 'Focus: developing leaders';
    if (rank === 6) return 'Focus: building your cell';
    if (rank === 7) return 'Focus: team performance';
    if (rank === 8) return 'Focus: running your organization';
    return 'Focus: business intelligence and oversight';
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    // Journey + community fail soft — the page must never blank on them.
    forkJoin({
      overview: this.analytics.overview(30),
      perf: this.billing.performance(),
      journey: this.progress.mine().pipe(catchError(() => of(null))),
      feed: this.community.feed(undefined, 5).pipe(catchError(() => of(null))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ overview, perf, journey, feed }) => {
          this.overview.set(overview.data ?? null);
          this.earnings.set(perf.data ?? null);
          this.journey.set(journey?.data ?? null);
          this.communityPosts.set(feed?.data?.items?.slice(0, 3) ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
