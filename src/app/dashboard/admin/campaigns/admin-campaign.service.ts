import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../_common/services/api.service';

export interface AdminCampaignRow {
  _id: string;
  campaignName: string;
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

  setStatus(id: string, status: 'Active' | 'Rejected' | 'Ended', reason = ''): Observable<any> {
    return this.apiService.patch<any>(`campaign/${id}/status`, { status, reason }, undefined, true);
  }
}
