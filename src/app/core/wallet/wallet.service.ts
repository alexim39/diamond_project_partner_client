import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { WalletHistoryEnvelope, WalletTransaction } from './wallet.models';
import { AuthService } from '../auth/auth.service';

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

/**
 * Wallet data access — reads the partner's own money records.
 * Balance is the live `partner.balance` (carried forward as the wallet
 * balance); history reads legacy transaction rows (normalized — writers
 * vary). Session-owned: callers pass nothing identity-bearing.
 */
@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthService);

  /** Current session user id (null until `me()` hydrates). */
  ownerId(): string | null {
    return (this.auth.currentUser()?.id as string | undefined) ?? null;
  }

  history(): Observable<WalletTransaction[]> {
    const id = this.ownerId() ?? '';
    return this.api
      .get<WalletHistoryEnvelope>(`billing/transaction/${id}`)
      .pipe(map((res) => ((res.data ?? []) as unknown[]).map((r) => this.shape(r))));
  }

  private shape(r: unknown): WalletTransaction {
    const o = (r ?? {}) as Record<string, unknown>;
    const at = o['createdAt'] ?? o['date'] ?? o['dateOfPayment'] ?? null;
    return {
      id: str(o['_id'] ?? o['id']),
      amount: num(o['amount']),
      reference: str(o['reference']),
      status: str(o['status'] ?? o['paymentStatus'] ?? 'unknown') || 'unknown',
      method: str(o['paymentMethod'] ?? o['method'] ?? '—') || '—',
      type: str(o['transactionType'] ?? o['type'] ?? '—') || '—',
      at: at ? new Date(at as string | number | Date).toISOString() : null,
    };
  }
}
