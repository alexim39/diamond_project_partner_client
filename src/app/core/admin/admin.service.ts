import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { UserRole } from '../auth/auth.models';
import { ManagedPartner, PartnerDirectoryEnvelope, AuditEnvelope } from './admin.models';

/**
 * Admin console data access → backend `/v1/admin/*`
 * (requireAuth + requireRole('admin') enforced server-side).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiClient);

  directory(params: { q?: string; limit?: number; skip?: number } = {}): Observable<PartnerDirectoryEnvelope> {
    const query = new URLSearchParams({
      q: params.q ?? '',
      limit: String(params.limit ?? 25),
      skip: String(params.skip ?? 0),
    });
    return this.api.get<PartnerDirectoryEnvelope>(`v1/admin/partners?${query.toString()}`);
  }

  setRole(partnerId: string, role: UserRole): Observable<{ data: ManagedPartner }> {
    return this.api.patch<{ data: ManagedPartner }>(`v1/admin/partners/${partnerId}/role`, { role });
  }

  audit(params: { action?: string; actorId?: string; limit?: number; skip?: number } = {}): Observable<AuditEnvelope> {
    const query = new URLSearchParams({
      ...(params.action ? { action: params.action } : {}),
      ...(params.actorId ? { actorId: params.actorId } : {}),
      limit: String(params.limit ?? 50),
      skip: String(params.skip ?? 0),
    });
    return this.api.get<AuditEnvelope>(`v1/admin/audit?${query.toString()}`);
  }
}
