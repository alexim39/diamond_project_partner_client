import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/notifications/notification.service';
import { FeedItem, FeedKind } from '../../../core/notifications/notification.models';
import { ApiError } from '../../../core/http/api-error';

const KIND_META: Record<FeedKind, { label: string; color: string; text: string }> = {
  followup: { label: 'Follow-up', color: '#bbdefb', text: '#0d47a1' },
  inactive: { label: 'Inactive', color: '#ffecb3', text: '#7a5c00' },
  conversion: { label: 'Conversion', color: '#c8e6c9', text: '#1b5e20' },
  release: { label: 'Payout', color: '#e1bee7', text: '#4a148c' },
};

/**
 * @title Notifications center — unified feed.
 *
 * Follow-ups, inactivity nudges, conversions and commission payouts in one
 * urgent-first list with kind filters, deep links and mark-read.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-notifications-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Notifications</span>
      </div>
    </section>

    <section class="center-page">
      <div class="page-head">
        <div>
          <h2>Notifications</h2>
          <p class="subtitle">
            @if (urgentCount() > 0) {
              <strong class="urgent">{{ urgentCount() }} need action now.</strong>
            } @else {
              You're all caught up on urgent items.
            }
          </p>
        </div>
        @if (items().length > 0) {
          <button mat-button (click)="markAllRead()" [disabled]="markingAll() || loading()">
            Mark all as read
          </button>
        }
      </div>

      <div class="filters" role="group" aria-label="Filter by kind">
        @for (f of kindFilters; track f.value) {
          <button
            mat-button
            [color]="kindFilter() === f.value ? 'primary' : undefined"
            (click)="setKind(f.value)"
          >{{ f.label }}</button>
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

      @if (filtered().length > 0) {
        <ul class="feed">
          @for (item of filtered(); track item.id) {
            <li class="feed-item" [class.feed-item--urgent]="item.urgency">
              <mat-icon [class.warn]="item.urgency">{{ item.icon }}</mat-icon>
              <div class="feed-body">
                <div class="feed-title-row">
                  <strong>{{ item.title }}</strong>
                  <mat-chip [style.background]="chip(item.kind).color" [style.color]="chip(item.kind).text" highlighted>
                    {{ chip(item.kind).label }}
                  </mat-chip>
                </div>
                <p class="muted">{{ item.body }} · {{ item.tag }}</p>
                <div class="feed-actions">
                  @if (item.link) {
                    <a mat-button [routerLink]="item.link">Open</a>
                  }
                  <button mat-button (click)="dismiss(item.id)" [disabled]="dismissingId() === item.id">
                    Dismiss
                  </button>
                </div>
              </div>
            </li>
          }
        </ul>
        <p class="muted">{{ filtered().length }} of {{ total() }} notifications</p>
      } @else if (!loading() && !error()) {
        <p class="empty">Nothing here — new follow-ups, payouts and conversions will land in this feed.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .center-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .urgent { color: var(--dp-error); }
    .filters { display: flex; gap: 0.25em; flex-wrap: wrap; }
    .feed { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .feed-item { display: flex; gap: 0.9em; align-items: flex-start; background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 0.9em 1em; }
    .feed-item--urgent { border-left: 4px solid var(--dp-error); }
    .feed-item mat-icon { margin-top: 0.1em; }
    .feed-item mat-icon.warn { color: var(--dp-error); }
    .feed-body { flex: 1; display: flex; flex-direction: column; gap: 0.3em; }
    .feed-body p { margin: 0; }
    .feed-title-row { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .feed-actions { display: flex; gap: 0.25em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class NotificationsCenterComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<FeedItem[]>([]);
  protected readonly total = signal(0);
  protected readonly kindFilter = signal<FeedKind | null>(null);
  protected readonly dismissingId = signal<string | null>(null);
  protected readonly markingAll = signal(false);

  protected readonly kindFilters: Array<{ label: string; value: FeedKind | null }> = [
    { label: 'All', value: null },
    { label: 'Follow-ups', value: 'followup' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Conversions', value: 'conversion' },
    { label: 'Payouts', value: 'release' },
  ];

  protected readonly filtered = computed(() => {
    const kind = this.kindFilter();
    return kind ? this.items().filter((i) => i.kind === kind) : this.items();
  });

  protected readonly urgentCount = computed(() => this.items().filter((i) => i.urgency).length);

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.notifications
      .feed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.items.set(res.data.items ?? []);
          this.total.set(res.data.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected setKind(kind: FeedKind | null): void {
    this.kindFilter.set(kind);
  }

  protected chip(kind: FeedKind): { label: string; color: string; text: string } {
    return KIND_META[kind] ?? KIND_META['followup'];
  }

  protected dismiss(id: string): void {
    this.dismissingId.set(id);
    this.notifications
      .markRead([id])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dismissingId.set(null);
          this.items.set(this.items().filter((i) => i.id !== id));
          this.total.set(Math.max(0, this.total() - 1));
        },
        error: (err: ApiError) => {
          this.dismissingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected markAllRead(): void {
    const ids = this.items().map((i) => i.id);
    if (ids.length === 0) return;
    this.markingAll.set(true);
    this.notifications
      .markRead(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.markingAll.set(false);
          this.items.set([]);
          this.total.set(0);
        },
        error: (err: ApiError) => {
          this.markingAll.set(false);
          this.error.set(err.message);
        },
      });
  }
}
