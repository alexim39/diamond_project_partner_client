import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../core/auth/auth.models';

export interface AdminLead {
  id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  state: string;
  status: string;
  source: string;
  createdAt: string | null;
  claimCount: number;
  ratingAvg: number | null;
  ratingCount: number;
  answers: Record<string, string | string[]>;
}

export interface AdminLeadSummary {
  total: number;
  notMoved: number;
  claimed: number;
  moved: number;
  new7d: number;
}

export interface AdminLeadList {
  items: AdminLead[];
  total: number;
  summary: AdminLeadSummary;
}

export type AdminLeadListEnvelope = ApiEnvelope<AdminLeadList>;

/** Admin lead-pool desk → session-owned `/v1/prospects/admin/leads/*` (role-gated). */
@Injectable({ providedIn: 'root' })
export class AdminLeadsService {
  private readonly api = inject(ApiClient);

  list(params: { q?: string; state?: string; status?: string; limit?: number; skip?: number } = {}): Observable<AdminLeadListEnvelope> {
    const query = new URLSearchParams({
      ...(params.q?.trim() ? { q: params.q.trim() } : {}),
      ...(params.state?.trim() ? { state: params.state.trim() } : {}),
      ...(params.status ? { status: params.status } : {}),
      limit: String(params.limit ?? 25),
      skip: String(params.skip ?? 0),
    });
    return this.api.get<AdminLeadListEnvelope>(`v1/prospects/admin/leads?${query.toString()}`);
  }

  remove(id: string): Observable<ApiEnvelope<{ id: string }>> {
    return this.api.delete(`v1/prospects/admin/leads/${encodeURIComponent(id)}`);
  }

  reopen(id: string): Observable<ApiEnvelope<{ id: string; status: string }>> {
    return this.api.patch(`v1/prospects/admin/leads/${encodeURIComponent(id)}`, {});
  }
}
