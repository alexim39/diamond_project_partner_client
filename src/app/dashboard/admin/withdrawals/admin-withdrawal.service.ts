import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../_common/services/api.service';

export interface WithdrawalRow {
  _id: string;
  partnerId: string;
  amount: number;
  reference: string;
  status: string;
  bank?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  date: string;
  owner: { username: string; name: string } | null;
}

/** Admin withdrawals queue → legacy `/billing/withdrawals/*` (role-gated). */
@Injectable({ providedIn: 'root' })
export class AdminWithdrawalService {
  constructor(private apiService: ApiService) {}

  queue(status = 'Pending', skip = 0, limit = 50): Observable<{ data: WithdrawalRow[]; meta: { total: number } }> {
    return this.apiService.get<any>(
      `billing/withdrawals?status=${encodeURIComponent(status)}&skip=${skip}&limit=${limit}`,
      undefined, undefined, true,
    );
  }

  decide(id: string, status: 'Paid' | 'Rejected', opts: { reference?: string; reason?: string } = {}): Observable<any> {
    return this.apiService.patch<any>(`billing/withdrawals/${id}`, { status, ...opts }, undefined, true);
  }
}
