import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, Subject, switchMap, tap } from 'rxjs';
import { SearchHit, SearchResults, SearchService } from '../../core/search/search.service';
import { ApiError } from '../../core/http/api-error';

interface FlatRow {
  group: string;
  label: string;
  sub: string;
  link: string;
}

/**
 * @title Search palette — ⌘K across members, prospects, courses, posts.
 *
 * Debounced live search with arrow-key navigation. Links respect the same
 * visibility the API enforces (own prospects, visible posts).
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-search-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, MatButtonModule, MatDialogModule, MatIconModule,
    MatProgressBarModule, RouterModule,
  ],
  template: `
    <div class="palette" role="dialog" aria-label="Search">
      <div class="palette-head">
        <mat-icon aria-hidden="true">search</mat-icon>
        <input
          #box
          class="palette-input"
          [(ngModel)]="query"
          (ngModelChange)="push($event)"
          (keydown)="onKey($event)"
          placeholder="Search members, prospects, courses, posts…"
          aria-label="Search members, prospects, courses and posts"
          autocomplete="off"
          spellcheck="false"
        />
        @if (query()) {
          <button class="palette-clear" (click)="push('')" aria-label="Clear search">
            <mat-icon aria-hidden="true">close</mat-icon>
          </button>
        }
        <kbd>esc</kbd>
      </div>

      @if (searching()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">{{ err }}</p>
      }

      @if (rows().length > 0) {
        <ul class="results" role="listbox" aria-label="Search results">
          @for (row of rows(); track row.group + row.label; let i = $index) {
            <li role="option" [attr.aria-selected]="i === active()">
              <a
                [routerLink]="row.link"
                (click)="close()"
                [class.active]="i === active()"
                (mouseenter)="active.set(i)"
              >
                <span class="group">{{ row.group }}</span>
                <span class="row-body">
                  <strong>{{ row.label }}</strong>
                  <span class="muted">{{ row.sub }}</span>
                </span>
                <mat-icon class="go" aria-hidden="true">arrow_forward</mat-icon>
              </a>
            </li>
          }
        </ul>
      } @else if (touched() && !searching() && !error()) {
        <div class="empty">
          <mat-icon aria-hidden="true">search_off</mat-icon>
          <p>No matches for “{{ query() }}” — try a name, stage, or course title.</p>
        </div>
      } @else if (!touched()) {
        <div class="empty idle">
          <mat-icon aria-hidden="true">keyboard_command_key</mat-icon>
          <p>Type at least 2 characters to search the workspace.</p>
        </div>
      }

      <p class="hint"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></p>
    </div>
  `,
  styles: [`
    .palette {
      display: flex; flex-direction: column; gap: 0;
      width: min(720px, 94vw); max-height: min(78vh, 720px);
      background: var(--dp-surface); color: var(--dp-text);
      border: 1px solid var(--dp-line); border-radius: 14px;
      overflow: hidden;
    }
    .palette-head {
      display: flex; align-items: center; gap: 0.6em;
      padding: 0.9em 1em;
      border-bottom: 1px solid var(--dp-line);
      background: var(--dp-sidenav); color: var(--dp-sidenav-text);
    }
    .palette-head > mat-icon { color: var(--dp-nav-icon); flex: none; }
    .palette-input {
      flex: 1; min-width: 0;
      background: transparent; border: none; outline: none;
      color: inherit; font: inherit; font-size: 1.05em;
    }
    .palette-input::placeholder { color: var(--dp-sidenav-text); opacity: 0.55; }
    .palette-clear {
      background: transparent; border: none; cursor: pointer;
      color: inherit; opacity: 0.7; display: inline-flex;
      min-width: 44px; min-height: 44px;
      align-items: center; justify-content: center;
    }
    kbd {
      font: inherit; font-size: 0.72em; font-weight: 700;
      border: 1px solid var(--dp-line); border-bottom-width: 2px; border-radius: 6px;
      padding: 0.15em 0.45em; color: var(--dp-muted); background: var(--dp-paper);
      flex: none;
    }
    .palette-head kbd { border-color: rgba(217, 179, 106, 0.4); color: var(--dp-nav-icon); background: transparent; }
    .results {
      list-style: none; margin: 0; padding: 0.5em;
      display: flex; flex-direction: column;
      overflow-y: auto;
      min-height: 120px;
    }
    .results a {
      display: flex; gap: 0.7em; align-items: center;
      padding: 0.55em 0.7em; border-radius: 10px;
      text-decoration: none; color: inherit; min-height: 52px;
    }
    .results a.active { background: var(--dp-gold-soft); }
    .results a.active .go { opacity: 1; transform: none; }
    .group {
      flex: none; font-size: 0.68em; font-weight: 800; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--dp-gold-ink); width: 78px;
    }
    .row-body { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .row-body strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .go { flex: none; opacity: 0; transform: translateX(-4px); color: var(--dp-gold-ink); font-size: 20px; height: 20px; width: 20px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); margin: 0.5em 1em; }
    .empty {
      display: flex; flex-direction: column; align-items: center; gap: 0.4em;
      padding: 2em 1.5em; text-align: center; color: var(--dp-muted);
    }
    .empty mat-icon { font-size: 32px; height: 32px; width: 32px; opacity: 0.5; }
    .empty p { margin: 0; max-width: 30em; }
    .hint {
      display: flex; gap: 1em; justify-content: center;
      margin: 0; padding: 0.6em 1em;
      font-size: 0.78em; color: var(--dp-muted);
      border-top: 1px solid var(--dp-line);
    }
    .hint span { display: inline-flex; align-items: center; gap: 0.3em; }
  `],
})
export class SearchPaletteComponent {
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<SearchPaletteComponent>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly terms = new Subject<string>();

  protected readonly query = signal('');
  protected readonly searching = signal(false);
  protected readonly touched = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly active = signal(0);
  protected readonly results = signal<SearchResults | null>(null);

  protected readonly rows = computed<FlatRow[]>(() => {
    const r = this.results();
    if (!r) return [];
    const out: FlatRow[] = [];
    const push = (group: string, hits: SearchHit[], toRow: (h: SearchHit) => Omit<FlatRow, 'group'>) => {
      for (const h of hits.slice(0, 5)) out.push({ group, label: toRow(h).label, sub: toRow(h).sub, link: toRow(h).link });
    };
    push('Members', r.members, (h) => ({
      label: h.name || `@${h.username ?? ''}`,
      sub: `@${h.username ?? ''}`,
      link: '/dashboard/mentorship/partners/my-partners',
    }));
    push('Prospects', r.prospects, (h) => ({
      label: h.name || 'Unnamed',
      sub: h.stage ?? '',
      link: h.id ? `/dashboard/prospects/detail/${h.id}` : '/dashboard/prospects/pipeline',
    }));
    push('Courses', r.courses, (h) => ({
      label: h.title || '',
      sub: h.tagline ?? '',
      link: h.id ? `/dashboard/training/courses/${h.id}` : '/dashboard/training/courses',
    }));
    push('Posts', r.posts, (h) => ({
      label: h.title || '',
      sub: h.kind ?? '',
      link: '/dashboard/community',
    }));
    return out;
  });

  constructor() {
    this.terms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.touched.set(true);
          this.error.set(null);
          this.active.set(0);
        }),
        filter((q) => q.trim().length >= 2),
        tap(() => this.searching.set(true)),
        switchMap((q) => this.search.query(q)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.results.set(res.data ?? null);
          this.searching.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.searching.set(false);
        },
      });
  }

  protected push(value: string): void {
    this.query.set(value);
    if (value.trim().length < 2) {
      this.results.set(null);
      this.searching.set(false);
      return;
    }
    this.terms.next(value);
  }

  protected onKey(event: KeyboardEvent): void {
    const rows = this.rows();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (rows.length > 0) this.active.set((this.active() + 1) % rows.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (rows.length > 0) this.active.set((this.active() - 1 + rows.length) % rows.length);
    } else if (event.key === 'Enter') {
      const row = rows[this.active()];
      if (row) {
        event.preventDefault();
        this.close();
        void this.router.navigateByUrl(row.link);
      }
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
