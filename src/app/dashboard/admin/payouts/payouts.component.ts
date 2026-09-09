import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { BillingService } from '../../../core/billing/billing.service';
import { PendingCart } from '../../../core/billing/billing.models';
import { ApiError } from '../../../core/http/api-error';

const naira = (n: number): string =>
  `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * @title Payout queue — admin fulfillment console.
 *
 * One row per order with pending commissions. Release flips entries to
 * Released and credits earners (atomic server-side); Void cancels pending
 * ones and claws back any already released. Two-step confirm on both.
 */
@Component({
  selector: 'async-payout-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Payout Queue</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Payout Queue</h2>
          <p class="subtitle">Release commissions for fulfilled orders, or void cancelled ones.</p>
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

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="buyer">
              <th mat-header-cell *matHeaderCellDef>Buyer</th>
              <td mat-cell *matCellDef="let row">{{ row.buyerName || row.buyerUsername }}</td>
            </ng-container>
            <ng-container matColumnDef="entries">
              <th mat-header-cell *matHeaderCellDef>Entries</th>
              <td mat-cell *matCellDef="let row">{{ row.entries }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let row" class="amount">{{ money(row.total) }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirm(); as c) {
                  @if (c.cartId === row.cartId) {
                    <button
                      mat-flat-button
                      [color]="c.kind === 'release' ? 'primary' : 'warn'"
                      (click)="apply(row, c.kind)"
                      [disabled]="actingId() === row.cartId"
                    >Confirm {{ c.kind }}?</button>
                    <button mat-button (click)="confirm.set(null)">Cancel</button>
                  }
                } @else {
                  <button mat-flat-button color="primary" (click)="arm(row.cartId, 'release')" [disabled]="actingId() === row.cartId">
                    Release
                  </button>
                  <button mat-button color="warn" (click)="arm(row.cartId, 'void')" [disabled]="actingId() === row.cartId">
                    Void
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <div class="pager">
          <button mat-button (click)="page(-1)" [disabled]="skip() === 0 || loading()">Previous</button>
          <span class="muted">{{ total() }} orders awaiting release</span>
          <button mat-button (click)="page(1)" [disabled]="skip() + limit() >= total() || loading()">Next</button>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">Queue is clear — no pending commissions.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .queue-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: #666; }
    .notice { display: flex; align-items: center; gap: 0.5em; color: #1b5e20; background: #e8f5e9; border-radius: 8px; padding: 0.6em 1em; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .amount { font-weight: 600; white-space: nowrap; }
    .muted { color: #777; font-size: 0.85em; }
    .error { color: #d32f2f; display: flex; align-items: center; gap: 0.5em; }
    .empty { color: #666; }
    .pager { display: flex; align-items: center; gap: 1em; }
  `],
})
export class PayoutQueueComponent implements OnInit {
  private readonly billing = inject(BillingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly rows = signal<PendingCart[]>([]);
  protected readonly total = signal(0);
  protected readonly limit = signal(25);
  protected readonly skip = signal(0);
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirm = signal<{ cartId: string; kind: 'release' | 'void' } | null>(null);

  protected readonly displayedColumns = ['buyer', 'entries', 'total', 'action'];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.billing
      .pendingQueue({ limit: this.limit(), skip: this.skip() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data.items ?? []);
          this.total.set(res.data.total ?? 0);
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

  protected money(n: number): string {
    return naira(n);
  }

  protected arm(cartId: string, kind: 'release' | 'void'): void {
    this.notice.set(null);
    this.confirm.set({ cartId, kind });
  }

  protected apply(row: PendingCart, kind: 'release' | 'void'): void {
    this.actingId.set(row.cartId);
    const call = kind === 'release' ? this.billing.release(row.cartId) : this.billing.void(row.cartId);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.actingId.set(null);
        this.confirm.set(null);
        this.notice.set(kind === 'release'
          ? `Released ${naira(row.total)} across ${row.entries} entries.`
          : `Order voided (${row.entries} entries settled).`);
        this.reload();
      },
      error: (err: ApiError) => {
        this.actingId.set(null);
        this.confirm.set(null);
        this.error.set(err.message);
      },
    });
  }
}
