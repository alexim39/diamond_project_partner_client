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

@Injectable({ providedIn: 'root' })
export class AdminProlificWomanLeadsService {
  private readonly api = inject(ApiClient);

  list(params: { q?: string; limit?: number; skip?: number } = {}): Observable<ApiEnvelope<ProlificWomanLeadList>> {
    const query = new URLSearchParams({
      ...(params.q?.trim() ? { q: params.q.trim() } : {}),
      limit: String(params.limit ?? 25),
      skip: String(params.skip ?? 0),
    });
    return this.api.get<ApiEnvelope<ProlificWomanLeadList>>(
      `v1/admin/prolificwomen/leads?${query.toString()}`,
    );
  }
}
