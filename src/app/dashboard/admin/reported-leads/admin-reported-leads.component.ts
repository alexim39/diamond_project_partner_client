import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { AdminCampaignService } from '../campaigns/admin-campaign.service';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Reported leads — bad-lead verdict desk.
 *
 * Partners flag dud allocations from their campaign detail or personal-list
 * inbox; each approved replacement credits ₦300 back and refills the slot,
 * each dismissal stands. OnPush + signals.
 */
@Component({
  selector: 'async-admin-reported-leads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressBarModule, MatTableModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Reported leads</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Reported leads</h2>
          <p class="subtitle">Replace credits ₦300 back and refills the campaign slot — dismiss keeps the allocation.</p>
        </div>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status"><mat-icon>check_circle</mat-icon> {{ note }}</p>
      }
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (error(); as err) {
        <p class="error" role="alert">{{ err }} <button mat-button (click)="reload()">Retry</button></p>
      }

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="lead">
              <th mat-header-cell *matHeaderCellDef>Lead</th>
              <td mat-cell *matCellDef="let row" class="name-cell">
                {{ row.accepted?.name ?? 'Unaccepted' }}
                <span class="muted">{{ row.createdAt | date:'mediumDate' }} · {{ tierLabel(row.tier) }} · ₦{{ row.costDebited | number }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="campaign">
              <th mat-header-cell *matHeaderCellDef>Campaign</th>
              <td mat-cell *matCellDef="let row">
                {{ row.campaign?.name ?? '—' }}
                <span class="muted">{{ row.campaign?.category ?? '' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="partner">
              <th mat-header-cell *matHeaderCellDef>Partner</th>
              <td mat-cell *matCellDef="let row">
                {{ row.partner?.name ?? '—' }}
                <span class="muted">@{{ row.partner?.username ?? '—' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let row">{{ row.reportReason || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirming() === row._id) {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic" class="reason-field">
                    <mat-label>Note (partner sees this, optional)</mat-label>
                    <input matInput [ngModel]="note()" (ngModelChange)="note.set($event)" maxlength="500" />
                  </mat-form-field>
                  <button mat-flat-button color="primary" (click)="decide(row, 'replace')" [disabled]="actingId() === row._id">Replace + credit</button>
                  <button mat-button (click)="decide(row, 'reject')" [disabled]="actingId() === row._id">Dismiss</button>
                  <button mat-button (click)="confirming.set(null)">Cancel</button>
                } @else {
                  <button mat-flat-button color="primary" (click)="confirming.set(row._id); note.set('')" [disabled]="actingId() === row._id">Review</button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No reported leads — the queue is clear.</p>
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
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .name-cell .muted { display: block; font-weight: 400; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .reason-field { min-width: 220px; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    button { min-height: 44px; }
  `],
})
export class AdminReportedLeadsComponent implements OnInit {
  private readonly admin = inject(AdminCampaignService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirming = signal<string | null>(null);
  protected readonly note = signal('');
  protected readonly notice = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<any[]>([]);
  protected readonly displayedColumns = ['lead', 'campaign', 'partner', 'reason', 'action'];

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .reportedAllocations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected tierLabel(tier: number): string {
    return tier === 1 ? 'Same state' : tier === 2 ? 'Nearby state' : 'Out of area';
  }

  protected decide(row: any, decision: 'replace' | 'reject'): void {
    if (this.actingId()) return;
    this.actingId.set(row._id);
    this.admin
      .verdictAllocation(row._id, decision, this.note())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.actingId.set(null);
          this.confirming.set(null);
          this.note.set('');
          this.notice.set(res?.message ?? 'Decided.');
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }
}
