import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface ProfileInterface {
  id: string;
}
  

@Injectable()
export class SocialMediaSettingsService {
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



  whatsappGroupLinkUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
    //console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/whatsappgrouplink`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }


  whatsappGroupChatUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
    //console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/whatsappchatlink`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  facebookPageUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
    console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/facebookPage`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  linkedinPageUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
    //console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/linkedinPage`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  youtubePageUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
    //console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/youtubePage`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  instagramPageUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
    //console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/instagramPage`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  tiktokPageUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
   // console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/tiktokPage`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  twitterPageUpdate(updateObject: {url: string; partnerId: string}): Observable<ProfileInterface> {
   // console.log('form record', updateObject);
    return this.http
      .put<ProfileInterface>(this.apiURL + `/partners/twitterPage`, updateObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  

   
}