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

  // server-side bulk send: charge + gateway + record in one session-owned call
  sendBulkSMS(formObject: { to: Array<string>, body: string, campaignId?: string }): Observable<{
    message: string; success: boolean;
    data: { sent: number; failed: Array<{ to: string; error: string }>; total: number; pages: number; cost: number; transactionId: string; status: string };
  }> {
    return this.apiService.post<any>(`v1/outreach/sms`, formObject, undefined, true);
  }

  // schedule a bulk send for later (charged at fire time, cancellable)
  scheduleBulkSMS(formObject: { to: Array<string>, body: string, sendAt: string, campaignId?: string }): Observable<any> {
    return this.apiService.post<any>(`v1/outreach/sms/schedule`, formObject, undefined, true);
  }

  // scheduled outbox (upcoming + recent)
  listScheduled(): Observable<any> {
    return this.apiService.get<any>(`v1/outreach/sms/scheduled`, undefined, undefined, true);
  }

  // cancel own scheduled send
  cancelScheduled(scheduleId: string): Observable<any> {
    return this.apiService.delete<any>(`v1/outreach/sms/scheduled/${scheduleId}`, undefined, undefined, true);
  }

  // bulk sms charge
  bulkSMSCharge(formObject: {partnerId: string, numberOfContacts: number, pages: number}): Observable<any> {
    return this.apiService.post<smsInterface>(`billing/bulk-sms-charge`, formObject, undefined, true);
  }

  // get sms byId
  getSMSCreatedBy(partnerId: string): Observable<any> {
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