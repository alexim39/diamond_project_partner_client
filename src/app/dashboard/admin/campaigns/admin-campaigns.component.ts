import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
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
import { AdminCampaignRow, AdminCampaignService } from './admin-campaign.service';
import { ApiError } from '../../../core/http/api-error';

type QueueFilter = 'Pending' | 'Active' | 'Ended' | 'Rejected' | 'All';

/**
 * @title Ad campaigns — admin fulfillment queue.
 *
 * Money is already held when rows land here: run them (Pending→Active),
 * reject with a reason (auto-refunds in full), or end finished flights.
 * FIFO oldest-first; partner notified on every move. OnPush + signals.
 */
@Component({
  selector: 'async-admin-campaigns',
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
        <span>Ad campaigns</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Ad campaigns</h2>
          <p class="subtitle">Held money, oldest first — run them, reject with refund, or end finished flights.</p>
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
          <mat-chip highlighted>{{ total() }} in queue</mat-chip>
        }
      </div>

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="campaign">
              <th mat-header-cell *matHeaderCellDef>Campaign</th>
              <td mat-cell *matCellDef="let row" class="name-cell">
                {{ row.campaignName }}
                <span class="muted">{{ targetSummary(row) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="owner">
              <th mat-header-cell *matHeaderCellDef>Owner</th>
              <td mat-cell *matCellDef="let row">
                {{ row.owner?.name ?? '—' }}
                <span class="muted">@{{ row.owner?.username ?? '—' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="budget">
              <th mat-header-cell *matHeaderCellDef>Held</th>
              <td mat-cell *matCellDef="let row" class="num-cell">{{ row.budget?.budgetAmount | number }}</td>
            </ng-container>
            <ng-container matColumnDef="age">
              <th mat-header-cell *matHeaderCellDef>Waiting</th>
              <td mat-cell *matCellDef="let row">{{ ageInQueue(row) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="dp-status {{ statusTone(row.deliveryStatus) }}">{{ row.deliveryStatus }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirming()?.id === row._id) {
                  @if (confirming()?.kind === 'reject') {
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="reason-field">
                      <mat-label>Reason (partner sees this)</mat-label>
                      <input matInput [ngModel]="rejectReason()" (ngModelChange)="rejectReason.set($event)" maxlength="500" placeholder="e.g. Budget below channel minimum" />
                    </mat-form-field>
                  }
                  <button
                    mat-flat-button
                    [color]="confirming()?.kind === 'run' ? 'primary' : 'warn'"
                    (click)="apply(row)"
                    [disabled]="actingId() === row._id"
                  >{{ actingLabel(row) }}</button>
                  <button mat-button (click)="confirming.set(null)">Cancel</button>
                } @else {
                  @if (row.deliveryStatus === 'Pending') {
                    <button mat-flat-button color="primary" (click)="arm(row._id, 'run')" [disabled]="actingId() === row._id">Run</button>
                    <button mat-button color="warn" (click)="arm(row._id, 'reject')" [disabled]="actingId() === row._id">Reject</button>
                  }
                  @if (row.deliveryStatus === 'Active') {
                    <button mat-button (click)="arm(row._id, 'end')" [disabled]="actingId() === row._id">End</button>
                  }
                  <a mat-icon-button [routerLink]="['/dashboard/tools/campaigns/detail', row._id]" title="Full record" aria-label="Full record">
                    <mat-icon>read_more</mat-icon>
                  </a>
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
        <p class="empty">Queue clear — nothing waiting{{ filter() === 'All' ? '' : ' under ' + filter() }}.</p>
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
export class AdminCampaignsComponent implements OnInit {
  private readonly admin = inject(AdminCampaignService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirming = signal<{ id: string; kind: 'run' | 'reject' | 'end' } | null>(null);
  protected readonly rejectReason = signal('');
  protected readonly notice = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<AdminCampaignRow[]>([]);
  protected readonly total = signal(0);
  protected readonly filter = signal<QueueFilter>('Pending');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);

  protected readonly filters: QueueFilter[] = ['Pending', 'Active', 'Ended', 'Rejected', 'All'];
  protected readonly displayedColumns = ['campaign', 'owner', 'budget', 'age', 'status', 'action'];

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

  protected targetSummary(row: AdminCampaignRow): string {
    const targets = row.targetAudience?.locationTargets;
    if (Array.isArray(targets) && targets.length > 0) {
      return targets.length > 3 ? `${targets.length} places` : targets.join(', ');
    }
    return '';
  }

  protected ageInQueue(row: AdminCampaignRow): string {
    const ms = Date.now() - new Date(row.createdAt ?? 0).getTime();
    if (Number.isNaN(ms) || ms < 0) return '—';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'just now';
    // Largest two units: 2y 3mo · 4mo 1w · 2w 3d · 5d 4h · 3h 20m · 45m.
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
      case 'active': return 'dp-status--ok';
      case 'pending': return 'dp-status--warn';
      case 'rejected':
      case 'ended': return 'dp-status--bad';
      default: return 'dp-status--info';
    }
  }

  protected arm(id: string, kind: 'run' | 'reject' | 'end'): void {
    this.confirming.set({ id, kind });
    this.rejectReason.set('');
    this.notice.set(null);
  }

  protected actingLabel(row: AdminCampaignRow): string {
    if (this.actingId() === row._id) return 'Working…';
    const kind = this.confirming()?.kind;
    if (kind === 'run') return 'Confirm run?';
    if (kind === 'reject') return 'Confirm reject + refund?';
    return 'Confirm end?';
  }

  protected apply(row: AdminCampaignRow): void {
    const c = this.confirming();
    if (!c || this.actingId()) return;
    const status = c.kind === 'run' ? 'Active' : c.kind === 'reject' ? 'Rejected' : 'Ended';
    this.actingId.set(row._id);
    this.admin
      .setStatus(row._id, status, this.rejectReason())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.confirming.set(null);
          this.rejectReason.set('');
          this.notice.set(
            status === 'Rejected'
              ? 'Rejected — held budget refunded, partner notified.'
              : status === 'Active'
                ? 'Campaign is live — partner notified.'
                : 'Campaign ended.',
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
