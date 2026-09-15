import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../_common/services/api.service';


export interface PartnerSignUpInterface {
  name: string;
  surname: string;
  email: string;
  reservationCode: string;
  phone: string;
  password: string;
  username: string;
}

export interface PartnerSignInInterface {
  email: string;
  password: string;
}

@Injectable()
export class PartnerAuthService {
  constructor(private apiService: ApiService) {}


  // user sign up 
  signup(formObject: PartnerSignUpInterface): Observable<any> {
    return this.apiService.post<PartnerSignUpInterface>(`auth/signup`, formObject, undefined, true);
  }

  // user sign in 
  siginin(formObject: PartnerSignInInterface): Observable<any> {
    return this.apiService.post<PartnerSignInInterface>(`auth/signin`, formObject, undefined, true);
  }

  // user sign out
  signOut(formObject: {}): Observable<any> {
    return this.apiService.post<any>('auth/signout', formObject, undefined, true);
  }

  // reset password — v1 API (transactional token flow). The legacy
  // `auth/reset-password-request` route is retired server-side: it never
  // persisted the token, so mailed links could never be confirmed.
  resetPassword(formObject: PartnerSignInInterface): Observable<any> {
    return this.apiService.post<PartnerSignInInterface>(`v1/auth/reset-password-request`, formObject, undefined, true);
  }

  // confirm reset — exchanges the emailed token for a new password.
  confirmResetPassword(payload: { token: string; newPassword: string }): Observable<any> {
    return this.apiService.post<any>(`v1/auth/reset-password`, payload, undefined, true);
  }

  
}