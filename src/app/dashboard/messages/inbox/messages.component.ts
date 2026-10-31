import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, interval, fromEvent, Observable } from 'rxjs';
import { MessageService } from '../../../core/messaging/message.service';
import { ChatSocketService } from '../../../core/messaging/chat-socket.service';
import { PresenceService, PresenceStatus } from '../../../core/presence/presence.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AvatarComponent } from '../../../_common/avatar.component';
import { AnnounceEnvelope, ChatRouteInfo, Contact, Message, MessageEnvelope, TeamAnnounceEnvelope } from '../../../core/messaging/message.models';
import { ApiError, userError } from '../../../core/http/api-error';
import { SmsApprovalDialogComponent } from './sms-approval-dialog.component';

type ComposeKind = 'direct' | 'announcement' | 'team';
type ChatMsg = Message & { clientId?: string; pending?: boolean; failed?: boolean };

const POLL_THREAD_MS = 8000;
const POLL_LISTS_MS = 24000;
const TYPING_CLEAR_MS = 3500;

/**
 * @title Messages — WhatsApp-style team chat.
 *
 * Two-pane chat (conversations left, thread right) over a live socket with
 * transparent REST fallback: every send, thread and read works offline-first
 * and upgrades to real-time when the socket connects. Announcements and
 * team broadcasts live in the Channels tab, unchanged. Brand tokens
 * throughout (gold ticks, dp surfaces) — WhatsApp interaction, Diamond look.
 */
