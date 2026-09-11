import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ProgressionService } from '../../core/progression/progression.service';
import { Journey, LADDER, levelRank, MissingRequirement } from '../../core/progression/progression.models';
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
    FormsModule, MatButtonModule, MatChipsModule, MatIconModule,
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
                      @if (cta(req); as label) {
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
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Maintained accounts</mat-label>
              <input matInput type="number" min="0" max="1000" [(ngModel)]="accountsCount" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="saveAccounts()" [disabled]="acting()">Save</button>
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
    .accounts-row { display: flex; gap: 0.75em; align-items: center; padding: 1em; flex-wrap: wrap; }
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
  protected readonly showAccounts = signal(false);
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
          this.showAccounts.set((res.data?.missing ?? []).some((m) => m.key === 'accounts'));
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
    if (req.key === 'accounts') return 'Record below';
    if (req.key === 'g8Request') return 'Submit request';
    if (req.key === 'nomination') return 'Request nomination';
    return '';
  }

  protected act(req: MissingRequirement): void {
    if (BOOLEAN_STAMPS.has(req.key)) {
      this.mutate({ [req.key]: { done: true } }, `"${req.label}" recorded.`);
    } else if (req.key === 'accounts') {
      this.showAccounts.set(true);
    } else if (req.key === 'g8Request') {
      this.mutate({ g8Request: { status: 'submitted' } }, 'Request sent to your G8 Leader.');
    } else if (req.key === 'nomination') {
      this.requestNomination();
    }
  }

  protected saveAccounts(): void {
    this.mutate({ accounts: { count: Math.max(0, Number(this.accountsCount()) || 0) } }, 'Accounts recorded.');
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
