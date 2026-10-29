import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../../core/auth/auth.models';

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
export class ProlificWomanLeadsService {
  private readonly api = inject(ApiClient);

  list(): Observable<ApiEnvelope<ProlificWomanLeadList>> {
    return this.api.get<ApiEnvelope<ProlificWomanLeadList>>(
      'v1/prolificwomen/leads?limit=500',
    );
  }

  accept(leadId: string): Observable<ApiEnvelope<{ prospectId: string }>> {
    return this.api.post<ApiEnvelope<{ prospectId: string }>>(
      `v1/prolificwomen/leads/${encodeURIComponent(leadId)}/accept`,
      {},
    );
  }
}
