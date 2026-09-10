import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { MessageService } from '../../../core/messaging/message.service';
import { AnnounceEnvelope, Contact, Message, MessageEnvelope } from '../../../core/messaging/message.models';
import { ApiError } from '../../../core/http/api-error';

type ComposeKind = 'direct' | 'announcement';

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
          </mat-button-toggle-group>

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
            <mat-form-field appearance="outline">
              <mat-label>Audience</mat-label>
              <mat-select formControlName="scope">
                <mat-option value="direct">Direct team</mat-option>
                <mat-option value="all">Entire downline (broadcast)</mat-option>
              </mat-select>
            </mat-form-field>
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
              <mat-chip highlighted>Replying to {{ reply.sender?.name ?? 'teammate' }}</mat-chip>
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

      <h3>Inbox ({{ inbox().length }})</h3>
      @if (inbox().length > 0) {
        <ul class="message-list">
          @for (msg of inbox(); track msg.id) {
            <li class="message-card" [class.message-card--unread]="!msg.readAt">
              <div class="message-top">
                <strong>{{ msg.sender?.name ?? 'Teammate' }}</strong>
                <mat-chip highlighted>{{ kindLabel(msg) }}</mat-chip>
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
                @if (msg.kind === 'direct') {
                  <button mat-button (click)="reply(msg)">Reply</button>
                }
              </div>
            </li>
          }
        </ul>
      } @else if (!loading()) {
        <p class="empty">No messages yet.</p>
      }

      <h3>Sent ({{ sent().length }})</h3>
      @if (sent().length > 0) {
        <ul class="message-list">
          @for (msg of sent(); track msg.id) {
            <li class="message-card">
              <div class="message-top">
                <strong>To {{ msg.recipient?.name ?? 'teammate' }}</strong>
                <span class="muted">{{ msg.createdAt | date:'short' }}</span>
              </div>
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
    .subtitle { margin: 0.25em 0 0; color: #666; }
    .unread-count { color: #d32f2f; }
    .compose-form { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; flex-wrap: wrap; }
    .message-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .message-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.35em; }
    .message-card--unread { border-left: 4px solid #3f51b5; }
    .message-card p { margin: 0; white-space: pre-wrap; }
    .message-top { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; }
    .message-actions { display: flex; gap: 0.25em; }
    .muted { color: #777; font-size: 0.85em; }
    .error { color: #d32f2f; }
    .notice { color: #1b5e20; }
    .empty { color: #666; }
  `],
})
export class MessagesComponent implements OnInit {
  private readonly messages = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sendError = signal<string | null>(null);
  protected readonly sentNotice = signal<string | null>(null);
  protected readonly showCompose = signal(false);
  protected readonly composeKind = signal<ComposeKind>('direct');
  protected readonly replyingTo = signal<Message | null>(null);
  protected readonly inbox = signal<Message[]>([]);
  protected readonly sent = signal<Message[]>([]);
  protected readonly contacts = signal<Contact[]>([]);
  protected readonly unread = signal(0);

  protected readonly form = this.fb.nonNullable.group({
    to: [''],
    title: [''],
    scope: ['direct' as 'direct' | 'all'],
    body: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.reload();
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
    return 'Direct';
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
    if (this.composeKind() === 'announcement' && v.title.trim().length < 2) {
      this.sendError.set('Announcements need a title.');
      return;
    }
    this.sending.set(true);
    this.sendError.set(null);
    this.sentNotice.set(null);
    const kind = this.composeKind();
    const request: Observable<MessageEnvelope | AnnounceEnvelope> = kind === 'direct'
      ? this.messages.sendDirect(v.to, body)
      : this.messages.announce(v.title.trim(), body, v.scope);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.sending.set(false);
        this.replyingTo.set(null);
        this.form.reset({ to: '', title: '', scope: 'direct', body: '' });
        this.sentNotice.set(
          kind === 'announcement' && 'inserted' in res.data
            ? `Announced to ${res.data.inserted} partners.`
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
