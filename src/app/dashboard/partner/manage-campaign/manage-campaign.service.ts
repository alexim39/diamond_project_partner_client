import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface ManageCampaignInterface {
    transactionId?: string;
    dateOfPayment?: string;
    amount?: number;
    paymentMethod?: string;
    paymentStatus?: boolean;
    action?: null;
    data?: [];
   /*  ageRangeTarget:  string;
      genderTarget:  string;
      locationTarget:  string;
      educationTarget: string;
      relationshipTarget:  string;
      adObjective:  string;
      successMeasurement:  string;
      budgetType:  string;
      budgetAmount: number;
      campaignStartDate:  string;
      campaignEndDate: string;
      noEndDate: boolean;
      adFormat:  string;
      deviceType: string;
      FacebookFeed: boolean
      InstagramFeed: boolean
      InstagramStories:boolean
      FacebookStories: boolean
      AudienceNetwork: boolean
      MessengerInbox: boolean; */
      targetAudience: any;
      marketingObjectives: any;
      budget: any;
      adDuration: any;
      adFormat: any;
      _id: string;
}
  

@Injectable()
export class ManageCampaignService {
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


  // get campaigns createdby
  getCampaignCreatedBy(id: string): Observable<ManageCampaignInterface> {
    return this.http
      .get<ManageCampaignInterface>(this.api + `/campaign/all-createdBy/${id}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
   
}