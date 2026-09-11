import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import {
  CATEGORY_LABELS,
  NotificationPreferences,
  StoredNotificationItem,
} from '../../../core/notifications/notification.models';
import { ApiError } from '../../../core/http/api-error';

const KIND_META: Record<string, { label: string; color: string; text: string }> = {
  followup: { label: 'Follow-up', color: '#bbdefb', text: '#0d47a1' },
  inactive: { label: 'Inactive', color: '#ffecb3', text: '#7a5c00' },
  conversion: { label: 'Conversion', color: '#c8e6c9', text: '#1b5e20' },
  release: { label: 'Payout', color: '#e1bee7', text: '#4a148c' },
  mention: { label: 'Mention', color: '#ffe0b2', text: '#7a4a00' },
  prospect: { label: 'Prospects', color: '#bbdefb', text: '#0d47a1' },
  daily: { label: 'Daily', color: '#bbdefb', text: '#0d47a1' },
  goals: { label: 'Goals', color: '#c8e6c9', text: '#1b5e20' },
  progression: { label: 'Progression', color: '#c8e6c9', text: '#1b5e20' },
  promotion: { label: 'Promotions', color: '#e1bee7', text: '#4a148c' },
  commission: { label: 'Commissions', color: '#e1bee7', text: '#4a148c' },
  training: { label: 'Training', color: '#d1c4e9', text: '#4527a0' },
  community: { label: 'Community', color: '#ffe0b2', text: '#7a4a00' },
  recognition: { label: 'Recognition', color: '#ffe0b2', text: '#7a4a00' },
  team: { label: 'Team', color: '#ffccbc', text: '#7a2e00' },
  system: { label: 'System', color: '#e0e0e0', text: '#424242' },
  marketing: { label: 'Marketing', color: '#e0e0e0', text: '#424242' },
};

type GroupKey = 'prospects' | 'community' | 'training' | 'goals' | 'team' | 'commissions' | 'system';

const GROUP_OF: Record<string, GroupKey> = {
  followup: 'prospects', inactive: 'prospects', conversion: 'prospects', prospect: 'prospects', daily: 'prospects',
  mention: 'community', community: 'community', recognition: 'community',
  training: 'training', progression: 'training',
  goals: 'goals',
  team: 'team', promotion: 'team',
  release: 'commissions', commission: 'commissions',
  system: 'system', marketing: 'system',
};

const GROUP_LABELS: Record<GroupKey, string> = {
  prospects: 'Prospects', community: 'Community', training: 'Training', goals: 'Goals',
  team: 'Team', commissions: 'Commissions', system: 'System',
};

interface DayBucket { label: string; items: StoredNotificationItem[]; }

