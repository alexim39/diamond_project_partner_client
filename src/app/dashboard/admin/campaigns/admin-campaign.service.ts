import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../_common/services/api.service';

export interface AdminCampaignRow {
  _id: string;
  campaignName: string;
  category?: string;
  allocated?: number;
  allocation?: { paused?: boolean; enabled?: boolean; delivered?: number; spent?: number };
  deliveryStatus: string;
  budget: { budgetAmount: number; budgetType: string };
  targetAudience: { locationTarget?: string; locationTargets?: string[] };
  adDuration: { campaignStartDate: string; campaignEndDate?: string | null; noEndDate: boolean };
  visits: number;
  createdAt: string;
  createdBy: string;
  owner: { username: string; name: string; email: string | null; phone: string | null } | null;
}

/** Admin ad-campaign queue → legacy `/campaign/*` admin endpoints. */
@Injectable({ providedIn: 'root' })
export class AdminCampaignService {
  constructor(private apiService: ApiService) {}

  queue(status = 'Pending', skip = 0, limit = 50): Observable<{ data: AdminCampaignRow[]; meta: { total: number } }> {
    return this.apiService.get<any>(
      `campaign/queue?status=${encodeURIComponent(status)}&skip=${skip}&limit=${limit}`,
      undefined, undefined, true,
    );
  }

  setStatus(id: string, status: 'Active' | 'Rejected' | 'Ended', reason = '', spend?: { spentAmount: number; spendNote?: string }): Observable<any> {
    return this.apiService.patch<any>(`campaign/${id}/status`, { status, reason, ...(spend ?? {}) }, undefined, true);
  }

  /** Run the matcher for one campaign now (admin top-up). */
  allocateNow(id: string, limit = 10): Observable<any> {
    return this.apiService.post<any>(`campaign/${id}/allocate`, { limit }, undefined, true);
  }

  /** Pause/resume allocation or tune caps (admin). */
  updateAllocation(id: string, patch: Record<string, unknown>): Observable<any> {
    return this.apiService.patch<any>(`campaign/${id}/allocation`, patch, undefined, true);
  }

  /** Reported-but-undecided allocations (admin desk). */
  reportedAllocations(): Observable<any> {
    return this.apiService.get<any>(`campaign/allocations/reported`, undefined, undefined, true);
  }

  /** Admin verdict on a reported allocation (replace = credit + refill slot). */
  verdictAllocation(id: string, decision: 'replace' | 'reject', note = ''): Observable<any> {
    return this.apiService.patch<any>(`campaign/allocations/${id}/verdict`, { decision, note }, undefined, true);
  }
}
