import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../../core/http/api-client.service';
import { ContactListMineEnvelope, ConvertEnvelope, CreateContactPayload, ActivationBoardEnvelope, DownlineContactListsEnvelope, LogCommunicationPayload, PoolEnvelope, ProspectDetailEnvelope, ProspectLead, ProspectListEnvelope, ProspectStage, StuckEnvelope } from './lead.models';

/**
 * Lead pipeline data access — talks to backend `/v1/prospects` (crm slice).
 * Fully typed; no `any`, no manual URL joining.
 */
@Injectable({ providedIn: 'root' })
export class LeadPipelineService {
  private readonly api = inject(ApiClient);

  listByPartner(partnerId: string, opts: number | { limit?: number; skip?: number; q?: string; stage?: string } = {}): Observable<ProspectListEnvelope> {    const o = typeof opts === 'number' ? { limit: opts } : opts;
    const params = new URLSearchParams();
    if (o.limit != null) params.set('limit', String(o.limit));
    if (o.skip != null) params.set('skip', String(o.skip));
    if (o.q?.trim()) params.set('q', o.q.trim());
    if (o.stage) params.set('stage', o.stage);
    const qs = params.toString();
    return this.api.get<ProspectListEnvelope>(`v1/prospects/by-partner/${partnerId}${qs ? `?${qs}` : ''}`);
  }

  /** Buy Prospect pool — geo-fenced, scored, with header KPIs. */
  pool(opts: { state?: string; limit?: number; skip?: number; q?: string } = {}): Observable<PoolEnvelope> {
    const params = new URLSearchParams();
    if (opts.state?.trim()) params.set('state', opts.state.trim());
    if (opts.limit != null) params.set('limit', String(opts.limit));
    if (opts.skip != null) params.set('skip', String(opts.skip));
    if (opts.q?.trim()) params.set('q', opts.q.trim());
    const qs = params.toString();
    return this.api.get<PoolEnvelope>(`v1/prospects/pool${qs ? `?${qs}` : ''}`);
  }

  stuck(partnerId: string): Observable<StuckEnvelope> {
    return this.api.get<StuckEnvelope>(`v1/prospects/stuck/${partnerId}`);
  }

  advanceStage(prospectId: string, stage: ProspectStage, author?: { by?: string; byName?: string }): Observable<unknown> {
    return this.api.post(`v1/prospects/${prospectId}/status`, { stage, ...(author ?? {}) });
  }

  convert(prospectId: string, author?: { by?: string; byName?: string }): Observable<ConvertEnvelope> {
    return this.api.post<ConvertEnvelope>(`v1/prospects/${prospectId}/convert`, { ...(author ?? {}) });
  }

  getById(prospectId: string): Observable<ProspectDetailEnvelope> {
    return this.api.get<ProspectDetailEnvelope>(`v1/prospects/${prospectId}`);
  }

  logCommunication(prospectId: string, payload: LogCommunicationPayload): Observable<unknown> {
    return this.api.post(`v1/prospects/${prospectId}/communications`, payload);
  }

  createContact(payload: CreateContactPayload): Observable<unknown> {
    return this.api.post('v1/prospects', payload);
  }

  updateContact(prospectId: string, payload: Partial<CreateContactPayload>): Observable<unknown> {
    return this.api.put(`v1/prospects/${prospectId}`, payload);
  }

  removeProspect(prospectId: string): Observable<unknown> {
    return this.api.delete(`v1/prospects/${prospectId}`);
  }

  /** Return a Buy Prospect lead to the pool (7-day window, server-enforced). */
  releaseProspect(prospectId: string): Observable<{ message: string; success: boolean }> {
    return this.api.post(`v1/prospects/${prospectId}/release`, {});
  }

  /** Accept your own page lead (free, no wallet movement). */
  acceptPageLead(surveyId: string): Observable<{ message: string; success: boolean; data: { prospectId: string } }> {
    return this.api.post<{ message: string; success: boolean; data: { prospectId: string } }>('v1/prospects/accept-page-lead', { surveyId });
  }

  /** 1–5 star quality vote on a worked lead (feeds pool prioritization). */
  rateLead(prospectId: string, score: number, note = ''): Observable<{ message: string; success: boolean }> {
    return this.api.post(`v1/prospects/${prospectId}/rate`, { score, note });
  }

  /** Admin: bulk-seed the pool from parsed rows. */
  importLeads(rows: Array<Record<string, string>>): Observable<{ message: string; success: boolean; data: { inserted: number; failed: Array<unknown>; total: number } }> {
    return this.api.post('v1/prospects/admin/leads/import', { rows });
  }

  contactListMine(): Observable<ContactListMineEnvelope> {
    return this.api.get<ContactListMineEnvelope>('v1/prospects/contact-list/mine');
  }

  submitContactList(): Observable<{ message: string; success: boolean; data: { batch: string; count: number } }> {
    return this.api.post<{ message: string; success: boolean; data: { batch: string; count: number } }>('v1/prospects/contact-list/submit', {});
  }

  downlineContactLists(): Observable<DownlineContactListsEnvelope> {
    return this.api.get<DownlineContactListsEnvelope>('v1/prospects/contact-list/downline');
  }

  activationBoard(): Observable<ActivationBoardEnvelope> {
    return this.api.get<ActivationBoardEnvelope>('v1/prospects/contact-list/activation');
  }

  prospectName(lead: ProspectLead): string {
    return `${lead.prospectName ?? ''} ${lead.prospectSurname ?? ''}`.trim() || 'Unnamed';
  }

  lastInterest(lead: ProspectLead): string {
    const comms = lead.communications ?? [];
    return comms.length > 0 ? (comms[comms.length - 1].interestLevel ?? '—') : '—';
  }
}
