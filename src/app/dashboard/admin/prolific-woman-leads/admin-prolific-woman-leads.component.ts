import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import {
  AdminProlificWomanLeadsService,
  ProlificWomanLead,
  ProlificWomanLeadStatus,
} from './admin-prolific-woman-leads.service';
import { ApiError, userError } from '../../../core/http/api-error';
import { timeAgo } from '../../../_common/date-util';

@Component({
  selector: 'async-admin-prolific-woman-leads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Prolific Women leads</span>
      </div>
    </section>

    <section class="page">
      <div class="page-head">
        <div>
          <h2>Prolific Women leads</h2>
          <p class="subtitle">
            Applications submitted through the Prolific Women website — mentorship
            readiness, location and contact preferences.
          </p>
        </div>
        <button mat-stroked-button (click)="reload()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (notice(); as note) {
        <p class="notice" role="status">
          <mat-icon>check_circle</mat-icon> {{ note }}
        </p>
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Search name, phone, location</mat-label>
          <input
            matInput
            type="search"
            [(ngModel)]="query"
            (keyup.enter)="applyFilters()"
            maxlength="120"
          />
        </mat-form-field>
        <button mat-button (click)="applyFilters()">Apply</button>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Per page</mat-label>
          <mat-select [value]="limit()" (selectionChange)="setLimit($event.value)">
            <mat-option [value]="25">25</mat-option>
            <mat-option [value]="50">50</mat-option>
            <mat-option [value]="100">100</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Status</mat-label>
          <mat-select [value]="statusFilter()" (selectionChange)="setStatus($event.value)">
            <mat-option value="all">All statuses</mat-option>
            <mat-option value="new">New</mat-option>
            <mat-option value="accepted">Accepted</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Applicant</th>
              <td mat-cell *matCellDef="let row" class="name-cell">{{ row.name }}</td>
            </ng-container>

            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let row">
                <div class="contact-links">
                  <a [href]="'tel:' + row.phone">{{ row.phone }}</a>
                  <a
                    class="wa-link"
                    [href]="waLink(row.phone)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let row">{{ row.location }}</td>
            </ng-container>

            <ng-container matColumnDef="readiness">
              <th mat-header-cell *matHeaderCellDef>Mentorship</th>
              <td mat-cell *matCellDef="let row">
                <span class="pill" [class.pill--ready]="row.readyToBeMentored === 'yes'">
                  {{ readinessLabel(row) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="office">
              <th mat-header-cell *matHeaderCellDef>Head office</th>
              <td mat-cell *matCellDef="let row">{{ officeLabel(row) }}</td>
            </ng-container>

            <ng-container matColumnDef="availability">
              <th mat-header-cell *matHeaderCellDef>Availability</th>
              <td mat-cell *matCellDef="let row">{{ availabilityLabel(row) }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="pill" [class.pill--ready]="row.status === 'accepted'">
                  {{ row.status === 'accepted' ? 'Accepted' : 'New' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="submitted">
              <th mat-header-cell *matHeaderCellDef>Submitted</th>
              <td mat-cell *matCellDef="let row">
                <div>{{ row.submittedAt ? (row.submittedAt | date:'medium') : '—' }}</div>
                <div class="muted">{{ ageOf(row) }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirmingId() === row.id) {
                  <button mat-flat-button color="warn" (click)="remove(row)" [disabled]="actingId() === row.id">
                    {{ actingId() === row.id ? 'Deleting…' : 'Confirm delete' }}
                  </button>
                  <button mat-button (click)="confirmingId.set(null)">Keep</button>
                } @else {
                  <button
                    mat-icon-button
                    color="warn"
                    title="Hard delete this application"
                    [attr.aria-label]="'Delete application from ' + row.name"
                    (click)="confirmingId.set(row.id)"
                    [disabled]="actingId() === row.id || row.status === 'accepted'"
                  ><mat-icon>delete</mat-icon></button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>

        <div class="pager">
          <button mat-button (click)="page(-1)" [disabled]="skip() === 0 || loading()">
            Previous
          </button>
          <span class="muted">
            {{ skip() + 1 }}–{{ skip() + rows().length }} of {{ total() }} applications
          </span>
          <button
            mat-button
            (click)="page(1)"
            [disabled]="skip() + limit() >= total() || loading()"
          >
            Next
          </button>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No applications match this search.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1em; flex-wrap: wrap; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 48em; }
    .error { color: var(--dp-error); }
    .toolbar { display: flex; gap: 0.75em; align-items: center; flex-wrap: wrap; }
    .toolbar mat-form-field { min-width: 150px; }
    .toolbar .search-field { flex: 1 1 240px; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .contact-links { display: flex; flex-direction: column; gap: 0.15em; }
    .contact-links a { color: var(--dp-primary); text-decoration: none; }
    .contact-links a:hover { text-decoration: underline; }
    .contact-links .wa-link { font-size: 0.8em; font-weight: 600; }
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 0.2em 0.6em;
      border: 1px solid var(--dp-line);
      border-radius: 999px;
      color: var(--dp-muted);
      font-size: 0.78em;
      white-space: nowrap;
    }
    .pill--ready {
      border-color: var(--dp-success);
      background: color-mix(in srgb, var(--dp-success) 12%, transparent);
      color: var(--dp-success);
    }
    .pager { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
    .notice { display: flex; align-items: center; gap: 0.5em; background: var(--dp-success-bg); color: var(--dp-success); border-radius: 8px; padding: 0.7em 1em; margin: 0; }
    .empty { color: var(--dp-muted); }
    button { min-height: 44px; }
  `],
})
export class AdminProlificWomanLeadsComponent implements OnInit {
  private readonly leads = inject(AdminProlificWomanLeadsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly columns = [
    'name',
    'contact',
    'location',
    'readiness',
    'office',
    'availability',
    'status',
    'submitted',
    'action',
  ];
  protected readonly rows = signal<ProlificWomanLead[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirmingId = signal<string | null>(null);
  protected readonly limit = signal(25);
  protected readonly skip = signal(0);
  protected readonly statusFilter = signal<ProlificWomanLeadStatus>('all');
  protected query = '';

  ngOnInit(): void {
    this.reload();
  }

  protected applyFilters(): void {
    this.skip.set(0);
    this.reload();
  }

  protected setStatus(status: ProlificWomanLeadStatus): void {
    this.statusFilter.set(status);
    this.skip.set(0);
    this.reload();
  }

  protected setLimit(value: number): void {
    this.limit.set(value);
    this.skip.set(0);
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.leads
      .list({
        ...(this.query.trim() ? { q: this.query.trim() } : {}),
        limit: this.limit(),
        skip: this.skip(),
        status: this.statusFilter(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data?.items ?? []);
          this.total.set(res.data?.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(userError(err));
          this.loading.set(false);
        },
      });
  }

  protected page(direction: 1 | -1): void {
    if (this.loading()) return;
    this.skip.set(Math.max(0, this.skip() + direction * this.limit()));
    this.reload();
  }

  /** Hard delete one unaccepted application (two-step confirm). */
  protected remove(row: ProlificWomanLead): void {
    if (this.actingId()) return;
    this.actingId.set(row.id);
    this.notice.set(null);
    this.error.set(null);
    this.leads
      .remove(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actingId.set(null);
          this.confirmingId.set(null);
          this.notice.set(res?.message ?? 'Application deleted.');
          this.rows.set(this.rows().filter((r) => r.id !== row.id));
          this.total.set(Math.max(0, this.total() - 1));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.confirmingId.set(null);
          this.error.set(userError(err));
        },
      });
  }

  protected readinessLabel(row: ProlificWomanLead): string {
    return row.readyToBeMentored === 'yes' ? 'Ready now' : 'Exploring';
  }

  protected officeLabel(row: ProlificWomanLead): string {
    return row.headOfficeInvite === 'yes' ? 'Visit requested' : 'Online';
  }

  protected availabilityLabel(row: ProlificWomanLead): string {
    return row.availability === 'weekdays' ? 'Weekdays' : 'Weekends';
  }

  protected ageOf(row: ProlificWomanLead): string {
    return row.createdAt ? timeAgo(new Date(row.createdAt)) : '—';
  }

  protected waLink(phone: string): string {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }
}
