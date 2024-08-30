import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface MentorsProgramInterface {
  message: string;
  data?: any
}
  

@Injectable()
export class MentorsProgramService {
  // Define API
  apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  //apiURL = 'http://localhost:3000';


  
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

// send bulkc
send(bulkSMSObject: {senderId: string, phoneNumbers: Array<string>, textMessage: string, partnerId: string}): Observable<MentorsProgramService> {
  //console.log('record', bulkSMSObject);
  return this.http
    .post<MentorsProgramService>(this.apiURL + `/sms/send-bulk-sms/`, bulkSMSObject, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
}

// bulk sms charge
/* bulkSMSCharge(chargeObject: {partnerId: string, numberOfContacts: number, pages: number}): Observable<smsInterface> {
  //console.log('record', chargeObject);
  return this.http
    .post<smsInterface>(this.apiURL + `/billing/bulk-sms-charge/`, chargeObject, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
} */


// get sms byId
/* getSMSCreatedBy(partnerId: string): Observable<smsInterface> {
  //console.log('record', id);
  return this.http
    .get<smsInterface>(this.apiURL + `/sms/getById/${partnerId}`, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
} */


   
}