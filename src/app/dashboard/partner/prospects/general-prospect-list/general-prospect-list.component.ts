import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClaimLeadDialogComponent } from './claim-lead-dialog.component';
import { MaskedProspectResponseComponent } from './masked-prospect-response.component';
import { LeadPipelineService } from '../lead-pipeline/lead-pipeline.service';
import { PoolLead } from '../lead-pipeline/lead.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { ApiError } from '../../../../core/http/api-error';
import { timeAgo } from '../../../../_common/date-util';

interface MyClaim {
  id: string;
  name: string;
  claimedAt: string;
}

/**
 * @title Buy Prospect — the fair lead shelf.
 *
 * Geo-fenced scored pool (server ranks Hot/New/Complete; members never see
 * numbers), KPI header (available · claimed today x/3 · active claims with
 * nearest deadline), masked cards with dossier + claim flow, My-claims
 * countdowns, no-state gate, admin CSV import. Mobile-first cards,
 * server pagination, no images — built for low bandwidth.
 */
@Component({
  selector: 'async-prospect-list',
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
        <a>Prospects</a> &gt;
        <span>Buy Prospect</span>
      </div>
    </section>

    <section class="pool-page">
      <div class="page-head">
        <div>
          <h2>Buy Prospect <mat-icon (click)="showDescription()">help</mat-icon></h2>
          <p class="subtitle">Shared platform pool{{ partnerState() ? ' in ' + partnerState() : '' }} — claim up to {{ dailyLimit() }} a day, work each within 48 hours. Looking for your own public-page submissions? See <a routerLink="../personal-list" title="My Page Leads">My Page Leads</a>.</p>
        </div>
        <a mat-button routerLink="../personal-list" title="My Page Leads — your public page submissions">My Page Leads</a>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }
      @if (loading() && items().length === 0) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (error(); as err) {
        <p class="error" role="alert">{{ err }} <button mat-button (click)="reload()">Retry</button></p>
      }

      @if (requiresState()) {
        <div class="dp-card gate-card" role="alert">
          <mat-icon>location_off</mat-icon>
          <div>
            <h3>Set your state to unlock leads</h3>
            <p class="muted">Buy Prospect shows leads near you. Add your state once in your profile and the shelf opens.</p>
            <a mat-flat-button color="primary" routerLink="/dashboard/settings/profiles">Set my state</a>
          </div>
        </div>
      } @else {
        @if (meta(); as m) {
          <div class="kpi-grid">
            <mat-card class="kpi">
              <mat-card-content>
                <mat-icon>groups</mat-icon>
                <span class="kpi-value">{{ m.available | number }}</span>
                <span class="kpi-label">Available near you</span>
              </mat-card-content>
            </mat-card>
            <mat-card class="kpi">
              <mat-card-content>
                <mat-icon>today</mat-icon>
                <span class="kpi-value">{{ m.claimedToday }}/{{ m.dailyLimit }}</span>
                <span class="kpi-label">Claimed today</span>
                <mat-progress-bar mode="determinate" [value]="100 * m.claimedToday / Math.max(1, m.dailyLimit)" />
              </mat-card-content>
            </mat-card>
            <mat-card class="kpi">
              <mat-card-content>
                <mat-icon>hourglass_bottom</mat-icon>
                <span class="kpi-value">{{ m.activeClaims | number }}</span>
                <span class="kpi-label">My active claims{{ nearestDeadline() ? ' · nearest ' + nearestDeadline() : '' }}</span>
              </mat-card-content>
            </mat-card>
          </div>
        }

        <div class="search-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
            <mat-label>Search name or phone</mat-label>
            <input matInput type="search" [(ngModel)]="query" (keyup.enter)="reload()" maxlength="60" />
          </mat-form-field>
          <button mat-button (click)="reload()">Search</button>
        </div>

        @if (myClaims().length > 0) {
          <div class="dp-card claims-card">
            <h3>My claims — work them before the clock runs out</h3>
            @for (c of myClaims(); track c.id) {
              <div class="claim-row">
                <div>
                  <strong>{{ c.name }}</strong>
                  <span class="muted">{{ countdown(c.claimedAt) }}</span>
                </div>
                <a mat-button [routerLink]="['/dashboard/insights/contact-analytics']" [queryParams]="{ id: c.id }">Work contact</a>
              </div>
            }
          </div>
        }

        <div class="cards">
          @for (lead of items(); track lead.id) {
            <article class="dp-card lead-card">
              <div class="lead-top">
                <span class="avatar" aria-hidden="true">{{ initials(lead) }}</span>
                <div class="lead-head">
                  <strong>{{ lead.name }} {{ lead.surname }}</strong>
                  <div class="chip-row">
                    @if (lead.state) {
                      <span class="dp-status dp-status--info">{{ lead.state }}</span>
                    }
                    @for (b of lead.badges; track b) {
                      <span class="dp-status" [class]="badgeTone(b)">{{ b }}</span>
                    }
                  </div>
                </div>
              </div>
              @if (lead.reasons.length > 0) {
                <p class="why"><mat-icon>bolt</mat-icon> {{ lead.reasons[0] }}</p>
              }
              <p class="muted">{{ ageOf(lead) }} old · contact masked until claim</p>
              <div class="card-actions">
                <button mat-button (click)="openDossier(lead)">Details</button>
                <span class="spacer"></span>
                <button
                  mat-flat-button color="primary"
                  (click)="claimLead(lead.id)"
                  [disabled]="!canClaimMore()"
                  [title]="canClaimMore() ? 'Claim for ₦250' : 'Daily claim limit reached'">
                  Claim · ₦250
                </button>
              </div>
            </article>
          }
        </div>

        @if (!loading() && items().length === 0 && !error()) {
          <div class="empty-card">
            <mat-icon>groups</mat-icon>
            <p>No leads right now — new arrivals land here automatically. Check back soon.</p>
          </div>
        }
        @if (hasMore()) {
          <button mat-button (click)="loadMore()" [disabled]="loading()">
            {{ loading() ? 'Loading…' : 'Show more' }}
          </button>
        }

        @if (isAdmin()) {
          <div class="dp-card import-card">
            <h3>Seed the pool (admin)</h3>
            <p class="muted">One lead per line: <code>Name, Surname, Phone, Email, State</code></p>
            <mat-form-field appearance="outline">
              <mat-label>Leads CSV lines</mat-label>
              <textarea matInput rows="4" [(ngModel)]="csvText" placeholder="Adaeze Obi, 08031234567, ada@mail.com, Lagos"></textarea>
            </mat-form-field>
            @if (importResult(); as r) {
              <p class="muted" role="status">{{ r }}</p>
            }
            <div><button mat-flat-button color="primary" (click)="importCsv()" [disabled]="importing() || !csvText().trim()">Import to pool</button></div>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .pool-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75em; }
    .page-head h2 { margin: 0; display: flex; align-items: center; gap: 0.4em; }
    .page-head mat-icon { cursor: pointer; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .notice { color: var(--dp-success); }
    .error { color: var(--dp-error); }
    .gate-card { padding: 1.2em; display: flex; gap: 0.8em; align-items: flex-start; }
    .gate-card mat-icon { font-size: 36px; height: 36px; width: 36px; }
    .gate-card h3 { margin: 0 0 0.3em; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75em; }
    .kpi mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .kpi mat-icon { color: var(--dp-gold); }
    .kpi-value { font-size: 1.5em; font-weight: 700; }
    .kpi-label { color: var(--dp-muted); font-size: 0.85em; }
    .search-row { display: flex; gap: 0.5em; align-items: center; flex-wrap: wrap; }
    .search-field { flex: 1 1 220px; }
    .claims-card { padding: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .claims-card h3 { margin: 0; }
    .claim-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5em; border-top: 1px solid var(--dp-line); padding-top: 0.5em; flex-wrap: wrap; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: 0.75em; }
    .lead-card { padding: 1em; display: flex; flex-direction: column; gap: 0.55em; }
    .lead-top { display: flex; gap: 0.7em; align-items: center; }
    .avatar { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--dp-gold), #6b4e12); }
    .lead-head { display: flex; flex-direction: column; gap: 0.25em; min-width: 0; }
    .chip-row { display: flex; gap: 0.35em; flex-wrap: wrap; }
    .why { display: flex; align-items: center; gap: 0.35em; margin: 0; font-size: 0.9em; }
    .why mat-icon { color: var(--dp-gold); font-size: 20px; height: 20px; width: 20px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; margin: 0; }
    .card-actions { display: flex; align-items: center; gap: 0.4em; margin-top: auto; }
    .spacer { flex: 1; }
    .empty-card { display: flex; flex-direction: column; align-items: center; gap: 0.5em; text-align: center; background: var(--dp-paper); border: 1px dashed var(--dp-line); border-radius: 14px; padding: 2.5em 1.5em; color: var(--dp-muted); }
    .empty-card mat-icon { font-size: 40px; height: 40px; width: 40px; opacity: 0.6; }
    .empty-card p { margin: 0; max-width: 34em; }
    .import-card { padding: 1em; display: flex; flex-direction: column; gap: 0.6em; }
    .import-card h3 { margin: 0; }
    button, a[mat-button], a[mat-flat-button] { min-height: 44px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, FormsModule, RouterModule],
})
export class GeneralProspectListComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  private readonly dialog = inject(MatDialog);
  private readonly leads = inject(LeadPipelineService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<PoolLead[]>([]);
  protected readonly total = signal(0);
  protected readonly meta = signal<{ available: number; claimedToday: number; dailyLimit: number; activeClaims: number; nearestDeadlineMs: number | null } | null>(null);
  protected readonly partnerState = signal('');
  protected readonly requiresState = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected query = '';
  protected readonly pageSize = 25;
  protected readonly myClaims = signal<MyClaim[]>([]);
  protected readonly csvText = signal('');
  protected readonly importing = signal(false);
  protected readonly importResult = signal<string | null>(null);
  protected readonly Math = Math;

  protected isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  protected dailyLimit(): number {
    return this.meta()?.dailyLimit ?? 3;
  }

  protected canClaimMore(): boolean {
    const m = this.meta();
    return !m || m.claimedToday < m.dailyLimit;
  }

  protected hasMore(): boolean {
    return this.items().length < this.total();
  }

  protected nearestDeadline(): string | null {
    const ms = this.meta()?.nearestDeadlineMs ?? null;
    if (ms === null || !Number.isFinite(ms)) return null;
    const h = Math.floor(ms / 3600000);
    if (h < 24) return `${h}h left`;
    return `${Math.floor(h / 24)}d left`;
  }

  ngOnInit(): void {
    this.reload();
    this.loadClaims();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.leads
      .pool({ limit: this.pageSize, skip: 0, ...(this.query.trim() ? { q: this.query.trim() } : {}) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          this.requiresState.set(!!data?.requiresState);
          this.partnerState.set(data?.partnerState ?? '');
          this.items.set(data?.items ?? []);
          this.total.set(data?.total ?? 0);
          this.meta.set(data?.meta ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.loading.set(true);
    this.leads
      .pool({ limit: this.pageSize, skip: this.items().length, ...(this.query.trim() ? { q: this.query.trim() } : {}) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set([...this.items(), ...(res.data?.items ?? [])]);
          this.total.set(res.data?.total ?? this.total());
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected loadClaims(): void {
    const id = this.partner?._id;
    if (!id) return;
    this.leads
      .listByPartner(id, { limit: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const rows = (res.data ?? []).filter((l) => !!l.claimedAt);
          rows.sort((a, b) => new Date(a.claimedAt ?? 0).getTime() - new Date(b.claimedAt ?? 0).getTime());
          this.myClaims.set(rows.slice(0, 5).map((l) => ({
            id: l.id,
            name: `${l.prospectName ?? ''} ${l.prospectSurname ?? ''}`.trim() || 'Unnamed',
            claimedAt: String(l.claimedAt ?? ''),
          })));
        },
        error: () => {},
      });
  }

  protected initials(lead: PoolLead): string {
    const parts = `${lead.name ?? ''} ${lead.surname ?? ''}`.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  protected badgeTone(badge: string): string {
    if (badge === 'Hot') return 'dp-status dp-status--bad';
    if (badge === 'New') return 'dp-status dp-status--warn';
    return 'dp-status dp-status--ok';
  }

  protected ageOf(lead: PoolLead): string {
    return timeAgo(new Date(lead.createdAt));
  }

  protected countdown(claimedAt: string): string {
    const ms = new Date(claimedAt).getTime() + 48 * 3600000 - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return 'window passed';
    const h = Math.floor(ms / 3600000);
    if (h < 24) return `${h}h left to log activity`;
    return `${Math.floor(h / 24)}d ${h % 24}h left`;
  }

  protected openDossier(lead: PoolLead): void {
    this.dialog.open(MaskedProspectResponseComponent, {
      data: { prospect: lead, partnerState: this.partnerState() || this.partner?.address?.state || '' },
    }).afterClosed().subscribe((result: unknown) => {
      const id = (result as { claim?: string } | null)?.claim;
      if (typeof id === 'string' && id) this.claimLead(id);
    });
  }

  protected claimLead(leadId: string): void {
    const lead = this.items().find((l: PoolLead) => l.id === leadId);
    if (!lead) return;
    this.dialog.open(ClaimLeadDialogComponent, {
      data: {
        lead: { ...lead, _id: lead.id } as unknown as Record<string, unknown>,
        partnerId: this.partner._id,
        partnerState: this.partnerState() || this.partner?.address?.state || '',
        walletBalance: Number(this.partner?.balance ?? 0),
      },
    }).afterClosed().subscribe((claimed: unknown) => {
      if (claimed !== true) return;
      this.notice.set('Lead claimed — find it in My pipeline.');
      this.reload();
      this.loadClaims();
    });
  }

  protected showDescription(): void {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: 'Buy Prospect: fresh leads near you, ranked Hot / New / Complete. Claiming costs ₦250 from your wallet — work each lead within 48 hours or it returns to the pool.',
      },
    });
  }

  protected importCsv(): void {
    const text = this.csvText().trim();
    if (!text || this.importing()) return;
    const rows = text.split(/\r?\n/).map((line: string) => line.trim()).filter(Boolean).map((line: string) => {
      const [name, surname, phone, email, state] = line.split(',').map((c: string) => c.trim());
      return { name, surname, phone, email, state };
    });
    this.importing.set(true);
    this.importResult.set(null);
    this.leads
      .importLeads(rows)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.importing.set(false);
          const d = res.data ?? { inserted: 0, failed: [], total: 0 };
          this.importResult.set(`Imported ${d.inserted} of ${d.total}${d.failed.length ? ` — ${d.failed.length} rows need name, surname and phone` : ''}.`);
          if (d.inserted > 0) {
            this.csvText.set('');
            this.reload();
          }
        },
        error: (err: ApiError) => {
          this.importing.set(false);
          this.importResult.set(err.message);
        },
      });
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
