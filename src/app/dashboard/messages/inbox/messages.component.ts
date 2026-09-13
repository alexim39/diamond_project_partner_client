import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { MessageService } from '../../../core/messaging/message.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AnnounceEnvelope, Contact, Message, MessageEnvelope, TeamAnnounceEnvelope } from '../../../core/messaging/message.models';
import { ApiError } from '../../../core/http/api-error';

type ComposeKind = 'direct' | 'announcement' | 'team';

/**
 * @title Messages — inbox, direct replies and team announcements.
 *
 * Directs stay inside the business relationship (upline/downline);
 * announcements fan out to the direct team or the whole downline.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatButtonModule, MatButtonToggleModule, MatChipsModule, MatIconModule,
    MatInputModule, MatProgressBarModule, MatSelectModule, ReactiveFormsModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Messages</span>
      </div>
    </section>

    <section class="messages-page">
      <div class="page-head">
        <div>
          <h2>Messages</h2>
          <p class="subtitle">
            @if (unread() > 0) {
              <strong class="unread-count">{{ unread() }} unread.</strong>
            } @else if (!loading()) {
              Inbox zero — nice.
            }
          </p>
        </div>
        <button mat-button (click)="toggleCompose()">{{ showCompose() ? 'Cancel' : 'Write message' }}</button>
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

      @if (showCompose()) {
        <form class="compose-form" [formGroup]="form" (ngSubmit)="send()">
          <mat-button-toggle-group [value]="composeKind()" (change)="setKind($event.value)" aria-label="Message type">
            <mat-button-toggle value="direct">Direct</mat-button-toggle>
            <mat-button-toggle value="announcement">Announcement</mat-button-toggle>
            @if (teamId()) {
              <mat-button-toggle value="team">Team</mat-button-toggle>
            }
          </mat-button-toggle-group>

          @if (composeKind() === 'team' && teamName()) {
            <p class="muted" role="note">To every member of {{ teamName() }} — teammates only.</p>
          }

          @if (composeKind() === 'direct') {
            <mat-form-field appearance="outline">
              <mat-label>To</mat-label>
              <mat-select formControlName="to">
                @for (c of contacts(); track c.id) {
                  <mat-option [value]="c.id">{{ c.name }} ({{ c.username }}) · {{ c.relation }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          } @else {
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" maxlength="120" placeholder="e.g. Team call tonight" />
            </mat-form-field>
            @if (composeKind() === 'team' && teamName()) {
              <p class="muted" role="note">Audience: {{ teamName() }} members only.</p>
            } @else {
              <mat-form-field appearance="outline">
                <mat-label>Audience</mat-label>
                <mat-select formControlName="scope">
                  <mat-option value="direct">Direct team</mat-option>
                  <mat-option value="all">Entire downline (broadcast)</mat-option>
                </mat-select>
              </mat-form-field>
            }
          }

          <mat-form-field appearance="outline">
            <mat-label>Message</mat-label>
            <textarea matInput rows="3" formControlName="body" maxlength="2000"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || sending()">
              {{ sending() ? 'Sending…' : (composeKind() === 'direct' ? 'Send' : 'Announce') }}
            </button>
            @if (replyingTo(); as reply) {
              <div class="reply-context" role="note">
                <span class="muted">Replying to {{ reply.sender?.name ?? 'teammate' }}</span>
                <blockquote>{{ snippet(reply.body) }}</blockquote>
              </div>
            }
            @if (sendError(); as err) {
              <span class="error" role="alert">{{ err }}</span>
            }
            @if (sentNotice(); as notice) {
              <span class="notice" role="status">{{ notice }}</span>
            }
          </div>
        </form>
      }

      <div class="filter-bar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search messages</mat-label>
          <input matInput type="search" [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" placeholder="Name, title or words" />
        </mat-form-field>
        <div class="filter-row" role="radiogroup" aria-label="Message filter">
          <button type="button" class="filter-btn" [class.filter-btn--active]="kindFilter() === 'all'" [attr.aria-pressed]="kindFilter() === 'all'" (click)="kindFilter.set('all')">All</button>
          <button type="button" class="filter-btn" [class.filter-btn--active]="kindFilter() === 'direct'" [attr.aria-pressed]="kindFilter() === 'direct'" (click)="kindFilter.set('direct')">Direct</button>
          <button type="button" class="filter-btn" [class.filter-btn--active]="kindFilter() === 'team'" [attr.aria-pressed]="kindFilter() === 'team'" (click)="kindFilter.set('team')">Team</button>
          <button type="button" class="filter-btn" [class.filter-btn--active]="kindFilter() === 'announce'" [attr.aria-pressed]="kindFilter() === 'announce'" (click)="kindFilter.set('announce')">Announcements</button>
          <button type="button" class="filter-btn" [class.filter-btn--active]="unreadOnly()" [attr.aria-pressed]="unreadOnly()" (click)="unreadOnly.set(!unreadOnly())">Unread</button>
        </div>
      </div>

      @if (showConversations()) {
        <h3>Conversations ({{ conversations().length }})</h3>
        @if (conversations().length > 0) {
          <ul class="message-list">
            @for (c of conversations(); track c.id) {
              <li class="message-card message-card--convo" [class.message-card--unread]="c.unread > 0">
                <button type="button" class="convo-head" (click)="loadThread(c.id)" [attr.aria-expanded]="openThreadId() === c.id">
                  <strong>{{ c.name }}</strong>
                  @if (c.unread > 0) {
                    <span class="dp-status dp-status--bad">{{ c.unread }} new</span>
                  }
                  <span class="muted convo-snippet">{{ lastSnippet(c.messages) }}</span>
                </button>
                @if (openThreadId() === c.id) {
                  <div class="thread">
                    @if (threadLoading()) {
                      <mat-progress-bar mode="indeterminate" />
                    }
                    @if (threadError(); as err) {
                      <p class="error" role="alert">{{ err }}</p>
                    }
                    <ol class="bubble-list">
                      @for (m of threadMsgs(); track m.id) {
                        <li class="bubble" [class.bubble--mine]="m.senderId === myId()">
                          <div class="bubble-top">
                            <strong>{{ m.senderId === myId() ? 'You' : (m.sender?.name ?? 'Teammate') }}</strong>
                            <span class="muted">{{ m.createdAt | date:'short' }}</span>
                          </div>
                          @if (m.title) {
                            <strong class="bubble-title">{{ m.title }}</strong>
                          }
                          <p>{{ m.body }}</p>
                        </li>
                      }
                    </ol>
                    <div class="reply-box">
                      <mat-form-field appearance="outline" subscriptSizing="dynamic">
                        <mat-label>Reply to {{ c.name }}…</mat-label>
                        <input matInput [value]="replyDraft()" (input)="replyDraft.set($any($event.target).value)" maxlength="2000" (keydown.enter)="sendThreadReply()" />
                      </mat-form-field>
                      <button mat-flat-button color="primary" (click)="sendThreadReply()" [disabled]="!replyDraft().trim() || threadSending()">
                        {{ threadSending() ? 'Sending…' : 'Send' }}
                      </button>
                    </div>
                    @if (threadSendError(); as err) {
                      <p class="error" role="alert">{{ err }}</p>
                    }
                  </div>
                }
              </li>
            }
          </ul>
        } @else if (!loading()) {
          <p class="empty">No conversations yet — direct messages with your upline or downline land here.</p>
        }
      }

      @if (showBroadcasts()) {
        <h3>Team & announcements ({{ visibleBroadcasts().length }})</h3>
        @if (visibleBroadcasts().length > 0) {
          <ul class="message-list">
            @for (msg of visibleBroadcasts(); track msg.id) {
              <li class="message-card" [class.message-card--unread]="!msg.readAt" [class.message-card--team]="msg.kind === 'team'">
                <div class="message-top">
                  <strong>{{ msg.sender?.name ?? 'Teammate' }}</strong>
                  <span class="dp-status {{ kindTone(msg.kind) }}">{{ kindLabel(msg) }}</span>
                  <span class="muted">{{ msg.createdAt | date:'short' }}</span>
                </div>
                @if (msg.title) {
                  <strong>{{ msg.title }}</strong>
                }
                <p>{{ msg.body }}</p>
                <div class="message-actions">
                  @if (!msg.readAt) {
                    <button mat-button (click)="open(msg)">Mark as read</button>
                  }
                  @if (canReply(msg)) {
                    <button mat-button (click)="reply(msg)">Reply</button>
                  }
                </div>
              </li>
            }
          </ul>
        } @else if (!loading()) {
          <p class="empty">Nothing here — team messages and announcements will appear in this feed.</p>
        }
      }

      <h3>Sent ({{ sentBroadcasts().length }})</h3>
      @if (sentBroadcasts().length > 0) {
        <ul class="message-list">
          @for (msg of sentBroadcasts(); track msg.id) {
            <li class="message-card">
              <div class="message-top">
                <strong>To {{ msg.recipient?.name ?? 'teammate' }}</strong>
                <span class="dp-status {{ kindTone(msg.kind) }}">{{ kindLabel(msg) }}</span>
                <span class="muted">{{ msg.createdAt | date:'short' }}</span>
              </div>
              @if (msg.title) {
                <strong>{{ msg.title }}</strong>
              }
              <p>{{ msg.body }}</p>
            </li>
          }
        </ul>
      } @else if (!loading()) {
        <p class="empty">Nothing sent yet.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .messages-page { display: flex; flex-direction: column; gap: 1em; }
    .messages-page h3 { margin: 0.5em 0 0; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .unread-count { color: var(--dp-error); }
    .compose-form { background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; flex-wrap: wrap; }
    .message-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .message-card { background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.35em; }
    .message-card--unread { border-left: 4px solid var(--dp-gold); }
    .message-card--team { border-left: 4px solid var(--dp-info); }
    html[data-theme='dark'] .message-card--team { border-left-color: #90caf9; }
    .message-card--convo { padding: 0; overflow: hidden; }
    .convo-head { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; width: 100%; padding: 0.9em 1em; background: transparent; border: none; cursor: pointer; color: inherit; font: inherit; text-align: left; min-height: 44px; }
    .convo-snippet { flex: 1; min-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .thread { display: flex; flex-direction: column; gap: 0.6em; border-top: 1px solid var(--dp-line); padding: 0.75em 1em 0.9em; }
    .bubble-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5em; }
    .bubble { align-self: flex-start; max-width: 85%; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 12px; padding: 0.6em 0.8em; display: flex; flex-direction: column; gap: 0.2em; }
    .bubble--mine { align-self: flex-end; background: var(--dp-gold-soft); border-color: var(--dp-gold); }
    .bubble p { margin: 0; white-space: pre-wrap; }
    .bubble-top { display: flex; align-items: center; gap: 0.5em; flex-wrap: wrap; }
    .bubble-title { font-size: 0.9em; }
    .reply-box { display: flex; gap: 0.5em; align-items: center; }
    .reply-box mat-form-field { flex: 1; }
    .reply-box button { min-height: 44px; }
    .reply-context { display: flex; flex-direction: column; gap: 0.25em; }
    .reply-context blockquote { margin: 0; padding: 0.4em 0.7em; border-left: 3px solid var(--dp-gold); background: var(--dp-paper); border-radius: 0 8px 8px 0; font-size: 0.88em; color: var(--dp-muted); white-space: pre-wrap; }
    .filter-bar { display: flex; gap: 0.75em; flex-wrap: wrap; align-items: center; }
    .filter-bar mat-form-field { flex: 1; min-width: 200px; }
    .filter-row { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .filter-btn { border: 1px solid var(--dp-line); background: transparent; border-radius: 999px; padding: 0.5em 1em; min-height: 44px; cursor: pointer; color: inherit; font: inherit; font-size: 0.85rem; }
    .filter-btn--active { border-color: var(--dp-gold); background: var(--dp-gold-soft); font-weight: 700; }
    .message-card p { margin: 0; white-space: pre-wrap; }
    .message-top { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .message-actions { display: flex; gap: 0.25em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    .notice { color: var(--dp-success); }
    .empty { color: var(--dp-muted); }
  `],
})
export class MessagesComponent implements OnInit {
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sendError = signal<string | null>(null);
  protected readonly sentNotice = signal<string | null>(null);
  protected readonly showCompose = signal(false);
  protected readonly composeKind = signal<ComposeKind>('direct');
  protected readonly teamId = signal<string | null>(null);
  protected readonly teamName = signal('');
  protected readonly replyingTo = signal<Message | null>(null);
  protected readonly inbox = signal<Message[]>([]);
  protected readonly sent = signal<Message[]>([]);
  protected readonly contacts = signal<Contact[]>([]);
  protected readonly unread = signal(0);
  protected readonly kindFilter = signal<'all' | 'direct' | 'team' | 'announce'>('all');
  protected readonly unreadOnly = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly openThreadId = signal<string | null>(null);
  protected readonly threadMsgs = signal<Message[]>([]);
  protected readonly threadLoading = signal(false);
  protected readonly threadError = signal<string | null>(null);
  protected readonly threadSending = signal(false);
  protected readonly threadSendError = signal<string | null>(null);
  protected readonly replyDraft = signal('');

  protected readonly form = this.fb.nonNullable.group({
    to: [''],
    title: [''],
    scope: ['direct' as 'direct' | 'all'],
    body: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.reload();
    // Team handoff (?team=&teamName=): open the team channel prefilled.
    // Delivery is teammates-only via the team endpoint (not the downline
    // announcement audiences).
    const team = this.route.snapshot.queryParamMap.get('team')?.trim() ?? '';
    const teamName = this.route.snapshot.queryParamMap.get('teamName')?.trim() ?? '';
    if (team && teamName) {
      this.teamId.set(team);
      this.teamName.set(teamName);
      this.composeKind.set('team');
      this.form.patchValue({ title: `[${teamName}] ` });
      this.showCompose.set(true);
    }
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      inbox: this.messages.inbox(),
      sent: this.messages.sent(),
      contacts: this.messages.contacts(),
      unread: this.messages.unreadCount(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ inbox, sent, contacts, unread }) => {
          this.inbox.set(inbox.data ?? []);
          this.sent.set(sent.data ?? []);
          this.contacts.set(contacts.data ?? []);
          this.unread.set(unread.data?.unread ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected toggleCompose(): void {
    this.showCompose.set(!this.showCompose());
    if (!this.showCompose()) this.replyingTo.set(null);
    this.sendError.set(null);
    this.sentNotice.set(null);
  }

  protected setKind(kind: ComposeKind): void {
    this.composeKind.set(kind);
    this.sendError.set(null);
  }

  protected kindLabel(msg: Message): string {
    if (msg.kind === 'broadcast') return 'Broadcast';
    if (msg.kind === 'announcement') return 'Announcement';
    if (msg.kind === 'team') return 'Team';
    return 'Direct';
  }

  protected kindTone(kind: Message['kind']): string {
    switch (kind) {
      case 'team': return 'dp-status--info';
      case 'announcement': return 'dp-status--warn';
      case 'broadcast': return 'dp-status--bad';
      default: return 'dp-status--ok';
    }
  }

  protected myId(): string {
    return String(this.auth.currentUser()?.id ?? '');
  }

  /** Direct messages grouped by counterpart — the conversation list. */
  protected readonly conversations = computed(() => {
    const me = this.myId();
    const q = this.searchQuery().trim().toLowerCase();
    const groups = new Map<string, { id: string; name: string; messages: Message[]; unread: number; lastAt: number }>();
    for (const m of this.inbox()) {
      if (m.kind !== 'direct') continue;
      const cid = String(m.senderId) === me ? String(m.recipientId) : String(m.senderId);
      const name = String(m.senderId) === me
        ? (m.recipient?.name ?? 'Teammate')
        : (m.sender?.name ?? 'Teammate');
      if (!groups.has(cid)) groups.set(cid, { id: cid, name, messages: [], unread: 0, lastAt: 0 });
      const g = groups.get(cid) as { id: string; name: string; messages: Message[]; unread: number; lastAt: number };
      g.messages.push(m);
      if (!m.readAt && String(m.senderId) !== me) g.unread += 1;
      const at = new Date(m.createdAt ?? 0).getTime();
      if (at > g.lastAt) g.lastAt = at;
      if (g.name === 'Teammate' && name !== 'Teammate') g.name = name;
    }
    let out = [...groups.values()];
    if (this.unreadOnly()) out = out.filter((g) => g.unread > 0);
    if (q) {
      out = out.filter((g) =>
        g.name.toLowerCase().includes(q)
        || g.messages.some((m) => `${m.title ?? ''} ${m.body ?? ''}`.toLowerCase().includes(q)));
    }
    out.sort((a, b) => b.lastAt - a.lastAt);
    return out;
  });

  /** Team + announcement inbox rows (flat cards, kind-distinct). */
  protected readonly broadcasts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return this.inbox().filter((m) => {
      if (m.kind === 'direct') return false;
      if (this.unreadOnly() && m.readAt) return false;
      if (!q) return true;
      return `${m.sender?.name ?? ''} ${m.title ?? ''} ${m.body ?? ''}`.toLowerCase().includes(q);
    });
  });

  /** Sent rows that don't live in a thread (team announcements). */
  protected readonly sentBroadcasts = computed(() => this.sent().filter((m) => m.kind !== 'direct'));

  protected showConversations(): boolean {
    return this.kindFilter() === 'all' || this.kindFilter() === 'direct';
  }

  protected showBroadcasts(): boolean {
    return this.kindFilter() === 'all' || this.kindFilter() === 'team' || this.kindFilter() === 'announce';
  }

  protected readonly visibleBroadcasts = computed(() => this.broadcasts().filter((m) => {
    const f = this.kindFilter();
    if (f === 'team') return m.kind === 'team';
    if (f === 'announce') return m.kind === 'announcement' || m.kind === 'broadcast';
    return true;
  }));

  protected snippet(text: string | undefined, len = 140): string {
    const t = String(text ?? '').trim();
    return t.length > len ? `${t.slice(0, len - 1)}…` : t;
  }

  protected lastSnippet(messages: Message[]): string {
    const last = messages[messages.length - 1];
    return this.snippet(last ? `${last.title ? last.title + ' — ' : ''}${last.body ?? ''}` : '');
  }

  /** Reply is possible on directs; on team/announcements only when the
   * sender is messageable (upline/downline) — otherwise a send would 403. */
  protected canReply(msg: Message): boolean {
    if (msg.kind === 'direct') return true;
    return this.contacts().some((c) => String(c.id) === String(msg.senderId));
  }

  protected loadThread(counterpartId: string): void {
    if (this.openThreadId() === counterpartId) {
      this.openThreadId.set(null);
      return;
    }
    this.openThreadId.set(counterpartId);
    this.threadMsgs.set([]);
    this.threadError.set(null);
    this.threadSendError.set(null);
    this.replyDraft.set('');
    this.threadLoading.set(true);
    this.messages
      .thread(counterpartId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const rows = [...(res.data ?? [])].sort(
            (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
          this.threadMsgs.set(rows);
          this.threadLoading.set(false);
          // Reading the thread clears its unread flags (counts stay truthful).
          for (const m of rows) {
            if (!m.readAt && String(m.senderId) !== this.myId()) this.open(m);
          }
        },
        error: (err: ApiError) => {
          this.threadLoading.set(false);
          this.threadError.set(err.message);
        },
      });
  }

  protected sendThreadReply(): void {
    const to = this.openThreadId();
    const body = this.replyDraft().trim();
    if (!to || !body || this.threadSending()) return;
    this.threadSending.set(true);
    this.threadSendError.set(null);
    this.messages
      .sendDirect(to, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.threadSending.set(false);
          this.replyDraft.set('');
          this.reload();
          this.loadThreadSilent(to);
        },
        error: (err: ApiError) => {
          this.threadSending.set(false);
          this.threadSendError.set(err.message);
        },
      });
  }

  /** Refresh thread rows without collapsing the open conversation. */
  private loadThreadSilent(counterpartId: string): void {
    this.messages
      .thread(counterpartId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.threadMsgs.set([...(res.data ?? [])].sort(
            (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()));
        },
        error: () => {},
      });
  }

  protected clearFilters(): void {
    this.kindFilter.set('all');
    this.unreadOnly.set(false);
    this.searchQuery.set('');
  }

  protected open(msg: Message): void {
    this.messages
      .markRead(msg.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.inbox.set(this.inbox().map((m) => (m.id === msg.id ? { ...m, readAt: new Date().toISOString() } : m)));
          this.unread.set(Math.max(0, this.unread() - 1));
        },
        error: (err: ApiError) => this.error.set(err.message),
      });
  }

  protected reply(msg: Message): void {
    this.replyingTo.set(msg);
    this.composeKind.set('direct');
    this.form.patchValue({ to: msg.senderId, body: '' });
    this.showCompose.set(true);
    this.sentNotice.set(null);
  }

  protected send(): void {
    const v = this.form.getRawValue();
    const body = v.body.trim();
    if (!body) return;
    if (this.composeKind() === 'direct' && !v.to) {
      this.sendError.set('Choose a recipient.');
      return;
    }
    if ((this.composeKind() === 'announcement' || this.composeKind() === 'team') && v.title.trim().length < 2) {
      this.sendError.set('Announcements need a title.');
      return;
    }
    if (this.composeKind() === 'team' && !this.teamId()) {
      this.sendError.set('Team context is missing — reopen from the team page.');
      return;
    }
    this.sending.set(true);
    this.sendError.set(null);
    this.sentNotice.set(null);
    const kind = this.composeKind();
    const request: Observable<MessageEnvelope | AnnounceEnvelope | TeamAnnounceEnvelope> = kind === 'direct'
      ? this.messages.sendDirect(v.to, body)
      : kind === 'team'
        ? this.messages.announceToTeam(this.teamId() as string, v.title.trim(), body)
        : this.messages.announce(v.title.trim(), body, v.scope);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.sending.set(false);
        this.replyingTo.set(null);
        this.form.reset({ to: '', title: '', scope: 'direct', body: '' });
        this.sentNotice.set(
          (kind === 'announcement' || kind === 'team') && 'inserted' in res.data
            ? kind === 'team'
              ? `Announced to ${res.data.inserted} teammate${res.data.inserted === 1 ? '' : 's'}.`
              : `Announced to ${res.data.inserted} partners.`
            : 'Message sent.',
        );
        this.reload();
      },
      error: (err: ApiError) => {
        this.sending.set(false);
        this.sendError.set(err.message);
      },
    });
  }
}
