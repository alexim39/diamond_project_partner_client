import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { PartnerInterface } from '../../../../_common/services/partner.service';

export interface TeamInterface {  
  teamName: string;          // The name of the team  
  description?: string;     // Description or purpose of the team (optional)  
  teamPurpose: string;      // Purpose of the team  
  partnerId: string;
  createdAt?: any;
  _id?: string;
} 
  

@Injectable()
export class MyPartnersService {
  // Define API
  apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  //  apiURL = 'http://localhost:3000';


  
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

  // get all partners
  getPartnersOf(partnerId: string): Observable<PartnerInterface[]> {
    //console.log('record', id);
    return this.http
      .get<PartnerInterface[]>(this.apiURL + `/partners/getPartnersOf/${partnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // get partner byId
  getPartnerById(myPartnerId: string): Observable<any> {
    //console.log('record', myPartnerId);
    return this.http
      .get<PartnerInterface>(this.apiURL + `/partners/getById/${myPartnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
    
}