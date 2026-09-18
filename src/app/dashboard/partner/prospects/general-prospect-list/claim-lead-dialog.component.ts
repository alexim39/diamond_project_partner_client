import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ProspectService } from '../prospects.service';
import { ApiError, userError } from '../../../../core/http/api-error';

export interface ClaimLeadData {
  lead: Record<string, unknown>;
  partnerId: string;
  partnerState?: string;
  walletBalance?: number;
}

export const CLAIM_FEE_NGN = 250;
export const CLAIM_REFUND_NGN = 120;

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

interface SignalRow {
  icon: string;
  label: string;
  value: string;
}

/**
 * @title Claim lead — the decision card for Buy Prospect.
 *
 * Everything a partner needs to say yes or no at a glance: who and where
 * (with a "near you" match against their own state), why the lead looks
 * promising (intent signals straight from the survey answers), profile
 * completeness, and freshness. Contact stays masked until the claim lands
 * (no free harvesting); success reveals it with a pipeline deep link.
 */
@Component({
  selector: 'async-claim-lead-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Own instance: dialogs resolve outside the opener's injector, and this
  // service is a stateless HTTP wrapper (no shared state to preserve).
  providers: [ProspectService],
  imports: [DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <h2 mat-dialog-title>Claim this lead?</h2>
    <div mat-dialog-content class="claim-body">
      <div class="hero">
        <span class="avatar" aria-hidden="true">{{ initials() }}</span>
        <div class="hero-text">
          <p class="lead-name">{{ fullName() }}</p>
          <div class="chip-row">
            @if (state()) {
              <span class="dp-status dp-status--info">{{ state() }}</span>
            }
            @if (nearYou()) {
              <span class="dp-status dp-status--ok">Near you</span>
            }
            @if (isHot()) {
              <span class="dp-status dp-status--bad">Hot · &lt;48h</span>
            } @else if (isNew()) {
              <span class="dp-status dp-status--warn">New</span>
            }
          </div>
          <p class="muted">{{ age() }} old · source {{ source() }}</p>
        </div>
      </div>

      <div class="panel">
        <h3>Why this lead</h3>
        @if (intentVerdict(); as verdict) {
          <p class="verdict"><mat-icon>bolt</mat-icon> {{ verdict }}</p>
        }
        @for (row of signals(); track row.label) {
          <div class="signal">
            <mat-icon>{{ row.icon }}</mat-icon>
            <span class="muted">{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        }
      </div>

      <div class="panel">
        <h3>Profile completeness · {{ completeness() }}%</h3>
        <mat-progress-bar mode="determinate" [value]="completeness()" />
        <div class="chip-row">
          <span class="dp-status" [class]="hasFullName() ? 'dp-status--ok' : 'dp-status--neutral'">Name</span>
          <span class="dp-status" [class]="hasPhone() ? 'dp-status--ok' : 'dp-status--neutral'">Phone</span>
          <span class="dp-status" [class]="hasEmail() ? 'dp-status--ok' : 'dp-status--neutral'">Email</span>
        </div>
      </div>

      <button mat-button class="answers-toggle" (click)="showAnswers.set(!showAnswers())">
        {{ showAnswers() ? 'Hide all survey answers' : 'See all survey answers' }}
        <mat-icon>{{ showAnswers() ? 'expand_less' : 'expand_more' }}</mat-icon>
      </button>
      @if (showAnswers()) {
        <div class="panel answers">
          @for (row of allAnswers(); track row.label) {
            <div class="signal">
              <span class="muted">{{ row.label }}</span>
              <strong>{{ row.value }}</strong>
            </div>
          }
        </div>
      }

      @if (!done() && !failed()) {
        <div class="fee panel" role="status">
          <div class="signal">
            <mat-icon>payments</mat-icon>
            <span class="muted">Claim fee</span>
            <strong>₦{{ fee() | number }}</strong>
          </div>
          <p class="muted">₦{{ refund() | number }} back if you return it within 7 days · wallet ₦{{ balance() | number }}</p>
        </div>
        @if (!canAfford()) {
          <p class="error" role="alert">
            Insufficient wallet balance.
            <a mat-button routerLink="/dashboard/wallet/deposit" (click)="close(false)">Fund wallet</a>
          </p>
        }
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
        <button mat-button mat-dialog-close [disabled]="sending()">Not now</button>
        <button mat-flat-button color="primary" (click)="confirm()" [disabled]="sending() || !canAfford()">Yes, claim it · ₦{{ fee() | number }}</button>
      }
    </div>
  `,
  styles: [`
    .claim-body { display: flex; flex-direction: column; gap: 0.8em; min-width: min(440px, 82vw); }
    .hero { display: flex; gap: 0.8em; align-items: center; }
    .avatar {
      flex: 0 0 auto; width: 52px; height: 52px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.2em; color: #fff;
      background: linear-gradient(135deg, var(--dp-gold), #6b4e12);
    }
    .hero-text { display: flex; flex-direction: column; gap: 0.3em; min-width: 0; }
    .lead-name { font-size: 1.2em; font-weight: 700; margin: 0; }
    .chip-row { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .muted { color: var(--dp-muted); font-size: 0.85em; margin: 0; }
    .panel { border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.7em 0.8em; display: flex; flex-direction: column; gap: 0.45em; }
    .panel h3 { margin: 0; font-size: 0.78em; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dp-gold-ink); }
    .verdict { display: flex; align-items: center; gap: 0.4em; font-weight: 700; margin: 0; color: var(--dp-gold-ink); }
    .verdict mat-icon { color: var(--dp-gold); }
    .signal { display: flex; align-items: center; gap: 0.5em; }
    .signal mat-icon { color: var(--dp-muted); font-size: 20px; height: 20px; width: 20px; }
    .signal strong { margin-left: auto; text-align: right; font-weight: 600; }
    .answers-toggle { align-self: flex-start; }
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
  protected readonly showAnswers = signal(false);

  private get lead(): Record<string, unknown> {
    return (this.data.lead ?? {}) as Record<string, unknown>;
  }

  protected fullName(): string {
    return `${str(this.lead['name'])} ${str(this.lead['surname'])}`.trim() || 'Unnamed lead';
  }

  protected initials(): string {
    const parts = `${str(this.lead['name'])} ${str(this.lead['surname'])}`.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  protected state(): string {
    return str(this.lead['state']);
  }

  protected nearYou(): boolean {
    const mine = str(this.data.partnerState).trim().toLowerCase();
    const theirs = this.state().trim().toLowerCase();
    return !!mine && !!theirs && mine === theirs;
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

  protected hasFullName(): boolean {
    return !!str(this.lead['name']).trim() && !!str(this.lead['surname']).trim();
  }

  protected hasPhone(): boolean {
    return this.phone().replace(/\D/g, '').length >= 7;
  }

  protected hasEmail(): boolean {
    return this.email().includes('@');
  }

  protected completeness(): number {
    const bits = [this.hasFullName(), this.hasPhone(), this.hasEmail()];
    return Math.round((bits.filter(Boolean).length / bits.length) * 100);
  }

  protected signals(): SignalRow[] {
    const get = (...keys: string[]): string => {
      for (const k of keys) {
        const v = str(this.lead[k]).trim();
        if (v) return v;
      }
      return '';
    };
    const rows: SignalRow[] = [
      { icon: 'trending_up', label: 'Passive income matters', value: get('importanceOfPassiveIncome') },
      { icon: 'schedule', label: 'Time to dedicate', value: get('onlineBusinessTimeDedication') },
      { icon: 'devices', label: 'Tech comfort', value: get('comfortWithTech') },
      { icon: 'work', label: 'Employment', value: get('employedStatus') },
    ];
    return rows.filter((r) => !!r.value);
  }

  protected intentVerdict(): string | null {
    const hay = `${str(this.lead['importanceOfPassiveIncome'])} ${str(this.lead['primaryOnlineBusinessMotivation'])}`.toLowerCase();
    if (!hay.trim()) return null;
    if (/(very|extremely|highly|desperate|must)/.test(hay)) return 'High intent — this lead says it matters a lot';
    if (/(somewhat|moderate|interested|curious|open)/.test(hay)) return 'Warm — showing real interest';
    return null;
  }

  protected allAnswers(): SignalRow[] {
    const pick = (label: string, ...keys: string[]): SignalRow | null => {
      for (const k of keys) {
        const raw = this.lead[k];
        const v = Array.isArray(raw) ? raw.map((x) => str(x)).filter(Boolean).join(', ') : str(raw).trim();
        if (v) return { icon: '', label, value: v };
      }
      return null;
    };
    return [
      pick('Age range', 'ageRange'),
      pick('Hangs out on', 'socialMedia'),
      pick('Employment', 'employedStatus'),
      pick('Passive income matters', 'importanceOfPassiveIncome'),
      pick('Buys online', 'onlinePurchaseSchedule'),
      pick('Motivation', 'primaryOnlineBusinessMotivation'),
      pick('Tech comfort', 'comfortWithTech'),
      pick('Time to dedicate', 'onlineBusinessTimeDedication'),
      pick('Referral', 'referral', 'referralCode'),
      pick('Country', 'country'),
    ].filter((r): r is SignalRow => !!r);
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

  protected fee(): number {
    return CLAIM_FEE_NGN;
  }

  protected refund(): number {
    return CLAIM_REFUND_NGN;
  }

  protected balance(): number {
    const b = Number(this.data.walletBalance);
    return Number.isFinite(b) ? b : 0;
  }

  protected canAfford(): boolean {
    return this.balance() >= CLAIM_FEE_NGN;
  }

  protected confirm(): void {
    if (this.sending() || this.done() || !this.canAfford()) return;
    this.sending.set(true);
    this.failed.set(null);
    this.dialogRef.disableClose = true;
    this.prospects.claimLead(str(this.lead['_id'])).subscribe({
      next: () => {
        this.sending.set(false);
        this.done.set(true);
        this.dialogRef.disableClose = false;
      },
      error: (err: ApiError) => {
        this.sending.set(false);
        this.dialogRef.disableClose = false;
        this.failed.set(userError(err));
      },
    });
  }
}
