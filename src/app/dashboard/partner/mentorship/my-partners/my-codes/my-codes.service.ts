import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../../../core/auth/auth.models';

export interface MyCodeRow {
  id: string;
  code: string;
  status: string;
  prospectId: string | null;
  prospect: { name: string; phone: string } | null;
  createdAt: string | null;
}

export interface MyCodesEnvelope extends ApiEnvelope<{ items: MyCodeRow[]; total: number }> {
  data: { items: MyCodeRow[]; total: number };
}

/** Partner's own recorded codes → `/v1/reservations/mine*` (session-owned). */
@Injectable({ providedIn: 'root' })
export class MyCodesService {
  private readonly api = inject(ApiClient);

  list(status?: string): Observable<MyCodesEnvelope> {
    const query = new URLSearchParams({ limit: '100' });
    if (status && status !== 'All') query.set('status', status);
    return this.api.get<MyCodesEnvelope>(`v1/reservations/mine?${query.toString()}`);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`v1/reservations/mine/${id}`);
  }
}
