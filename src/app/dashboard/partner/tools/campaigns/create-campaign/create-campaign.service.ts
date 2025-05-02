import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface CreateCampaignInterface {
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
}
  

@Injectable()
export class CreateCampaignService {
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


  // facebook campaign
  facebook(campaignData: CreateCampaignInterface): Observable<CreateCampaignInterface> {
    //console.log('form record', campaignData);
    return this.http
      .post<CreateCampaignInterface>(this.apiURL + '/campaign/facebook', campaignData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  
  // youtube campaign
  youtube(campaignData: CreateCampaignInterface): Observable<CreateCampaignInterface> {
    //console.log('form record', campaignData);
    return this.http
      .post<CreateCampaignInterface>(this.apiURL + '/campaign/youtube', campaignData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // youtube campaign
  linkedin(campaignData: CreateCampaignInterface): Observable<CreateCampaignInterface> {
    //console.log('form record', campaignData);
    return this.http
      .post<CreateCampaignInterface>(this.apiURL + '/campaign/linkedin', campaignData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   
}