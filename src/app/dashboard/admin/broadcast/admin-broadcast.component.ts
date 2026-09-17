import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import {
  AdminBroadcastService, AudienceEstimate, BroadcastRow, CampaignAudience, CampaignPayload,
} from './admin-broadcast.service';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Broadcast desk — notices, campaigns and receipts.
 *
 * Top: the legacy quick in-app notice (unchanged behavior). Below: the
 * campaign composer — audience (all / segment / hand-picked), kind
 * (system reaches everyone; marketing honors channel opt-outs), channels
 * (in-app free, email free, SMS platform-funded with a spend estimate +
 * explicit confirmation), now-or-scheduled. History shows per-channel
 * stats. OnPush + signals.
 */
@Component({
  selector: 'async-admin-broadcast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatCheckboxModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatRadioModule,
    MatSelectModule, MatTableModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Broadcast</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Broadcast</h2>
          <p class="subtitle">Reach members where they are — app inbox, email, SMS. Use sparingly; every send is audited.</p>
        </div>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      <div class="dp-card compose-card">
        <h3>Quick in-app notice <span class="muted">— app inbox only</span></h3>
        <p class="muted">For email or SMS, use the campaign composer below.</p>
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput [value]="title()" (input)="title.set($any($event.target).value)" maxlength="140" placeholder="Scheduled maintenance tonight" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Message</mat-label>
          <textarea matInput rows="3" [value]="body()" (input)="body.set($any($event.target).value)" maxlength="2000" placeholder="What members need to know"></textarea>
          <mat-hint>{{ body().length }} / 2000 chars · {{ pages(body()) }} SMS page{{ pages(body()) === 1 ? '' : 's' }}</mat-hint>
        </mat-form-field>
        <div class="compose-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Link (optional)</mat-label>
            <input matInput [value]="link()" (input)="link.set($any($event.target).value)" maxlength="500" placeholder="/dashboard/community" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Priority</mat-label>
            <mat-select [value]="priority()" (selectionChange)="priority.set($event.value)">
              <mat-option value="high">High</mat-option>
              <mat-option value="medium">Medium</mat-option>
            </mat-select>
          </mat-form-field>
          @if (confirming()) {
            <button mat-flat-button color="warn" (click)="send()" [disabled]="sending() || !canSend()">
              {{ sending() ? 'Sending…' : 'Confirm send to all?' }}
            </button>
            <button mat-button (click)="confirming.set(false)">Cancel</button>
          } @else {
            <button mat-flat-button color="primary" (click)="confirming.set(true)" [disabled]="!canSend()">Review & send</button>
          }
        </div>
        @if (sendError(); as err) {
          <p class="error" role="alert">{{ err }}</p>
        }
      </div>

      <div class="dp-card compose-card">
        <h3>Email + SMS campaign</h3>
        <p class="muted">System reaches everyone on every enabled channel. Marketing honors each member's channel opt-outs.</p>

        <p class="form-section-label">Step 1 · Who receives it</p>
        <mat-radio-group [(ngModel)]="kind" aria-label="Campaign kind">
          <mat-radio-button value="system">System (urgent — all members)</mat-radio-button>
          <mat-radio-button value="marketing">Marketing (announcements, newsletters — opt-outs honored)</mat-radio-button>
        </mat-radio-group>

        <mat-form-field appearance="outline">
          <mat-label>Audience</mat-label>
          <mat-select [(ngModel)]="audienceMode">
            <mat-option value="all">All members</mat-option>
            <mat-option value="segment">Segment (filters)</mat-option>
            <mat-option value="picked">Hand-picked members</mat-option>
          </mat-select>
        </mat-form-field>

        @if (audienceMode === 'segment') {
          <div class="compose-row">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Role contains (optional)</mat-label>
              <input matInput [(ngModel)]="segRole" maxlength="40" placeholder="User" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Account status</mat-label>
              <mat-select [(ngModel)]="segActive">
                <mat-option [value]="">Any</mat-option>
                <mat-option [value]="true">Active only</mat-option>
                <mat-option [value]="false">Inactive only</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        }

        @if (audienceMode === 'picked') {
          <mat-form-field appearance="outline">
            <mat-label>Find member (email or username)</mat-label>
            <input matInput [(ngModel)]="lookup" (keyup.enter)="searchMember()" minlength="2" />
          </mat-form-field>
          <div class="compose-row">
            <button mat-button (click)="searchMember()" [disabled]="lookup.trim().length < 2 || searching()">Search</button>
          </div>
          @if (searchError(); as serr) {
            <p class="error" role="alert">{{ serr }}</p>
          }
          @if (candidates().length > 0) {
            <div class="hits">
              @for (h of candidates(); track h.id) {
                <button mat-button (click)="pick(h)">{{ h.name }} · {{ h.username ?? h.email }}</button>
              }
            </div>
          }
          @if (picked().length > 0) {
            <div class="hits">
              @for (h of picked(); track h.id) {
                <button mat-button class="active" (click)="unpick(h)">{{ h.name }} ✕</button>
              }
            </div>
          }
        }

        <p class="form-section-label">Step 2 · How it travels (pick at least one)</p>
        <div class="compose-row channels">
          <mat-checkbox [(ngModel)]="chInApp">App inbox <span class="muted">free · appears in the notification bell</span></mat-checkbox>
          <mat-checkbox [(ngModel)]="chEmail">Email <span class="muted">free · needs the member's email address</span></mat-checkbox>
          <mat-checkbox [(ngModel)]="chSms">SMS <span class="muted">gateway credit · needs the member's phone number</span></mat-checkbox>
        </div>

        <p class="form-section-label">Step 3 · What it says</p>
        <p class="muted echo">Shared message (edit above): <strong>{{ title().trim() || '—' }}</strong> — {{ body().trim().slice(0, 120) || '—' }}{{ body().trim().length > 120 ? '…' : '' }}</p>

        @if (chEmail) {
          <mat-form-field appearance="outline">
            <mat-label>Email subject (defaults to title above)</mat-label>
            <input matInput [(ngModel)]="subject" maxlength="120" />
            <mat-hint>{{ subject.length }} / 120</mat-hint>
          </mat-form-field>
        }
        @if (chSms) {
          <mat-form-field appearance="outline">
            <mat-label>SMS text (defaults to title + message above)</mat-label>
            <textarea matInput rows="2" [(ngModel)]="smsBody" maxlength="459"></textarea>
            <mat-hint>{{ (smsBody || (title() + ' — ' + body())).length }} / 459 chars · {{ pages(smsBody || (title() + ' — ' + body())) }} page{{ pages(smsBody || (title() + ' — ' + body())) === 1 ? '' : 's' }}</mat-hint>
          </mat-form-field>
        }

        <p class="form-section-label">Step 4 · When it goes out</p>

        <mat-form-field appearance="outline">
          <mat-label>Send</mat-label>
          <mat-select [(ngModel)]="when">
            <mat-option value="now">Now (within a minute)</mat-option>
            <mat-option value="later">Schedule for later</mat-option>
          </mat-select>
        </mat-form-field>
        @if (when === 'later') {
          <mat-form-field appearance="outline">
            <mat-label>Scheduled date & time</mat-label>
            <input matInput type="datetime-local" [(ngModel)]="sendAt" />
          </mat-form-field>
        }

        @if (estimate(); as est) {
          <div class="dp-card estimate" role="status">
            <div><strong>{{ est.total | number }}</strong> members{{ est.capped ? ' (capped at 5,000)' : '' }}</div>
            <div class="muted">App inbox {{ est.inApp | number }} · Email {{ est.email | number }} · SMS {{ est.sms | number }} ({{ est.smsPages }} page{{ est.smsPages === 1 ? '' : 's' }})</div>
            @if (chSms) {
              <div><strong>≈ ₦{{ est.estimatedSmsSpend | number:'1.0-2' }}</strong> gateway credit for SMS</div>
              <mat-checkbox [(ngModel)]="confirmSpend">I confirm this gateway spend</mat-checkbox>
            }
          </div>
        }
        @if (campaignError(); as err) {
          <p class="error" role="alert">{{ err }}</p>
        }
        <p class="form-section-label">Step 5 · Review & send</p>
        <p class="send-summary" role="status">{{ sendSummary() }}</p>
        <div class="compose-row">
          <button mat-button (click)="preview()" [disabled]="!canQueue() || estimating()">
            {{ estimating() ? 'Counting…' : (estimate() ? 'Refresh estimate' : 'Preview reach + cost') }}
          </button>
          <button
            mat-flat-button color="primary"
            (click)="queue()"
            [disabled]="!canQueue() || !estimate() || queuing() || (chSms && !confirmSpend)">
            {{ queuing() ? 'Queueing…' : (when === 'later' ? 'Schedule campaign' : 'Queue campaign') }}
          </button>
        </div>
      </div>

      <h3>History</h3>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="notice">
              <th mat-header-cell *matHeaderCellDef>Broadcast</th>
              <td mat-cell *matCellDef="let row" class="notice-cell">
                <strong>{{ row.title }}</strong>
                <span class="muted">{{ row.body }}</span>
                <span class="muted">
                  {{ row.createdAt | date:'medium' }} ·
                  @if (row.stats) {
                    app {{ row.stats.inApp.sent }}/{{ row.stats.inApp.failed }} ·
                    mail {{ row.stats.email.sent }}/{{ row.stats.email.failed }} ·
                    sms {{ row.stats.sms.sent }}/{{ row.stats.sms.failed }}
                  } @else {
                    reached {{ row.recipientCount }}@if (row.capped) { (capped) }
                  }
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="channels">
              <th mat-header-cell *matHeaderCellDef>Channels</th>
              <td mat-cell *matCellDef="let row">
                @if (row.channels) {
                  @if (row.channels.inApp) { <span class="dp-status dp-status--info">app</span> }
                  @if (row.channels.email) { <span class="dp-status dp-status--info">mail</span> }
                  @if (row.channels.sms) { <span class="dp-status dp-status--warn">sms</span> }
                  <span class="muted">{{ row.kind }} · {{ row.status }}</span>
                } @else {
                  <span class="dp-status dp-status--info">app</span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Priority</th>
              <td mat-cell *matCellDef="let row"><span [class]="row.priority === 'high' ? 'dp-status dp-status--bad' : 'dp-status dp-status--warn'">{{ row.priority }}</span></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <div class="pager">
          <button mat-button (click)="page(-1)" [disabled]="skip() === 0 || loading()">Previous</button>
          <span class="muted">{{ total() }} broadcasts</span>
          <button mat-button (click)="page(1)" [disabled]="skip() + limit() >= total() || loading()">Next</button>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No broadcasts yet.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .queue-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .notice { color: var(--dp-success); }
    .compose-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .compose-card h3 { margin: 0; }
    .compose-row { display: flex; gap: 0.75em; align-items: center; flex-wrap: wrap; }
    .compose-row mat-form-field { min-width: 200px; }
    .form-section-label { font-size: 0.78em; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dp-gold-ink); margin: 0.4em 0 -0.3em; }
    .echo { border-left: 3px solid var(--dp-line); padding-left: 0.6em; }
    .send-summary { background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.6em 0.8em; }
    .channels mat-checkbox { margin-right: 0.5em; }
    .hits { display: flex; gap: 0.5em; flex-wrap: wrap; }
    .hits button.active { border: 1px solid var(--dp-gold); font-weight: 700; }
    .estimate { padding: 0.8em; display: flex; flex-direction: column; gap: 0.4em; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .notice-cell { display: flex; flex-direction: column; gap: 0.15em; max-width: 520px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .empty { color: var(--dp-muted); }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .pager { display: flex; align-items: center; gap: 1em; }
    button { min-height: 44px; }
  `],
})
export class AdminBroadcastComponent implements OnInit {
  private readonly cast = inject(AdminBroadcastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly sendError = signal<string | null>(null);
  protected readonly rows = signal<BroadcastRow[]>([]);
  protected readonly total = signal(0);
  protected readonly limit = signal(25);
  protected readonly skip = signal(0);
  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly link = signal('');
  protected readonly priority = signal<'high' | 'medium'>('high');
  protected readonly confirming = signal(false);
  protected readonly sending = signal(false);

  // Campaign composer state (plain fields — template-driven, matches page style).
  protected kind: 'system' | 'marketing' = 'system';
  protected audienceMode: 'all' | 'segment' | 'picked' = 'all';
  protected segRole = '';
  protected segActive: '' | boolean = '';
  protected chInApp = true;
  protected chEmail = false;
  protected chSms = false;
  protected subject = '';
  protected smsBody = '';
  protected when: 'now' | 'later' = 'now';
  protected sendAt = '';
  protected confirmSpend = false;
  protected lookup = '';
  protected readonly searching = signal(false);
  protected readonly searchError = signal<string | null>(null);
  protected readonly candidates = signal<Array<{ id: string; name: string; username: string | null; email: string | null }>>([]);
  protected readonly picked = signal<Array<{ id: string; name: string; username: string | null; email: string | null }>>([]);
  protected readonly estimate = signal<AudienceEstimate | null>(null);
  protected readonly estimating = signal(false);
  protected readonly queuing = signal(false);
  protected readonly campaignError = signal<string | null>(null);

  protected readonly displayedColumns = ['notice', 'channels', 'priority'];

  ngOnInit(): void {
    this.reload();
  }

  protected canSend(): boolean {
    return this.title().trim().length >= 3 && this.body().trim().length >= 3;
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cast
      .history({ limit: this.limit(), skip: this.skip() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data?.items ?? []);
          this.total.set(res.data?.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected page(direction: 1 | -1): void {
    this.skip.set(Math.max(0, this.skip() + direction * this.limit()));
    this.reload();
  }

  protected send(): void {
    if (!this.canSend() || this.sending()) return;
    this.sending.set(true);
    this.sendError.set(null);
    this.notice.set(null);
    this.cast
      .send({
        title: this.title().trim(),
        body: this.body().trim(),
        ...(this.link().trim() ? { link: this.link().trim() } : {}),
        priority: this.priority(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sending.set(false);
          this.confirming.set(false);
          this.title.set('');
          this.body.set('');
          this.link.set('');
          this.notice.set(res.message ?? `Broadcast sent to ${res.data?.delivered ?? 0} members.`);
          this.skip.set(0);
          this.reload();
        },
        error: (err: ApiError) => {
          this.sending.set(false);
          this.sendError.set(err.message);
        },
      });
  }

  protected pages(text: string): number {
    return Math.max(1, Math.ceil(String(text ?? '').length / 160));
  }

  protected sendSummary(): string {
    const chans: string[] = [];
    if (this.chInApp) chans.push('app inbox');
    if (this.chEmail) chans.push('email');
    if (this.chSms) chans.push('SMS');
    const who = this.audienceMode === 'all'
      ? 'all members'
      : this.audienceMode === 'segment'
        ? 'the filtered segment'
        : `${this.picked().length} picked member${this.picked().length === 1 ? '' : 's'}`;
    const est = this.estimate();
    const reach = est
      ? ` — reach ~${est.total} (${est.inApp} app, ${est.email} mail, ${est.sms} sms${this.chSms ? `, ≈₦${est.estimatedSmsSpend.toFixed(2)}` : ''})`
      : ' — preview reach & cost before sending';
    return `You are queueing a ${this.kind} campaign to ${who} via ${chans.length ? chans.join(' + ') : 'no channels'}${reach}.`;
  }

  protected audience(): CampaignAudience {
    if (this.audienceMode === 'picked') {
      return { mode: 'picked', ids: this.picked().map((p) => p.id) };
    }
    if (this.audienceMode === 'segment') {
      return {
        mode: 'segment',
        segment: {
          ...(this.segRole.trim() ? { role: this.segRole.trim() } : {}),
          ...(this.segActive === '' ? {} : { active: this.segActive }),
          excludeSuspended: true,
        },
      };
    }
    return { mode: 'all' };
  }

  protected campaignPayload(): CampaignPayload {
    return {
      title: this.title().trim() || 'Untitled campaign',
      body: this.body().trim() || 'See details inside.',
      ...(this.link().trim() ? { link: this.link().trim() } : {}),
      priority: this.priority(),
      ...(this.subject.trim() ? { subject: this.subject.trim() } : {}),
      ...(this.smsBody.trim() ? { smsBody: this.smsBody.trim() } : {}),
      channels: { inApp: this.chInApp, email: this.chEmail, sms: this.chSms },
      kind: this.kind,
      audience: this.audience(),
      ...(this.when === 'later' && this.sendAt ? { sendAt: new Date(this.sendAt).toISOString() } : {}),
    };
  }

  protected canQueue(): boolean {
    if (!this.canSend()) return false;
    if (!this.chInApp && !this.chEmail && !this.chSms) return false;
    if (this.audienceMode === 'picked' && this.picked().length === 0) return false;
    if (this.when === 'later') {
      const at = new Date(this.sendAt).getTime();
      if (!Number.isFinite(at) || at <= Date.now()) return false;
    }
    return true;
  }

  protected preview(): void {
    if (!this.canQueue() || this.estimating()) return;
    this.estimating.set(true);
    this.campaignError.set(null);
    this.cast
      .estimate(this.campaignPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.estimate.set(res.data ?? null);
          this.estimating.set(false);
          this.confirmSpend = false;
        },
        error: (err: ApiError) => {
          this.estimating.set(false);
          this.campaignError.set(err.message);
        },
      });
  }

  protected queue(): void {
    if (!this.canQueue() || !this.estimate() || this.queuing()) return;
    if (this.chSms && !this.confirmSpend) return;
    this.queuing.set(true);
    this.campaignError.set(null);
    this.cast
      .queueCampaign({
        ...this.campaignPayload(),
        confirmSpend: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.queuing.set(false);
          this.estimate.set(null);
          this.confirmSpend = false;
          this.smsBody = '';
          this.subject = '';
          this.picked.set([]);
          this.notice.set(res.message ?? 'Campaign queued.');
          this.skip.set(0);
          this.reload();
        },
        error: (err: ApiError) => {
          this.queuing.set(false);
          this.campaignError.set(err.message);
        },
      });
  }

  protected searchMember(): void {
    const q = this.lookup.trim();
    if (q.length < 2 || this.searching()) return;
    this.searching.set(true);
    this.searchError.set(null);
    this.cast
      .lookupMember(q)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = (res.data ?? {}) as { exact?: { id: string; name: string; username: string | null; email: string | null } | null; matches?: Array<{ id: string; name: string; username: string | null; email: string | null }> };
          const list = [...(data.exact ? [data.exact] : []), ...(data.matches ?? [])];
          this.candidates.set(list.filter((h) => !this.picked().some((p) => p.id === h.id)).slice(0, 8));
          this.searching.set(false);
        },
        error: (err: ApiError) => {
          this.searching.set(false);
          this.searchError.set(err.message ?? 'Member search failed — try again.');
        },
      });
  }

  protected pick(h: { id: string; name: string; username: string | null; email: string | null }): void {
    if (!this.picked().some((p) => p.id === h.id)) this.picked.set([...this.picked(), h]);
    this.candidates.set(this.candidates().filter((c) => c.id !== h.id));
    this.estimate.set(null);
  }

  protected unpick(h: { id: string }): void {
    this.picked.set(this.picked().filter((p) => p.id !== h.id));
    this.estimate.set(null);
  }
}
