import { ApiEnvelope } from '../../../../core/auth/auth.models';

/** Canonical pipeline — mirrors backend `PROSPECT_STAGES`. */
export type ProspectStage = 'New' | 'Contacted' | 'Interested' | 'In Negotiation' | 'Converted' | 'Closed';

export const STAGE_ORDER: ProspectStage[] = ['New', 'Contacted', 'Interested', 'In Negotiation', 'Converted'];

export const STAGE_META: Record<ProspectStage, { label: string; color: string; text: string }> = {
  New: { label: 'New', color: '#e0e0e0', text: '#424242' },
  Contacted: { label: 'Contacted', color: '#bbdefb', text: '#0d47a1' },
  Interested: { label: 'Interested', color: '#ffecb3', text: '#7a5c00' },
  'In Negotiation': { label: 'In Negotiation', color: '#e1bee7', text: '#4a148c' },
  Converted: { label: 'Converted', color: '#c8e6c9', text: '#1b5e20' },
  Closed: { label: 'Closed', color: '#ffcdd2', text: '#b71c1c' },
};

export interface ProspectLead {
  id: string;
  prospectName: string;
  prospectSurname?: string;
  prospectPhone: string;
  prospectEmail?: string;
  prospectSource: string;
  partnerId: string;
  status?: { name?: string; stage?: ProspectStage; note?: string; status?: string };
  communications?: Array<{ interestLevel?: string; date?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProspectListEnvelope extends ApiEnvelope<ProspectLead[]> {
  data: ProspectLead[];
  meta?: { total: number; limit: number; skip: number };
}

export interface ConvertEnvelope extends ApiEnvelope<{ code: string; prospect: ProspectLead }> {
  data: { code: string; prospect: ProspectLead };
}

/** Next forward step in the pipeline, or null at terminal stages. */
export function nextStage(stage: ProspectStage | undefined): ProspectStage | null {
  const current = stage ?? 'New';
  if (current === 'Converted' || current === 'Closed') return null;
  const idx = STAGE_ORDER.indexOf(current as ProspectStage);
  return idx < 0 ? 'Contacted' : (STAGE_ORDER[idx + 1] ?? null);
}
