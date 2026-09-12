import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ProgressionService } from '../../../../../core/progression/progression.service';
import { PendingConfirmation } from '../../../../../core/progression/progression.models';
import { ApiError } from '../../../../../core/http/api-error';

/**
 * @title Confirm training — upline approval inbox.
 *
 * Pending IPO/QSG/SMO marks from the downline with per-item approve and
 * decline (decline requires the reason note — it goes straight to the
 * member). OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-training-confirmations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Confirm training</span>
      </div>
    </section>

    <section class="confirm-page">
      <div class="page-head">
        <div>
          <h2>Confirm training</h2>
          <p class="subtitle">Your downline marked these complete — verify and confirm so their gates unlock.</p>
        </div>
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

      @if (items().length > 0) {
        <ul class="card-list">
          @for (entry of items(); track entry.partnerId) {
            <li class="dp-card member-card">
              <div class="card-top">
                <div>
                  <strong>{{ entry.member?.name ?? 'Team member' }}</strong>
                  <span class="muted">@{{ entry.member?.username ?? '—' }}</span>
                </div>
              </div>
              @for (p of entry.pending; track p.key) {
                <div class="pending-row">
                  <div>
                    <strong>{{ p.label }}</strong>
                    <span class="muted"> · requested {{ p.requestedAt | date:'mediumDate' }}</span>
                  </div>
                  @if (deciding() === decisionKey(entry.partnerId, p.key)) {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="note-field">
                      <mat-label>Reason (required to decline)</mat-label>
                      <input matInput [(ngModel)]="noteDraft" maxlength="500" placeholder="What remains outstanding?" />
                    </mat-form-field>
                  }
                  <div class="row-actions">
                    <button mat-flat-button color="primary" (click)="decide(entry, p.key, true)" [disabled]="deciding() !== null">
                      {{ deciding() === decisionKey(entry.partnerId, p.key) && lastApproved() ? 'Confirming…' : 'Approve' }}
                    </button>
                    @if (deciding() === decisionKey(entry.partnerId, p.key)) {
                      <button mat-button (click)="decide(entry, p.key, false)" [disabled]="deciding() !== null || !noteDraft().trim()">Confirm decline</button>
                      <button mat-button (click)="deciding.set(null)">Cancel</button>
                    } @else {
                      <button mat-button (click)="askDecline(entry, p.key)" [disabled]="deciding() !== null">Decline</button>
                    }
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      } @else if (!loading() && !error()) {
        <p class="empty">Nothing awaiting confirmation — your downline is either confirmed or quiet.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .confirm-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .card-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .member-card { padding: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .card-top { display: flex; justify-content: space-between; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .pending-row { display: flex; flex-direction: column; gap: 0.4em; border-top: 1px solid var(--dp-line); padding-top: 0.6em; }
    .row-actions { display: flex; gap: 0.4em; flex-wrap: wrap; align-items: center; }
    .row-actions button { min-height: 44px; }
    .note-field { width: 100%; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .notice { color: var(--dp-success, #2e7d32); }
    .empty { color: var(--dp-muted); }
  `],
})
export class TrainingConfirmationsComponent implements OnInit {
  private readonly progress = inject(ProgressionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly items = signal<PendingConfirmation[]>([]);
  protected readonly deciding = signal<string | null>(null);
  protected readonly lastApproved = signal(true);
  protected readonly noteDraft = signal('');

  ngOnInit(): void {
    this.reload();
  }

  protected decisionKey(partnerId: string, key: string): string {
    return `${partnerId}:${key}`;
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.progress
      .pendingConfirmations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set(res.data?.items ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected askDecline(entry: PendingConfirmation, key: string): void {
    this.deciding.set(this.decisionKey(entry.partnerId, key));
    this.lastApproved.set(false);
    this.noteDraft.set('');
    this.notice.set(null);
  }

  protected decide(entry: PendingConfirmation, key: string, approved: boolean): void {
    if (approved) {
      this.deciding.set(this.decisionKey(entry.partnerId, key));
      this.lastApproved.set(true);
    }
    const note = this.noteDraft().trim();
    if (!approved && !note) return;
    this.error.set(null);
    this.notice.set(null);
    this.progress
      .decideTraining(entry.partnerId, key, approved, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deciding.set(null);
          this.noteDraft.set('');
          this.notice.set(approved ? 'Training confirmed — their gate unlocks.' : 'Declined with your reason — they have been notified.');
          this.reload();
        },
        error: (err: ApiError) => {
          this.deciding.set(null);
          this.error.set(err.message);
        },
      });
  }
}
