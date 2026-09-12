import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error';
import { LeadPipelineService } from './lead-pipeline.service';
import { nextStage, ProspectLead, ProspectStage, STAGE_META, STAGE_ORDER, StuckEntry } from './lead.models';
import { forkJoin } from 'rxjs';

/**
 * @title Lead pipeline — modern lead management.
 *
 * OnPush + signals + `@for`/`@if`. Stage chips color-code the canonical
 * pipeline; "Advance" walks a lead forward; "Convert" issues an enrollment
 * code via two-step confirm and surfaces it for sharing with the prospect.
 */
@Component({
  selector: 'async-lead-pipeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatChipsModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatTooltipModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Prospects</a> &gt;
        <span>Lead Pipeline</span>
      </div>
    </section>

    <section class="pipeline-page">
      <div class="page-head">
        <div>
          <h2>Lead Pipeline</h2>
          <p class="subtitle">Track every prospect from first contact to converted partner.</p>
        </div>
        <mat-button-toggle-group>
          <mat-button-toggle routerLink="../personal-list" title="My prospect list">
            <mat-icon>view_list</mat-icon> Contact List
          </mat-button-toggle>
          <mat-button-toggle routerLink="../general-list" title="General prospect list">
            <mat-icon>groups</mat-icon> General List
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (issuedCode(); as issued) {
        <div class="code-banner" role="status">
          <mat-icon>celebration</mat-icon>
          <div>
            <strong>{{ issued.name }}</strong> is ready to enroll. Share this code:
            <code>{{ issued.code }}</code>
          </div>
          <button mat-icon-button (click)="issuedCode.set(null)" aria-label="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      <div class="stage-cards">
        @for (entry of stageCounts(); track entry.stage) {
          <button
            class="stage-card"
            [class.active]="stageFilter() === entry.stage"
            (click)="toggleStageFilter(entry.stage)"
            [style.--chip-bg]="entry.meta.color"
            [style.--chip-fg]="entry.meta.text"
          >
            <span class="count">{{ entry.count }}</span>
            <span class="label">{{ entry.meta.label }}</span>
          </button>
        }
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search leads</mat-label>
          <input matInput type="search" placeholder="Name, phone or email" (input)="search.set($any($event.target).value)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button
          mat-button
          [color]="stuckOnly() ? 'warn' : undefined"
          (click)="stuckOnly.set(!stuckOnly())"
          [disabled]="stuckCount() === 0"
          title="Show only prospects past their stage attention threshold"
        >
          <mat-icon>warning</mat-icon> Stuck ({{ stuckCount() }})
        </button>
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" class="loader" />
        }
      </div>

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (!loading() && filtered().length === 0 && !error()) {
        <p class="empty">No leads match. Add prospects to start building your pipeline.</p>
      }

      @if (selectionCount() > 0) {
        <div class="bulk-bar" role="group" aria-label="Bulk outreach">
          <span class="muted">{{ selectionCount() }} selected</span>
          <button mat-button (click)="sendSms()">
            <mat-icon>smartphone</mat-icon> Send SMS
          </button>
          <button mat-button (click)="sendEmail()">
            <mat-icon>mail</mat-icon> Send email
          </button>
          <button mat-button (click)="clearSelection()">Clear</button>
        </div>
      }

      @if (filtered().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="filtered()" class="mat-elevation-z2">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox
                  [checked]="allVisibleSelected()"
                  [indeterminate]="someVisibleSelected()"
                  (change)="toggleAllVisible()"
                  aria-label="Select all visible"
                />
              </th>
              <td mat-cell *matCellDef="let lead">
                <mat-checkbox
                  [checked]="isSelected(lead.id)"
                  (change)="toggleSelect(lead.id)"
                  [aria-label]="'Select ' + names(lead)"
                />
              </td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let lead" class="name-cell"><a [routerLink]="['../detail', lead.id]" class="name-link">{{ names(lead) }}</a></td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let lead">
                <div>{{ lead.prospectPhone }}</div>
                <div class="muted">{{ lead.prospectEmail || '—' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="stage">
              <th mat-header-cell *matHeaderCellDef>Stage</th>
              <td mat-cell *matCellDef="let lead">
                <mat-chip
                  [style.background]="chip(lead).color"
                  [style.color]="chip(lead).text"
                  highlighted
                >{{ chip(lead).label }}</mat-chip>
                @if (stuckOf(lead); as stuck) {
                  <div class="stuck-badge" title="No movement for {{ stuck.daysInStage }} days (threshold {{ stuck.limit }})">
                    ⚠ stuck {{ stuck.daysInStage }}d
                  </div>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="interest">
              <th mat-header-cell *matHeaderCellDef>Interest</th>
              <td mat-cell *matCellDef="let lead" class="interest-cell">{{ interest(lead) }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let lead">
                @if (nextOf(lead); as next) {
                  <button mat-button (click)="advance(lead, next)" [disabled]="actingId() === lead.id">
                    Advance to {{ next }}
                  </button>
                }
                @if (!isConverted(lead)) {
                  <a mat-button [routerLink]="['../booking', lead.id]" title="Book a chat with {{ names(lead) }}">Book</a>
                }
                @if (canConvert(lead)) {
                  @if (confirmId() === lead.id) {
                    <button mat-flat-button color="primary" (click)="convert(lead)" [disabled]="actingId() === lead.id">
                      Confirm convert?
                    </button>
                    <button mat-button (click)="confirmId.set(null)">Cancel</button>
                  } @else {
                    <button
                      mat-flat-button
                      color="accent"
                      matTooltip="Issue an enrollment code for this prospect"
                      (click)="confirmId.set(lead.id)"
                    >Convert</button>
                  }
                }
                @if (isConverted(lead)) {
                  <span class="muted">Enrolled ✓</span>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <p class="total muted">{{ filtered().length }} of {{ total() }} leads</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .pipeline-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .code-banner {
      display: flex; align-items: center; gap: 0.75em;
      background: var(--dp-success-bg); border: 1px solid var(--dp-success); border-radius: 8px; padding: 0.75em 1em;
    }
    .code-banner code { font-size: 1.2em; font-weight: 700; letter-spacing: 0.1em; background: var(--dp-surface); padding: 0.1em 0.5em; border-radius: 4px; }
    .code-banner div { flex: 1; }
    .stage-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75em; }
    .stage-card {
      display: flex; flex-direction: column; align-items: center; gap: 0.15em;
      background: var(--chip-bg); color: var(--chip-fg);
      border: 2px solid transparent; border-radius: 10px; padding: 0.8em 0.5em; cursor: pointer;
    }
    .stage-card.active { border-color: currentColor; }
    .stage-card .count { font-size: 1.6em; font-weight: 700; }
    .stage-card .label { font-size: 0.85em; }
    .toolbar { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
    .toolbar mat-form-field { flex: 1; min-width: 220px; }
    .bulk-bar { display: flex; align-items: center; gap: 0.5em; flex-wrap: wrap; background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.5em 0.75em; }
    .bulk-bar button { min-height: 44px; }
    .loader { flex: 2; min-width: 120px; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; text-transform: capitalize; }
    .name-link { text-decoration: none; color: inherit; }
    .name-link:hover { color: var(--dp-gold-ink); }
    .stuck-badge { color: var(--dp-error); font-size: 0.85em; font-weight: 600; margin-top: 0.25em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .interest-cell { text-transform: capitalize; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    .total { margin: 0; }
  `],
})
export class LeadPipelineComponent implements OnInit {
  private readonly leads = inject(LeadPipelineService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly exportContacts = inject(ExportContactAndEmailService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<ProspectLead[]>([]);
  protected readonly total = signal(0);
  protected readonly search = signal('');
  protected readonly stageFilter = signal<ProspectStage | null>(null);
  protected readonly stuckOnly = signal(false);
  protected readonly stuckDays = signal<Record<string, StuckEntry>>({});
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirmId = signal<string | null>(null);
  protected readonly issuedCode = signal<{ name: string; code: string } | null>(null);

  protected readonly displayedColumns = ['select', 'name', 'contact', 'stage', 'interest', 'action'];
  protected readonly selected = signal<Set<string>>(new Set());

  protected readonly selectionCount = computed(() => this.selected().size);

  protected readonly stageCounts = computed(() => {
    const counts = new Map<ProspectStage, number>();
    for (const lead of this.rows()) {
      const stage = (lead.status?.stage ?? 'New') as ProspectStage;
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    }
    return [...STAGE_ORDER, 'Closed' as ProspectStage].map((stage) => ({
      stage,
      count: counts.get(stage) ?? 0,
      meta: STAGE_META[stage],
    }));
  });

  protected readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const stage = this.stageFilter();
    const stuckMap = this.stuckDays();
    return this.rows().filter((lead) => {
      if (stage && (lead.status?.stage ?? 'New') !== stage) return false;
      if (this.stuckOnly() && !stuckMap[lead.id]) return false;
      if (!q) return true;
      const haystack = `${lead.prospectName} ${lead.prospectSurname ?? ''} ${lead.prospectPhone} ${lead.prospectEmail ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  });

  protected readonly stuckCount = computed(() => Object.keys(this.stuckDays()).length);

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected allVisibleSelected(): boolean {
    const visible = this.filtered();
    return visible.length > 0 && visible.every((lead) => this.selected().has(lead.id));
  }

  protected someVisibleSelected(): boolean {
    const visible = this.filtered();
    const count = visible.filter((lead) => this.selected().has(lead.id)).length;
    return count > 0 && count < visible.length;
  }

  protected toggleSelect(id: string): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected toggleAllVisible(): void {
    const visible = this.filtered();
    this.selected.update((set) => {
      const next = new Set(set);
      if (visible.every((lead) => next.has(lead.id))) {
        for (const lead of visible) next.delete(lead.id);
      } else {
        for (const lead of visible) next.add(lead.id);
      }
      return next;
    });
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  /** Bulk outreach handoff — selected numbers/emails ride the shared subject to the compose pages. */
  protected sendSms(): void {
    const phones = this.rows()
      .filter((lead) => this.selected().has(lead.id) && lead.prospectPhone?.trim())
      .map((lead) => lead.prospectPhone.trim());
    if (phones.length === 0) return;
    this.exportContacts.setData(phones);
    this.router.navigate(['/dashboard/tools/sms/new']);
  }

  protected sendEmail(): void {
    const emails = this.rows()
      .filter((lead) => this.selected().has(lead.id) && lead.prospectEmail?.trim())
      .map((lead) => lead.prospectEmail!.trim());
    if (emails.length === 0) return;
    this.exportContacts.setData(emails);
    this.router.navigate(['/dashboard/tools/email/new']);
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    const partnerId = this.auth.currentUser()?.id;
    if (!partnerId) {
      this.error.set('Session expired. Please sign in again.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      leads: this.leads.listByPartner(partnerId),
      stuck: this.leads.stuck(partnerId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ leads, stuck }) => {
          this.rows.set(leads.data ?? []);
          this.total.set(leads.meta?.total ?? (leads.data ?? []).length);
          this.stuckDays.set(Object.fromEntries((stuck.data ?? []).map((s) => [s.prospectId, s])));
          this.selected.set(new Set());
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected toggleStageFilter(stage: ProspectStage): void {
    this.stageFilter.set(this.stageFilter() === stage ? null : stage);
  }

  protected stuckOf(lead: ProspectLead): StuckEntry | null {
    return this.stuckDays()[lead.id] ?? null;
  }

  protected names(lead: ProspectLead): string {
    return this.leads.prospectName(lead);
  }

  protected chip(lead: ProspectLead): { label: string; color: string; text: string } {
    return STAGE_META[((lead.status?.stage ?? 'New') as ProspectStage)] ?? STAGE_META.New;
  }

  protected interest(lead: ProspectLead): string {
    return this.leads.lastInterest(lead);
  }

  protected nextOf(lead: ProspectLead): ProspectStage | null {
    return nextStage(lead.status?.stage);
  }

  protected canConvert(lead: ProspectLead): boolean {
    const stage = lead.status?.stage ?? 'New';
    return stage !== 'Converted' && stage !== 'Closed';
  }

  protected isConverted(lead: ProspectLead): boolean {
    return lead.status?.stage === 'Converted';
  }

  protected advance(lead: ProspectLead, stage: ProspectStage): void {
    this.actingId.set(lead.id);
    this.leads
      .advanceStage(lead.id, stage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected convert(lead: ProspectLead): void {
    this.actingId.set(lead.id);
    this.leads
      .convert(lead.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actingId.set(null);
          this.confirmId.set(null);
          this.issuedCode.set({ name: this.names(lead), code: res.data.code });
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.confirmId.set(null);
          this.error.set(err.message);
        },
      });
  }
}
