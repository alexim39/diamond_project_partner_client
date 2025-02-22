import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

export interface ProspectListInterface {
  message: string;
  data?: Array<{
    surname: string;
    name: string;
    email: string;
    phoneNumber: string;
    createdAt: Date;
  }>  
}
  

@Injectable()
export class AnalyticsService {
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
 
  // get prospect owned
  getProspectFor(createdBy: string): Observable<ProspectListInterface> {
    //console.log('record', id);
    return this.http
      .get<ProspectListInterface>(this.apiURL + `/prospect/for/${createdBy}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // get contacts createdby
  importSingle(importId: any): Observable<ProspectListInterface> {
  //console.log('record', importId);
  return this.http
    .get<ProspectListInterface>(this.apiURL + `/prospect/import-single/${importId.partnerId}/${importId.prospectId}`, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
  }

   // detele single prospect
   deleteSingle(prospectId: string): Observable<ProspectListInterface> {
    //console.log('record', prospectId);
    return this.http
      .get<ProspectListInterface>(this.apiURL + `/prospect/delete-single/${prospectId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
    }
  
  // get session booking
  getSessionBookingsFor(createdBy: string): Observable<ProspectListInterface> {
    //console.log('record', id);
    return this.http
      .get<ProspectListInterface>(this.apiURL + `/booking/for/${createdBy}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // detele single prospect
  deleteBookings(id: string): Observable<ProspectListInterface> {
  //console.log('record', id);
  return this.http
    .delete<ProspectListInterface>(this.apiURL + `/booking/delete/${id}`, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
  }

  // update the booking status
  updateBookingStatus(formData: FormGroup) {
     //console.log('form record', formData);
     return this.http
     .put<any>(this.apiURL + `/booking/update`, formData, { withCredentials: true })
     .pipe(retry(1), catchError(this.handleError));
  }

  // get partner email
  getEmailList(createdBy: string): Observable<ProspectListInterface> {
    //console.log('record', id);
    return this.http
      .get<ProspectListInterface>(this.apiURL + `/booking/email-list/${createdBy}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
    

  // detele single prospect email
  deleteSingleEmailFromEmailList(emailId: string): Observable<ProspectListInterface> {
  console.log('record', emailId);
  return this.http
    .get<ProspectListInterface>(this.apiURL + `/emailSubscription/delete-email/${emailId}`, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
  }
   
}