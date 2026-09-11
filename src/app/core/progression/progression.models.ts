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

export interface MilestonesEnvelope extends ApiEnvelope<{ milestones: Record<string, unknown> }> {
  data: { milestones: Record<string, unknown> };
}
