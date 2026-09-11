import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { BillingService } from '../../../../core/billing/billing.service';
import { CommissionEntry, CommissionStatus, CommissionSums, PerformanceData } from '../../../../core/billing/billing.models';
import { ApiError } from '../../../../core/http/api-error';

const STATUS_META: Record<CommissionStatus, { label: string; color: string; text: string }> = {
  Pending: { label: 'Pending', color: '#ffecb3', text: '#7a5c00' },
  Released: { label: 'Released', color: '#c8e6c9', text: '#1b5e20' },
  Voided: { label: 'Voided', color: '#e0e0e0', text: '#424242' },
  Reversed: { label: 'Reversed', color: '#ffcdd2', text: '#b71c1c' },
};

const naira = (n: number): string =>
  `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * @title Commission overview — earnings, performance, ledger.
 *
 * Summary cards (lifetime/released/pending + team volume/downline/recruits)
 * over a filterable ledger table. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-commission-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatChipsModule, MatButtonModule, MatButtonToggleModule,
    MatIconModule, MatProgressBarModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Settings</a> &gt;
        <span>Commissions</span>
      </div>
    </section>

    <section class="commissions-page">
      <div class="page-head">
        <div>
          <h2>Commission Overview</h2>
          <p class="subtitle">Unilevel earnings from your network's purchases — released after order fulfillment.</p>
        </div>
        <mat-button-toggle-group>
          <mat-button-toggle routerLink="../billing" title="Billing settings">
            <mat-icon>account_balance_wallet</mat-icon> Billing
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (loading() && !performance()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (performance(); as perf) {
        <div class="cards">
          <div class="card accent">
            <span class="k">Lifetime earnings</span>
            <strong>{{ money(perf.commissions.lifetime) }}</strong>
            <span class="muted">{{ perf.commissions.releasedCount }} payouts</span>
          </div>
          <div class="card">
            <span class="k">Released</span>
            <strong>{{ money(perf.commissions.Released) }}</strong>
            <span class="muted">spendable balance</span>
          </div>
          <div class="card">
            <span class="k">Pending</span>
            <strong>{{ money(perf.commissions.Pending) }}</strong>
            <span class="muted">{{ perf.commissions.pendingCount }} awaiting fulfillment</span>
          </div>
          <div class="card">
            <span class="k">Team volume</span>
            <strong>{{ money(perf.teamVolume) }}</strong>
            <span class="muted">{{ perf.teamOrders }} orders · {{ perf.downlineCount }} downlines</span>
          </div>
          <div class="card">
            <span class="k">Personal volume</span>
            <strong>{{ money(perf.personalVolume) }}</strong>
            <span class="muted">{{ perf.personalOrders }} orders · {{ perf.recruitsThisMonth }} recruits this month</span>
          </div>
        </div>
        @if (perf.downlineTruncated) {
          <p class="muted">Team figures cover the first 10 levels — contact support for a full audit.</p>
        }
      }

      <div class="ledger-head">
        <h3>Earnings ledger</h3>
        <div class="filters" role="group" aria-label="Filter by status">
          @for (f of filters; track f.value) {
            <button
              mat-button
              [color]="statusFilter() === f.value ? 'primary' : undefined"
              (click)="setFilter(f.value)"
            >{{ f.label }}</button>
          }
        </div>
      </div>

      @if (loadingEntries()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (entries().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="entries()" class="mat-elevation-z2">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let e">{{ dateOf(e) }}</td>
            </ng-container>
            <ng-container matColumnDef="buyer">
              <th mat-header-cell *matHeaderCellDef>Buyer</th>
              <td mat-cell *matCellDef="let e">{{ e.buyerName || e.buyerUsername }}</td>
            </ng-container>
            <ng-container matColumnDef="level">
              <th mat-header-cell *matHeaderCellDef>Level</th>
              <td mat-cell *matCellDef="let e">L{{ e.level }} · {{ percent(e.rate) }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let e" class="amount">{{ money(e.amount) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <mat-chip [style.background]="chip(e.status).color" [style.color]="chip(e.status).text" highlighted>
                  {{ chip(e.status).label }}
                </mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <div class="pager">
          <button mat-button (click)="page(-1)" [disabled]="skip() === 0 || loadingEntries()">Previous</button>
          <span class="muted">{{ total() }} entries</span>
          <button mat-button (click)="page(1)" [disabled]="skip() + limit() >= total() || loadingEntries()">Next</button>
        </div>
      } @else if (!loadingEntries() && !error()) {
        <p class="empty">No earnings yet — commissions appear here when your downline purchases.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .commissions-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75em; }
    .card { display: flex; flex-direction: column; gap: 0.15em; background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 0.9em 1em; }
    .card.accent { background: #e8f5e9; border-color: #a5d6a7; }
    .card .k { font-size: 0.85em; color: var(--dp-muted); }
    .card strong { font-size: 1.4em; }
    .ledger-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5em; }
    .ledger-head h3 { margin: 0; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .amount { font-weight: 600; white-space: nowrap; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: #d32f2f; display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    .pager { display: flex; align-items: center; gap: 1em; }
  `],
})
export class CommissionOverviewComponent implements OnInit {
  private readonly billing = inject(BillingService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly loadingEntries = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly performance = signal<PerformanceData | null>(null);
  protected readonly entries = signal<CommissionEntry[]>([]);
  protected readonly total = signal(0);
  protected readonly limit = signal(50);
  protected readonly skip = signal(0);
  protected readonly statusFilter = signal<CommissionStatus | null>(null);

  protected readonly displayedColumns = ['date', 'buyer', 'level', 'amount', 'status'];
  protected readonly filters: Array<{ label: string; value: CommissionStatus | null }> = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'Pending' },
    { label: 'Released', value: 'Released' },
    { label: 'Voided', value: 'Voided' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.billing
      .performance()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.performance.set(res.data);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
    this.loadEntries();
  }

  protected setFilter(status: CommissionStatus | null): void {
    if (this.statusFilter() === status) return;
    this.statusFilter.set(status);
    this.skip.set(0);
    this.loadEntries();
  }

  protected page(direction: 1 | -1): void {
    this.skip.set(Math.max(0, this.skip() + direction * this.limit()));
    this.loadEntries();
  }

  private loadEntries(): void {
    this.loadingEntries.set(true);
    this.billing
      .myCommissions({ status: this.statusFilter() ?? undefined, limit: this.limit(), skip: this.skip() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.entries.set(res.data.items ?? []);
          this.total.set(res.data.total ?? 0);
          this.loadingEntries.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loadingEntries.set(false);
        },
      });
  }

  protected money(n: number): string {
    return naira(n);
  }

  protected percent(rate: number): string {
    return `${Math.round(Number(rate) * 100)}%`;
  }

  protected dateOf(entry: CommissionEntry): string {
    return entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—';
  }

  protected chip(status: CommissionStatus): { label: string; color: string; text: string } {
    return STATUS_META[status] ?? STATUS_META['Pending'];
  }
}
