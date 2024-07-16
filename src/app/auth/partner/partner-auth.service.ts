import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { PartnerSignInData, PartnerSignUpData } from './partner-auth.interface';

@Injectable()
export class PartnerAuthService {
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


  // user sign up 
  signup(signUpData: PartnerSignUpData): Observable<PartnerSignUpData> {
    //console.log('form record', signUpData);
    return this.http
      .post<PartnerSignUpData>(this.api + '/partners/signup', signUpData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   // user sign in 
   siginin(signInData: PartnerSignInData): Observable<PartnerSignInData> {
    //console.log('form record', signInData);
    return this.http
      .post<PartnerSignInData>(this.api + '/partners/signin', signInData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   // user sign out
   signOut(formObject: {}): Observable<any> {
    return this.http
      .post<any>(this.api + '/partners/signout', formObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  
}