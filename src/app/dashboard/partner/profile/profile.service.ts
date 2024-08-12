import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ProfileInterface {
  id: string;
}
  

@Injectable()
export class ProfileService {
  // Define API
  //api = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  //api = 'http://localhost:3000';

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


  // profile update
  profileUpdate(dataObject: ProfileInterface): Observable<ProfileInterface> {
    //console.log('form record', dataObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/update-profile`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // username Update 
  usernameUpdate(dataObject: ProfileInterface): Observable<ProfileInterface> {
    //console.log('form record', dataObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/update-username/`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   // change Password 
   changePassword(dataObject: ProfileInterface): Observable<ProfileInterface> {
    //console.log('form record', dataObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/change-password/`, dataObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   
}