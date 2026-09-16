import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../core/auth/auth.models';

export interface BroadcastRow {
  id: string;
  title: string;
  body: string;
  link: string | null;
  priority: 'high' | 'medium';
  createdBy: string | null;
  recipientCount: number;
  capped: boolean;
  createdAt: string | null;
}

export interface BroadcastListEnvelope extends ApiEnvelope<{ items: BroadcastRow[]; total: number; limit: number; skip: number }> {
  data: { items: BroadcastRow[]; total: number; limit: number; skip: number };
}

export interface BroadcastResult {
  id: string;
  delivered: number;
  failed: number;
  capped: boolean;
  total: number;
}

/** Platform broadcast → `/v1/admin/broadcast/*` (role-gated server-side). */
@Injectable({ providedIn: 'root' })
export class AdminBroadcastService {
  private readonly api = inject(ApiClient);

  history(params: { limit?: number; skip?: number } = {}): Observable<BroadcastListEnvelope> {
    const query = new URLSearchParams({
      limit: String(params.limit ?? 25),
      skip: String(params.skip ?? 0),
    });
    return this.api.get<BroadcastListEnvelope>(`v1/admin/broadcast?${query.toString()}`);
  }

  send(payload: { title: string; body: string; link?: string; priority?: 'high' | 'medium' }): Observable<ApiEnvelope<BroadcastResult>> {
    return this.api.post<ApiEnvelope<BroadcastResult>>('v1/admin/broadcast', payload);
  }
}
