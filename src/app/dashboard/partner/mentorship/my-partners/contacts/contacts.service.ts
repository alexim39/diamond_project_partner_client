import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { FormGroup } from '@angular/forms';

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
  // Define API
  /** Base URL comes from the Angular environment (dev/prod swapped at build). */
  apiURL = environment.apiUrl;

  
  constructor(private http: HttpClient) {}
  /*========================================
    CRUD Methods for consuming RESTful API
  =========================================*/
  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  // Error handling
  private handleError(error: any) {
    let errorMessage: {code: string, message: string};
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = {'code': error.status, 'message': error.message};
    }
    //window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }


  // contact creatioin
  create(dataObject: ContactsInterface): Observable<ContactsInterface> {
    //console.log('form record', dataObject);
    return this.http
      .post<ContactsInterface>(this.apiURL + `/prospect/create`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // contact creatioin
  update(dataObject: ContactsInterface): Observable<ContactsInterface> {
    //console.log('form record', dataObject);
    return this.http
      .put<ContactsInterface>(this.apiURL + `/prospect/update`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // get contacts createdby
  getContctsCreatedBy(createdBy: string): Observable<ContactsInterface> {
    //console.log('record', id);
    return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/all-createdBy/${createdBy}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // get contacts createdby
  import(partnerId: string): Observable<ContactsInterface> {
    //console.log('record', partnerId);
    return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/import/${partnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // get prospect byId
  getProspectById(prospectId: string): Observable<ContactsInterface> {
    //console.log('record', id);
    return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/getById/${prospectId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // update prospect status
  updateProspectStatus(obj: {status: string; prospectId: string}): Observable<ContactsInterface> {
    //console.log('record', obj);
    return this.http
      .post<ContactsInterface>(this.apiURL + `/prospect/updateStatus`, obj, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // update prospect remark
  updateProspectRemark(obj: {remark: string; prospectId: string}): Observable<ContactsInterface> {
    //console.log('record', obj);
    return this.http
      .post<ContactsInterface>(this.apiURL + `/prospect/updateRemark`, obj, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // delete prospect 
  deleteProspect(id: string): Observable<ContactsInterface> {
    //console.log('record', obj);
    return this.http
      .get<ContactsInterface>(this.apiURL + `/prospect/delete/${id}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // single sms charge
  signleSMSCharge(partnerId: string): Observable<ContactsInterface> {
    //console.log('record', obj);
    return this.http
      .get<ContactsInterface>(this.apiURL + `/billing/single-sms-charge/${partnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // send single email — session-owned v1 route (validated, recorded,
  // honest per-recipient outcome). Replaces legacy emails/send-emails.
  sendProspectEmail(emailObject: {partner: PartnerInterface, prospect: ContactsInterface, emailBody: string, emailSubject?: string}): Observable<any> {
    //console.log('record', emailObject);
    const to = [String((emailObject.prospect as any)?.prospectEmail ?? '').trim().toLowerCase()].filter(Boolean);
    return this.http
      .post<any>(this.apiURL + `/v1/outreach/email`, {
        to,
        subject: String((emailObject as any)?.emailSubject ?? 'Message from your Diamond Project partner'),
        body: String(emailObject.emailBody ?? ''),
      }, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // save sms 
  saveSMSRecord(SMSbject: {partner: string, prospect: string | Array<string>, smsBody: string}): Observable<ContactsInterface> {
    //console.log('record', SMSbject);
    return this.http
      .post<ContactsInterface>(this.apiURL + `/sms/save-sms/`, SMSbject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
   
   // submit booking — session-authenticated (server requires a partner session)
   bookSurvey(formData: any): Observable<any> {
     //console.log('form record', formData);
     return this.http
       .post<any>(this.apiURL + '/booking/submit', formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
}