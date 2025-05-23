import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { ApiService } from '../../../_common/services/api.service';

export interface ContactsInterface {
    prospectName: string;
    prospectSurname: string;
    prospectEmail: string;
    prospectPhone: string;
    prospectSource: string;
    prospectRemark?: string;
    createdAt: Date;
    status: {
      createdAt: Date;
      expectedDecisionDate: Date;
      name: string;
      note: string;
      status: string;
      _id: string;
    };
    _id: string;
 /*  message: string;
  data?: Array<{
    prospectName: string;
    prospectSurname: string;
    prospectEmail: string;
    prospectPhone: string;
    prospectSource: string;
    prospectRemark?: string;
    createdAt: Date;
    status: string;
    id: string;
  }>;
  success: boolean; */
}

export interface codeData {
  partnerId: string;
  prospectId: string;
  code: string;
}
  
export interface CommunicationInterface {
  interestLevel: string;
  date: Date;
  type: 'call' | 'email' | 'text' | 'zoom' | 'meeting';
  duration?: number;
  description: string;
  topicsDiscussed: string[];
  prospectId: string;
  _id?: string;
}

@Injectable()
export class ContactsService {
  constructor(private apiService: ApiService) {}


  // contact creatioin
  create(formData: ContactsInterface): Observable<any> {
    return this.apiService.post<any>(`prospect/create`, formData, undefined, true);
  }

  // contact creatioin
  update(formData: ContactsInterface): Observable<any> {
    return this.apiService.put<any>(`prospect/update`, formData, undefined, true);
  }

  // get contacts createdby
  getContactsCreatedBy(createdBy: string): Observable<any> {
    return this.apiService.get<ContactsInterface>(`prospect/all-createdBy/${createdBy}`, undefined, undefined, true);
  }

  // get contacts createdby
  import(partnerId: string): Observable<any> {
    return this.apiService.get<ContactsInterface>(`prospect/import/${partnerId}`, undefined, undefined, true);
  }

  // get prospect byId
  getProspectById(prospectId: string): Observable<any> {
    return this.apiService.get<ContactsInterface>(`prospect/getById/${prospectId}`, undefined, undefined, true);
  }

  // update prospect status
  updateProspectStatus(payload: { prospectId: string; status: { name: string; note: string | undefined; paydayDate: Date | undefined; }; }): Observable<any> {
    return this.apiService.post<{status: {}; prospectId: string}>(`prospect/updateStatus`, payload, undefined, true);
  }

  // delete prospect 
  deleteProspect(id: string): Observable<any> {
    return this.apiService.get<string>(`prospect/delete/${id}`, undefined, undefined, true);
  }

  // promote new prospect 
  promoteProspectToPartner(formData: codeData): Observable<any> {
    return this.apiService.post<ContactsInterface>(`reservationCode/submit`, formData, undefined, true);
  }

  // single sms charge
  signleSMSCharge(partnerId: string): Observable<any> {
    return this.apiService.get<ContactsInterface>(`billing/single-sms-charge/${partnerId}`, undefined, undefined, true);
  }

  // send single email
  sendProspectEmail(formData: {partner: PartnerInterface, prospect: ContactsInterface, emailBody: string}): Observable<any> {
    return this.apiService.post<ContactsInterface>(`emails/send-emails`, formData, undefined, true);
  }
   
  // submit booking
  bookSurvey(formData: any): Observable<any> {
      return this.apiService.post<any>(`booking/submit`, formData, undefined, true);
  }

  // move prospect back to survey
  moveProspectBackToSurveyList(prospectId: string): Observable<any> {
    return this.apiService.get<string>(`prospect/move-back-to-survey/${prospectId}`, undefined, undefined, true);
  }

  /**
   * Update prospect communications
   * @param formData - Object containing communication and prospectId
  */
  updateProspectCommunications(formData: CommunicationInterface): Observable<any> {
    return this.apiService.post<CommunicationInterface>(`prospect/communications`, formData, undefined, true);
  }

  // delete prospect communiction
  deleteCommunictaionEntry(prospectId: string, communicationId: string): Observable<any> {
    return this.apiService.delete<any>(`prospect/communications/${prospectId}/${communicationId}`, undefined, undefined, true);
  }

}