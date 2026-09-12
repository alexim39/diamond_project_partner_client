import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { LeadPipelineService } from '../../../prospects/lead-pipeline/lead-pipeline.service';
import { DownlineContactListItem } from '../../../prospects/lead-pipeline/lead.models';
import { ApiError } from '../../../../../core/http/api-error';

/**
 * @title Downline contact lists — the upline workbench.
 *
 * Submitted onboarding lists from the downline with per-batch progress
 * and callable contact rows (hottest + unworked first). This is where
 * "upline calls those contacts and books sessions" happens in-app.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-downline-contact-lists',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule, RouterModule],
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

      @if (items().length > 0) {
        <ul class="batch-list">
          @for (b of items(); track b.partnerId + b.batch) {
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
                @for (c of b.contacts; track c.id) {
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
                  </li>
                }
              </ul>
            </li>
          }
        </ul>
      } @else if (!loading() && !error()) {
        <p class="empty">No submitted lists yet — when your downline submits their contact lists, they land here.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .lists-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
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
    .contact a[mat-button] { min-height: 44px; }
    .spacer { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class DownlineContactListsComponent implements OnInit {
  private readonly leads = inject(LeadPipelineService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<DownlineContactListItem[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  protected stageKeys(b: DownlineContactListItem): string[] {
    return Object.keys(b.stageCounts ?? {}).sort();
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
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