@Component({
  selector: 'async-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent, DatePipe, MatButtonModule, MatButtonToggleModule, MatChipsModule,
    MatDialogModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule,
    ReactiveFormsModule, RouterModule,
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
          <h2>Messages
            @if (unread() > 0) {
              <span class="unread-count">{{ unread() }} unread</span>
            }
          </h2>
          <p class="subtitle">
            <span class="conn" [class.conn--live]="chat.connected()">
              <span class="conn-dot" aria-hidden="true"></span>
              {{ chat.connected() ? 'Live' : 'Offline — messages still send, syncing on reconnect' }}
            </span>
          </p>
        </div>
        <div class="head-actions">
          <button mat-button [class.active-tab]="view() === 'chats'" (click)="view.set('chats')">Chats</button>
          <button mat-button [class.active-tab]="view() === 'channels'" (click)="view.set('channels')">Channels</button>
        </div>
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

      @if (view() === 'chats') {
        <div class="chat-shell" [class.thread-open]="!!openThreadId()">
          <aside class="chat-side" aria-label="Conversations">
            <div class="side-tools">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" class="side-search">
                <mat-label>Search chats</mat-label>
                <input matInput type="search" [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" />
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              @if (startingChat()) {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Message…</mat-label>
                    <mat-select [value]="''" (selectionChange)="startChat($event.value); startingChat.set(false)">
                      @for (c of contacts(); track c.id) {
                        <mat-option [value]="c.id">{{ c.name }} · {{ c.relation }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Find anyone…</mat-label>
                    <input matInput [value]="peopleQuery()" (input)="onPeopleSearch($any($event.target).value)" placeholder="Name or username, min 2 letters" />
                    <mat-icon matSuffix>person_search</mat-icon>
                  </mat-form-field>
                  @if (peopleLoading()) {
                    <mat-progress-bar mode="indeterminate" />
                  }
                  @if (people().length > 0) {
                    <ul class="people-list">
                      @for (p of people(); track p.id) {
                        <li>
                          <async-avatar [name]="p.name" size="xs" [photo]="p.photo ?? null" />
                          <span class="people-name"><strong>{{ p.name }}</strong><span class="muted">@{{ p.username }}</span></span>
                          <button mat-button (click)="startChat(p.id); startingChat.set(false)">Chat</button>
                        </li>
                      }
                    </ul>
                  }
                } @else {
                  <button mat-stroked-button (click)="startingChat.set(true)">
                    <mat-icon>edit</mat-icon> New chat
                  </button>
                }
            </div>
            <ul class="convo-list">
              @for (c of conversations(); track c.id) {
                <li>
                  <button
                    type="button"
                    class="convo"
                    [class.active]="openThreadId() === c.id"
                    (click)="openChat(c.id)"
                    [attr.aria-current]="openThreadId() === c.id"
                  >
                    <async-avatar [name]="c.name" size="sm" [photo]="c.photo" [presence]="avatarPresence(c.id)" />
                    <span class="convo-main">
                      <span class="convo-top">
                        <strong>{{ c.name }}</strong>
                        <span class="muted">{{ lastAt(c.messages) | date:'shortTime' }}</span>
                      </span>
                      <span class="convo-sub">
                        <span class="muted convo-snippet">
                          @if (typingFrom()[c.id]) {
                            <em class="typing">typing…</em>
                          } @else {
                            {{ lastSnippet(c.messages) }}
                          }
                        </span>
                        @if (c.unread > 0) {
                          <span class="unread-badge" aria-label="{{ c.unread }} unread">{{ c.unread }}</span>
                        }
                      </span>
                    </span>
                  </button>
                </li>
              }
            </ul>
            @if (conversations().length === 0 && !loading()) {
              <p class="empty side-empty">No chats yet — start one with your upline or downline.</p>
            }
          </aside>

          <div class="chat-main" aria-label="Conversation">
            @if (openThreadName(); as peer) {
              <header class="chat-head">
                <button mat-icon-button class="back-btn" (click)="openThreadId.set(null)" aria-label="Back to chats">
                  <mat-icon>arrow_back</mat-icon>
                </button>
                <async-avatar [name]="peer.name" size="sm" [photo]="photoOf(peer.id)" [presence]="avatarPresence(peer.id)" />
                <span class="chat-peer">
                  <strong>{{ peer.name }}</strong>
                  <span class="muted">{{ peerStatus(peer.id) }}</span>
                </span>
                <span class="spacer"></span>
                    @if (isOffline(peer.id) && isNetwork(peer.id)) {
                      <button mat-stroked-button (click)="openSmsDialog()" [disabled]="smsSending()">
                        <mat-icon>sms</mat-icon> SMS
                      </button>
                    }
              </header>

              @if (routeInfo()[peer.id]; as route) {
                @if (!route.online && isNetwork(peer.id)) {
                  <div class="sms-banner" role="note">
                    <mat-icon>cloud_off</mat-icon>
                    <span>{{ peer.name }} is offline — messages wait until they're back, or reach their phone now.</span>
                    <button mat-flat-button color="primary" (click)="openSmsDialog()" [disabled]="smsSending()">
                      {{ smsSending() ? 'Sending…' : 'Send as SMS' }}
                    </button>
                  </div>
                }
              }
              @if (smsNotice(); as note) {
                <p class="notice" role="status">{{ note }}</p>
              }
              @if (smsError(); as err) {
                <p class="error" role="alert">{{ err }}</p>
              }

              <div class="thread-scroll" #threadScroll>
                @if (threadLoading()) {
                  <mat-progress-bar mode="indeterminate" />
                }
                @if (threadError(); as err) {
                  <p class="error" role="alert">{{ err }} <button mat-button (click)="openChat(openThreadId()!)">Retry</button></p>
                }
                @for (day of threadDays(); track day.key) {
                  <div class="day-chip" aria-hidden="true"><span>{{ day.label }}</span></div>
                  <ol class="bubble-list">
                    @for (m of day.msgs; track m.clientId ?? m.id) {
                      <li class="bubble" [class.bubble--mine]="m.senderId === myId()" [class.bubble--pending]="m.pending">
                        <p>{{ m.body }}</p>
                        <span class="bubble-meta">
                          <span class="muted">{{ m.createdAt | date:'shortTime' }}</span>
                          @if (m.senderId === myId()) {
                            @if (m.pending) {
                              <mat-icon class="ticks" aria-label="Sending">schedule</mat-icon>
                            } @else if (m.failed) {
                              <button mat-icon-button class="retry" (click)="retryTemp(m.clientId!)" title="Retry send" aria-label="Retry send">
                                <mat-icon>error_outline</mat-icon>
                              </button>
                            } @else if (m.readAt) {
                              <mat-icon class="ticks ticks--read" aria-label="Read">done_all</mat-icon>
                            } @else {
                              <mat-icon class="ticks" aria-label="Delivered">done_all</mat-icon>
                            }
                          }
                        </span>
                      </li>
                    }
                  </ol>
                }
                @if (typingFrom()[peer.id]) {
                  <div class="bubble typing-bubble" aria-live="polite"><span></span><span></span><span></span></div>
                }
                @if (threadSendError(); as err) {
                  <p class="error" role="alert">{{ err }}</p>
                }
              </div>

              <div class="composer">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Message {{ peer.name }}…</mat-label>
                  <textarea
                    matInput rows="2"
                    [value]="replyDraft()"
                    (input)="onDraftInput($any($event.target).value)"
                    (keydown.enter)="onComposerKey($any($event))"
                    (blur)="typingStop()"
                    maxlength="2000"
                  ></textarea>
                </mat-form-field>
                <button mat-fab color="primary" class="send-btn" (click)="sendThreadReply()" [disabled]="!replyDraft().trim() || threadSending()" aria-label="Send message">
                  <mat-icon>{{ threadSending() ? 'more_horiz' : 'send' }}</mat-icon>
                </button>
              </div>
            } @else {
              <div class="chat-empty">
                <mat-icon>forum</mat-icon>
                <p>Pick a conversation — or start one. Messages arrive live when you're online.</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="compose-wrap">
          <button mat-button (click)="toggleCompose()">{{ showCompose() ? 'Cancel' : 'New announcement' }}</button>
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
                      <mat-option [value]="c.id">{{ c.name }} ({{ c.username }}) · {{ c.relation }}{{ presenceSuffix(c.id) }}</mat-option>
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
              @if (replyingTo(); as reply) {
                <div class="reply-context" role="note">
                  <span class="muted">Replying to {{ reply.sender?.name ?? 'teammate' }}</span>
                  <blockquote>{{ snippet(reply.body) }}</blockquote>
                </div>
              }
              <mat-form-field appearance="outline">
                <mat-label>Message</mat-label>
                <textarea matInput rows="3" formControlName="body" maxlength="2000"></textarea>
              </mat-form-field>
              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || sending()">
                  {{ sending() ? 'Sending…' : (composeKind() === 'direct' ? 'Send' : 'Announce') }}
                </button>
                @if (sendError(); as err) {
                  <span class="error" role="alert">{{ err }}</span>
                }
                @if (sentNotice(); as notice) {
                  <span class="notice" role="status">{{ notice }}</span>
                }
              </div>
            </form>
          }

          <h3>Team & announcements ({{ broadcasts().length }})</h3>
          @if (broadcasts().length > 0) {
            <ul class="message-list">
              @for (msg of broadcasts(); track msg.id) {
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
        </div>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .messages-page { display: flex; flex-direction: column; gap: 1em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; display: flex; align-items: center; gap: 0.5em; }
    .head-actions { display: flex; gap: 0.25em; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 999px; padding: 0.2em; }
    .head-actions button { border-radius: 999px; min-height: 44px; }
    .head-actions button.active-tab { background: var(--dp-gold-soft); font-weight: 700; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .unread-count { color: var(--dp-error); font-size: 0.6em; }
    .conn { display: inline-flex; align-items: center; gap: 0.4em; font-size: 0.85em; }
    .conn-dot { width: 0.6em; height: 0.6em; border-radius: 50%; background: var(--dp-muted); }
    .conn--live .conn-dot { background: #2e7d32; animation: presence-ping 1.8s ease-out infinite; }
    @keyframes presence-ping {
      0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.55); }
      70% { box-shadow: 0 0 0 6px rgba(46, 125, 50, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .conn--live .conn-dot { animation: none; }
    }

    .chat-shell { display: grid; grid-template-columns: 300px 1fr; grid-template-rows: minmax(0, 1fr); border: 1px solid var(--dp-line); border-radius: 14px; overflow: hidden; background: var(--dp-surface); height: clamp(480px, 74vh, 780px); }
    .chat-side { border-right: 1px solid var(--dp-line); display: flex; flex-direction: column; min-height: 0; min-width: 0; background: var(--dp-paper); }
    .side-tools { padding: 0.75em; display: flex; flex-direction: column; gap: 0.5em; border-bottom: 1px solid var(--dp-line); }
    .side-tools mat-form-field { width: 100%; }
    .people-list { list-style: none; margin: 0; padding: 0.2em 0.4em 0.4em; display: flex; flex-direction: column; gap: 0.15em; overflow-y: auto; min-height: 0; }
    .people-list li { display: flex; align-items: center; gap: 0.6em; padding: 0.4em 0.5em; border-radius: 8px; }
    .people-list li:hover { background: var(--dp-info-bg); }
    .people-name { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .people-name strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .people-list button { flex: none; min-height: 44px; }
    .convo-list { list-style: none; margin: 0; padding: 0.4em; overflow-y: auto; display: flex; flex-direction: column; gap: 0.15em; flex: 1; min-height: 0; }
    .convo { display: flex; gap: 0.7em; align-items: center; width: 100%; padding: 0.7em; border: none; border-radius: 10px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; min-height: 64px; }
    .convo:hover { background: var(--dp-info-bg); }
    .convo.active { background: var(--dp-gold-soft); }
    .convo-main { display: flex; flex-direction: column; min-width: 0; flex: 1; gap: 0.15em; }
    .convo-top { display: flex; align-items: baseline; gap: 0.5em; }
    .convo-top strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .convo-top .muted { margin-left: auto; flex: none; }
    .convo-sub { display: flex; align-items: center; gap: 0.5em; }
    .convo-snippet { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .typing { color: var(--dp-gold-ink); font-weight: 600; }
    .unread-badge { flex: none; min-width: 1.5em; height: 1.5em; border-radius: 999px; background: var(--dp-error); color: #fff; font-size: 0.75em; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; padding: 0 0.4em; }
    .side-empty { padding: 1em; }

    .chat-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--dp-surface); }
    .chat-head { display: flex; align-items: center; gap: 0.7em; padding: 0.6em 0.9em; border-bottom: 1px solid var(--dp-line); background: var(--dp-paper); flex: none; }
    .chat-head .back-btn { display: none; }
    .chat-peer { display: flex; flex-direction: column; min-width: 0; }
    .chat-peer strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .spacer { flex: 1; }
    .sms-banner { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; margin: 0.6em 0.9em 0; padding: 0.6em 0.8em; border-radius: 10px; background: var(--dp-info-bg); border: 1px solid var(--dp-line); font-size: 0.88em; }
    .sms-banner mat-icon { color: var(--dp-muted); }
    .thread-scroll { flex: 1; overflow-y: auto; padding: 1em 0.9em; display: flex; flex-direction: column; gap: 0.4em; min-height: 0; }
    .thread-scroll > * { flex: none; }
    .thread-scroll > .bubble-list { align-self: stretch; }
    .day-chip { display: flex; justify-content: center; margin: 0.3em 0; }
    .day-chip span { font-size: 0.75em; color: var(--dp-muted); background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 999px; padding: 0.15em 0.8em; }
    .bubble-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35em; }
    .bubble { align-self: flex-start; max-width: 82%; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 4px 14px 14px 14px; padding: 0.55em 0.8em; }
    .bubble--mine { align-self: flex-end; background: var(--dp-gold-soft); border: 1px solid var(--dp-gold); border-radius: 14px 4px 14px 14px; }
    .bubble--pending { opacity: 0.65; }
    .bubble p { margin: 0; white-space: pre-wrap; word-break: break-word; }
    .bubble-meta { display: flex; align-items: center; justify-content: flex-end; gap: 0.25em; margin-top: 0.15em; }
    .ticks { font-size: 16px; height: 16px; width: 16px; color: var(--dp-muted); }
    .ticks--read { color: var(--dp-gold-ink); }
    .retry { width: 32px; height: 32px; }
    .retry mat-icon { color: var(--dp-error); font-size: 18px; height: 18px; width: 18px; }
    .typing-bubble { display: inline-flex; gap: 4px; align-self: flex-start; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 14px; padding: 0.7em 0.9em; width: fit-content; }
    .typing-bubble span { width: 7px; height: 7px; border-radius: 50%; background: var(--dp-muted); animation: typing-bounce 1.2s infinite; }
    .typing-bubble span:nth-child(2) { animation-delay: 0.15s; }
    .typing-bubble span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes typing-bounce { 0%, 60%, 100% { transform: none; opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      .typing-bubble span { animation: none; opacity: 0.8; }
    }
    .composer { display: flex; gap: 0.5em; align-items: flex-end; padding: 0.6em 0.9em; border-top: 1px solid var(--dp-line); background: var(--dp-paper); flex: none; }
    .composer mat-form-field { flex: 1; }
    .send-btn { flex: none; }
    .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5em; color: var(--dp-muted); text-align: center; padding: 2em; }
    .chat-empty mat-icon { font-size: 48px; height: 48px; width: 48px; opacity: 0.4; }

    .compose-wrap { display: flex; flex-direction: column; gap: 0.75em; }
    .compose-form { background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; flex-wrap: wrap; }
    .reply-context { display: flex; flex-direction: column; gap: 0.25em; }
    .reply-context blockquote { margin: 0; padding: 0.4em 0.7em; border-left: 3px solid var(--dp-gold); background: var(--dp-paper); border-radius: 0 8px 8px 0; font-size: 0.88em; color: var(--dp-muted); white-space: pre-wrap; }
    .message-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .message-card { background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 10px; padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.35em; }
    .message-card--unread { border-left: 4px solid var(--dp-gold); }
    .message-card--team { border-left: 4px solid var(--dp-info); }
    .message-card p { margin: 0; white-space: pre-wrap; }
    .message-top { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .message-actions { display: flex; gap: 0.25em; flex-wrap: wrap; }
    .message-actions button { min-height: 44px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    .notice { color: var(--dp-success); }
    .empty { color: var(--dp-muted); }

    @media only screen and (max-width: 760px) {
      .chat-shell { grid-template-columns: 1fr; height: calc(100vh - 190px); height: calc(100dvh - 190px); min-height: 0; max-height: none; }
      .chat-side { border-right: none; overflow: hidden; }
      .chat-shell.thread-open .chat-side { display: none; }
      .chat-main { display: none; }
      .chat-shell.thread-open { max-height: none; }
      .chat-shell.thread-open .chat-main { display: flex; min-height: 0; max-height: 100%; overflow: hidden; }
      .chat-head .back-btn { display: inline-flex; }
      .bubble { max-width: 92%; }
      .composer { padding-bottom: calc(0.6em + env(safe-area-inset-bottom, 0px)); }
      .composer textarea { font-size: 16px; }
    }
  `],
})
export class MessagesComponent implements OnInit {
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);
  private readonly presence = inject(PresenceService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  protected readonly chat = inject(ChatSocketService);
  /** counterpart/contact id → lastSeenAt (null = offline/stranger). */
  protected readonly presenceMap = signal<Record<string, string | null>>({});
  /** Live socket presence overrides (true/false); absent = fall back to presenceMap. */
  protected readonly livePresence = signal<Record<string, boolean>>({});
  /** counterparts currently typing. */
  protected readonly typingFrom = signal<Record<string, number>>({});
  /** Per-open-thread routing intel for the SMS fallback banner. */
  protected readonly routeInfo = signal<Record<string, ChatRouteInfo>>({});

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
  protected readonly view = signal<'chats' | 'channels'>('chats');
  protected readonly inbox = signal<Message[]>([]);
  protected readonly sent = signal<Message[]>([]);
  protected readonly contacts = signal<Contact[]>([]);
  protected readonly unread = signal(0);
  protected readonly searchQuery = signal('');
  protected readonly startingChat = signal(false);
  protected readonly openThreadId = signal<string | null>(null);
  protected readonly openThreadName = signal<{ id: string; name: string } | null>(null);
  protected readonly threadMsgs = signal<ChatMsg[]>([]);
  protected readonly threadLoading = signal(false);
  protected readonly threadError = signal<string | null>(null);
  protected readonly threadSending = signal(false);
  protected readonly threadSendError = signal<string | null>(null);
  protected readonly replyDraft = signal('');
  protected readonly smsSending = signal(false);
  protected readonly smsNotice = signal<string | null>(null);
  protected readonly smsError = signal<string | null>(null);
  protected readonly peopleQuery = signal('');
  protected readonly people = signal<Array<{ id: string; username: string; name: string; photo: string | null }>>([]);
  protected readonly peopleLoading = signal(false);
  private lastTypingSent = 0;
  private peopleTimer: ReturnType<typeof setTimeout> | null = null;
  private typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  @ViewChild('threadScroll') private threadScroll?: ElementRef<HTMLDivElement>;

  protected readonly form = this.fb.nonNullable.group({
    to: [''],
    title: [''],
    scope: ['direct' as 'direct' | 'all'],
    body: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.reload();
    this.chat.connect();
    this.wireSocket();
    // Offline fallback polling: REST is the source of truth when the
    // socket is down, so the page never goes stale.
    interval(POLL_THREAD_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.chat.connected() || document.hidden) return;
        const id = this.openThreadId();
        if (id) this.loadThreadSilent(id);
      });
    interval(POLL_LISTS_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.chat.connected() || document.hidden) return;
        this.refreshListsSilent();
      });
    // Returning tabs catch up immediately instead of waiting for a poll.
    fromEvent(window, 'focus')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.chat.connected()) return;
        const id = this.openThreadId();
        if (id) this.loadThreadSilent(id);
        this.refreshListsSilent();
      });
    // Team handoff (?team=&teamName=): open the team channel prefilled.
    const team = this.route.snapshot.queryParamMap.get('team')?.trim() ?? '';
    const teamName = this.route.snapshot.queryParamMap.get('teamName')?.trim() ?? '';
    if (team && teamName) {
      this.teamId.set(team);
      this.teamName.set(teamName);
      this.composeKind.set('team');
      this.form.patchValue({ title: `[${teamName}] ` });
      this.view.set('channels');
      this.showCompose.set(true);
    }
  }

  /** Socket → view-state bridges (all guarded, never throw into the socket). */
  private wireSocket(): void {
    this.chat.message$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((m) => this.onSocketMessage(m));
    this.chat.read$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ messageId }) => {
      this.threadMsgs.set(this.threadMsgs().map((x) => (x.id === messageId ? { ...x, readAt: x.readAt ?? new Date().toISOString() } : x)));
    });
    this.chat.typing$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ from, typing }) => {
      const id = String(from);
      if (typing) {
        this.typingFrom.set({ ...this.typingFrom(), [id]: Date.now() });
        clearTimeout(this.typingTimers[id]);
        this.typingTimers[id] = setTimeout(() => {
          this.typingFrom.set(Object.fromEntries(Object.entries(this.typingFrom()).filter(([k]) => k !== id)));
        }, TYPING_CLEAR_MS);
      } else {
        clearTimeout(this.typingTimers[id]);
        this.typingFrom.set(Object.fromEntries(Object.entries(this.typingFrom()).filter(([k]) => k !== id)));
      }
    });
    this.chat.presence$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ userId, online }) => {
      const id = String(userId);
      this.livePresence.set({ ...this.livePresence(), [id]: !!online });
      if (online) this.refreshRoute(id);
    });
    this.chat.reconnected$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refreshListsSilent();
      const id = this.openThreadId();
      if (id) this.loadThreadSilent(id);
    });
  }

  /** Incoming live message: open thread absorbs it, others bump counts. */
  private onSocketMessage(m: Message): void {
    const me = this.myId();
    const counterpart = String(m.senderId) === me ? String(m.recipientId) : String(m.senderId);
    if (this.openThreadId() && counterpart === this.openThreadId()) {
      if (String(m.senderId) === me) {
        // Own echo: fold into the oldest pending bubble instead of duplicating.
        const tempIdx = this.threadMsgs().findIndex((x) => x.pending && String(x.recipientId) === counterpart);
        if (tempIdx >= 0) {
          const rows = [...this.threadMsgs()];
          rows[tempIdx] = { ...m };
          this.threadMsgs.set(rows.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()));
          this.scrollSoon();
          return;
        }
      }
      if (!this.threadMsgs().some((x) => x.id === m.id)) {
        this.threadMsgs.set([...this.threadMsgs(), m]);
        this.scrollSoon();
      }
      if (String(m.senderId) !== me && !m.readAt) this.markReadBoth(m);
      this.refreshRoute(counterpart);
    } else {
      if (String(m.senderId) !== me) this.unread.set(this.unread() + 1);
      this.refreshListsSilent();
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
          this.refreshPresence();
        },
        error: (err: ApiError) => {
          this.error.set(userError(err));
          this.loading.set(false);
        },
      });
  }

  /** Silent list refresh (socket events + offline polling) — no spinners. */
  private refreshListsSilent(): void {
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
          this.refreshPresence();
        },
        error: () => {},
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

  protected startChat(id: string): void {
    if (!id) return;
    this.searchQuery.set('');
    this.peopleQuery.set('');
    this.people.set([]);
    this.openChat(id);
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

  /** Presence dot for a counterpart id (null hides it). */
  protected presenceOf(id: string | null | undefined): PresenceStatus {
    if (!id) return null;
    return this.presence.statusOf(this.presenceMap()[String(id)] ?? null);
  }

  /** Avatar presence: live socket state wins, bulk presence is the fallback. */
  protected avatarPresence(id: string): PresenceStatus {
    const live = this.livePresence()[id];
    if (live === true) return 'online';
    if (live === false) return null;
    return this.presenceOf(id);
  }

  /** " · Online" suffix for the To picker (empty when offline). */
  protected presenceSuffix(id: string | null | undefined): string {
    const s = this.presenceOf(id);
    if (s === 'online') return ' · Online';
    if (s === 'recent') return ' · Active';
    return '';
  }

  /** Avatar photo for a counterpart id (null = initials fallback). */
  protected photoOf(id: string | null | undefined): string | null {
    if (!id) return null;
    const key = String(id);
    const fromContact = this.contacts().find((c) => String(c.id) === key)?.photo;
    if (fromContact) return fromContact;
    const fromPeople = this.people().find((p) => String(p.id) === key)?.photo;
    if (fromPeople) return fromPeople;
    return this.conversations().find((c) => String(c.id) === key)?.photo ?? null;
  }

  protected resolveName(counterpartId: string): string {
    const contact = this.contacts().find((c) => String(c.id) === String(counterpartId));
    if (contact) return contact.name;
    const found = this.people().find((p) => String(p.id) === String(counterpartId));
    if (found) return found.name;
    return this.conversations().find((c) => String(c.id) === String(counterpartId))?.name ?? 'Teammate';
  }

  /** Live people search for starting chats beyond the contact list. */
  protected onPeopleSearch(value: string): void {
    this.peopleQuery.set(value);
    const q = value.trim();
    if (q.length < 2) {
      if (this.peopleTimer) clearTimeout(this.peopleTimer);
      this.people.set([]);
      this.peopleLoading.set(false);
      return;
    }
    this.peopleTimer = setTimeout(() => {
      this.peopleLoading.set(true);
      this.messages
        .people(q)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            const me = this.myId();
            this.people.set((res.data ?? []).filter((p) => String(p.id) !== me).slice(0, 10));
            this.peopleLoading.set(false);
          },
          error: () => this.peopleLoading.set(false),
        });
    }, 300);
  }

  /** Whether the counterpart is in-network (SMS fallback stays network-only). */
  protected isNetwork(id: string | null | undefined): boolean {
    if (!id) return false;
    return this.contacts().some((c) => String(c.id) === String(id));
  }

  /** Header status line: socket first, route intel next, bulk presence last. */
  protected peerStatus(id: string): string {
    const live = this.livePresence()[id];
    if (live === true) return 'Online now';
    if (live === false) return 'Offline';
    const route = this.routeInfo()[id];
    if (route) {
      if (route.online) return 'Online now';
      if (route.presence === 'recent') return 'Active recently';
      return 'Offline';
    }
    const s = this.presenceOf(id);
    if (s === 'online') return 'Online now';
    if (s === 'recent') return 'Active recently';
    return 'Offline';
  }

  protected isOffline(id: string): boolean {
    const live = this.livePresence()[id];
    if (live !== undefined) return !live;
    const route = this.routeInfo()[id];
    if (route) return !route.online;
    return this.presenceOf(id) === null;
  }

  /** Refresh presence for conversation counterparts + messageable contacts. */
  private refreshPresence(): void {
    const me = this.myId();
    const ids = [
      ...this.contacts().map((c) => c.id),
      ...this.inbox().flatMap((m) => [m.senderId, m.recipientId]),
    ].filter((id) => String(id) !== me);
    if (ids.length === 0) return;
    this.presence
      .lookup(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((map) => this.presenceMap.set({ ...this.presenceMap(), ...map }));
  }

  /** Direct threads (inbox + sent) grouped by counterpart — the chat list. */
  protected readonly conversations = computed(() => {
    const me = this.myId();
    const q = this.searchQuery().trim().toLowerCase();
    const photos = new Map<string, string>();
    for (const c of this.contacts()) {
      if (c.photo) photos.set(String(c.id), c.photo);
    }
    const groups = new Map<string, { id: string; name: string; photo: string | null; messages: Message[]; unread: number; lastAt: number }>();
    const absorb = (m: Message) => {
      if (m.kind !== 'direct') return;
      const cid = String(m.senderId) === me ? String(m.recipientId) : String(m.senderId);
      const name = String(m.senderId) === me
        ? (m.recipient?.name ?? 'Teammate')
        : (m.sender?.name ?? 'Teammate');
      if (!groups.has(cid)) groups.set(cid, { id: cid, name, photo: photos.get(cid) ?? null, messages: [], unread: 0, lastAt: 0 });
      const g = groups.get(cid) as { id: string; name: string; photo: string | null; messages: Message[]; unread: number; lastAt: number };
      g.messages.push(m);
      if (!m.readAt && String(m.senderId) !== me) g.unread += 1;
      const at = new Date(m.createdAt ?? 0).getTime();
      if (at > g.lastAt) g.lastAt = at;
      if (g.name === 'Teammate' && name !== 'Teammate') g.name = name;
      if (!g.photo && photos.has(cid)) g.photo = photos.get(cid) ?? null;
    };
    for (const m of this.inbox()) absorb(m);
    for (const m of this.sent()) absorb(m);
    let out = [...groups.values()];
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
      if (!q) return true;
      return `${m.sender?.name ?? ''} ${m.title ?? ''} ${m.body ?? ''}`.toLowerCase().includes(q);
    });
  });

  /** Sent rows that don't live in a thread (team announcements). */
  protected readonly sentBroadcasts = computed(() => this.sent().filter((m) => m.kind !== 'direct'));

  protected snippet(text: string | undefined, len = 140): string {
    const t = String(text ?? '').trim();
    return t.length > len ? `${t.slice(0, len - 1)}…` : t;
  }

  protected lastSnippet(messages: Message[]): string {
    const last = messages[messages.length - 1];
    return this.snippet(last ? `${last.title ? last.title + ' — ' : ''}${last.body ?? ''}` : '');
  }

  protected lastAt(messages: Message[]): string {
    const last = messages[messages.length - 1];
    return String(last?.createdAt ?? '');
  }

  /** Group an open thread into day sections for dividers. */
  protected readonly threadDays = computed(() => {
    const days = new Map<string, { key: string; label: string; msgs: ChatMsg[] }>();
    for (const m of this.threadMsgs()) {
      const d = new Date(m.createdAt ?? 0);
      const key = Number.isNaN(d.getTime()) ? 'undated' : d.toDateString();
      if (!days.has(key)) {
        days.set(key, {
          key,
          label: key === 'undated' ? '' : d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
          msgs: [],
        });
      }
      days.get(key)!.msgs.push(m);
    }
    return [...days.values()];
  });

  /** Reply is possible on directs; on team/announcements only when the
   * sender is messageable (upline/downline) — otherwise a send would 403. */
  protected canReply(msg: Message): boolean {
    if (msg.kind === 'direct') return true;
    return this.contacts().some((c) => String(c.id) === String(msg.senderId));
  }

  protected openChat(counterpartId: string): void {
    this.searchQuery.set('');
    this.startingChat.set(false);
    this.openThreadName.set(
      this.openThreadName()?.id === counterpartId
        ? this.openThreadName()
        : { id: counterpartId, name: this.resolveName(counterpartId) },
    );
    this.openThreadId.set(counterpartId);
    this.threadMsgs.set([]);
    this.threadError.set(null);
    this.threadSendError.set(null);
    this.replyDraft.set('');
    this.smsNotice.set(null);
    this.smsError.set(null);
    this.threadLoading.set(true);
    this.refreshRoute(counterpartId);
    this.messages
      .thread(counterpartId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const rows = [...(res.data ?? [])].sort(
            (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
          this.threadMsgs.set(rows);
          this.threadLoading.set(false);
          this.scrollSoon();
          // Reading the thread clears its unread flags (counts stay truthful).
          for (const m of rows) {
            if (!m.readAt && String(m.senderId) !== this.myId()) this.markReadBoth(m);
          }
          this.openThreadName.set({ id: counterpartId, name: this.resolveName(counterpartId) });
        },
        error: (err: ApiError) => {
          this.threadLoading.set(false);
          this.threadError.set(userError(err));
        },
      });
  }

  private scrollSoon(): void {
    // Double rAF: the first frame lets Angular render the new rows,
    // the second runs after layout so scrollHeight is final.
    requestAnimationFrame(() => requestAnimationFrame(() => this.scrollNow()));
  }

  private scrollNow(): void {
    try {
      const el = this.threadScroll?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* layout not ready yet */ }
  }

  protected onDraftInput(value: string): void {
    this.replyDraft.set(value);
    const to = this.openThreadId();
    if (!to || !this.chat.connected()) return;
    const now = Date.now();
    if (value.trim() && now - this.lastTypingSent > 3000) {
      this.lastTypingSent = now;
      this.chat.typing(to, true);
    }
    if (!value.trim()) this.typingStop();
  }

  protected typingStop(): void {
    const to = this.openThreadId();
    if (to) this.chat.typing(to, false);
  }

  protected onComposerKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendThreadReply();
    }
  }

  protected sendThreadReply(): void {
    const to = this.openThreadId();
    const body = this.replyDraft().trim();
    if (!to || !body || this.threadSending()) return;
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const temp: ChatMsg = {
      id: `pending-${clientId}`,
      senderId: this.myId(),
      recipientId: to,
      kind: 'direct',
      title: '',
      body,
      readAt: null,
      createdAt: new Date().toISOString(),
      clientId,
      pending: true,
    };
    this.threadMsgs.set([...this.threadMsgs(), temp]);
    this.replyDraft.set('');
    this.typingStop();
    this.scrollSoon();
    this.deliver(to, body, clientId);
  }

  /** Socket-first delivery; REST fallback keeps the page working offline-first. */
  private deliver(to: string, body: string, clientId: string): void {
    if (this.chat.connected()) {
      this.threadSending.set(true);
      this.chat.send(to, body, clientId).then(
        ({ message }) => {
          this.threadSending.set(false);
          this.replaceTemp(clientId, message);
        },
        () => {
          this.threadSending.set(false);
          this.failTemp(clientId);
          this.threadSendError.set('Send failed — tap retry on the message.');
        },
      );
      return;
    }
    this.threadSending.set(true);
    this.threadSendError.set(null);
    this.messages
      .sendDirect(to, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.threadSending.set(false);
          if (res.data) this.replaceTemp(clientId, res.data);
          else this.failTemp(clientId);
          this.refreshListsSilent();
        },
        error: (err: ApiError) => {
          this.threadSending.set(false);
          this.failTemp(clientId);
          this.threadSendError.set(userError(err));
        },
      });
  }

  protected retryTemp(clientId: string): void {
    const temp = this.threadMsgs().find((m) => m.clientId === clientId && m.failed);
    if (!temp || this.threadSending()) return;
    this.threadMsgs.set(this.threadMsgs().map((m) =>
      m.clientId === clientId ? { ...m, failed: false, pending: true } : m,
    ));
    this.threadSendError.set(null);
    this.deliver(String(temp.recipientId), temp.body, clientId);
  }

  private replaceTemp(clientId: string, message: Message): void {
    const rows = this.threadMsgs();
    if (rows.some((m) => m.clientId === clientId)) {
      this.threadMsgs.set(
        rows
          .map((m) => (m.clientId === clientId ? { ...message } : m))
          .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()),
      );
    } else if (!rows.some((m) => m.id === message.id)) {
      // Echo already landed first — fill the gap, never duplicate.
      this.threadMsgs.set(
        [...rows, { ...message }].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()),
      );
    }
    this.scrollSoon();
  }

  private failTemp(clientId: string): void {
    this.threadMsgs.set(this.threadMsgs().map((m) =>
      m.clientId === clientId ? { ...m, pending: false, failed: true } : m,
    ));
  }

  /** Refresh thread rows without collapsing the open conversation. */
  private loadThreadSilent(counterpartId: string): void {
    this.messages
      .thread(counterpartId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const pending = this.threadMsgs().filter((m) => m.pending || m.failed);
          const rows = [...(res.data ?? [])].sort(
            (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
          this.threadMsgs.set([...rows, ...pending]);
        },
        error: () => {},
      });
  }

  /** Socket-first read receipt; REST fallback keeps counts truthful. */
  private markReadBoth(m: Message): void {
    const stamp = new Date().toISOString();
    this.threadMsgs.set(this.threadMsgs().map((x) => (x.id === m.id ? { ...x, readAt: x.readAt ?? stamp } : x)));
    this.inbox.set(this.inbox().map((x) => (x.id === m.id ? { ...x, readAt: x.readAt ?? stamp } : x)));
    this.unread.set(Math.max(0, this.unread() - 1));
    if (this.chat.connected()) {
      this.chat.markRead(m.id);
    } else {
      this.messages.markRead(m.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ error: () => {} });
    }
  }

  /** Routing intel for the SMS fallback banner (cached per counterpart). */
  private refreshRoute(counterpartId: string): void {
    if (this.routeInfo()[counterpartId]) return;
    this.messages
      .routeInfo(counterpartId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.data) this.routeInfo.set({ ...this.routeInfo(), [counterpartId]: res.data });
        },
        error: () => {},
      });
  }

  /** Approved SMS fallback: explicit dialog, exact wallet charge, no surprises. */
  protected openSmsDialog(): void {
    const peer = this.openThreadName();
    const route = peer ? this.routeInfo()[peer.id] : undefined;
    if (!peer || !route) return;
    const dialog = this.dialog.open(SmsApprovalDialogComponent, {
      data: {
        name: peer.name,
        maskedPhone: route.maskedPhone,
        unitCost: route.smsUnitCost,
        offlineNote: route.online ? 'is around' : 'is offline',
        initialBody: this.replyDraft().trim(),
      },
    });
    dialog.afterClosed().subscribe((body: string | null) => {
      if (!body) return;
    this.smsSending.set(true);
    this.smsError.set(null);
    this.smsNotice.set(null);
    this.messages
      .sendSmsFallback(peer.id, body)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.smsSending.set(false);
            this.replyDraft.set('');
            this.smsNotice.set(res?.message ?? 'SMS sent.');
          },
          error: (err: ApiError) => {
            this.smsSending.set(false);
            this.smsError.set(userError(err));
          },
        });
    });
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
        error: (err: ApiError) => this.error.set(userError(err)),
      });
  }

  protected reply(msg: Message): void {
    this.replyingTo.set(msg);
    this.composeKind.set('direct');
    this.form.patchValue({ to: msg.senderId, body: '' });
    this.view.set('channels');
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
        this.sendError.set(userError(err));
      },
    });
  }
}
