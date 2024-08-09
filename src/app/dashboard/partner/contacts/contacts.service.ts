import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

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
  }>  
}
  

@Injectable()
export class ContactsService {
  // Define API
  //api = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  api = 'http://localhost:3000';
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
      .post<ContactsInterface>(this.api + `/prospect/create`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

 // get contacts createdby
 getContctsCreatedBy(createdBy: string): Observable<ContactsInterface> {
  //console.log('record', id);
  return this.http
    .get<ContactsInterface>(this.api + `/prospect/all-createdBy/${createdBy}`, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
}

  /*  // change Password 
   changePassword(dataObject: ProfileInterface): Observable<ProfileInterface> {
    //console.log('form record', dataObject);
    return this.http
      .put<ProfileInterface>(this.api + `/partners/change-password/`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  } */

   
}