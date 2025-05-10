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
   
}