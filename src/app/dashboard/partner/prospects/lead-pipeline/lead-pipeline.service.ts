import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../../core/http/api-client.service';
import { ConvertEnvelope, ProspectLead, ProspectListEnvelope, ProspectStage } from './lead.models';

/**
 * Lead pipeline data access — talks to backend `/v1/prospects` (crm slice).
 * Fully typed; no `any`, no manual URL joining.
 */
@Injectable({ providedIn: 'root' })
export class LeadPipelineService {
  private readonly api = inject(ApiClient);

  listByPartner(partnerId: string, limit = 200): Observable<ProspectListEnvelope> {
    return this.api.get<ProspectListEnvelope>(`v1/prospects/by-partner/${partnerId}?limit=${limit}`);
  }

  advanceStage(prospectId: string, stage: ProspectStage): Observable<unknown> {
    return this.api.post(`v1/prospects/${prospectId}/status`, { stage });
  }

  convert(prospectId: string): Observable<ConvertEnvelope> {
    return this.api.post<ConvertEnvelope>(`v1/prospects/${prospectId}/convert`, {});
  }

  prospectName(lead: ProspectLead): string {
    return `${lead.prospectName ?? ''} ${lead.prospectSurname ?? ''}`.trim() || 'Unnamed';
  }

  lastInterest(lead: ProspectLead): string {
    const comms = lead.communications ?? [];
    return comms.length > 0 ? (comms[comms.length - 1].interestLevel ?? '—') : '—';
  }
}
