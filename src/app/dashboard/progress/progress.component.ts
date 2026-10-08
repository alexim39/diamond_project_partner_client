import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ProgressionService } from '../../core/progression/progression.service';
import { Journey, LADDER, CONFIRMABLE_KEYS, levelRank, MissingRequirement } from '../../core/progression/progression.models';
import { ApiError } from '../../core/http/api-error';

const BOOLEAN_STAMPS = new Set([
  'ipo', 'qsg', 'smo', 'fullTime', 'office',
  'onboardingSession', 'qualifiedConfirmed', 'appointment',
]);

/**
 * @title My journey — Diamond progression ladder.
 *
 * Current position, next gate with percent, completed vs missing
 * requirements, one-tap attestation. Levels derive server-side from
 * live signals + milestones. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, MatButtonModule, MatChipsModule, MatIconModule,
    MatInputModule, MatProgressBarModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>My Journey</span>
      </div>
    </section>

    <section class="journey-page">
      <div class="page-head">
        <div>
          <h2>My Journey</h2>
          <p class="subtitle">Where you stand on the Diamond ladder — and what unlocks next.</p>
        </div>
        <a mat-button routerLink="/dashboard/goals">Goals</a>
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

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      @if (journey(); as j) {
        @if (j.promoted) {
          <div class="promo-banner" role="status">
            <mat-icon>celebration</mat-icon>
            <div>Promoted from <strong>{{ pretty(j.promoted.from) }}</strong> to <strong>{{ pretty(j.promoted.to) }}</strong> — keep climbing.</div>
          </div>
        }

        <div class="dp-card level-card">
          <div class="level-top">
            <div>
              <span class="muted">Current position · level {{ rank() + 1 }} of {{ ladder().length }}</span>
              <h3>{{ j.levelLabel }}</h3>
            </div>
            @if (j.nextLabel) {
              <div class="next">
                <span class="muted">Next</span>
                <strong>{{ j.nextLabel }} · {{ j.percent }}%</strong>
              </div>
            } @else {
              <mat-chip highlighted>Top of the ladder</mat-chip>
            }
          </div>
          @if (j.next) {
            <mat-progress-bar mode="determinate" [value]="j.percent" />
          }
        </div>

        @if (j.forecast; as f) {
          <div class="dp-card forecast-card" role="status">
            <mat-icon>{{ f.stalled ? 'warning' : 'trending_up' }}</mat-icon>
            <div>
              <strong>Forecast · {{ f.label }}</strong>
              @if (f.etaDate) {
                <span class="muted"> · ETA {{ f.etaDate | date:'mediumDate' }}</span>
              }
            </div>
          </div>
        }

        <div class="dp-card roadmap-card">
          <h3>Roadmap</h3>
          <ol class="ladder" aria-label="Diamond progression roadmap">
            @for (rung of ladder(); track rung.level; let i = $index) {
              <li
                class="rung"
                [class.rung--done]="i < rank()"
                [class.rung--current]="i === rank()"
                [class.rung--next]="j.next !== null && rung.level === j.next"
                [attr.aria-current]="i === rank() ? 'step' : null"
              >
                <span class="rung-dot" aria-hidden="true">
                  @if (i < rank()) {
                    <mat-icon>check_circle</mat-icon>
                  } @else if (i === rank()) {
                    <mat-icon>my_location</mat-icon>
                  } @else {
                    <mat-icon>radio_button_unchecked</mat-icon>
                  }
                </span>
                <div class="rung-body">
                  <strong>{{ rung.label }}</strong>
                  <span class="muted">
                    @if (i < rank()) {
                      Completed
                    } @else if (i === rank()) {
                      You are here · {{ j.percent }}% to next
                    } @else if (j.next !== null && rung.level === j.next) {
                      Up next
                    } @else {
                      Level {{ i + 1 }}
                    }
                  </span>
                </div>
              </li>
            }
          </ol>
        </div>

        <div class="req-grid">
          <div class="dp-card req-col">
            <h3>Completed ({{ j.completed.length }})</h3>
            @if (j.completed.length > 0) {
              <ul class="req-list">
                @for (label of j.completed; track label) {
                  <li><mat-icon>check_circle</mat-icon><span>{{ label }}</span></li>
                }
              </ul>
            } @else {
              <p class="empty">Nothing banked for this gate yet.</p>
            }
          </div>

          <div class="dp-card req-col">
            <h3>Still needed ({{ j.missing.length }})</h3>
            @if (j.missing.length > 0) {
              <ul class="req-list">
                @for (req of j.missing; track req.key) {
                  <li>
                    <mat-icon>radio_button_unchecked</mat-icon>
                    <div class="req-body">
                      <strong>{{ req.label }}</strong>
                      <span class="muted">{{ req.action }}</span>
                      @if (pendingNote(req); as pending) {
                        <p class="pending" role="status"><mat-icon>hourglass_empty</mat-icon>{{ pending }}</p>
                      } @else if (cta(req); as label) {
                        <div class="req-cta">
                          <button mat-button (click)="act(req)" [disabled]="acting()">{{ label }}</button>
                        </div>
                      }
                    </div>
                  </li>
                }
              </ul>
            } @else {
              <p class="empty">Gate clear — the next level is yours.</p>
            }
          </div>
        </div>

        @if (showAccounts()) {
          <div class="dp-card accounts-row">
            <div class="evidence-head">
              <h3>DTC accounts evidence</h3>
              <p class="muted">Enter your 3 DTC account IDs — your upline will confirm them before the gate unlocks.</p>
            </div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Maintained accounts (count)</mat-label>
              <input matInput type="number" min="0" max="1000" [(ngModel)]="accountsCount" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="evidence-field">
              <mat-label>DTC account references (one per line)</mat-label>
              <textarea matInput rows="3" maxlength="1100" [(ngModel)]="accountsRefs" placeholder="e.g. DTC-12345&#10;DTC-67890&#10;DTC-11223"></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="saveAccounts()" [disabled]="acting()">Submit for confirmation</button>
          </div>
        }

        @if (showMaintenance()) {
          <div class="dp-card accounts-row">
            <div class="evidence-head">
              <h3>Monthly maintenance evidence</h3>
              <p class="muted">Shop orders count automatically. Only submit here if you maintained via DTC — your upline will confirm the receipt.</p>
            </div>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>DTC receipt / order reference</mat-label>
              <input matInput maxlength="100" [(ngModel)]="maintenanceRef" placeholder="e.g. DTC-ORD-98765" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Month (YYYY-MM)</mat-label>
              <input matInput maxlength="7" [(ngModel)]="maintenanceMonth" placeholder="e.g. 2026-10" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="saveMaintenance()" [disabled]="acting()">Submit for confirmation</button>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .journey-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .promo-banner { display: flex; align-items: center; gap: 0.75em; background: var(--dp-success-bg); border: 1px solid var(--dp-success); border-radius: 8px; padding: 0.75em 1em; }
    .promo-banner div { flex: 1; }
    .level-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .level-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1em; flex-wrap: wrap; }
    .level-top h3 { margin: 0.15em 0 0; font-size: 1.4em; }
    .forecast-card { display: flex; align-items: center; gap: 0.6em; padding: 0.75em 1em; }
    .forecast-card mat-icon { color: var(--dp-gold); }
    .next { text-align: right; display: flex; flex-direction: column; gap: 0.15em; }
    .roadmap-card { padding: 1em; }
    .roadmap-card h3 { margin: 0 0 0.6em; font-size: 1em; }
    .ladder { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .rung { display: flex; gap: 0.7em; align-items: flex-start; padding: 0.55em 0; position: relative; }
    .rung:not(:last-child)::before { content: ''; position: absolute; left: 9px; top: 32px; bottom: -4px; width: 2px; background: var(--dp-line); }
    .rung--done:not(:last-child)::before { background: var(--dp-success); }
    .rung-dot mat-icon { font-size: 20px; height: 20px; width: 20px; color: var(--dp-muted); }
    .rung--done .rung-dot mat-icon { color: var(--dp-success); }
    .rung--current .rung-dot mat-icon { color: var(--dp-gold); }
    .rung--current strong { color: var(--dp-gold-ink); }
    .rung-body { display: flex; flex-direction: column; gap: 0.1em; }
    .req-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75em; }
    .req-col { padding: 1em; }
    .req-col h3 { margin: 0 0 0.6em; font-size: 1em; }
    .req-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .req-list li { display: flex; gap: 0.5em; align-items: flex-start; }
    .req-list mat-icon { color: var(--dp-gold); font-size: 20px; height: 20px; width: 20px; }
    .req-body { flex: 1; display: flex; flex-direction: column; gap: 0.2em; }
    .req-cta { display: flex; gap: 0.4em; margin-top: 0.25em; }
    .req-cta button, .accounts-row button { min-height: 44px; }
    .pending { display: flex; align-items: center; gap: 0.4em; margin: 0.25em 0 0; font-size: 0.85em; color: var(--dp-gold-ink); }
    .pending mat-icon { font-size: 18px; height: 18px; width: 18px; }
    .accounts-row { display: flex; gap: 0.75em; align-items: center; padding: 1em; flex-wrap: wrap; }
    .evidence-head { flex-basis: 100%; }
    .evidence-head h3 { margin: 0 0 0.2em; font-size: 1em; }
    .evidence-head p { margin: 0 0 0.4em; }
    .evidence-field { flex-basis: 100%; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .notice { color: var(--dp-success); }
    .empty { color: var(--dp-muted); }
    @media only screen and (max-width: 600px) {
      .next { text-align: left; }
    }
  `],
})
export class ProgressComponent implements OnInit {
  private readonly progress = inject(ProgressionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly acting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly journey = signal<Journey | null>(null);
  protected readonly accountsCount = signal(0);
  protected readonly accountsRefs = signal('');
  protected readonly maintenanceRef = signal('');
  protected readonly maintenanceMonth = signal('');
  protected readonly showAccounts = signal(false);
  protected readonly showMaintenance = signal(false);
  protected readonly ladder = signal(LADDER);
  protected rank(): number {
    return levelRank(this.journey()?.level);
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.progress
      .mine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.journey.set(res.data ?? null);
          const missing = res.data?.missing ?? [];
          this.showAccounts.set(missing.some((m) => m.key === 'accounts'));
          this.showMaintenance.set(missing.some((m) => m.key === 'maintenance'));
          const miles = (res.data?.milestones ?? {}) as Record<string, any>;
          if (typeof miles?.['accounts']?.count === 'number') this.accountsCount.set(miles['accounts'].count);
          if (Array.isArray(miles?.['accounts']?.refs)) this.accountsRefs.set((miles['accounts'].refs as string[]).join('\n'));
          if (typeof miles?.['maintenance']?.ref === 'string') this.maintenanceRef.set(miles['maintenance'].ref);
          if (typeof miles?.['maintenance']?.month === 'string') this.maintenanceMonth.set(miles['maintenance'].month);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected pretty(level: string): string {
    return level.replace(/_/g, ' ');
  }

  /** CTA label per requirement kind (empty = computed, nothing to tap). */
  protected cta(req: MissingRequirement): string {
    if (BOOLEAN_STAMPS.has(req.key)) return 'Mark done';
    if (req.key === 'accounts') return 'Add evidence below';
    if (req.key === 'maintenance') return 'Record receipt below';
    if (req.key === 'g8Request') return 'Submit request';
    if (req.key === 'nomination') return 'Request nomination';
    return '';
  }

  /**
   * Marked done but awaiting upline verification — show the pending
   * message instead of another Mark done button. Covers training plus
   * trust legs (office / full-time / onboarding).
   */
  protected pendingNote(req: MissingRequirement): string | null {
    if (!CONFIRMABLE_KEYS.includes(req.key)) return null;
    const stamp = (this.journey()?.milestones?.[req.key] ?? {}) as { done?: boolean; confirmedAt?: string | null };
    if (stamp.done === true && !stamp.confirmedAt) {
      return 'Thank you for taking the next step — your upline will confirm this activity.';
    }
    return null;
  }

  protected act(req: MissingRequirement): void {
    if (BOOLEAN_STAMPS.has(req.key)) {
      const note = CONFIRMABLE_KEYS.includes(req.key)
        ? `"${req.label}" recorded — thank you for taking the next step. Your upline will confirm this activity.`
        : `"${req.label}" recorded.`;
      this.mutate({ [req.key]: { done: true } }, note);
    } else if (req.key === 'accounts') {
      this.showAccounts.set(true);
    } else if (req.key === 'maintenance') {
      this.showMaintenance.set(true);
    } else if (req.key === 'g8Request') {
      this.mutate({ g8Request: { status: 'submitted' } }, 'Request sent to your G8 Leader.');
    } else if (req.key === 'nomination') {
      this.requestNomination();
    }
  }

  protected saveAccounts(): void {
    const refs = String(this.accountsRefs() ?? '')
      .split(/[\n,]+/)
      .map((r) => r.trim())
      .filter(Boolean)
      .slice(0, 10);
    const count = Math.max(0, Number(this.accountsCount()) || 0);
    if (count < 1) {
      this.error.set('Enter how many DTC accounts you maintain.');
      return;
    }
    if (refs.length === 0) {
      this.error.set('Add at least one DTC account reference as evidence.');
      return;
    }
    this.mutate(
      { accounts: { count, refs } },
      'DTC accounts submitted — thank you. Your upline will confirm this activity.',
    );
  }

  protected saveMaintenance(): void {
    const ref = String(this.maintenanceRef() ?? '').trim();
    const month = String(this.maintenanceMonth() ?? '').trim();
    if (!ref) {
      this.error.set('Enter your DTC receipt / order reference.');
      return;
    }
    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      this.error.set('Month must look like YYYY-MM.');
      return;
    }
    this.mutate(
      { maintenance: { done: true, ref, month } },
      'Maintenance receipt submitted — thank you. Your upline will confirm this activity.',
    );
  }

  private mutate(patch: Record<string, unknown>, note: string): void {
    this.acting.set(true);
    this.notice.set(null);
    this.error.set(null);
    this.progress
      .attest(patch)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.acting.set(false);
          this.notice.set(note);
          this.reload();
        },
        error: (err: ApiError) => {
          this.acting.set(false);
          this.error.set(err.message);
        },
      });
  }

  private requestNomination(): void {
    this.acting.set(true);
    this.notice.set(null);
    this.error.set(null);
    this.progress
      .requestNomination()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.acting.set(false);
          this.notice.set('Nomination requested — a G8 Leader will decide.');
          this.reload();
        },
        error: (err: ApiError) => {
          this.acting.set(false);
          this.error.set(err.message);
        },
      });
  }
}
