import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../_common/services/api.service';

export interface smsInterface {
  message: string;
  data?: any
}
  

@Injectable()
export class SMSService {
  constructor(private apiService: ApiService) {}

  // send bulkc
  send(formObject: {senderId: string, phoneNumbers: Array<string>, textMessage: string, partnerId: string}): Observable<smsInterface> {
    return this.apiService.post<smsInterface>(`sms/send-bulk-sms`, formObject, undefined, true);
  }

  // bulk sms charge
  bulkSMSCharge(formObject: {partnerId: string, numberOfContacts: number, pages: number}): Observable<any> {
    return this.apiService.post<smsInterface>(`billing/bulk-sms-charge`, formObject, undefined, true);
  }

  // get sms byId
  getSMSCreatedBy(partnerId: string): Observable<smsInterface> {
    return this.apiService.get<smsInterface>(`sms/getById/${partnerId}`, undefined, undefined, true);
  }

  // detele single sms
  deleteSingleSMS(smsId: string): Observable<any> {
    return this.apiService.delete<any>(`sms/delete-single/${smsId}`, undefined, undefined, true);
  }

  // save sms 
  saveSMSRecord(formData: {partner: string, prospect: string | Array<string>, smsBody: string}): Observable<any> {
    return this.apiService.post<any>(`sms/save-sms`, formData, undefined, true);
  }


   
}