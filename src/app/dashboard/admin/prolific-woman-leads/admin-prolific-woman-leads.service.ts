import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../core/auth/auth.models';

export interface ProlificWomanLead {
  id: string;
  name: string;
  phone: string;
  location: string;
  readyToBeMentored: string;
  headOfficeInvite: string;
  availability: string;
  submittedAt: string | null;
  source: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProlificWomanLeadList {
  items: ProlificWomanLead[];
  total: number;
  limit: number;
  skip: number;
}

export type ProlificWomanLeadStatus = 'all' | 'new' | 'accepted';

@Injectable({ providedIn: 'root' })
export class AdminProlificWomanLeadsService {
  private readonly api = inject(ApiClient);

  list(params: { q?: string; limit?: number; skip?: number; status?: ProlificWomanLeadStatus } = {}): Observable<ApiEnvelope<ProlificWomanLeadList>> {
    const query = new URLSearchParams({
      ...(params.q?.trim() ? { q: params.q.trim() } : {}),
      limit: String(params.limit ?? 25),
      skip: String(params.skip ?? 0),
      ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
    });
    return this.api.get<ApiEnvelope<ProlificWomanLeadList>>(
      `v1/admin/prolificwomen/leads?${query.toString()}`,
    );
  }

  /** Hard delete one unaccepted application (accepted rows live on as prospects). */
  remove(id: string): Observable<ApiEnvelope<{ id: string }>> {
    return this.api.delete<ApiEnvelope<{ id: string }>>(
      `v1/admin/prolificwomen/leads/${encodeURIComponent(id)}`,
    );
  }
}
