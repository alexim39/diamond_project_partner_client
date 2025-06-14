import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ApiService } from '../../../_common/services/api.service';

export interface ProspectListInterface {
  message: string;
  surname: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: Date; 
  _id: string; 
}
  

@Injectable()
export class ProspectService {
  constructor(private apiService: ApiService) {}
 
  // get prospect owned by the system
  getAllProspect(): Observable<any> {
      return this.apiService.get<ProspectListInterface>(`prospect/all`, undefined, undefined, true);
  }

  // get prospect owned by the partner
  getAllMyProspect(username: string): Observable<any> {
      return this.apiService.get<ProspectListInterface>(`prospect/my/${username}`, undefined, undefined, true);
  }

  // get prospect owned
  getProspectFor(createdBy: string): Observable<any> {
      return this.apiService.get<ProspectListInterface>(`prospect/for/${createdBy}`, undefined, undefined, true);
  }

  // get contacts createdby
  importSingle(importId: any): Observable<any> {
    return this.apiService.get<ProspectListInterface>(`prospect/import-single/${importId.partnerId}/${importId.prospectId}/${importId.source}`, undefined, undefined, true);
  }

   // detele single prospect
  /*  deleteSingle(prospectId: string): Observable<any> {
      return this.apiService.get<ProspectListInterface>(`prospect/delete-single/${prospectId}`, undefined, undefined, true);
    } */
  
  // get session booking
  getSessionBookingsFor(createdBy: string): Observable<any> {
    return this.apiService.get<ProspectListInterface>(`booking/for/${createdBy}`, undefined, undefined, true);
  }

  // detele single prospect
  deleteBookings(id: string): Observable<any> {
    return this.apiService.delete<ProspectListInterface>(`booking/delete/${id}`, undefined, undefined, true);
  }

  // update the booking status
  updateBookingStatus(formData: FormGroup): Observable<any> {
    return this.apiService.put<any>(`booking/update`, formData, undefined, true);
  }

  // get partner email
  getEmailList(createdBy: string): Observable<any> {
    return this.apiService.get<ProspectListInterface>(`booking/email-list/${createdBy}`, undefined, undefined, true);
  }
    

  // detele single prospect email
  deleteSingleEmailFromEmailList(emailId: string): Observable<any> {
    return this.apiService.get<ProspectListInterface>(`emailSubscription/delete-email/${emailId}`, undefined, undefined, true);
  }
   
}