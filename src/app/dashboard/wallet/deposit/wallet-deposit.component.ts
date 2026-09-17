import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../../core/wallet/wallet.service';
import { ApiError } from '../../../core/http/api-error';

const PRESETS = [1000, 2500, 5000, 10000, 25000];
const MIN_NGN = 100;
const MAX_NGN = 1000000;

/**
 * @title Deposit funds — Opay cashier top-up.
 *
 * Amount is validated here for UX and re-validated server-side (the only
 * number Opay ever sees comes from the backend in kobo). Success hands
 * the member to the Opay cashier page in the same tab; the return landing
 * confirms the credit. OnPush + signals, mobile-first.
 */
@Component({
  selector: 'async-wallet-deposit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a routerLink="/dashboard/wallet">Wallet</a> &gt;
        <span>Deposit</span>
      </div>
    </section>

    <section class="deposit-page">
      <div class="page-head">
        <div>
          <h2>Deposit funds</h2>
          <p class="subtitle">Top up with card, transfer or USSD through Opay — credit lands on confirmation.</p>
        </div>
      </div>

      <div class="dp-card deposit-card">
        <h3>How much?</h3>
        <div class="presets" role="group" aria-label="Quick amounts">
          @for (p of presets; track p) {
            <button mat-button [class.active]="amount() === p" (click)="amount.set(p)">₦{{ p | number }}</button>
          }
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Custom amount (₦)</mat-label>
          <input matInput type="number" [value]="amount()" (input)="amount.set($any($event.target).valueAsNumber)" [min]="min" [max]="max" step="100" />
          <mat-hint>Between ₦{{ min | number }} and ₦{{ max | number }}</mat-hint>
        </mat-form-field>
        @if (formError(); as ferr) {
          <p class="error" role="alert">{{ ferr }}</p>
        }
        @if (error(); as err) {
          <p class="error" role="alert">
            {{ err }}
          </p>
        }
        @if (starting()) {
          <mat-progress-bar mode="indeterminate" />
        }
        <button mat-flat-button color="primary" (click)="start()" [disabled]="!valid() || starting()">
          {{ starting() ? 'Opening checkout…' : 'Continue to Opay · ₦' + ((amount() || 0) | number) }}
        </button>
        <p class="muted">You leave Diamond Project for Opay's secure checkout and return automatically after paying.</p>
      </div>
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .deposit-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .deposit-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; max-width: 560px; }
    .deposit-card h3 { margin: 0; }
    .presets { display: flex; gap: 0.5em; flex-wrap: wrap; }
    .presets button.active { border: 1px solid var(--dp-gold); font-weight: 700; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    button { min-height: 44px; }
  `],
})
export class WalletDepositComponent {
  private readonly wallet = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly presets = PRESETS;
  protected readonly min = MIN_NGN;
  protected readonly max = MAX_NGN;
  protected readonly amount = signal<number>(2500);
  protected readonly starting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected valid(): boolean {
    const a = Number(this.amount());
    return Number.isFinite(a) && a >= MIN_NGN && a <= MAX_NGN;
  }

  protected formError(): string | null {
    const a = Number(this.amount());
    if (!Number.isFinite(a)) return 'Enter an amount.';
    if (a < MIN_NGN) return `Minimum deposit is ₦${MIN_NGN.toLocaleString()}.`;
    if (a > MAX_NGN) return `Maximum deposit is ₦${MAX_NGN.toLocaleString()}.`;
    return null;
  }

  protected start(): void {
    if (!this.valid() || this.starting()) return;
    this.starting.set(true);
    this.error.set(null);
    this.wallet
      .initDeposit(Number(this.amount()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const url = res.data?.cashierUrl;
          if (!url) {
            this.starting.set(false);
            this.error.set('Checkout did not open — try again.');
            return;
          }
          window.location.href = url;
        },
        error: (err: ApiError) => {
          this.starting.set(false);
          this.error.set(err.message);
        },
      });
  }
}
