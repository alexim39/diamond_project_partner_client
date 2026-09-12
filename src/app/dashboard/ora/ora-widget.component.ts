import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, effect, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OraService } from '../../core/ora/ora.service';
import { OraContext, OraMessage } from '../../core/ora/ora.models';
import { ApiError } from '../../core/http/api-error';

/** Minimal safe markdown: escape first, then bold/code/bullets/breaks. */
const renderMarkdown = (raw: string): string => {
  const escaped = String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const inline = escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const lines = inline.split('\n');
  let html = '';
  let inList = false;
  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${bullet[1]}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (line.trim()) html += `<p>${line}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html || '<p></p>';
};

/**
 * @title Ora — floating AI mentor.
 *
 * Bottom-right assistant (FAB + panel, full sheet on phones) backed by
 * `/v1/ora/*`: level-aware greeting, suggested starters, persistent
 * conversations. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-ora-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="ora-root">
      @if (open()) {
        <section class="ora-panel" role="dialog" aria-label="Chat with Ora">
          <header class="ora-head">
            <span class="ora-avatar" aria-hidden="true">O</span>
            <div class="ora-head-text">
              <strong>Ora</strong>
              @if (context(); as ctx) {
                <span class="muted">{{ ctx.levelLabel }}</span>
              }
            </div>
            <span class="spacer"></span>
            <button mat-icon-button (click)="toggleHistory()" aria-label="Conversation history" [title]="view() === 'history' ? 'Back to chat' : 'Conversation history'">
              <mat-icon>{{ view() === 'history' ? 'chat' : 'history' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="newChat()" aria-label="New conversation" title="New conversation">
              <mat-icon>add</mat-icon>
            </button>
            <button mat-icon-button (click)="open.set(false)" aria-label="Close Ora">
              <mat-icon>close</mat-icon>
            </button>
          </header>

          @if (view() === 'history') {
            <div class="ora-history">
              @if (history().length > 0) {
                <ul>
                  @for (c of history(); track c.id) {
                    <li>
                      <button class="history-row" (click)="openConversation(c.id)">
                        <span class="history-title">{{ c.title }}</span>
                      </button>
                      <button mat-icon-button (click)="removeConversation(c.id)" aria-label="Delete conversation">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </li>
                  }
                </ul>
              } @else {
                <p class="empty">No past conversations yet.</p>
              }
            </div>
          } @else {
            <div class="ora-messages" #scroll>
              @if (context(); as ctx) {
                @if (messages().length === 0) {
                  <div class="bubble assistant"><div [innerHTML]="render(ctx.greeting)"></div></div>
                  <div class="starters">
                    @for (s of ctx.starters; track s) {
                      <button mat-button class="starter" (click)="ask(s)">{{ s }}</button>
                    }
                  </div>
                }
              }
              @for (m of messages(); track $index) {
                <div class="bubble" [class.user]="m.role === 'user'" [class.assistant]="m.role === 'assistant'">
                  <div [innerHTML]="render(m.content)"></div>
                </div>
              }
              @if (sending()) {
                <div class="bubble assistant thinking"><em>Ora is thinking…</em></div>
              }
              @if (error(); as err) {
                <p class="error" role="alert">
                  {{ err }}
                  @if (canRetry()) {
                    <button mat-button (click)="retry()">Retry</button>
                  }
                </p>
              }
            </div>

            <form class="ora-input" (ngSubmit)="send()">
              <input
                name="ora-input"
                [(ngModel)]="draft"
                placeholder="Ask Ora anything…"
                aria-label="Message Ora"
                maxlength="2000"
                autocomplete="off"
              />
              <button mat-icon-button color="primary" type="submit" [disabled]="!draft().trim() || sending()" aria-label="Send">
                <mat-icon>send</mat-icon>
              </button>
            </form>
          }
          @if (booting()) {
            <mat-progress-bar mode="indeterminate" />
          }
        </section>
      }
      <button
        mat-fab
        color="primary"
        class="ora-fab"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-label="Chat with Ora"
        title="Chat with Ora"
      >
        <mat-icon>{{ open() ? 'close' : 'smart_toy' }}</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .ora-root { position: fixed; right: 1.25em; bottom: 1.25em; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; gap: 0.75em; }
    .ora-fab { min-height: 56px; }
    .ora-panel {
      width: min(380px, calc(100vw - 2.5em)); height: min(560px, calc(100dvh - 8em));
      display: flex; flex-direction: column; overflow: hidden;
      background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
    }
    .ora-head { display: flex; align-items: center; gap: 0.6em; padding: 0.6em 0.6em 0.6em 0.9em; border-bottom: 1px solid var(--dp-line); background: var(--dp-sidenav); color: var(--dp-sidenav-text); }
    .ora-avatar { flex: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--dp-sidenav); background: var(--dp-nav-icon); }
    .ora-head-text { display: flex; flex-direction: column; line-height: 1.2; }
    .ora-head-text .muted { color: var(--dp-sidenav-text); opacity: 0.75; font-size: 0.78em; }
    .spacer { flex: 1; }
    .ora-head button { color: var(--dp-sidenav-text); }
    .ora-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.6em; padding: 0.9em; }
    .bubble { max-width: 88%; padding: 0.6em 0.85em; border-radius: 14px; font-size: 0.9em; line-height: 1.5; }
    .bubble p { margin: 0 0 0.4em; }
    .bubble p:last-child { margin-bottom: 0; }
    .bubble ul { margin: 0 0 0.4em; padding-left: 1.2em; }
    .bubble code { background: var(--dp-gold-soft); border-radius: 4px; padding: 0 0.3em; font-size: 0.9em; }
    .bubble.assistant { align-self: flex-start; background: var(--dp-paper); border: 1px solid var(--dp-line); border-bottom-left-radius: 4px; }
    .bubble.user { align-self: flex-end; background: var(--dp-gold-soft); border: 1px solid var(--dp-gold); border-bottom-right-radius: 4px; }
    .thinking { opacity: 0.75; }
    .starters { display: flex; flex-wrap: wrap; gap: 0.4em; }
    .starter { min-height: 44px; border: 1px solid var(--dp-line); border-radius: 999px; text-transform: none; font-weight: 500; }
    .ora-input { display: flex; align-items: center; gap: 0.4em; padding: 0.6em 0.6em 0.6em 0.9em; border-top: 1px solid var(--dp-line); }
    .ora-input input { flex: 1; min-height: 44px; border: 1px solid var(--dp-line); border-radius: 999px; padding: 0 1em; background: var(--dp-paper); color: inherit; font: inherit; }
    .ora-history { flex: 1; overflow-y: auto; padding: 0.6em; }
    .ora-history ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .ora-history li { display: flex; align-items: center; border-bottom: 1px solid var(--dp-line); }
    .history-row { flex: 1; text-align: left; background: none; border: none; color: inherit; font: inherit; padding: 0.8em 0.5em; cursor: pointer; }
    .history-title { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .error { color: var(--dp-error); font-size: 0.85em; display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); padding: 1em; text-align: center; }
    @media (max-width: 640px) {
      .ora-root { right: 0.75em; bottom: 5.5em; }
      .ora-panel { width: calc(100vw - 1.5em); height: calc(100dvh - 9em); }
    }
  `],
})
export class OraWidgetComponent implements OnInit {
  private readonly ora = inject(OraService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollBox = viewChild<ElementRef<HTMLElement>>('scroll');

  protected readonly open = signal(false);
  protected readonly view = signal<'chat' | 'history'>('chat');
  protected readonly booting = signal(false);
  protected readonly context = signal<OraContext | null>(null);
  protected readonly messages = signal<OraMessage[]>([]);
  protected readonly conversationId = signal<string | null>(null);
  protected readonly history = signal<Array<{ id: string; title: string }>>([]);
  protected readonly draft = signal('');
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly canRetry = signal(false);

  private lastFailed: string | null = null;

  constructor() {
    effect(() => {
      this.messages();
      this.sending();
      queueMicrotask(() => {
        const el = this.scrollBox()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  ngOnInit(): void {
    // Context loads lazily on first open — no cost for members who never chat.
  }

  protected render(text: string): string {
    return renderMarkdown(text);
  }

  protected toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next && !this.context()) this.boot();
  }

  protected newChat(): void {
    this.conversationId.set(null);
    this.messages.set([]);
    this.error.set(null);
    this.canRetry.set(false);
    this.view.set('chat');
  }

  protected toggleHistory(): void {
    if (this.view() === 'history') {
      this.view.set('chat');
      return;
    }
    this.view.set('history');
    this.ora
      .conversations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.history.set(res.data?.items ?? []),
        error: () => this.history.set([]),
      });
  }

  protected openConversation(id: string): void {
    this.ora
      .conversation(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.conversationId.set(res.data?.id ?? id);
          this.messages.set(res.data?.messages ?? []);
          this.error.set(null);
          this.view.set('chat');
        },
        error: (err: ApiError) => this.error.set(err.message),
      });
  }

  protected removeConversation(id: string): void {
    this.ora
      .deleteConversation(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.history.set(this.history().filter((c) => c.id !== id));
          if (this.conversationId() === id) this.newChat();
        },
        error: (err: ApiError) => this.error.set(err.message),
      });
  }

  protected ask(prompt: string): void {
    this.draft.set(prompt);
    this.send();
  }

  protected retry(): void {
    if (this.lastFailed) {
      this.draft.set(this.lastFailed);
      this.send();
    }
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text || this.sending()) return;
    this.draft.set('');
    this.error.set(null);
    this.canRetry.set(false);
    this.lastFailed = text;
    this.messages.set([...this.messages(), { role: 'user', content: text, at: null }]);
    this.sending.set(true);
    this.ora
      .chat(text, this.conversationId() ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.conversationId.set(res.data?.conversationId ?? this.conversationId());
          this.messages.set([...this.messages(), { role: 'assistant', content: res.data?.reply ?? '', at: null }]);
          this.sending.set(false);
          this.lastFailed = null;
        },
        error: (err: ApiError) => {
          this.sending.set(false);
          this.error.set(err.message);
          this.canRetry.set(true);
        },
      });
  }

  private boot(): void {
    this.booting.set(true);
    this.ora
      .context()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.context.set(res.data ?? null);
          this.booting.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.booting.set(false);
        },
      });
  }
}
