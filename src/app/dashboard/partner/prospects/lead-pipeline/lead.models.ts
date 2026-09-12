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
  status?: { name?: string; stage?: ProspectStage; note?: string; status?: string; stageEnteredAt?: string };
  communications?: Array<{ interestLevel?: string; date?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProspectListEnvelope extends ApiEnvelope<ProspectLead[]> {
  data: ProspectLead[];
  meta?: { total: number; limit: number; skip: number };
}

export type RelationshipTag = 'Family' | 'Friend' | 'Colleague' | 'Church' | 'Neighbour' | 'Referral' | 'Other';
export type ContactPriority = 'high' | 'normal';

export const RELATIONSHIP_TAGS: RelationshipTag[] = ['Family', 'Friend', 'Colleague', 'Church', 'Neighbour', 'Referral', 'Other'];

export interface CreateContactPayload {
  prospectName: string;
  prospectSurname?: string;
  prospectPhone: string;
  prospectEmail?: string;
  prospectSource: string;
  relationship?: RelationshipTag;
  priority?: ContactPriority;
  bestTimeToCall?: string;
  consentToContact?: boolean;
  notes?: string;
}

export interface ContactListEntry {
  id: string;
  prospectName: string;
  prospectSurname: string;
  prospectPhone: string;
  relationship: string;
  priority: string;
  createdAt: string | null;
}

export interface ContactListBatch {
  batch: string;
  submittedAt: string | null;
  total: number;
  stageCounts: Record<string, number>;
  worked: number;
}

export interface ContactListMine {
  unsubmitted: ContactListEntry[];
  unsubmittedCount: number;
  minRequired: number;
  canSubmit: boolean;
  batches: ContactListBatch[];
}

export type ContactListMineEnvelope = ApiEnvelope<ContactListMine>;

export interface ContactListSubmitResult {
  batch: string;
  count: number;
  submittedAt: string;
}

export interface DownlineContact {
  id: string;
  prospectName: string;
  prospectSurname: string;
  prospectPhone: string;
  relationship: string;
  priority: string;
  bestTimeToCall: string;
  consentToContact: boolean;
  stage: string;
}

export interface DownlineContactListItem extends ContactListBatch {
  partnerId: string;
  member: { username: string; name: string } | null;
  contacts: DownlineContact[];
}

export interface DownlineContactLists {
  items: DownlineContactListItem[];
  total: number;
}

export type DownlineContactListsEnvelope = ApiEnvelope<DownlineContactLists>;

export interface ConvertEnvelope extends ApiEnvelope<{ code: string; prospect: ProspectLead }> {
  data: { code: string; prospect: ProspectLead };
}

/** Full communication entry — mirrors backend `createCommunicationEntity`. */
export interface ProspectCommunication {
  id?: string;
  _id?: string;
  type: 'call' | 'email' | 'text' | 'zoom' | 'whatsapp';
  interestLevel?: string;
  date?: string;
  duration?: number;
  description?: string;
  followUpAction?: string;
  topicsDiscussed?: string[];
  status?: string;
}

export interface ProspectDetail extends Omit<ProspectLead, 'communications'> {
  communications?: ProspectCommunication[];
}

export interface ProspectDetailEnvelope extends ApiEnvelope<ProspectDetail> {
  data: ProspectDetail;
}

export interface LogCommunicationPayload {
  type: 'call' | 'email' | 'text' | 'zoom' | 'whatsapp';
  interestLevel: 'hot' | 'warm' | 'cold';
  date?: string;
  duration?: number;
  description: string;
  followUpAction?: string;
}

/** Stuck-in-pipeline entry — mirrors backend `stuckAnalysis`. */
export interface StuckEntry {
  prospectId: string;
  name: string;
  stage: ProspectStage;
  daysInStage: number;
  limit: number;
  overBy: number;
}

export interface StuckEnvelope extends ApiEnvelope<StuckEntry[]> {
  data: StuckEntry[];
}

/** Next forward step in the pipeline, or null at terminal stages. */
export function nextStage(stage: ProspectStage | undefined): ProspectStage | null {
  const current = stage ?? 'New';
  if (current === 'Converted' || current === 'Closed') return null;
  const idx = STAGE_ORDER.indexOf(current as ProspectStage);
  return idx < 0 ? 'Contacted' : (STAGE_ORDER[idx + 1] ?? null);
}
