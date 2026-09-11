import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import { ChartThemeService } from '../../../core/charts/chart-theme.service';
import type { EChartsCoreOption } from '../../../core/charts/echarts-setup';
import { forkJoin } from 'rxjs';
import { BillingService } from '../../../core/billing/billing.service';
import { CommissionEntry, CommissionStatus, CommissionSums, EarningsTrendBucket } from '../../../core/billing/billing.models';
import { ApiError } from '../../../core/http/api-error';

const STATUS_FILTERS: Array<{ label: string; value: CommissionStatus | null }> = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'Pending' },
  { label: 'Released', value: 'Released' },
  { label: 'Voided', value: 'Voided' },
  { label: 'Reversed', value: 'Reversed' },
];

/**
 * @title My earnings — sums, monthly trend and ledger history.
 *
 * Released vs pending at a glance, monthly released bars, filterable
 * ledger with load-more. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-earnings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, MatButtonModule, MatCardModule, MatChipsModule,
    MatIconModule, MatProgressBarModule, MatTableModule, NgxEchartsDirective, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Earnings</span>
      </div>
    </section>

    <section class="earnings-page">
      <div class="page-head">
        <div>
          <h2>My Earnings</h2>
          <p class="subtitle">Released, pending and every ledger entry behind them.</p>
        </div>
        <a mat-button routerLink="/dashboard/insights">Exports</a>
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

      @if (sums(); as s) {
        <div class="stat-grid">
          <mat-card>
            <mat-card-content>
              <mat-icon>payments</mat-icon>
              <span class="stat-value">{{ s.Released | number }}</span>
              <span class="stat-label">Released lifetime ({{ s.releasedCount | number }})</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>hourglass_top</mat-icon>
              <span class="stat-value">{{ s.Pending | number }}</span>
              <span class="stat-label">Pending ({{ s.pendingCount | number }})</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>trending_up</mat-icon>
              <span class="stat-value">{{ thisMonth() | number }}</span>
              <span class="stat-label">Released this month</span>
            </mat-card-content>
          </mat-card>
        </div>
      }

      @if (earningsChart(); as chart) {
        <div class="dp-card trends">
          <h3>Released — last {{ trend().length }} months</h3>
          <div echarts [options]="chart" class="chart" role="img" aria-label="Monthly released earnings chart"></div>
        </div>
      }

      <h3>Ledger</h3>
      <div class="filters" role="group" aria-label="Filter by status">
        @for (f of statusFilters; track f.label) {
          <button mat-button [color]="statusFilter() === f.value ? 'primary' : undefined" (click)="setStatus(f.value)">
            {{ f.label }}
          </button>
        }
      </div>

      @if (entries().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="entries()" class="mat-elevation-z2">
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let e" class="num-cell">{{ e.amount | number }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="dp-status" [class.dp-status--ok]="e.status === 'Released'" [class.dp-status--warn]="e.status === 'Pending'" [class.dp-status--bad]="e.status === 'Voided' || e.status === 'Reversed'">{{ e.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="released">
              <th mat-header-cell *matHeaderCellDef>Released</th>
              <td mat-cell *matCellDef="let e">{{ e.releasedAt ? (e.releasedAt | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="recorded">
              <th mat-header-cell *matHeaderCellDef>Recorded</th>
              <td mat-cell *matCellDef="let e">{{ e.createdAt | date:'mediumDate' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <p class="muted">{{ entries().length }} of {{ total() }} entries</p>
        @if (entries().length < total()) {
          <button mat-button (click)="loadMore()" [disabled]="loadingMore()">Show more</button>
        }
      } @else if (!loading() && !error()) {
        <p class="empty">No entries yet — earnings appear here after checkout accrual.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .earnings-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .earnings-page h3 { margin: 0.5em 0 0; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75em; }
    .stat-grid mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .stat-grid mat-icon { color: var(--dp-gold); }
    .stat-value { font-size: 1.5em; font-weight: 700; }
    .stat-label { color: var(--dp-muted); font-size: 0.85em; }
    .trends { padding: 1em; }
    .trends h3 { margin: 0 0 0.75em; font-size: 1em; }
    .chart { height: 260px; width: 100%; }
    .filters { display: flex; gap: 0.25em; flex-wrap: wrap; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .num-cell { font-weight: 600; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class EarningsComponent implements OnInit {
  private readonly billing = inject(BillingService);
  private readonly charts = inject(ChartThemeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sums = signal<CommissionSums | null>(null);
  protected readonly trend = signal<EarningsTrendBucket[]>([]);  protected readonly entries = signal<CommissionEntry[]>([]);
  protected readonly total = signal(0);
  protected readonly statusFilter = signal<CommissionStatus | null>(null);

  protected readonly displayedColumns = ['amount', 'status', 'released', 'recorded'];
  protected readonly statusFilters = STATUS_FILTERS;
  protected readonly thisMonth = computed(() => this.trend()[this.trend().length - 1]?.total ?? 0);

  /** Released-earnings chart — rebuilt on data or light/dark toggle. */
  protected readonly earningsChart = computed<EChartsCoreOption | null>(() => {
    const buckets = this.trend();
    if (buckets.length === 0) return null;
    const p = this.charts.palette();
    const ax = this.charts.axis();
    return {
      ...this.charts.base(),
      tooltip: { trigger: 'axis', valueFormatter: (v: number | string) => `${v}` },
      grid: { left: 56, right: 12, top: 24, bottom: 28 },
      xAxis: { type: 'category', data: buckets.map((b) => b.label), ...ax },
      yAxis: { type: 'value', ...ax },
      series: [
        {
          type: 'bar',
          data: buckets.map((b) => b.total),
          itemStyle: { color: p.success, borderRadius: [6, 6, 0, 0] },
          emphasis: { itemStyle: { color: p.gold } },
        },
      ],
    };
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ ledger: this.billing.myCommissions({ limit: 50 }), trends: this.billing.trends() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ ledger, trends }) => {
          this.sums.set(ledger.data?.sums ?? null);
          this.entries.set(ledger.data?.items ?? []);
          this.total.set(ledger.data?.total ?? 0);
          this.trend.set(trends.data?.buckets ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected setStatus(status: CommissionStatus | null): void {
    this.statusFilter.set(status);
    this.loading.set(true);
    this.billing
      .myCommissions({ limit: 50, ...(status ? { status } : {}) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sums.set(res.data?.sums ?? null);
          this.entries.set(res.data?.items ?? []);
          this.total.set(res.data?.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected loadMore(): void {
    this.loadingMore.set(true);
    const status = this.statusFilter();
    this.billing
      .myCommissions({ limit: 50, skip: this.entries().length, ...(status ? { status } : {}) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingMore.set(false);
          this.entries.set([...this.entries(), ...(res.data?.items ?? [])]);
        },
        error: (err: ApiError) => {
          this.loadingMore.set(false);
          this.error.set(err.message);
        },
      });
  }
}
