import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { ApiService } from '../../../_common/services/api.service';

export interface ContactsInterface {
  message: string;
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
  }> 
}

export interface codeData {
  partnerId: string;
  prospectId: string;
  code: string;
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
  getContctsCreatedBy(createdBy: string): Observable<any> {
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
  updateProspectStatus(formData: {status: string; prospectId: string}): Observable<any> {
      return this.apiService.post<ContactsInterface>(`prospect/updateStatus`, formData, undefined, true);
  }

  // update prospect remark
  updateProspectRemark(formData: {remark: string; prospectId: string}): Observable<ContactsInterface> {
      return this.apiService.post<ContactsInterface>(`prospect/updateRemark`, formData, undefined, true);
  }

  // delete prospect 
  deleteProspect(id: string): Observable<any> {
      return this.apiService.get<ContactsInterface>(`prospect/delete/${id}`, undefined, undefined, true);
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

  // save sms 
  saveSMSRecord(formData: {partner: string, prospect: string | Array<string>, smsBody: string}): Observable<ContactsInterface> {
      return this.apiService.post<ContactsInterface>(`sms/save-sms`, formData, undefined, true);
  }
   
  // submit booking
  bookSurvey(formData: any): Observable<any> {
      return this.apiService.post<any>(`booking/submit`, formData, undefined, true);
  }

  // move prospect back to survey
  moveProspectBackToSurveyList(prospectId: string): Observable<any> {
      return this.apiService.get<string>(`prospect/move-back-to-survey/${prospectId}`, undefined, undefined, true);
  }

}