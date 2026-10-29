import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ApiError, userError } from '../../../../core/http/api-error';
import { timeAgo } from '../../../../_common/date-util';
import { ProlificLeadResponseComponent } from './prolific-lead-response.component';
import {
  ProlificWomanLead,
  ProlificWomanLeadsService,
} from './prolific-woman-leads.service';

@Component({
  selector: 'async-prolific-woman-leads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Prospects</a> &gt;
        <span>Prolific Woman leads</span>
      </div>
    </section>

    <section class="inbox-page">
      <div class="page-head">
        <div>
          <h2>Prolific Woman leads</h2>
          <p class="subtitle">
            Applications from the Prolific Woman website. Accept a lead to move it
            into My follow-ups.
          </p>
        </div>
        <mat-button-toggle-group>
          <mat-button-toggle routerLink="../prolific-woman-leads" [checked]="true">
            <mat-icon>assignment_ind</mat-icon> Prolific Woman
          </mat-button-toggle>
          <mat-button-toggle routerLink="../personal-list" title="My Page Leads">
            <mat-icon>inbox</mat-icon> My Page Leads
          </mat-button-toggle>
          <mat-button-toggle routerLink="../pipeline" title="My follow-ups">
            <mat-icon>trending_up</mat-icon> My follow-ups
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }
      @if (error(); as err) {
        <p class="error" role="alert">{{ err }}</p>
      }

      <div class="kpi-grid">
        <mat-card class="kpi"><mat-card-content>
          <mat-icon>inbox</mat-icon>
          <span class="kpi-value">{{ rows().length }}</span>
          <span class="kpi-label">Awaiting accept</span>
        </mat-card-content></mat-card>
        <mat-card class="kpi"><mat-card-content>
          <mat-icon>fiber_new</mat-icon>
          <span class="kpi-value">{{ todayCount() }}</span>
          <span class="kpi-label">Arrived today</span>
        </mat-card-content></mat-card>
        <mat-card class="kpi"><mat-card-content>
          <mat-icon>bolt</mat-icon>
          <span class="kpi-value">{{ readyCount() }}</span>
          <span class="kpi-label">Ready now</span>
        </mat-card-content></mat-card>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Search name, phone or location</mat-label>
          <input
            matInput
            type="search"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            maxlength="120"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        @if (accepting()) { <mat-progress-bar mode="indeterminate" class="loader" /> }
      </div>

      @if (filtered().length === 0) {
        <div class="empty-card">
          <mat-icon>inbox</mat-icon>
          <p>No pending Prolific Woman applications.</p>
          <a mat-flat-button color="primary" routerLink="../pipeline">Open My follow-ups</a>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered()" class="mat-elevation-z2">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Applicant</th>
              <td mat-cell *matCellDef="let row" class="name-cell" data-label="Applicant">
                <button class="name-btn" (click)="view(row)">
                  {{ row.name }}
                </button>
                <div class="muted">{{ row.location }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let row" data-label="Contact">
                <div>{{ row.phone }}</div>
                <a class="wa-link" [href]="waLink(row.phone)" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="mentorship">
              <th mat-header-cell *matHeaderCellDef>Mentorship</th>
              <td mat-cell *matCellDef="let row" data-label="Mentorship">
                <span class="pill" [class.pill--ready]="row.readyToBeMentored === 'yes'">
                  {{ readinessLabel(row) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="office">
              <th mat-header-cell *matHeaderCellDef>Head office</th>
              <td mat-cell *matCellDef="let row" data-label="Head office">{{ officeLabel(row) }}</td>
            </ng-container>

            <ng-container matColumnDef="availability">
              <th mat-header-cell *matHeaderCellDef>Availability</th>
              <td mat-cell *matCellDef="let row" data-label="Availability">{{ availabilityLabel(row) }}</td>
            </ng-container>

            <ng-container matColumnDef="arrived">
              <th mat-header-cell *matHeaderCellDef>Arrived</th>
              <td mat-cell *matCellDef="let row" data-label="Arrived">
                <div>{{ row.createdAt | date:'mediumDate' }}</div>
                <div class="muted">{{ ageOf(row) }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row" class="action-cell" data-label="Actions">
                <button mat-button (click)="view(row)">View</button>
                @if (confirmId() === row.id) {
                  <button mat-flat-button color="primary" (click)="accept(row)" [disabled]="accepting()">
                    Confirm accept?
                  </button>
                  <button mat-button (click)="confirmId.set(null)">Back</button>
                } @else {
                  <button mat-flat-button color="primary" (click)="confirmId.set(row.id)" [disabled]="accepting()">
                    Accept
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
        <p class="total muted">Showing {{ filtered().length }} of {{ rows().length }} awaiting accept</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; cursor: pointer; }
    .inbox-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1em; flex-wrap: wrap; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 46em; }
    .notice { color: var(--dp-success); }
    .error { color: var(--dp-error); }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75em; }
    .kpi mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .kpi mat-icon { color: var(--dp-gold); }
    .kpi-value { font-size: 1.5em; font-weight: 700; }
    .kpi-label { color: var(--dp-muted); font-size: 0.85em; }
    .toolbar { display: flex; gap: 0.75em; align-items: center; flex-wrap: wrap; }
    .toolbar .search-field { flex: 1 1 220px; }
    .loader { flex: 2; min-width: 120px; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .name-btn { background: none; border: none; padding: 0; font: inherit; font-weight: 700; cursor: pointer; color: inherit; text-align: left; }
    .name-btn:hover { color: var(--dp-gold-ink); text-decoration: underline; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .wa-link { color: var(--dp-primary); font-size: 0.8em; font-weight: 600; text-decoration: none; }
    .wa-link:hover { text-decoration: underline; }
    .pill { display: inline-flex; align-items: center; padding: 0.2em 0.6em; border: 1px solid var(--dp-line); border-radius: 999px; color: var(--dp-muted); font-size: 0.78em; white-space: nowrap; }
    .pill--ready { border-color: var(--dp-success); color: var(--dp-success); }
    .total { margin: 0; }
    .empty-card { display: flex; flex-direction: column; align-items: center; gap: 0.7em; text-align: center; background: var(--dp-paper); border: 1px dashed var(--dp-line); border-radius: 14px; padding: 2.5em 1.5em; color: var(--dp-muted); }
    .empty-card mat-icon { font-size: 40px; height: 40px; width: 40px; opacity: 0.6; }
    .empty-card p { margin: 0; max-width: 34em; }
    button, a[mat-button], a[mat-flat-button] { min-height: 44px; }
    @media only screen and (max-width: 600px) {
      .table-wrap { overflow-x: visible; }
      .mat-mdc-table thead { display: none; }
      .mat-mdc-table tbody { display: flex; flex-direction: column; gap: 0.75em; background: transparent; }
      .mat-mdc-table tr.mat-row { display: block; background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 0.25em 0; }
      .mat-mdc-table td.mat-cell { display: flex; align-items: center; gap: 0.75em; border-bottom: 1px solid var(--dp-line); padding: 0.6em 0.9em; }
      .mat-mdc-table td.mat-cell:last-child { border-bottom: none; }
      .mat-mdc-table td.mat-cell::before { content: attr(data-label); flex: none; width: 6em; color: var(--dp-muted); font-size: 0.75em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      .mat-mdc-table td.action-cell { flex-wrap: wrap; row-gap: 0.5em; }
    }
  `],
})
export class ProlificWomanLeadsComponent implements OnInit {
  private readonly leads = inject(ProlificWomanLeadsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly columns = [
    'name',
    'contact',
    'mentorship',
    'office',
    'availability',
    'arrived',
    'action',
  ];
  protected readonly rows = signal<ProlificWomanLead[]>([]);
  protected readonly query = signal('');
  protected readonly notice = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly accepting = signal(false);
  protected readonly confirmId = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = [...this.rows()].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
    if (!q) return list;
    return list.filter((row) =>
      `${row.name} ${row.phone} ${row.location}`.toLowerCase().includes(q),
    );
  });

  protected readonly todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.rows().filter((row) => String(row.createdAt ?? '').slice(0, 10) === today).length;
  });

  protected readonly readyCount = computed(
    () => this.rows().filter((row) => row.readyToBeMentored === 'yes').length,
  );

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.error.set(null);
    this.leads
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data?.items ?? []);
          this.confirmId.set(null);
        },
        error: (err: ApiError) => this.error.set(userError(err)),
      });
  }

  protected view(row: ProlificWomanLead): void {
    this.dialog
      .open(ProlificLeadResponseComponent, { data: { lead: row } })
      .afterClosed()
      .subscribe((res: { accepted?: boolean; id?: string } | undefined) => {
        if (res?.accepted && res.id) {
          this.rows.set(this.rows().filter((item) => item.id !== res.id));
          this.notice.set('Lead accepted — find it in My follow-ups.');
        }
      });
  }

  protected accept(row: ProlificWomanLead): void {
    if (this.accepting()) return;
    this.confirmId.set(null);
    this.accepting.set(true);
    this.error.set(null);
    this.leads
      .accept(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.accepting.set(false);
          this.rows.set(this.rows().filter((item) => item.id !== row.id));
          this.notice.set('Lead accepted — find it in My follow-ups.');
        },
        error: (err: ApiError) => {
          this.accepting.set(false);
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
