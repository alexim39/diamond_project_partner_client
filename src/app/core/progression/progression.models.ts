import { ApiEnvelope } from '../../core/auth/auth.models';

export interface MissingRequirement {
  key: string;
  label: string;
  action: string;
}

export interface Promotion {
  from: string;
  to: string;
}

export interface Journey {
  level: string;
  levelLabel: string;
  next: string | null;
  nextLabel: string | null;
  percent: number;
  completed: string[];
  missing: MissingRequirement[];
  remainingActions: string[];
  milestones: Record<string, unknown>;
  signals: { recruits: number; activeDownline: number; maintenanceOk: boolean };
  promoted: Promotion | null;
}

export interface JourneyEnvelope extends ApiEnvelope<Journey> {
  data: Journey;
}

export interface PendingNomination {
  partnerId: string;
  level: string | null;
  note: string;
  requestedAt: string | null;
  member: { username: string; name: string } | null;
}

export interface Oversight {
  level: string;
  isAdmin: boolean;
  total: number;
  capped: boolean;
  distribution: Record<string, number>;
  leaders: number;
  pendingNominations: PendingNomination[];
  pendingCount: number;
}

export interface PendingEnvelope extends ApiEnvelope<{ items: PendingNomination[]; total: number }> {
  data: { items: PendingNomination[]; total: number };
}

export interface OversightEnvelope extends ApiEnvelope<Oversight> {
  data: Oversight;
}

export interface MilestonesEnvelope extends ApiEnvelope<{ milestones: Record<string, unknown> }> {
  data: { milestones: Record<string, unknown> };
}

/** Diamond ladder in rank order — mirrors backend LEVELS + LEVEL_LABELS. */
export const LADDER: Array<{ level: string; label: string }> = [
  { level: 'prospect', label: 'Prospect' },
  { level: 'partner', label: 'Partner' },
  { level: 'emerging_active', label: 'Emerging Active Partner' },
  { level: 'qualified_active', label: 'Qualified Active Partner' },
  { level: 'active', label: 'Active Partner' },
  { level: 'kingsman', label: 'Kingsman' },
  { level: 'ecl', label: 'Emerging Cell Leader' },
  { level: 'cell_leader', label: 'Cell Leader' },
  { level: 'g_leader', label: 'G Leader' },
  { level: 'g8', label: 'G8 Leader' },
];

export const levelRank = (level: string | null | undefined): number =>
  Math.max(0, LADDER.findIndex((r) => r.level === level));
