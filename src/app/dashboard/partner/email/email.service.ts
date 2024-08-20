import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { FormGroup } from '@angular/forms';

export interface EmailInterface {
  message: string;
  data?: any
}
  

@Injectable()
export class EmailService {
  // Define API
  //apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  //apiURL = 'http://localhost:3000';

  private apiURL: string = environment.apiUrl; 

  
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



// get sms byId
getEmailsCreatedBy(partnerId: string): Observable<EmailInterface> {
  //console.log('record', id);
  return this.http
    .get<EmailInterface>(this.apiURL + `/emails/getById/${partnerId}`, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
}

// send bulk email
sendBulkEmail(bulkEmailObject: FormGroup): Observable<EmailInterface> {
  //console.log('record', bulkEmailObject);
  return this.http
    .post<EmailInterface>(this.apiURL + `/emails/send-bulk-email/`, bulkEmailObject, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
}
   
}