import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { NetworkService } from '../../../../network/tree/network.service';
import { LeadPipelineService } from '../../../prospects/lead-pipeline/lead-pipeline.service';
import { ActivationBoardItem, ProspectLead } from '../../../prospects/lead-pipeline/lead.models';
import { ApiError, userError } from '../../../../../core/http/api-error';

/**
 * @title Business KPI — downline business health for one partner.
 *
 * Answers for an upline: how big is this partner's business, how active is
 * it, and what is the single next step to drive it forward. All numbers come
 * from live session-scoped reads (network tree, pipeline, stuck, activation);
 * every failure is fail-soft so the page never breaks — missing slices show
 * "—" with a retry. Every action deep-links to an existing working page.
 */
@Component({
  selector: 'async-partner-business-kpi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="dp-card kpi-section" aria-label="Business KPI">
      <div class="kpi-head">
        <div>
          <h3>Business KPI — {{ partnerName() }}</h3>
          <p class="muted">Live snapshot of this partner's downline business + what to do next as upline.</p>
        </div>
        <button mat-button (click)="reload()" [disabled]="loading()">Refresh</button>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (error(); as err) {
        <p class="error" role="alert">{{ err }} <button mat-button (click)="reload()">Retry</button></p>
      }

      <div class="kpi-grid">
        <mat-card><mat-card-content>
          <mat-icon>groups</mat-icon>
          <span class="kpi-value">{{ directCount() }}</span>
          <span class="kpi-label">Direct partners</span>
        </mat-card-content></mat-card>
        <mat-card><mat-card-content>
          <mat-icon>account_tree</mat-icon>
          <span class="kpi-value">{{ teamTotal() === null ? '—' : teamTotal() }}</span>
          <span class="kpi-label">Total team (3 levels)</span>
        </mat-card-content></mat-card>
        <mat-card><mat-card-content>
          <mat-icon>trending_up</mat-icon>
          <span class="kpi-value">{{ pipelineOpen() === null ? '—' : pipelineOpen() }}</span>
          <span class="kpi-label">Open pipeline</span>
        </mat-card-content></mat-card>
        <mat-card><mat-card-content>
          <mat-icon>celebration</mat-icon>
          <span class="kpi-value">{{ pipelineConverted() === null ? '—' : pipelineConverted() }}</span>
          <span class="kpi-label">Converted</span>
        </mat-card-content></mat-card>
        <mat-card><mat-card-content>
          <mat-icon>warning</mat-icon>
          <span class="kpi-value">{{ stuckCount() === null ? '—' : stuckCount() }}</span>
          <span class="kpi-label">Stuck follow-ups</span>
        </mat-card-content></mat-card>
        <mat-card><mat-card-content>
          <mat-icon>checklist</mat-icon>
          <span class="kpi-value">{{ activationWorkedLabel() }}</span>
          <span class="kpi-label">List worked</span>
        </mat-card-content></mat-card>
      </div>

      <div class="split">
        <div class="panel">
          <h4>Pipeline by stage</h4>
          @if (stageRows().length > 0) {
            <ul class="stages">
              @for (s of stageRows(); track s.stage) {
                <li>
                  <span>{{ s.stage }}</span>
                  <div class="bar-track"><div class="bar-fill" [style.width.%]="s.pct"></div></div>
                  <strong>{{ s.count }}</strong>
                </li>
              }
            </ul>
          } @else {
            <p class="muted">{{ pipelineLoaded() ? 'No pipeline leads yet.' : 'Pipeline unavailable — retry.' }}</p>
          }
          @if (teamDepth() !== null) {
            <p class="muted">Team depth {{ teamDepth() }} levels
              @if (perLevel().length > 0) {
                · L1 {{ perLevel()[0] ?? 0 }}@if (perLevel().length > 1) { · L2 {{ perLevel()[1] ?? 0 }} }@if (perLevel().length > 2) { · L3 {{ perLevel()[2] ?? 0 }} }
              }
            </p>
          }
        </div>

        <div class="panel">
          <h4>Activation</h4>
          @if (activation(); as a) {
            <div class="chips">
              <mat-chip highlighted>IPO: {{ a.ipoDone ? 'done' : 'pending' }}</mat-chip>
              <mat-chip highlighted>QSG: {{ a.qsgDone ? 'done' : 'pending' }}</mat-chip>
              @if (a.overdue) {
                <mat-chip color="warn" highlighted>Overdue 48h</mat-chip>
              }
            </div>
            <p class="next"><strong>Next:</strong> {{ a.nextAction }}</p>
          } @else {
            <p class="muted">No activation record yet — onboarding hasn't started.</p>
          }
        </div>
      </div>

      <h4>Next steps for you as upline</h4>
      @if (nextSteps().length > 0) {
        <ul class="steps">
          @for (s of nextSteps(); track s.title) {
            <li class="dp-card step">
              <mat-icon>{{ s.icon }}</mat-icon>
              <div>
                <strong>{{ s.title }}</strong>
                <p class="muted">{{ s.detail }}</p>
              </div>
              <span class="spacer"></span>
              <a mat-button [routerLink]="s.link">{{ s.cta }}</a>
            </li>
          }
        </ul>
      } @else {
        <p class="muted">Healthy — nothing urgent. Check back after their next touches.</p>
      }
    </section>
  `,
  styles: [`
    .kpi-section { padding: 1em; display: flex; flex-direction: column; gap: 1em; margin-top: 1em; }
    .kpi-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75em; flex-wrap: wrap; }
    .kpi-head h3 { margin: 0; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75em; }
    .kpi-grid mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .kpi-grid mat-icon { color: var(--dp-gold); }
    .kpi-value { font-size: 1.5em; font-weight: 700; }
    .kpi-label { color: var(--dp-muted); font-size: 0.85em; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 1em; }
    @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
    .panel h4 { margin: 0 0 0.5em; }
    .stages { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4em; }
    .stages li { display: grid; grid-template-columns: 110px 1fr 40px; gap: 0.6em; align-items: center; font-size: 0.9em; }
    .bar-track { height: 10px; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--dp-gold); min-width: 2px; }
    .chips { display: flex; gap: 0.4em; flex-wrap: wrap; margin-bottom: 0.5em; }
    .next { margin: 0; }
    .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .step { display: flex; gap: 0.7em; align-items: center; padding: 0.8em 1em; flex-wrap: wrap; }
    .step mat-icon { color: var(--dp-gold-ink); }
    .step p { margin: 0.15em 0 0; }
    .spacer { flex: 1; }
    button, a[mat-button] { min-height: 44px; }
  `],
})
export class PartnerBusinessKpiComponent implements OnInit {
  @Input() myPartner!: PartnerInterface;
  @Input() myPartnerPartners: PartnerInterface[] = [];
  @Input() supportInfo: ActivationBoardItem | null = null;

  private readonly network = inject(NetworkService);
  private readonly leads = inject(LeadPipelineService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly teamTotal = signal<number | null>(null);
  protected readonly teamDepth = signal<number | null>(null);
  protected readonly perLevel = signal<number[]>([]);
  protected readonly pipeline = signal<ProspectLead[]>([]);
  protected readonly pipelineLoaded = signal(false);
  protected readonly stuckCount = signal<number | null>(null);

  protected readonly directCount = computed(() => this.myPartnerPartners?.length ?? 0);
  protected readonly activation = computed(() => this.supportInfo);
  protected readonly activationWorkedLabel = computed(() => {
    const a = this.supportInfo;
    return a ? `${a.worked ?? 0}/${a.total ?? 0}` : '—';
  });
  protected readonly pipelineOpen = computed(() => {
    if (!this.pipelineLoaded()) return null;
    return this.pipeline().filter((l) => !['Converted', 'Closed'].includes(String(l.status?.stage ?? ''))).length;
  });
  protected readonly pipelineConverted = computed(() => {
    if (!this.pipelineLoaded()) return null;
    return this.pipeline().filter((l) => String(l.status?.stage ?? '') === 'Converted').length;
  });
  protected readonly stageRows = computed(() => {
    const rows = this.pipeline();
    if (!rows.length) return [];
    const counts = new Map<string, number>();
    for (const l of rows) {
      const s = String(l.status?.stage ?? 'New');
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()].map(([stage, count]) => ({ stage, count, pct: Math.max(2, Math.round((count / max) * 100)) }));
  });

  protected readonly nextSteps = computed(() => {
    const steps: Array<{ icon: string; title: string; detail: string; link: string; cta: string }> = [];
    const id = String((this.myPartner as { _id?: unknown })?._id ?? '');
    const direct = this.directCount();
    const a = this.supportInfo;
    const stuck = this.stuckCount() ?? 0;
    const open = this.pipelineOpen() ?? 0;
    if (direct === 0) {
      steps.push({ icon: 'person_add', title: 'Help them land their first partner', detail: 'No direct recruits yet — work their contact list together and book the first showcase.', link: '/dashboard/mentorship/team/activation', cta: 'Open activation' });
    }
    if (a && (!a.ipoDone || !a.qsgDone)) {
      steps.push({ icon: 'verified', title: 'Close IPO / QSG onboarding', detail: `IPO ${a.ipoDone ? 'done' : 'pending'} · QSG ${a.qsgDone ? 'done' : 'pending'} — confirm the missing step with them.`, link: '/dashboard/mentorship/team/confirmations', cta: 'Confirm training' });
    }
    if (stuck > 0) {
      steps.push({ icon: 'warning', title: `Clear ${stuck} stuck follow-up${stuck === 1 ? '' : 's'}`, detail: 'Past stage attention threshold — call through them together this week.', link: `/dashboard/mentorship/partners/my-partners/contacts/${id}`, cta: 'View contacts' });
    } else if (open > 0) {
      steps.push({ icon: 'trending_up', title: `Work ${open} open pipeline lead${open === 1 ? '' : 's'}`, detail: 'Review stages together and agree the next touch for each.', link: `/dashboard/mentorship/partners/my-partners/contacts/${id}`, cta: 'View contacts' });
    }
    if (!a && direct > 0) {
      steps.push({ icon: 'assignment', title: 'Get their contact list submitted', detail: 'Active downline but no onboarding record — ask for their list submission.', link: '/dashboard/mentorship/team/contact-lists', cta: 'Contact lists' });
    }
    steps.push({ icon: 'forum', title: 'Ask for a team update', detail: 'Request a short written report to keep momentum and spot blockers early.', link: '/dashboard/insights/team-reports', cta: 'Team reports' });
    return steps.slice(0, 4);
  });

  protected partnerName(): string {
    return `${this.myPartner?.name ?? ''} ${this.myPartner?.surname ?? ''}`.trim() || this.myPartner?.username || 'partner';
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    const id = String((this.myPartner as { _id?: unknown })?._id ?? '');
    if (!id) {
      this.error.set('Partner not loaded yet.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      tree: this.network.tree(id, 3).pipe(catchError(() => of(null))),
      pipeline: this.leads.listByPartner(id, { limit: 200 }).pipe(catchError(() => of(null))),
      stuck: this.leads.stuck(id).pipe(catchError(() => of(null))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tree, pipeline, stuck }) => {
          const meta = (tree as { data?: { meta?: { total?: number; depth?: number; perLevel?: number[] } } } | null)?.data?.meta;
          this.teamTotal.set(typeof meta?.total === 'number' ? meta.total : null);
          this.teamDepth.set(typeof meta?.depth === 'number' ? meta.depth : null);
          this.perLevel.set(Array.isArray(meta?.perLevel) ? meta.perLevel : []);
          const rows = (pipeline as { data?: ProspectLead[] } | null)?.data;
          this.pipeline.set(Array.isArray(rows) ? rows : []);
          this.pipelineLoaded.set(Array.isArray(rows));
          const stuckRows = (stuck as { data?: unknown[] } | null)?.data;
          this.stuckCount.set(Array.isArray(stuckRows) ? stuckRows.length : null);
          if (!tree && !pipeline && !stuck) this.error.set('Could not load business data.');
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(userError(err));
          this.loading.set(false);
        },
      });
  }
}
