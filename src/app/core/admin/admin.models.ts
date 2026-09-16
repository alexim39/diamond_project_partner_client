import { UserRole } from '../auth/auth.models';
import { ApiEnvelope } from '../auth/auth.models';

export interface ManagedPartner {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: UserRole;
  suspended?: boolean;
  suspendReason?: string | null;
  subscription?: { plan?: string; status?: string };
  createdAt?: string;
}

export interface PartnerDirectoryEnvelope extends ApiEnvelope<ManagedPartner[]> {
  data: ManagedPartner[];
  total: number;
  limit: number;
  skip: number;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  actorLabel: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: string | null;
}

export interface PlatformStats {
  total: number;
  new7d: number;
  new30d: number;
  roles: { user: number; leader: number; g8: number; admin: number };
  suspended: number;
}

export interface PlatformStatsEnvelope extends ApiEnvelope<PlatformStats> {
  data: PlatformStats;
}

export interface AuditEnvelope extends ApiEnvelope<{ items: AuditEntry[]; total: number; limit: number; skip: number }> {
  data: { items: AuditEntry[]; total: number; limit: number; skip: number };
}
