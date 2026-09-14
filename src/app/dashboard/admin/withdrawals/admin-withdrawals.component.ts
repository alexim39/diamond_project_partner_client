import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { AdminWithdrawalService, WithdrawalRow } from './admin-withdrawal.service';
import { ApiError } from '../../../core/http/api-error';

type QueueFilter = 'Pending' | 'Paid' | 'Rejected' | 'All';

/**
 * @title Withdrawals — admin payout decisions.
 *
 * Money is already debited when rows land here: mark Paid (with receipt
 * reference) or Reject with a reason (auto-refunds in full). FIFO
 * oldest-first; partner notified on every move. OnPush + signals.
 */
@Component({
  selector: 'async-admin-withdrawals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, FormsModule, MatButtonModule, MatChipsModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule,
    MatTableModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Withdrawals</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Withdrawals</h2>
          <p class="subtitle">Debited money waiting on you — pay them with a receipt, or reject with a full refund.</p>
        </div>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">
          <mat-icon>check_circle</mat-icon> {{ note }}
        </p>
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

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Status</mat-label>
          <mat-select [value]="filter()" (selectionChange)="filter.set($event.value); pageIndex.set(0); reload()">
            @for (f of filters; track f) {
              <mat-option [value]="f">{{ f === 'All' ? 'All statuses' : f }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (total() > 0) {
          <mat-chip highlighted>{{ total() }} request{{ total() === 1 ? '' : 's' }}</mat-chip>
        }
      </div>

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="owner">
              <th mat-header-cell *matHeaderCellDef>Partner</th>
              <td mat-cell *matCellDef="let row" class="name-cell">
                {{ row.owner?.name ?? '—' }}
                <span class="muted">@{{ row.owner?.username ?? '—' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row" class="num-cell">₦{{ row.amount | number }}</td>
            </ng-container>
            <ng-container matColumnDef="destination">
              <th mat-header-cell *matHeaderCellDef>Pay to</th>
              <td mat-cell *matCellDef="let row">
                {{ row.bank ?? '—' }} · {{ row.accountNumber ?? '—' }}
                <span class="muted">{{ row.accountName ?? '' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="age">
              <th mat-header-cell *matHeaderCellDef>Waiting</th>
              <td mat-cell *matCellDef="let row">{{ ageInQueue(row) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="dp-status {{ statusTone(row.status) }}">{{ row.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirming()?.id === row._id) {
                  @if (confirming()?.kind === 'pay') {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="reason-field">
                      <mat-label>Receipt reference</mat-label>
                      <input matInput [ngModel]="receiptRef()" (ngModelChange)="receiptRef.set($event)" maxlength="64" placeholder="Bank transfer ref" />
                    </mat-form-field>
                  } @else {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="reason-field">
                      <mat-label>Reason (partner sees this)</mat-label>
                      <input matInput [ngModel]="rejectReason()" (ngModelChange)="rejectReason.set($event)" maxlength="500" placeholder="e.g. Account name mismatch" />
                    </mat-form-field>
                  }
                  <button
                    mat-flat-button
                    [color]="confirming()?.kind === 'pay' ? 'primary' : 'warn'"
                    (click)="apply(row)"
                    [disabled]="actingId() === row._id"
                  >{{ actingLabel(row) }}</button>
                  <button mat-button (click)="confirming.set(null)">Cancel</button>
                } @else {
                  @if (row.status === 'Pending') {
                    <button mat-flat-button color="primary" (click)="arm(row._id, 'pay')" [disabled]="actingId() === row._id">Mark paid</button>
                    <button mat-button color="warn" (click)="arm(row._id, 'reject')" [disabled]="actingId() === row._id">Reject</button>
                  }
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator
            [length]="total()"
            [pageSize]="pageSize()"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPage($event)"
          ></mat-paginator>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">Queue clear — no withdrawals{{ filter() === 'All' ? '' : ' under ' + filter() }}.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .queue-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .notice { display: flex; align-items: center; gap: 0.5em; background: var(--dp-success-bg); color: var(--dp-success); border-radius: 8px; padding: 0.7em 1em; margin: 0; }
    html[data-theme='dark'] .notice { color: #9ccc9f; }
    .toolbar { display: flex; gap: 0.75em; align-items: center; flex-wrap: wrap; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .name-cell .muted { display: block; font-weight: 400; }
    .num-cell { text-align: right; }
    .reason-field { min-width: 220px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    html[data-theme='dark'] .error { color: #e89a9a; }
    .empty { color: var(--dp-muted); }
    button { min-height: 44px; }
  `],
})
export class AdminWithdrawalsComponent implements OnInit {
  private readonly admin = inject(AdminWithdrawalService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirming = signal<{ id: string; kind: 'pay' | 'reject' } | null>(null);
  protected readonly rejectReason = signal('');
  protected readonly receiptRef = signal('');
  protected readonly notice = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<WithdrawalRow[]>([]);
  protected readonly total = signal(0);
  protected readonly filter = signal<QueueFilter>('Pending');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);

  protected readonly filters: QueueFilter[] = ['Pending', 'Paid', 'Rejected', 'All'];
  protected readonly displayedColumns = ['owner', 'amount', 'destination', 'age', 'status', 'action'];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .queue(this.filter(), this.pageIndex() * this.pageSize(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.total.set(res.meta?.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.reload();
  }

  protected ageInQueue(row: WithdrawalRow): string {
    const ms = Date.now() - new Date(row.date ?? 0).getTime();
    if (Number.isNaN(ms) || ms < 0) return '—';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'just now';
    const units: Array<[string, number]> = [['y', 525600], ['mo', 43200], ['w', 10080], ['d', 1440], ['h', 60], ['m', 1]];
    const parts: string[] = [];
    let rest = minutes;
    for (const [label, size] of units) {
      const n = Math.floor(rest / size);
      if (n > 0) {
        parts.push(`${n}${label}`);
        rest -= n * size;
      }
      if (parts.length === 2) break;
    }
    return parts.join(' ');
  }

  protected statusTone(status: string): string {
    switch (String(status ?? '').toLowerCase()) {
      case 'paid':
      case 'completed': return 'dp-status--ok';
      case 'pending': return 'dp-status--warn';
      case 'rejected': return 'dp-status--bad';
      default: return 'dp-status--info';
    }
  }

  protected arm(id: string, kind: 'pay' | 'reject'): void {
    this.confirming.set({ id, kind });
    this.rejectReason.set('');
    this.receiptRef.set('');
    this.notice.set(null);
  }

  protected actingLabel(row: WithdrawalRow): string {
    if (this.actingId() === row._id) return 'Working…';
    return this.confirming()?.kind === 'pay' ? 'Confirm paid?' : 'Confirm reject + refund?';
  }

  protected apply(row: WithdrawalRow): void {
    const c = this.confirming();
    if (!c || this.actingId()) return;
    this.actingId.set(row._id);
    const opts = c.kind === 'pay'
      ? { reference: this.receiptRef().trim() }
      : { reason: this.rejectReason().trim() };
    this.admin
      .decide(row._id, c.kind === 'pay' ? 'Paid' : 'Rejected', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.confirming.set(null);
          this.notice.set(
            c.kind === 'pay'
              ? 'Marked paid — partner notified.'
              : 'Rejected — held amount refunded, partner notified.',
          );
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }
}
