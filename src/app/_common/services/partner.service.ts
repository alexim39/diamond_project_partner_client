import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface PartnerInterface {
  _id: string;
  //courses?: Array<CourseInterface> | Array<string> | any;
  status: boolean;
  name: string;
  surname: string;
  email: string;
  reservationCode: string;
  phone: string;
  password: string;
  username: string;
}

@Injectable()
export class PartnerService {
  // Define API
  //apiURL = 'https://asynctrainingapi5-70vtakyj.b4a.run';
  apiURL = 'http://localhost:3000';
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
  handleError(error: any) {
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

  // get a user
  getPartner(): Observable<PartnerInterface> {
    return this.http
      .get<PartnerInterface>(this.apiURL + '/partners/partner', { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }


  // user course registration
 /*  registerCourse(courseId: string): Observable<any> {
    return this.http
      .put<any>(this.apiURL + '/users/register-course', {courseId: courseId}, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  } */

  private partnerSubject = new BehaviorSubject<any>(null); // Initial value can be anything

  sharedPartnerData$ = this.partnerSubject.asObservable();

  updatePartnerService(data: PartnerInterface) {
    this.partnerSubject.next(data);
  }


}