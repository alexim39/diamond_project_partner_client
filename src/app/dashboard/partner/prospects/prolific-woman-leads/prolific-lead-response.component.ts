import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ApiError, userError } from '../../../../core/http/api-error';
import { timeAgo } from '../../../../_common/date-util';
import {
  ProlificWomanLead,
  ProlificWomanLeadsService,
} from './prolific-woman-leads.service';

@Component({
  selector: 'async-prolific-lead-response',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="head">
      <span class="avatar">{{ initials() }}</span>
      <span class="head-text">
        <strong>{{ lead.name }}</strong>
        <small class="muted">{{ lead.location }} · arrived {{ arrivedAgo() }}</small>
      </span>
    </h2>

    <mat-dialog-content class="body">
      @if (error(); as err) {
        <p class="error" role="alert">{{ err }}</p>
      }

      <div class="contact-row">
        <a mat-stroked-button [href]="'tel:' + lead.phone">
          <mat-icon>call</mat-icon> {{ lead.phone }}
        </a>
        <a
          mat-stroked-button
          [href]="waLink()"
          target="_blank"
          rel="noopener noreferrer"
        >
          <mat-icon>chat</mat-icon> WhatsApp
        </a>
      </div>

      <div class="groups">
        <section>
          <h4>Application</h4>
          <div class="qa"><span>Mentorship</span><strong>{{ readiness() }}</strong></div>
          <div class="qa"><span>Head office</span><strong>{{ office() }}</strong></div>
          <div class="qa"><span>Availability</span><strong>{{ availability() }}</strong></div>
          <div class="qa"><span>Submitted</span><strong>{{ lead.submittedAt | date:'fullDate' }}</strong></div>
        </section>
        <section>
          <h4>Location</h4>
          <div class="qa"><span>City / state</span><strong>{{ lead.location }}</strong></div>
          <div class="qa"><span>Source</span><strong>Prolific Women website</strong></div>
        </section>
      </div>

      <p class="hint muted">
        Accept moves this application into My follow-ups as a pipeline prospect.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions class="foot">
      <button mat-button (click)="close()">Close</button>
      <span class="spacer"></span>
      <button mat-flat-button color="primary" (click)="accept()" [disabled]="accepting()">
        {{ accepting() ? 'Accepting…' : 'Accept into follow-ups' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .head { display: flex; align-items: center; gap: 0.8em; padding-bottom: 0.5em; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--dp-gold), #6b4e12); flex: none; }
    .head-text { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
    .head-text strong { font-size: 1.1em; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .body { display: flex; flex-direction: column; gap: 1em; min-width: min(520px, 90vw); }
    .error { color: var(--dp-error); margin: 0; }
    .contact-row { display: flex; gap: 0.5em; flex-wrap: wrap; }
    .groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.9em; }
    .groups section { background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 10px; padding: 0.8em 0.9em; }
    .groups h4 { margin: 0 0 0.5em; font-size: 0.8em; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dp-gold-ink); }
    .qa { display: flex; flex-direction: column; gap: 0.1em; padding: 0.35em 0; border-top: 1px solid var(--dp-line); }
    .qa:first-of-type { border-top: none; }
    .qa span { color: var(--dp-muted); font-size: 0.78em; }
    .qa strong { font-weight: 600; word-break: break-word; }
    .hint { margin: 0; }
    .foot { display: flex; align-items: center; gap: 0.5em; }
    .spacer { flex: 1; }
    button { min-height: 44px; }
  `],
})
export class ProlificLeadResponseComponent {
  private readonly dialogRef = inject(MatDialogRef<ProlificLeadResponseComponent>);
  private readonly data = inject<{ lead: ProlificWomanLead }>(MAT_DIALOG_DATA);
  private readonly leads = inject(ProlificWomanLeadsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly accepting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected get lead(): ProlificWomanLead {
    return this.data.lead;
  }

  protected initials(): string {
    const parts = this.lead.name.split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  protected arrivedAgo(): string {
    return this.lead.createdAt ? timeAgo(new Date(this.lead.createdAt)) : '';
  }

  protected readiness(): string {
    return this.lead.readyToBeMentored === 'yes' ? 'Ready now' : 'Exploring';
  }

  protected office(): string {
    return this.lead.headOfficeInvite === 'yes' ? 'Visit requested' : 'Online';
  }

  protected availability(): string {
    return this.lead.availability === 'weekdays' ? 'Weekdays' : 'Weekends';
  }

  protected waLink(): string {
    return `https://wa.me/${this.lead.phone.replace(/\D/g, '')}`;
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected accept(): void {
    if (this.accepting()) return;
    this.accepting.set(true);
    this.error.set(null);
    this.leads
      .accept(this.lead.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.dialogRef.close({ accepted: true, id: this.lead.id }),
        error: (err: ApiError) => {
          this.accepting.set(false);
          this.error.set(userError(err));
        },
      });
  }
}
