import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { AdminBroadcastService, BroadcastRow } from './admin-broadcast.service';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Broadcast — platform-wide admin notices.
 *
 * Composer writes one in-app notice per member (bounded server-side,
 * deduped by broadcast id); history below shows reach. Email-at-scale
 * is deliberately out — members read these in the notification center.
 * OnPush + signals, token-blind dark shells.
 */
@Component({
  selector: 'async-admin-broadcast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule, MatTableModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Broadcast</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Broadcast</h2>
          <p class="subtitle">One notice to every member's notification center — maintenance, policy, events. Use sparingly.</p>
        </div>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      <div class="dp-card compose-card">
        <h3>New broadcast</h3>
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput [value]="title()" (input)="title.set($any($event.target).value)" maxlength="140" placeholder="Scheduled maintenance tonight" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Message</mat-label>
          <textarea matInput rows="3" [value]="body()" (input)="body.set($any($event.target).value)" maxlength="2000" placeholder="What members need to know"></textarea>
        </mat-form-field>
        <div class="compose-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Link (optional)</mat-label>
            <input matInput [value]="link()" (input)="link.set($any($event.target).value)" maxlength="500" placeholder="/dashboard/community" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Priority</mat-label>
            <mat-select [value]="priority()" (selectionChange)="priority.set($event.value)">
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
            </mat-select>
          </mat-form-field>
          @if (confirming()) {
            <button mat-flat-button color="warn" (click)="send()" [disabled]="sending() || !canSend()">
              {{ sending() ? 'Sending…' : 'Confirm send to all?' }}
            </button>
            <button mat-button (click)="confirming.set(false)">Cancel</button>
          } @else {
            <button mat-flat-button color="primary" (click)="confirming.set(true)" [disabled]="!canSend()">Review & send</button>
          }
        </div>
        @if (sendError(); as err) {
          <p class="error" role="alert">{{ err }}</p>
        }
      </div>

      <h3>History</h3>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="notice">
              <th mat-header-cell *matHeaderCellDef>Broadcast</th>
              <td mat-cell *matCellDef="let row" class="notice-cell">
                <strong>{{ row.title }}</strong>
                <span class="muted">{{ row.body }}</span>
                <span class="muted">{{ row.createdAt | date:'medium' }} · reached {{ row.recipientCount }}@if (row.capped) { (capped) }</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Priority</th>
              <td mat-cell *matCellDef="let row"><span [class]="row.priority === 'high' ? 'dp-status dp-status--bad' : 'dp-status dp-status--warn'">{{ row.priority }}</span></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <div class="pager">
          <button mat-button (click)="page(-1)" [disabled]="skip() === 0 || loading()">Previous</button>
          <span class="muted">{{ total() }} broadcasts</span>
          <button mat-button (click)="page(1)" [disabled]="skip() + limit() >= total() || loading()">Next</button>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No broadcasts yet.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .queue-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .notice { color: var(--dp-success); }
    .compose-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .compose-card h3 { margin: 0; }
    .compose-row { display: flex; gap: 0.75em; align-items: center; flex-wrap: wrap; }
    .compose-row mat-form-field { min-width: 200px; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .notice-cell { display: flex; flex-direction: column; gap: 0.15em; max-width: 520px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .empty { color: var(--dp-muted); }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .pager { display: flex; align-items: center; gap: 1em; }
    button { min-height: 44px; }
  `],
})
export class AdminBroadcastComponent implements OnInit {
  private readonly cast = inject(AdminBroadcastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly sendError = signal<string | null>(null);
  protected readonly rows = signal<BroadcastRow[]>([]);
  protected readonly total = signal(0);
  protected readonly limit = signal(25);
  protected readonly skip = signal(0);
  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly link = signal('');
  protected readonly priority = signal<'high' | 'medium'>('high');
  protected readonly confirming = signal(false);
  protected readonly sending = signal(false);

  protected readonly displayedColumns = ['notice', 'priority'];

  ngOnInit(): void {
    this.reload();
  }

  protected canSend(): boolean {
    return this.title().trim().length >= 3 && this.body().trim().length >= 3;
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cast
      .history({ limit: this.limit(), skip: this.skip() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data?.items ?? []);
          this.total.set(res.data?.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected page(direction: 1 | -1): void {
    this.skip.set(Math.max(0, this.skip() + direction * this.limit()));
    this.reload();
  }

  protected send(): void {
    if (!this.canSend() || this.sending()) return;
    this.sending.set(true);
    this.sendError.set(null);
    this.notice.set(null);
    this.cast
      .send({
        title: this.title().trim(),
        body: this.body().trim(),
        ...(this.link().trim() ? { link: this.link().trim() } : {}),
        priority: this.priority(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sending.set(false);
          this.confirming.set(false);
          this.title.set('');
          this.body.set('');
          this.link.set('');
          this.notice.set(res.message ?? `Broadcast sent to ${res.data?.delivered ?? 0} members.`);
          this.skip.set(0);
          this.reload();
        },
        error: (err: ApiError) => {
          this.sending.set(false);
          this.sendError.set(err.message);
        },
      });
  }
}
