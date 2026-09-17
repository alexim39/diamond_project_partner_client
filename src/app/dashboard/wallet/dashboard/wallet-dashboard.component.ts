import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { WalletService } from '../../../core/wallet/wallet.service';
import { ApiError } from '../../../core/http/api-error';

/** External commission home — earnings live there now, D3P tracks spending. */
export const DTC_URL = 'https://ec5.empoweredconsumerism.com/index.html#/sign-in-ec';

/**
 * @title Wallet dashboard — balance, flows and doors.
 *
 * Read-only over existing records: live `partner.balance` carried forward
 * as the wallet balance, in/out summed from transaction history. Deposits
 * land in Slice 2 (Opay); until then no money moves from this page.
 * OnPush + signals, token-blind dark shells, mobile-first grid.
 */
@Component({
  selector: 'async-wallet-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Wallet</span>
      </div>
    </section>

    <section class="wallet-page">
      <div class="page-head">
        <div>
          <h2>Wallet & Marketplace</h2>
          <p class="subtitle">Spend on growth, track every naira. Commissions live on the DTC platform now.</p>
        </div>
        <div class="head-actions">
          <a mat-flat-button color="primary" [href]="dtcUrl" target="_blank" rel="noopener">
            <mat-icon>open_in_new</mat-icon> DTC link
          </a>
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

      <div class="kpi-grid">
        <mat-card class="kpi kpi--hero">
          <mat-card-content>
            <mat-icon>account_balance_wallet</mat-icon>
            <span class="kpi-value">₦{{ balance() | number:'1.0-2' }}</span>
            <span class="kpi-label">Wallet balance</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi">
          <mat-card-content>
            <mat-icon>arrow_downward</mat-icon>
            <span class="kpi-value">₦{{ moneyIn() | number:'1.0-2' }}</span>
            <span class="kpi-label">Money in</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi">
          <mat-card-content>
            <mat-icon>arrow_upward</mat-icon>
            <span class="kpi-value">₦{{ moneyOut() | number:'1.0-2' }}</span>
            <span class="kpi-label">Money out</span>
          </mat-card-content>
        </mat-card>
        <mat-card class="kpi">
          <mat-card-content>
            <mat-icon>receipt_long</mat-icon>
            <span class="kpi-value">{{ txCount() | number }}</span>
            <span class="kpi-label">Transactions</span>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dp-card actions-card">
        <h3>Quick actions</h3>
        <div class="actions-row">
          <a mat-button routerLink="/dashboard/products/eshop"><mat-icon>shopping_bag</mat-icon> Buy products</a>
          <a mat-button routerLink="/dashboard/products/order-history"><mat-icon>package_2</mat-icon> View orders</a>
          <a mat-button routerLink="/dashboard/wallet/history"><mat-icon>history</mat-icon> Full history</a>
          <a mat-button [href]="dtcUrl" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon> My commissions</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .wallet-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .head-actions a { text-decoration: none; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75em; }
    .kpi mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .kpi mat-icon { color: var(--dp-gold); }
    .kpi--hero { border-color: var(--dp-gold); }
    .kpi-value { font-size: 1.5em; font-weight: 700; }
    .kpi-label { color: var(--dp-muted); font-size: 0.85em; }
    .actions-card { padding: 1em; }
    .actions-card h3 { margin: 0 0 0.5em; }
    .actions-row { display: flex; gap: 0.5em; flex-wrap: wrap; }
    .actions-row a { text-decoration: none; min-height: 44px; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    button, a[mat-button], a[mat-flat-button] { min-height: 44px; }
  `],
})
export class WalletDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly wallet = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dtcUrl = DTC_URL;
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly inOut = signal<{ in: number; out: number; count: number }>({ in: 0, out: 0, count: 0 });

  protected readonly balance = computed(() => Number(this.auth.currentUser()?.['balance'] ?? 0));
  protected readonly moneyIn = computed(() => this.inOut().in);
  protected readonly moneyOut = computed(() => this.inOut().out);
  protected readonly txCount = computed(() => this.inOut().count);

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      me: this.auth.me().pipe(catchError(() => of(null))),
      txs: this.wallet.history().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ txs }) => {
          // Credit-family types flow in, everything else flows out.
          // Unknown writers default to out — balances stay conservative.
          let credit = 0;
          let debit = 0;
          for (const t of txs ?? []) {
            const amt = Math.abs(Number(t.amount) || 0);
            if (amt === 0) continue;
            if (/credit|deposit|refund|fund|release/i.test(`${t.type}`)) credit += amt;
            else debit += amt;
          }
          this.inOut.set({ in: credit, out: debit, count: (txs ?? []).length });
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}
