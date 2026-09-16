import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
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
import { AdminReservationService, ReviewCodeRow } from './admin-reservation.service';
import { ApiError } from '../../../core/http/api-error';

type QueueFilter = 'Pending' | 'Approved' | 'Rejected' | 'Used' | 'All';

/**
 * @title Reservation codes — admin review queue.
 *
 * Legacy survey-submitted codes land at Pending with no other path to
 * approval; v1 self-approves and never appears here needing work.
 * Approve makes a code usable at signup, Reject kills it. FIFO
 * oldest-first; issuer notified on every move. OnPush + signals.
 */
@Component({
  selector: 'async-admin-reservations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, MatButtonModule, MatChipsModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule,
    MatTableModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Reservation codes</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Reservation codes</h2>
          <p class="subtitle">Survey-submitted codes waiting on review — approve to make them usable, reject to kill them.</p>
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
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search code</mat-label>
          <input matInput type="search" placeholder="NV012652…" [value]="searchText()" (input)="onSearch($any($event.target).value)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        @if (hasFilters()) {
          <button mat-button (click)="clearFilters()">Clear</button>
        }
        @if (total() > 0) {
          <mat-chip highlighted>{{ total() }} code{{ total() === 1 ? '' : 's' }}</mat-chip>
        }
      </div>

      @if (summary(); as s) {
        <div class="stat-grid" role="group" aria-label="Codes by status">
          <div class="dp-card stat"><span class="stat-value">{{ s.Pending | number }}</span><span class="muted">Pending</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.Approved | number }}</span><span class="muted">Approved</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.Used | number }}</span><span class="muted">Used</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.Rejected | number }}</span><span class="muted">Rejected</span></div>
        </div>
      }

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let row" class="name-cell">
                <code class="copyable" (click)="copyCode(row.code)" (keydown.enter)="copyCode(row.code)" tabindex="0" title="Copy code">{{ row.code }}</code>
              </td>
            </ng-container>
            <ng-container matColumnDef="issuer">
              <th mat-header-cell *matHeaderCellDef>Issuer</th>
              <td mat-cell *matCellDef="let row">
                @if (row.issuer) {
                  {{ row.issuer?.name ?? '—' }}
                  <span class="muted">@{{ row.issuer?.username ?? '—' }}</span>
                } @else if (row.issuerUpline) {
                  {{ row.issuerUpline.name }}
                  <span class="muted">upline of @{{ row.issuerUpline.holderUsername ?? 'holder' }} · @{{ row.issuerUpline.username }}</span>
                } @else {
                  <span class="muted">—</span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="prospect">
              <th mat-header-cell *matHeaderCellDef>For</th>
              <td mat-cell *matCellDef="let row">
                @if (row.prospect) {
                  {{ row.prospect.name }}
                  <span class="muted">{{ row.prospect.phone }}</span>
                } @else if (row.consumer) {
                  {{ row.consumer.name }}
                  <span class="muted">used by @{{ row.consumer.username }}</span>
                } @else {
                  <span class="muted">—</span>
                }
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
            <ng-container matColumnDef="use">
              <th mat-header-cell *matHeaderCellDef>Use</th>
              <td mat-cell *matCellDef="let row">
                @if (row.status === 'Used') {
                  <span class="dp-status dp-status--ok">Used</span>
                } @else {
                  <span class="muted">Unused</span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirming()?.id === row.id) {
                  <button
                    mat-flat-button
                    [color]="confirming()?.kind === 'reject' ? 'warn' : 'primary'"
                    (click)="apply(row)"
                    [disabled]="actingId() === row.id"
                  >{{ actingLabel(row) }}</button>
                  <button mat-button (click)="confirming.set(null)">Cancel</button>
                } @else {
                  @if (row.status === 'Pending') {
                    <button mat-flat-button color="primary" (click)="arm(row.id, 'approve')" [disabled]="actingId() === row.id">Approve</button>
                    <button mat-button color="warn" (click)="arm(row.id, 'reject')" [disabled]="actingId() === row.id">Reject</button>
                  }
                  @if (row.status === 'Approved') {
                    <button mat-button (click)="arm(row.id, 'topending')" [disabled]="actingId() === row.id">To pending</button>
                    <button mat-button color="warn" (click)="arm(row.id, 'reject')" [disabled]="actingId() === row.id">Reject</button>
                  }
                  @if (row.status === 'Rejected') {
                    <button mat-button (click)="arm(row.id, 'topending')" [disabled]="actingId() === row.id">To pending</button>
                    <button mat-flat-button color="primary" (click)="arm(row.id, 'approve')" [disabled]="actingId() === row.id">Approve</button>
                  }
                  @if (deletingId() === row.id) {
                    <button mat-flat-button color="warn" (click)="remove(row)" [disabled]="actingId() === row.id">
                      {{ actingId() === row.id ? 'Deleting…' : 'Confirm delete?' }}
                    </button>
                    <button mat-button (click)="deletingId.set(null)">Cancel</button>
                  } @else if (row.status !== 'Used') {
                    <button mat-button color="warn" (click)="deletingId.set(row.id)" [disabled]="actingId() === row.id" title="Permanently delete this code">Delete</button>
                  } @else {
                    <span class="muted" title="Used codes are signup history and cannot be deleted">Locked</span>
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
        <p class="empty">Queue clear — no codes{{ filter() === 'All' ? '' : ' under ' + filter() }}.</p>
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
    .toolbar mat-form-field { min-width: 200px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.6em; }
    .stat { display: flex; flex-direction: column; gap: 0.1em; padding: 0.7em 0.9em; }
    .stat-value { font-size: 1.4em; font-weight: 700; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .name-cell code { font-size: 1.05em; letter-spacing: 0.05em; }
    .copyable { cursor: pointer; border-bottom: 1px dashed var(--dp-muted); }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    html[data-theme='dark'] .error { color: #e89a9a; }
    .empty { color: var(--dp-muted); }
    button { min-height: 44px; }
  `],
})
export class AdminReservationsComponent implements OnInit {
  private readonly admin = inject(AdminReservationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirming = signal<{ id: string; kind: 'approve' | 'reject' | 'topending' } | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<ReviewCodeRow[]>([]);
  protected readonly total = signal(0);
  protected readonly summary = signal<{ Pending: number; Approved: number; Rejected: number; Used: number } | null>(null);
  protected readonly filter = signal<QueueFilter>('Approved');
  protected readonly query = signal('');
  protected readonly searchText = signal('');
  protected readonly deletingId = signal<string | null>(null);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);

  protected readonly filters: QueueFilter[] = ['Pending', 'Approved', 'Rejected', 'Used', 'All'];
  protected readonly displayedColumns = ['code', 'issuer', 'prospect', 'age', 'status', 'use', 'action'];

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .queue(this.filter(), this.pageIndex() * this.pageSize(), this.pageSize(), this.query())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data?.items ?? []);
          this.total.set(res.data?.total ?? 0);
          this.summary.set(res.data?.summary ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected onSearch(value: string): void {
    this.searchText.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.query.set(value.trim());
      this.pageIndex.set(0);
      this.reload();
    }, 300);
  }

  protected hasFilters(): boolean {
    return this.query().trim() !== '' || this.filter() !== 'Approved';
  }

  protected clearFilters(): void {
    this.query.set('');
    this.searchText.set('');
    this.filter.set('Approved');
    this.pageIndex.set(0);
    this.reload();
  }

  protected copyCode(code: string): void {
    navigator.clipboard?.writeText(code).then(
      () => this.notice.set(`Code ${code} copied.`),
      () => this.error.set('Copy failed — select the code manually.'),
    );
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.reload();
  }

  protected ageInQueue(row: ReviewCodeRow): string {
    const ms = Date.now() - new Date(row.createdAt ?? 0).getTime();
    if (Number.isNaN(ms) || ms < 0) return '—';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    // Full year / month / week / day breakdown for long waits.
    let days = Math.floor(hours / 24);
    const parts: string[] = [];
    const years = Math.floor(days / 365);
    days -= years * 365;
    const months = Math.floor(days / 30);
    days -= months * 30;
    const weeks = Math.floor(days / 7);
    days -= weeks * 7;
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    return parts.length > 0 ? parts.join(' ') : `${hours}h`;
  }

  protected statusTone(status: string): string {
    switch (String(status ?? '').toLowerCase()) {
      case 'approved':
      case 'used': return 'dp-status--ok';
      case 'pending': return 'dp-status--warn';
      case 'rejected': return 'dp-status--bad';
      default: return 'dp-status--info';
    }
  }

  protected arm(id: string, kind: 'approve' | 'reject' | 'topending'): void {
    this.confirming.set({ id, kind });
    this.notice.set(null);
  }

  protected actingLabel(row: ReviewCodeRow): string {
    if (this.actingId() === row.id) return 'Working…';
    const kind = this.confirming()?.kind;
    if (kind === 'topending') return 'Confirm move to pending?';
    return kind === 'approve' ? 'Confirm approve?' : 'Confirm reject?';
  }

  protected remove(row: ReviewCodeRow): void {
    if (this.actingId()) return;
    this.actingId.set(row.id);
    this.error.set(null);
    this.admin
      .remove(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actingId.set(null);
          this.deletingId.set(null);
          this.notice.set(res.message ?? `Code ${row.code} deleted permanently.`);
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.deletingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected apply(row: ReviewCodeRow): void {
    const c = this.confirming();
    if (!c || this.actingId()) return;
    const target = c.kind === 'approve' ? 'Approved' : c.kind === 'reject' ? 'Rejected' : 'Pending';
    this.actingId.set(row.id);
    this.admin
      .decide(row.id, target)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.confirming.set(null);
          this.notice.set(
            target === 'Approved'
              ? `Code ${row.code} approved — usable at signup, issuer notified.`
              : target === 'Rejected'
                ? `Code ${row.code} rejected — dead everywhere, issuer notified.`
                : `Code ${row.code} moved back to pending review.`,
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