/**
 * @title Notifications center — unified stored + derived list.
 *
 * Stored announcements (goals, training, promotions, system…) and derived
 * action items (follow-ups, payouts, conversions, mentions) in one list:
 * urgent first, then newest-first day buckets. Read / archive / delete /
 * mute-category, unread toggle, search, group filters. OnPush + signals.
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
            @if (urgent().length > 0) {
              <strong class="urgent">{{ urgent().length }} need action now.</strong>
            } @else {
              You're all caught up on urgent items.
            }
          </p>
        </div>
        <div class="head-actions">
          @if (all().length > 0) {
            <button mat-button (click)="markAllRead()" [disabled]="markingAll() || loading()">
              Mark all as read
            </button>
            <button mat-button (click)="archiveAll()" [disabled]="markingAll() || loading()">
              Archive all
            </button>
          }
          <a mat-button routerLink="/dashboard/notifications/preferences">Notification settings</a>
        </div>
      </div>

      <div class="controls">
        <input
          type="search"
          class="search"
          placeholder="Search notifications…"
          aria-label="Search notifications"
          [value]="search()"
          (input)="onSearch($event)"
          (keyup.enter)="reload()"
        />
        <button
          mat-button
          [color]="unreadOnly() ? 'primary' : undefined"
          [attr.aria-pressed]="unreadOnly()"
          (click)="toggleUnread()"
        >{{ unreadOnly() ? 'Unread ✓' : 'Unread' }}</button>
      </div>

      <div class="filters" role="group" aria-label="Filter by group">
        <button mat-button [color]="!groupFilter() ? 'primary' : undefined" (click)="setGroup(null)">All</button>
        @for (g of groupKeys; track g) {
          <button mat-button [color]="groupFilter() === g ? 'primary' : undefined" (click)="setGroup(g)">
            {{ groupLabel(g) }}
          </button>
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

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      @if (urgent().length > 0) {
        <h3 class="group-head">Needs action now</h3>
        <ul class="feed">
          @for (item of urgent(); track item.id) {
            <li class="feed-item feed-item--urgent" [class.feed-item--read]="item.read">
              <mat-icon class="warn">{{ item.icon }}</mat-icon>
              <div class="feed-body">
                <div class="feed-title-row">
                  <strong>{{ item.title }}</strong>
                  <mat-chip [style.background]="chip(item.kind).color" [style.color]="chip(item.kind).text" highlighted>
                    {{ chip(item.kind).label }}
                  </mat-chip>
                  @if (item.origin === 'stored') {
                    <mat-chip class="prio" highlighted>{{ item.priority }}</mat-chip>
                  }
                </div>
                <p class="muted">{{ item.body }} · {{ item.tag }}</p>
                <div class="feed-actions">
                  @if (item.link) {
                    <a mat-button [routerLink]="item.link">Open</a>
                  }
                  <button mat-button (click)="toggleDetail(item.id)">
                    {{ expandedId() === item.id ? 'Hide details' : 'Details' }}
                  </button>
                  @if (item.origin === 'stored') {
                    <button mat-button (click)="archiveStored(item.id)" [disabled]="busyId() === item.id">Archive</button>
                  } @else {
                    <button mat-button (click)="dismiss(item.id)" [disabled]="busyId() === item.id">Dismiss</button>
                  }
                </div>
                @if (expandedId() === item.id) {
                  <div class="detail">
                    <p>{{ item.body }}</p>
                    <p class="muted">{{ categoryLabel(item.kind) }} · {{ item.at }}</p>
                    @if (item.origin === 'stored') {
                      <div class="feed-actions">
                        <button mat-button (click)="muteCategory(item)" [disabled]="busyId() === item.id">
                          Mute these
                        </button>
                        @if (confirmDeleteId() === item.id) {
                          <button mat-button color="warn" (click)="deleteStored(item.id)" [disabled]="busyId() === item.id">
                            Confirm delete
                          </button>
                          <button mat-button (click)="confirmDeleteId.set(null)">Cancel</button>
                        } @else {
                          <button mat-button (click)="confirmDeleteId.set(item.id)">Delete</button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </li>
          }
        </ul>
      }

      @if (buckets().length > 0) {
        @for (bucket of buckets(); track bucket.label) {
          <h3 class="group-head">{{ bucket.label }}</h3>
          <ul class="feed">
            @for (item of bucket.items; track item.id) {
              <li class="feed-item" [class.feed-item--urgent]="item.urgency && !item.read" [class.feed-item--read]="item.read">
                <mat-icon [class.warn]="item.urgency && !item.read">{{ item.icon }}</mat-icon>
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
                    <button mat-button (click)="toggleDetail(item.id)">
                      {{ expandedId() === item.id ? 'Hide details' : 'Details' }}
                    </button>
                    @if (item.origin === 'stored') {
                      <button mat-button (click)="archiveStored(item.id)" [disabled]="busyId() === item.id">Archive</button>
                    } @else {
                      <button mat-button (click)="dismiss(item.id)" [disabled]="busyId() === item.id">Dismiss</button>
                    }
                  </div>
                  @if (expandedId() === item.id) {
                    <div class="detail">
                      <p>{{ item.body }}</p>
                      <p class="muted">{{ categoryLabel(item.kind) }} · {{ item.at }}</p>
                      @if (item.origin === 'stored') {
                        <div class="feed-actions">
                          <button mat-button (click)="muteCategory(item)" [disabled]="busyId() === item.id">
                            Mute these
                          </button>
                          @if (confirmDeleteId() === item.id) {
                            <button mat-button color="warn" (click)="deleteStored(item.id)" [disabled]="busyId() === item.id">
                              Confirm delete
                            </button>
                            <button mat-button (click)="confirmDeleteId.set(null)">Cancel</button>
                          } @else {
                            <button mat-button (click)="confirmDeleteId.set(item.id)">Delete</button>
                          }
                        </div>
                      }
                    </div>
                    }
                  </div>
                </li>
              }
            </ul>
          }
          @if (hasMore()) {
            <p class="muted">Showing the first 50 — search or filter to narrow down.</p>
          }
          <p class="muted">{{ all().length }} notifications</p>
        } @else if (!loading() && !error()) {
          <p class="empty">
            @if (unreadOnly()) {
              You're all caught up — nothing unread.
            } @else {
              Nothing here — follow-ups, payouts, goals and team news will land in this feed.
            }
          </p>
        }
      </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .center-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .head-actions { display: flex; gap: 0.25em; flex-wrap: wrap; align-items: center; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .urgent { color: var(--dp-error); }
    .controls { display: flex; gap: 0.5em; flex-wrap: wrap; align-items: center; }
    .search { flex: 1 1 220px; min-height: 44px; padding: 0 0.9em; border-radius: 8px; border: 1px solid var(--dp-line); background: var(--dp-surface); color: inherit; font: inherit; }
    .filters { display: flex; gap: 0.25em; flex-wrap: wrap; }
    .group-head { margin: 0.5em 0 0; font-size: 1em; }
    .feed { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .feed-item { display: flex; gap: 0.9em; align-items: flex-start; background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 0.9em 1em; }
    .feed-item--urgent { border-left: 4px solid var(--dp-error); }
    .feed-item--read { opacity: 0.65; }
    .feed-item mat-icon { margin-top: 0.1em; }
    .feed-item mat-icon.warn { color: var(--dp-error); }
    .feed-body { flex: 1; display: flex; flex-direction: column; gap: 0.3em; min-width: 0; }
    .feed-body p { margin: 0; }
    .feed-title-row { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .prio { text-transform: capitalize; }
    .feed-actions { display: flex; gap: 0.25em; flex-wrap: wrap; }
    .detail { border-top: 1px dashed var(--dp-line); padding-top: 0.6em; display: flex; flex-direction: column; gap: 0.4em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .notice { color: var(--dp-success, #2e7d32); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class NotificationsCenterComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly stored = signal<StoredNotificationItem[]>([]);
  protected readonly derived = signal<StoredNotificationItem[]>([]);
  protected readonly hasMore = signal(false);
  protected readonly prefs = signal<NotificationPreferences | null>(null);
  protected readonly unreadOnly = signal(false);
  protected readonly groupFilter = signal<GroupKey | null>(null);
  protected readonly search = signal('');
  protected readonly expandedId = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);
  protected readonly confirmDeleteId = signal<string | null>(null);
  protected readonly markingAll = signal(false);

  protected readonly groupKeys: GroupKey[] = ['prospects', 'community', 'training', 'goals', 'team', 'commissions', 'system'];

  protected readonly all = computed(() => {
    const group = this.groupFilter();
    const both = [...this.stored(), ...this.derived()]
      .filter((i) => !group || GROUP_OF[i.kind] === group)
      .sort((a, b) => +new Date(b.at) - +new Date(a.at));
    return both;
  });

  protected readonly urgent = computed(() => this.all().filter((i) => i.urgency && !i.read));
  protected readonly urgentCount = computed(() => this.urgent().length);

  protected readonly buckets = computed<DayBucket[]>(() => {
    const rest = this.all().filter((i) => !(i.urgency && !i.read));
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const buckets: DayBucket[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'This week', items: [] },
      { label: 'Earlier', items: [] },
    ];
    for (const item of rest) {
      const t = +new Date(item.at);
      if (Number.isNaN(t) || t >= startOfToday) buckets[0].items.push(item);
      else if (t >= startOfToday - 86400000) buckets[1].items.push(item);
      else if (t >= startOfToday - 7 * 86400000) buckets[2].items.push(item);
      else buckets[3].items.push(item);
    }
    return buckets.filter((b) => b.items.length > 0);
  });

  ngOnInit(): void {
    this.reload();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected toggleUnread(): void {
    this.unreadOnly.update((v) => !v);
    this.reload();
  }

  protected setGroup(group: GroupKey | null): void {
    this.groupFilter.set(group);
  }

  protected groupLabel(group: GroupKey): string {
    return GROUP_LABELS[group];
  }

  protected categoryLabel(kind: string): string {
    return CATEGORY_LABELS[kind] ?? this.chip(kind).label;
  }

  protected toggleDetail(id: string): void {
    this.expandedId.update((cur) => (cur === id ? null : id));
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: { unread?: boolean; q?: string; limit?: number } = { limit: 50 };
    if (this.unreadOnly()) params.unread = true;
    if (this.search().trim()) params.q = this.search().trim();
    forkJoin({ list: this.notifications.list(params), prefs: this.notifications.getPreferences() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ list, prefs }) => {
          this.stored.set(list.data?.stored ?? []);
          this.derived.set(list.data?.derived ?? []);
          this.hasMore.set(list.data?.hasMore ?? false);
          this.prefs.set(prefs.data ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected chip(kind: string): { label: string; color: string; text: string } {
    return KIND_META[kind] ?? { label: kind, color: '#e0e0e0', text: '#424242' };
  }

  /** Derived (computed) items dismiss through the legacy read endpoint. */
  protected dismiss(id: string): void {
    this.busyId.set(id);
    this.notifications
      .markRead([id])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.derived.set(this.derived().filter((i) => i.id !== id));
        },
        error: (err: ApiError) => {
          this.busyId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected markAllRead(): void {
    if (this.all().length === 0) return;
    this.markingAll.set(true);
    this.notifications
      .bulk('read-all')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const ids = this.derived().map((i) => i.id);
          if (ids.length === 0) {
            this.markingAll.set(false);
            this.reload();
            return;
          }
          this.notifications
            .markRead(ids)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.markingAll.set(false);
                this.reload();
              },
              error: (err: ApiError) => {
                this.markingAll.set(false);
                this.error.set(err.message);
              },
            });
        },
        error: (err: ApiError) => {
          this.markingAll.set(false);
          this.error.set(err.message);
        },
      });
  }

  protected archiveAll(): void {
    if (this.all().length === 0) return;
    this.markingAll.set(true);
    this.notifications
      .bulk('archive-all')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.markingAll.set(false);
          this.reload();
        },
        error: (err: ApiError) => {
          this.markingAll.set(false);
          this.error.set(err.message);
        },
      });
  }

  protected archiveStored(id: string): void {
    this.busyId.set(id);
    this.notifications
      .archiveStored(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.stored.set(this.stored().filter((i) => i.id !== id));
        },
        error: (err: ApiError) => {
          this.busyId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected deleteStored(id: string): void {
    this.busyId.set(id);
    this.notifications
      .deleteStored(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.confirmDeleteId.set(null);
          this.stored.set(this.stored().filter((i) => i.id !== id));
        },
        error: (err: ApiError) => {
          this.busyId.set(null);
          this.error.set(err.message);
        },
      });
  }

  /** "Mute these" turns the category off in-app for future items and archives this one. */
  protected muteCategory(item: StoredNotificationItem): void {
    const current = this.prefs();
    if (!current) {
      this.error.set('Preferences are still loading — try again in a moment.');
      return;
    }
    this.busyId.set(item.id);
    const channels = {
      ...current.channels,
      [item.kind]: { inApp: false, email: false, sms: false },
    };
    this.notifications
      .updatePreferences({ channels, emailDigest: current.emailDigest })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.prefs.set(res.data ?? this.prefs());
          this.notice.set(
            `You muted “${this.categoryLabel(item.kind)}” — future ones won't appear in-app. Change anytime in Notification settings.`,
          );
          this.archiveStored(item.id);
        },
        error: (err: ApiError) => {
          this.busyId.set(null);
          this.error.set(err.message);
        },
      });
  }
}
