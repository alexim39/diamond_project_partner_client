import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MyCodesService, MyCodeRow } from './my-codes.service';
import { ApiError } from '../../../../../core/http/api-error';

type CodeFilter = 'All' | 'Pending' | 'Approved' | 'Used' | 'Rejected';

/**
 * @title My codes — every reservation code you recorded.
 *
 * Status, who it was activated for, used/unused at a glance, copy, and
 * delete for your own unconsumed codes. Session-owned endpoints throughout.
 * OnPush + signals, token-blind dark shells, in-card scroll on mobile.
 */
@Component({
  selector: 'async-my-codes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule, MatTableModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a routerLink="/dashboard/mentorship/partners/my-partners">My partners</a> &gt;
        <span>My codes</span>
      </div>
    </section>

    <section class="codes-page">
      <div class="page-head">
        <div>
          <h2>My codes</h2>
          <p class="subtitle">Codes you recorded — who each was activated for, and whether it has been used.</p>
        </div>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Status</mat-label>
          <mat-select [value]="filter()" (selectionChange)="filter.set($event.value); reload()">
            @for (f of filters; track f) {
              <mat-option [value]="f">{{ f === 'All' ? 'All statuses' : f }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (total() > 0) {
          <span class="muted">{{ total() }} code{{ total() === 1 ? '' : 's' }}</span>
        }
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

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let row" class="name-cell">
                <code class="copyable" (click)="copyCode(row.code)" (keydown.enter)="copyCode(row.code)" tabindex="0" title="Copy code">{{ row.code }}</code>
              </td>
            </ng-container>
            <ng-container matColumnDef="for">
              <th mat-header-cell *matHeaderCellDef>Activated for</th>
              <td mat-cell *matCellDef="let row">
                @if (row.prospect) {
                  {{ row.prospect.name }}
                  <span class="muted">{{ row.prospect.phone }}</span>
                } @else {
                  <span class="muted">—</span>
                }
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
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="dp-status {{ statusTone(row.status) }}">{{ row.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="added">
              <th mat-header-cell *matHeaderCellDef>Recorded</th>
              <td mat-cell *matCellDef="let row" class="muted">{{ row.createdAt | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (deletingId() === row.id) {
                  <button mat-flat-button color="warn" (click)="remove(row)" [disabled]="actingId() === row.id">
                    {{ actingId() === row.id ? 'Deleting…' : 'Confirm delete?' }}
                  </button>
                  <button mat-button (click)="deletingId.set(null)">Cancel</button>
                } @else if (row.status !== 'Used') {
                  <button mat-button color="warn" (click)="deletingId.set(row.id)" [disabled]="actingId() === row.id" title="Permanently delete this code">Delete</button>
                } @else {
                  <span class="muted" title="Used codes are signup history">Locked</span>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No codes{{ filter() === 'All' ? ' yet — record one from My partners' : ' under ' + filter() }}.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .codes-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .notice { color: var(--dp-success); }
    .toolbar { display: flex; gap: 0.75em; align-items: center; flex-wrap: wrap; }
    .toolbar mat-form-field { min-width: 200px; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .name-cell code { font-size: 1.05em; letter-spacing: 0.05em; }
    .copyable { cursor: pointer; border-bottom: 1px dashed var(--dp-muted); }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .empty { color: var(--dp-muted); }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    button { min-height: 44px; }
  `],
})
export class MyCodesComponent implements OnInit {
  private readonly codes = inject(MyCodesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<MyCodeRow[]>([]);
  protected readonly total = signal(0);
  protected readonly filter = signal<CodeFilter>('All');

  protected readonly filters: CodeFilter[] = ['All', 'Pending', 'Approved', 'Used', 'Rejected'];
  protected readonly displayedColumns = ['code', 'for', 'use', 'status', 'added', 'action'];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.codes
      .list(this.filter())
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

  protected statusTone(status: string): string {
    switch (String(status ?? '').toLowerCase()) {
      case 'approved':
      case 'used': return 'dp-status--ok';
      case 'pending': return 'dp-status--warn';
      case 'rejected': return 'dp-status--bad';
      default: return 'dp-status--info';
    }
  }

  protected copyCode(code: string): void {
    navigator.clipboard?.writeText(code).then(
      () => this.notice.set(`Code ${code} copied.`),
      () => this.error.set('Copy failed — select the code manually.'),
    );
  }

  protected remove(row: MyCodeRow): void {
    if (this.actingId()) return;
    this.actingId.set(row.id);
    this.error.set(null);
    this.codes
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
}
