import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ManualAccount, ManualClaimRow, WalletService } from '../../../core/wallet/wallet.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiError, userError } from '../../../core/http/api-error';

const MIN_NGN = 100;
const MAX_NGN = 1000000;

/**
 * @title Bank-transfer deposit — pay first, claim after.
 *
 * Step 1 shows the business receiving accounts (copy buttons, no typing).
 * Step 2 files a details-only claim (amount, destination, sender, date,
 * bank reference). An admin confirms against the statement and the wallet
 * is credited; the member tracks every claim below. OnPush + signals.
 */
@Component({
  selector: 'async-manual-deposit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule, MatProgressBarModule, MatSelectModule, NgClass, RouterModule],
  template: `
    <div class="dp-card manual-card">
      <h3>Step 1 · Send the money</h3>
      <p class="muted">Transfer to any account below from your bank app or USSD, then continue to step 2.</p>
      @for (a of accounts(); track a.number) {
        <div class="account">
          <div>
            <strong>{{ a.bank }} · {{ a.number }}</strong>
            <span class="muted">{{ a.name }}</span>
          </div>
          <button mat-button (click)="copy(a.number)"><mat-icon>content_copy</mat-icon> {{ copied() === a.number ? 'Copied!' : 'Copy' }}</button>
        </div>
      }
    </div>

    <div class="dp-card manual-card">
      <h3>Step 2 · Send your transfer details</h3>
      <mat-form-field appearance="outline">
        <mat-label>Amount you sent (₦)</mat-label>
        <input matInput type="number" [(ngModel)]="amount" [min]="min" [max]="max" step="100" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Account you paid into</mat-label>
        <mat-select [(ngModel)]="destination">
          @for (a of accounts(); track a.number) {
            <mat-option [value]="a.number">{{ a.bank }} · {{ a.number }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Sender name (on the transfer)</mat-label>
        <input matInput [(ngModel)]="senderName" maxlength="120" />
        <mat-hint>Pre-filled with your profile name — change it if someone else sent for you</mat-hint>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Account number you sent from</mat-label>
        <input matInput inputmode="numeric" [(ngModel)]="senderAccount" maxlength="20" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Date of transfer</mat-label>
        <input matInput [matDatepicker]="paidPicker" [(ngModel)]="paidAt" [max]="today" />
        <mat-datepicker-toggle matSuffix [for]="paidPicker" />
        <mat-datepicker #paidPicker />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Bank reference / session ID</mat-label>
        <input matInput [(ngModel)]="bankReference" maxlength="64" />
        <mat-hint>The reference on your debit alert or receipt</mat-hint>
      </mat-form-field>
      @if (formError(); as ferr) {
        <p class="error" role="alert">{{ ferr }}</p>
      }
      @if (error(); as err) {
        <p class="error" role="alert">{{ err }}</p>
      }
      @if (sending()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (lastReference(); as ref) {
        <p class="ok" role="status">Details received — reference {{ ref }}. We credit your wallet after confirmation.</p>
      }
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="!valid() || sending()">
        {{ sending() ? 'Sending…' : 'Send transfer details' }}
      </button>
    </div>

    <div class="dp-card manual-card">
      <h3>My transfer claims</h3>
      @if (loadingClaims()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (claims().length === 0) {
        <p class="muted">No claims yet — they appear here once you send transfer details.</p>
      } @else {
        @for (c of claims(); track c.reference) {
          <div class="claim">
            <div>
              <strong>₦{{ c.amountNgn | number }}</strong>
              <span class="dp-status" [ngClass]="toneClass(c.status)">{{ label(c.status) }}</span>
              <div class="muted small">{{ c.reference }} · {{ c.createdAt | date:'medium' }}</div>
              @if (c.decisionNote) {
                <div class="muted small">Note: {{ c.decisionNote }}</div>
              }
            </div>
            <a mat-button [routerLink]="['/dashboard/wallet/history']">History</a>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .manual-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; max-width: 560px; margin-bottom: 1em; }
    .manual-card h3 { margin: 0; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .muted.small { font-size: 0.8em; }
    .account, .claim { display: flex; align-items: center; justify-content: space-between; gap: 0.5em; border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.6em 0.8em; flex-wrap: wrap; }
    .account strong { display: block; font-size: 1.05em; letter-spacing: 0.02em; }
    .error { color: var(--dp-error); }
    .ok { color: var(--dp-success); }
    button { min-height: 44px; }
  `],
})
export class ManualDepositComponent implements OnInit {
  private readonly wallet = inject(WalletService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly accounts = input.required<ManualAccount[]>();

  protected readonly min = MIN_NGN;
  protected readonly max = MAX_NGN;
  protected readonly today = new Date();
  protected amount: number | null = 2500;
  protected destination = '';
  protected senderName = '';
  protected senderAccount = '';
  protected paidAt: Date | null = new Date();
  protected bankReference = '';
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly lastReference = signal<string | null>(null);
  protected readonly claims = signal<ManualClaimRow[]>([]);
  protected readonly loadingClaims = signal(true);
  protected copied = signal<string | null>(null);

  ngOnInit(): void {
    const first = this.accounts()?.[0]?.number;
    if (first) this.destination = first;
    // The profile owner is the sender in the overwhelmingly common case —
    // pre-fill, still editable for the "someone paid for me" exception.
    if (!this.senderName.trim()) {
      const me = this.auth.currentUser();
      const full = [me?.name, me?.surname].filter(Boolean).join(' ').trim();
      if (full) this.senderName = full;
    }
    this.reloadClaims();
  }

  protected copy(text: string): void {
    navigator.clipboard?.writeText(text).catch(() => null);
    this.copied.set(text);
    setTimeout(() => this.copied.set(null), 2000);
  }

  protected validDate(): boolean {
    return this.paidAt instanceof Date && !Number.isNaN(this.paidAt.getTime());
  }

  /** Local YYYY-MM-DD (no UTC shift — the date the member picked). */
  protected paidAtIso(): string {
    const d = this.paidAt as Date;
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  protected valid(): boolean {
    const a = Number(this.amount);
    return Number.isFinite(a) && a >= MIN_NGN && a <= MAX_NGN
      && !!this.destination
      && this.senderName.trim().length >= 2
      && this.senderAccount.replace(/\D/g, '').length >= 10
      && this.validDate()
      && this.bankReference.trim().length >= 4;
  }

  protected formError(): string | null {
    const a = Number(this.amount);
    if (!Number.isFinite(a)) return 'Enter the amount you sent.';
    if (a < MIN_NGN || a > MAX_NGN) return `Amount must be between ₦${MIN_NGN.toLocaleString()} and ₦${MAX_NGN.toLocaleString()}.`;
    if (!this.destination) return 'Choose the account you paid into.';
    if (this.senderName.trim().length < 2) return 'Enter the sender name on the transfer.';
    if (this.senderAccount.replace(/\D/g, '').length < 10) return 'Enter the account number you sent from.';
    if (!this.validDate()) return 'Pick the transfer date from the calendar.';
    if (this.bankReference.trim().length < 4) return 'Enter the bank reference / session ID.';
    return null;
  }

  protected submit(): void {
    if (!this.valid() || this.sending()) return;
    this.sending.set(true);
    this.error.set(null);
    this.wallet
      .submitManualDeposit({
        amountNgn: Number(this.amount),
        destinationAccount: this.destination,
        senderName: this.senderName.trim(),
        senderAccount: this.senderAccount.replace(/\D/g, ''),
        paidAt: this.paidAtIso(),
        bankReference: this.bankReference.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sending.set(false);
          this.lastReference.set(res.data?.reference ?? null);
          this.reloadClaims();
        },
        error: (err: ApiError) => {
          this.sending.set(false);
          this.error.set(userError(err));
        },
      });
  }

  protected reloadClaims(): void {
    this.loadingClaims.set(true);
    this.wallet
      .myManualClaims()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.claims.set(res.data ?? []);
          this.loadingClaims.set(false);
        },
        error: () => this.loadingClaims.set(false),
      });
  }

  protected toneClass(status: string): string {
    if (status === 'approved') return 'dp-status--ok';
    if (status === 'rejected') return 'dp-status--bad';
    return 'dp-status--warn';
  }

  protected label(status: string): string {
    if (status === 'awaiting-review') return 'Awaiting confirmation';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
