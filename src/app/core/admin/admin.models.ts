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
  subscription?: { plan?: string; status?: string };
  createdAt?: string;
}

export interface PartnerDirectoryEnvelope extends ApiEnvelope<ManagedPartner[]> {
  data: ManagedPartner[];
  total: number;
  limit: number;
  skip: number;
}
