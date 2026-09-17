import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ProspectService } from '../prospects.service';

export interface ClaimLeadData {
  lead: Record<string, unknown>;
  partnerId: string;
}

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

/**
 * @title Claim lead — commit moment for Buy Prospect.
 *
 * Contact stays masked until the claim lands (no free harvesting from the
 * pool); success reveals the full phone/email with a deep link into My
 * pipeline. Rules are stated up front: exclusive move, 7-day return.
 */
@Component({
  selector: 'async-claim-lead-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Own instance: dialogs resolve outside the opener's injector, and this
  // service is a stateless HTTP wrapper (no shared state to preserve).
  providers: [ProspectService],
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <h2 mat-dialog-title>Claim this lead?</h2>
    <div mat-dialog-content class="claim-body">
      <p class="lead-name">{{ fullName() }}</p>
      <div class="chip-row">
        @if (state()) {
          <span class="dp-status dp-status--info">{{ state() }}</span>
        }
        @if (isHot()) {
          <span class="dp-status dp-status--bad">Hot · &lt;48h</span>
        } @else if (isNew()) {
          <span class="dp-status dp-status--warn">New</span>
        }
        @if (hasEmail()) {
          <span class="dp-status dp-status--ok">Email on file</span>
        }
      </div>
      <p class="muted">{{ age() }} old · source {{ source() }}</p>

      @if (!done() && !failed()) {
        <ul class="rules">
          <li>Moves to <strong>My pipeline</strong> and leaves the pool — others can't claim it.</li>
          <li>Work it within <strong>7 days</strong>, or return it from the pipeline for others.</li>
          <li>Full contact unlocks on claim.</li>
        </ul>
      }

      @if (sending()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (failed(); as err) {
        <p class="error" role="alert">{{ err }}</p>
      }
      @if (done()) {
        <div class="reveal" role="status">
          <p><mat-icon>check_circle</mat-icon> Claimed — {{ fullName() }} is in your pipeline.</p>
          <p><strong>{{ phone() }}</strong></p>
          @if (email()) {
            <p>{{ email() }}</p>
          }
        </div>
      }
    </div>
    <div mat-dialog-actions align="end">
      @if (done()) {
        <a mat-flat-button color="primary" routerLink="/dashboard/prospects/pipeline" (click)="close(true)">Open in My pipeline</a>
        <button mat-button (click)="close(true)">Close</button>
      } @else {
        <button mat-button mat-dialog-close [disabled]="sending()">Cancel</button>
        <button mat-flat-button color="primary" (click)="confirm()" [disabled]="sending()">Yes, claim it</button>
      }
    </div>
  `,
  styles: [`
    .claim-body { display: flex; flex-direction: column; gap: 0.6em; min-width: min(420px, 80vw); }
    .lead-name { font-size: 1.2em; font-weight: 700; margin: 0; }
    .chip-row { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .muted { color: var(--dp-muted); font-size: 0.85em; margin: 0; }
    .rules { margin: 0; padding-left: 1.2em; display: flex; flex-direction: column; gap: 0.3em; }
    .error { color: var(--dp-error); }
    .reveal { border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.8em; }
    .reveal p { margin: 0.2em 0; display: flex; align-items: center; gap: 0.4em; }
    button, a[mat-flat-button], a[mat-button] { min-height: 44px; }
  `],
})
export class ClaimLeadDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ClaimLeadDialogComponent>);
  private readonly data = inject<ClaimLeadData>(MAT_DIALOG_DATA);
  private readonly prospects = inject(ProspectService);

  protected readonly sending = signal(false);
  protected readonly done = signal(false);
  protected readonly failed = signal<string | null>(null);

  private get lead(): Record<string, unknown> {
    return (this.data.lead ?? {}) as Record<string, unknown>;
  }

  protected fullName(): string {
    return `${str(this.lead['name'])} ${str(this.lead['surname'])}`.trim() || 'Unnamed lead';
  }

  protected state(): string {
    return str(this.lead['state']);
  }

  protected source(): string {
    return str(this.lead['source'] ?? this.lead['prospectSource'] ?? 'Survey');
  }

  protected phone(): string {
    return str(this.lead['phoneNumber'] ?? this.lead['prospectPhone']);
  }

  protected email(): string {
    return str(this.lead['email'] ?? this.lead['prospectEmail']);
  }

  protected hasEmail(): boolean {
    return this.email().includes('@');
  }

  protected ageMs(): number {
    const t = new Date(str(this.lead['createdAt'])).getTime();
    return Number.isFinite(t) ? Date.now() - t : NaN;
  }

  protected isHot(): boolean {
    return Number.isFinite(this.ageMs()) && this.ageMs() < 48 * 3600000;
  }

  protected isNew(): boolean {
    return Number.isFinite(this.ageMs()) && this.ageMs() < 7 * 86400000;
  }

  protected age(): string {
    if (!Number.isFinite(this.ageMs()) || this.ageMs() < 0) return 'Fresh';
    const h = Math.floor(this.ageMs() / 3600000);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  protected close(result: boolean): void {
    this.dialogRef.close(result);
  }

  protected confirm(): void {
    if (this.sending() || this.done()) return;
    this.sending.set(true);
    this.failed.set(null);
    this.dialogRef.disableClose = true;
    this.prospects.importSingle({
      partnerId: this.data.partnerId,
      prospectId: str(this.lead['_id']),
      source: 'website',
    }).subscribe({
      next: () => {
        this.sending.set(false);
        this.done.set(true);
        this.dialogRef.disableClose = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.sending.set(false);
        this.dialogRef.disableClose = false;
        this.failed.set(err?.error?.message ?? 'Server error occurred, please try again.');
      },
    });
  }
}
