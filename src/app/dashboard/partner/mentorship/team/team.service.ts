import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

export interface TeamInterface {  
  teamName: string;          // The name of the team  
  description?: string;     // Description or purpose of the team (optional)  
  teamPurpose: string;      // Purpose of the team  
  partnerId: string;
  createdAt?: any;
} 
  

@Injectable()
export class TeamService {
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

  // create team
  createTeam(teamObject: FormGroup): Observable<TeamInterface> {
    //console.log('record', teamObject);
    return this.http
      .post<TeamInterface>(this.apiURL + `/team/create/`, teamObject, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   // get createdby
   getAllTeamsBy(id: string): Observable<Array<TeamInterface>> {
    return this.http
      .get<Array<TeamInterface>>(this.apiURL + `/team/all-createdBy/${id}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }


   
}