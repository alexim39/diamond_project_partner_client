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
    //console.log('form record', dataObject);
   /*  return this.http
      .post<ContactsInterface>(this.apiURL + `/prospect/create`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<any>(`prospect/create`, formData, undefined, true);
  }

  // contact creatioin
  update(formData: ContactsInterface): Observable<any> {
    //console.log('form record', dataObject);
   /*  return this.http
      .put<ContactsInterface>(this.apiURL + `/prospect/update`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
 */
      return this.apiService.put<any>(`prospect/update`, formData, undefined, true);
  }

  // get contacts createdby
  getContctsCreatedBy(createdBy: string): Observable<any> {
    //console.log('record', id);
    /* return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/all-createdBy/${createdBy}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.get<ContactsInterface>(`prospect/all-createdBy/${createdBy}`, undefined, undefined, true);
  }

  // get contacts createdby
  import(partnerId: string): Observable<any> {
    //console.log('record', partnerId);
    /* return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/import/${partnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.get<ContactsInterface>(`prospect/import/${partnerId}`, undefined, undefined, true);
  }

  // get prospect byId
  getProspectById(prospectId: string): Observable<any> {
    //console.log('record', id);
    /* return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/getById/${prospectId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.get<ContactsInterface>(`prospect/getById/${prospectId}`, undefined, undefined, true);
  }

  // update prospect status
  updateProspectStatus(formData: {status: string; prospectId: string}): Observable<any> {
    //console.log('record', obj);
    /* return this.http
      .post<ContactsInterface>(this.apiURL + `/prospect/updateStatus`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<ContactsInterface>(`prospect/updateStatus`, formData, undefined, true);
  }

  // update prospect remark
  updateProspectRemark(formData: {remark: string; prospectId: string}): Observable<ContactsInterface> {
    //console.log('record', obj);
    /* return this.http
      .post<ContactsInterface>(this.apiURL + `/prospect/updateRemark`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<ContactsInterface>(`prospect/updateRemark`, formData, undefined, true);
  }

  // delete prospect 
  deleteProspect(id: string): Observable<any> {
    //console.log('record', obj);
   /*  return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/delete/${id}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.get<ContactsInterface>(`prospect/delete/${id}`, undefined, undefined, true);
  }

  // promote new prospect 
  promoteProspectToPartner(formData: codeData): Observable<any> {
    //console.log('record', prospect);
    /* return this.http
      .post<ContactsInterface>(this.apiURL + `/reservationCode/submit`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<ContactsInterface>(`reservationCode/submit`, formData, undefined, true);
  }

  // single sms charge
  signleSMSCharge(partnerId: string): Observable<any> {
    //console.log('record', obj);
    /* return this.http
      .get<ContactsInterface>(this.apiURL + `/billing/single-sms-charge/${partnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.get<ContactsInterface>(`billing/single-sms-charge/${partnerId}`, undefined, undefined, true);
  }

  // send single email
  sendProspectEmail(formData: {partner: PartnerInterface, prospect: ContactsInterface, emailBody: string}): Observable<any> {
    //console.log('record', emailObject);
    /* return this.http
      .post<ContactsInterface>(this.apiURL + `/emails/send-emails/`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<ContactsInterface>(`emails/send-emails`, formData, undefined, true);
  }

  // save sms 
  saveSMSRecord(formData: {partner: string, prospect: string | Array<string>, smsBody: string}): Observable<ContactsInterface> {
    //console.log('record', SMSbject);
    /* return this.http
      .post<ContactsInterface>(this.apiURL + `/sms/save-sms/`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<ContactsInterface>(`sms/save-sms`, formData, undefined, true);
  }
   
  // submit booking
  bookSurvey(formData: any): Observable<any> {
    //console.log('form record', formData);
    /* return this.http
      .post<any>(this.apiURL + '/booking/submit', formData)
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<any>(`booking/submit`, formData, undefined, true);
  }

  // move prospect back to survey
  moveProspectBackToSurveyList(prospectId: string): Observable<any> {
    //console.log('record', id);
    /* return this.http
      .get<string>(this.apiURL + `/prospect/move-back-to-survey/${prospectId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.get<string>(`prospect/move-back-to-survey/${prospectId}`, undefined, undefined, true);
  }

}