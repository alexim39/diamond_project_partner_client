import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../_common/services/api.service';

export interface CampaignInterface {
    message: string;
    data?: Array<{
      targetAudience: any;
      marketingObjectives: any;
      budget: any;
      adDuration: any;
      adFormat: any;
      _id: string;
      visits?: number;
      createdAt: Date;
      campaignName: string;
    }>;      
}
  

@Injectable()
export class CampaignService {
  constructor(private apiService: ApiService) {}


  // get campaigns createdby
  getCampaignCreatedBy(id: string): Observable<any> {
      return this.apiService.get<CampaignInterface>(`campaign/all-createdBy/${id}`, undefined, undefined, true);
  }

  // get campaign by id
  getCampaignById(id: string): Observable<any> {
       return this.apiService.get<CampaignInterface>(`campaign/${id}`, undefined, undefined, true);
  }

  /** Per-campaign allocation funnels for every owned campaign (one round trip). */
  getMyAllocationSummaries(): Observable<any> {
      return this.apiService.get<any>(`campaign/mine/allocation-summary`, undefined, undefined, true);
  }

  /** Allocation funnel for one campaign (owner/upline/admin). */
  getAllocationSummary(id: string): Observable<any> {
      return this.apiService.get<any>(`campaign/${id}/allocation-summary`, undefined, undefined, true);
  }

  /** Ledger rows for one campaign with accepted-contact names. */
  getCampaignAllocations(id: string): Observable<any> {
      return this.apiService.get<any>(`campaign/${id}/allocations`, undefined, undefined, true);
  }

  /** Run the matcher for one campaign now (owner/upline/admin). */
  allocateNow(id: string, limit = 10): Observable<any> {
      return this.apiService.post<any>(`campaign/${id}/allocate`, { limit }, undefined, true);
  }

  /** Owner self-cancel while Pending (full refund, no admin wait). */
  cancelCampaign(id: string): Observable<any> {
      return this.apiService.post<any>(`campaign/${id}/cancel`, {}, undefined, true);
  }

  /** Duplicate as a fresh Pending campaign (owner or admin; budget held again). */
  duplicateCampaign(id: string): Observable<any> {
      return this.apiService.post<any>(`campaign/${id}/duplicate`, {}, undefined, true);
  }

  /** Pause/resume allocation or tune caps (owner or admin). */
  updateAllocation(id: string, patch: Record<string, unknown>): Observable<any> {
      return this.apiService.patch<any>(`campaign/${id}/allocation`, patch, undefined, true);
  }

  /** Flag one allocated lead as bad (owner of the campaign). */
  reportAllocation(allocationId: string, reason = ''): Observable<any> {
      return this.apiService.post<any>(`campaign/allocations/${allocationId}/report`, { reason }, undefined, true);
  }

  /** Admin verdict on a reported allocation (replace = credit + refill slot). */
  verdictAllocation(allocationId: string, decision: 'replace' | 'reject', note = ''): Observable<any> {
      return this.apiService.patch<any>(`campaign/allocations/${allocationId}/verdict`, { decision, note }, undefined, true);
  }

  /** Reported-but-undecided allocations (admin). */
  reportedAllocations(): Observable<any> {
      return this.apiService.get<any>(`campaign/allocations/reported`, undefined, undefined, true);
  }
   
}