import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { LeadPipelineService } from '../../../prospects/lead-pipeline/lead-pipeline.service';
import { DownlineContactListItem } from '../../../prospects/lead-pipeline/lead.models';
import { ApiError } from '../../../../../core/http/api-error';

type ListFilter = 'all' | 'needs-work' | 'done';

const PAGE_SIZE = 10;
const PREVIEW_COUNT = 5;

/**
 * @title Downline contact lists — the upline workbench.
 *
 * Submitted onboarding lists from every downline member, newest first.
 * Built for scale: one card per member batch, contacts previewed with
 * expand, batches paged (10/page), searchable across members and phones —
 * so ten partners submitting at once stays usable. This is where
 * "upline calls those contacts and books sessions" happens in-app.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-downline-contact-lists',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, MatButtonModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Downline contact lists</span>
      </div>
    </section>

    <section class="lists-page">
      <div class="page-head">
        <div>
          <h2>Downline contact lists</h2>
          <p class="subtitle">Lists your people submitted — call the fresh numbers first, book sessions, mark outcomes in the pipeline.</p>
        </div>
        <button mat-button (click)="reload()" [disabled]="loading()">Refresh</button>
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

      @if (!loading() && !error() && items().length > 0) {
        <div class="chip-row" role="status">
          <mat-chip highlighted>{{ memberCount() }} member{{ memberCount() === 1 ? '' : 's' }}</mat-chip>
          <mat-chip highlighted>{{ items().length }} list{{ items().length === 1 ? '' : 's' }}</mat-chip>
          <mat-chip highlighted>{{ totalContacts() }} contacts</mat-chip>
          <mat-chip highlighted>{{ unworkedCount() }} unworked</mat-chip>
        </div>

        <div class="toolbar">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Search member, username or phone</mat-label>
            <input matInput type="search" [value]="query()" (input)="query.set($any($event.target).value); page.set(0)" />
          </mat-form-field>
          <div class="filter-row" role="radiogroup" aria-label="List filter">
            <button type="button" class="filter-btn" [class.filter-btn--active]="filter() === 'all'" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all'); page.set(0)">All</button>
            <button type="button" class="filter-btn" [class.filter-btn--active]="filter() === 'needs-work'" [attr.aria-pressed]="filter() === 'needs-work'" (click)="filter.set('needs-work'); page.set(0)">Needs work</button>
            <button type="button" class="filter-btn" [class.filter-btn--active]="filter() === 'done'" [attr.aria-pressed]="filter() === 'done'" (click)="filter.set('done'); page.set(0)">Fully worked</button>
          </div>
        </div>

        <div class="expand-row">
          <span class="muted">Showing {{ paged().length }} of {{ filtered().length }} lists</span>
          <span class="spacer"></span>
          <button mat-button (click)="expandAll()">Expand all</button>
          <button mat-button (click)="collapseAll()">Collapse all</button>
        </div>
      }

      @if (paged().length > 0) {
        <ul class="batch-list">
          @for (b of paged(); track b.partnerId + b.batch) {
            <li class="dp-card batch">
              <div class="batch-head">
                <div>
                  <strong>{{ b.member?.name ?? 'Team member' }}</strong>
                  <span class="muted">@{{ b.member?.username ?? '—' }} · submitted {{ b.submittedAt | date:'mediumDate' }}</span>
                </div>
                <span class="count-pill">{{ b.worked }} of {{ b.total }} worked</span>
              </div>
              <div class="entry-tags">
                @for (stage of stageKeys(b); track stage) {
                  <mat-chip highlighted>{{ stage }} ({{ b.stageCounts[stage] }})</mat-chip>
                }
              </div>
              <ul class="contact-list">
                @for (c of visibleContacts(b); track c.id) {
                  <li class="contact" [class.contact--worked]="c.stage !== 'New'">
                    <div>
                      <strong>{{ c.prospectName }} {{ c.prospectSurname }}</strong>
                      <a class="phone" [href]="'tel:' + c.prospectPhone">{{ c.prospectPhone }}</a>
                      <div class="entry-tags">
                        <mat-chip highlighted>{{ c.relationship }}</mat-chip>
                        @if (c.priority === 'high') {
                          <mat-chip color="warn" highlighted>High priority</mat-chip>
                        }
                        @if (c.consentToContact) {
                          <mat-chip color="primary" highlighted>Consented</mat-chip>
                        }
                        <mat-chip highlighted>{{ c.stage }}</mat-chip>
                      </div>
                      @if (c.bestTimeToCall) {
                        <p class="muted">Best time: {{ c.bestTimeToCall }}</p>
                      }
                    </div>
                    <span class="spacer"></span>
                    <a mat-button [href]="'tel:' + c.prospectPhone" aria-label="Call {{ c.prospectName }}">
                      <mat-icon>call</mat-icon> Call
                    </a>
                    <a mat-button [routerLink]="['/dashboard/prospects/detail', c.id]" aria-label="Open {{ c.prospectName }} in pipeline">Open</a>
                  </li>
                }
              </ul>
              @if (b.contacts.length > previewCount) {
                <button mat-button (click)="toggle(batchKey(b))">
                  {{ isExpanded(batchKey(b)) ? 'Show less' : 'Show all ' + b.contacts.length + ' contacts' }}
                </button>
              }
            </li>
          }
        </ul>

        @if (totalPages() > 1) {
          <div class="pager">
            <button mat-button (click)="prev()" [disabled]="page() === 0">Previous</button>
            <span class="muted" role="status">Page {{ page() + 1 }} of {{ totalPages() }}</span>
            <button mat-button (click)="next()" [disabled]="page() + 1 >= totalPages()">Next</button>
          </div>
        }
      } @else if (!loading() && !error()) {
        @if (items().length === 0) {
          <div class="empty-card">
            <mat-icon>contact_phone</mat-icon>
            <p><strong>No submitted lists yet.</strong></p>
            <p class="muted">When your downline submits contact lists (any number, from Tools → Contacts → New), they land here — newest first. If a member just submitted and you still see this, confirm they are in your downline (Network tree) and pull to refresh.</p>
            <a mat-button routerLink="/dashboard/mentorship/partners/my-partners">Check my downline</a>
          </div>
        } @else {
          <p class="empty">No lists match — <button mat-button (click)="clearSearch()">clear search</button></p>
        }
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .lists-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .page-head button { min-height: 44px; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .chip-row { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .toolbar { display: flex; gap: 0.75em; flex-wrap: wrap; align-items: center; }
    .toolbar mat-form-field { flex: 1; min-width: 220px; }
    .filter-row { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .filter-btn { border: 1px solid var(--dp-line); background: transparent; border-radius: 999px; padding: 0.5em 1em; min-height: 44px; cursor: pointer; color: inherit; font: inherit; font-size: 0.85rem; }
    .filter-btn--active { border-color: var(--dp-gold); background: var(--dp-gold-soft); font-weight: 700; }
    .expand-row { display: flex; align-items: center; gap: 0.5em; flex-wrap: wrap; }
    .expand-row button { min-height: 44px; }
    .batch-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .batch { padding: 1em; display: flex; flex-direction: column; gap: 0.6em; }
    .batch-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75em; flex-wrap: wrap; }
    .count-pill { font-size: 0.85em; font-weight: 800; border-radius: 999px; padding: 0.3em 0.9em; background: var(--dp-surface); border: 1px solid var(--dp-line); color: var(--dp-muted); white-space: nowrap; }
    .entry-tags { display: flex; gap: 0.3em; flex-wrap: wrap; margin-top: 0.3em; }
    .contact-list { list-style: none; margin: 0.4em 0 0; padding: 0; display: flex; flex-direction: column; }
    .contact { display: flex; align-items: center; gap: 0.75em; padding: 0.6em 0; border-top: 1px solid var(--dp-line); flex-wrap: wrap; }
    .contact--worked { opacity: 0.7; }
    .contact p { margin: 0.2em 0 0; }
    .phone { color: var(--dp-gold-ink); font-weight: 600; text-decoration: none; margin-left: 0.5em; }
    .contact a[mat-button], .batch button[mat-button], .pager button { min-height: 44px; }
    .pager { display: flex; align-items: center; justify-content: center; gap: 1em; }
    .spacer { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    .empty-card { display: flex; flex-direction: column; align-items: center; gap: 0.4em; text-align: center; background: var(--dp-surface); border: 1px dashed var(--dp-line); border-radius: 14px; padding: 2.5em 1.5em; color: var(--dp-muted); }
    .empty-card mat-icon { font-size: 40px; height: 40px; width: 40px; opacity: 0.6; }
    .empty-card p { margin: 0; max-width: 38em; }
    .empty-card a { min-height: 44px; }
  `],
})
export class DownlineContactListsComponent implements OnInit {
  private readonly leads = inject(LeadPipelineService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<DownlineContactListItem[]>([]);
  protected readonly query = signal('');
  protected readonly filter = signal<ListFilter>('all');
  protected readonly page = signal(0);
  protected readonly expanded = signal<Record<string, boolean>>({});
  protected readonly previewCount = PREVIEW_COUNT;

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.items().filter((b) => {
      if (f === 'needs-work' && (b.total - b.worked) <= 0) return false;
      if (f === 'done' && (b.total - b.worked) > 0) return false;
      if (!q) return true;
      const hay = `${b.member?.name ?? ''} ${b.member?.username ?? ''} ${(b.contacts ?? []).map((c) => `${c.prospectName} ${c.prospectSurname} ${c.prospectPhone}`).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  protected readonly paged = computed(() => {
    const p = Math.min(this.page(), this.totalPages() - 1);
    return this.filtered().slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);
  });

  protected readonly memberCount = computed(() => new Set(this.items().map((b) => b.partnerId)).size);
  protected readonly totalContacts = computed(() => this.items().reduce((n, b) => n + (b.contacts?.length ?? 0), 0));
  protected readonly unworkedCount = computed(() => this.items().reduce((n, b) => n + Math.max(0, (b.total ?? 0) - (b.worked ?? 0)), 0));

  ngOnInit(): void {
    this.reload();
  }

  protected stageKeys(b: DownlineContactListItem): string[] {
    return Object.keys(b.stageCounts ?? {}).sort();
  }

  protected batchKey(b: DownlineContactListItem): string {
    return `${b.partnerId}::${b.batch}`;
  }

  protected isExpanded(key: string): boolean {
    return this.expanded()[key] === true;
  }

  protected toggle(key: string): void {
    this.expanded.update((m) => ({ ...m, [key]: !m[key] }));
  }

  protected expandAll(): void {
    const all: Record<string, boolean> = {};
    for (const b of this.paged()) all[this.batchKey(b)] = true;
    this.expanded.update((m) => ({ ...m, ...all }));
  }

  protected collapseAll(): void {
    this.expanded.set({});
  }

  protected prev(): void {
    this.page.update((p) => Math.max(0, p - 1));
  }

  protected next(): void {
    this.page.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }

  protected clearSearch(): void {
    this.query.set('');
    this.filter.set('all');
    this.page.set(0);
  }

  protected visibleContacts(b: DownlineContactListItem): DownlineContactListItem['contacts'] {
    if (this.isExpanded(this.batchKey(b))) return b.contacts ?? [];
    return (b.contacts ?? []).slice(0, PREVIEW_COUNT);
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.leads
      .downlineContactLists()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set(res.data?.items ?? []);
          this.page.set(0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
