import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { DepositMethod, WalletService } from '../../../core/wallet/wallet.service';
import { ManualDepositComponent } from './manual-deposit.component';
import { ApiError } from '../../../core/http/api-error';

const PRESETS = [1000, 2500, 5000, 10000, 25000];
const MIN_NGN = 100;
const MAX_NGN = 1000000;

/**
 * @title Deposit funds — method switcher.
 *
 * The page renders whatever `GET deposit/methods` lists, so a future
 * gateway (Paystack…) needs only a backend registry entry plus one
 * section here — no redesign. Opay = instant checkout handoff; bank
 * transfer = pay-first manual claim confirmed by an admin.
 */
@Component({
  selector: 'async-wallet-deposit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, ManualDepositComponent, RouterModule],
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
          <p class="subtitle">Instant checkout or bank transfer — pick whichever suits you.</p>
        </div>
      </div>

      @if (loadingMethods()) {
        <mat-progress-bar mode="indeterminate" />
      }
      <div class="methods" role="group" aria-label="Deposit method">
        @for (m of methods(); track m.id) {
          <button mat-button [class.active]="method() === m.id" [disabled]="!m.enabled" (click)="method.set(m.id)">{{ m.label }}</button>
        }
      </div>
      @if (opayDisabled()) {
        <p class="error" role="alert">Instant checkout is unavailable right now — please use bank transfer.</p>
      }

      @if (method() === 'manual' && manualMethod(); as manual) {
        <async-manual-deposit [accounts]="manual.accounts ?? []" />
      } @else {
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
      }
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
    .methods { display: flex; gap: 0.5em; flex-wrap: wrap; }
    .methods button.active { border: 1px solid var(--dp-gold); font-weight: 700; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    button { min-height: 44px; }
  `],
})
export class WalletDepositComponent implements OnInit {
  private readonly wallet = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly presets = PRESETS;
  protected readonly min = MIN_NGN;
  protected readonly max = MAX_NGN;
  protected readonly amount = signal<number>(2500);
  protected readonly starting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly methods = signal<DepositMethod[]>([]);
  protected readonly method = signal<string>('opay');
  protected readonly loadingMethods = signal(true);

  ngOnInit(): void {
    this.wallet
      .depositMethods()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const list = (res.data ?? []).filter((m) => m && m.id);
          this.methods.set(list);
          // Default to the first enabled method; keep Opay first when live.
          const first = list.find((m) => m.enabled) ?? list[0];
          if (first) this.method.set(first.id);
          this.loadingMethods.set(false);
        },
        error: () => {
          // Registry unreachable — fall back to the Opay form alone.
          this.methods.set([{ id: 'opay', kind: 'gateway', label: 'Pay with Opay', detail: '', enabled: true }]);
          this.method.set('opay');
          this.loadingMethods.set(false);
        },
      });
  }

  protected manualMethod(): DepositMethod | null {
    return this.methods().find((m) => m.id === 'manual') ?? null;
  }

  protected opayDisabled(): boolean {
    const opay = this.methods().find((m) => m.id === 'opay');
    return !!opay && !opay.enabled && this.method() === 'opay';
  }

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
