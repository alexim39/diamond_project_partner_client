import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface CampaignInterface {
    message: string;
    data?: Array<{
      targetAudience: any;
      marketingObjectives: any;
      budget: any;
      adDuration: any;
      adFormat: any;
      _id: string;
      visits?: number;
      createdAt: Date;
      campaignName: string;
    }>;      
}
  

@Injectable()
export class CampaignService {
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


  // get campaigns createdby
  getCampaignCreatedBy(id: string): Observable<CampaignInterface> {
    return this.http
      .get<CampaignInterface>(this.apiURL + `/campaign/all-createdBy/${id}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // get campaign by id
  getCampaignById(id: string): Observable<CampaignInterface> {
    //console.log('id',id)
    return this.http
      .get<CampaignInterface>(this.apiURL + `/campaign/${id}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
   
}