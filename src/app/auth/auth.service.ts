import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerSignInData, PartnerSignUpData } from './auth.interface';
import { ApiService } from '../_common/services/api.service';

@Injectable()
export class PartnerAuthService {
  constructor(private apiService: ApiService) {}


  // user sign up 
  signup(formObject: PartnerSignUpData): Observable<PartnerSignUpData> {
    //console.log('form record', signUpData);
    /* return this.http
      .post<PartnerSignUpData>(this.apiURL + '/partners/signup', formObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<PartnerSignUpData>(`partners/signup`, formObject, undefined, true);
  }

   // user sign in 
   siginin(formObject: PartnerSignInData): Observable<PartnerSignInData> {
    //console.log('form record', signInData);
    /* return this.http
      .post<PartnerSignInData>(this.apiURL + '/partners/signin', signInData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<PartnerSignInData>(`partners/signin`, formObject, undefined, true);
  }

   // user sign out
   signOut(formObject: {}): Observable<any> {
   /*  return this.http
      .post<any>(this.apiURL + '/partners/signout', formObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<any>('partners/signout', formObject, undefined, true);
  }

   // reset password
   resetPassword(formObject: PartnerSignInData): Observable<PartnerSignInData> {
   //console.log('form record', signInData);
    /* return this.http
      .post<PartnerSignInData>(this.apiURL + '/partners/reset-password-request', signInData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError)); */

      return this.apiService.post<PartnerSignInData>(`partners/reset-password-request`, formObject, undefined, true);
  }

  
}