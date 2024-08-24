import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { FormGroup } from '@angular/forms';

export interface TicketInterface {  
  subject: string;               // Subject of the issue  
  description: string;           // Description of the challenge faced  
  date: Date;                    // Date the issue occurred  
  category: string;              // Selected category  
  priority: string;              // Priority level (Low, Medium, High)  
  comment?: string;              // Additional comments (optional)  
  partnerId: string;
}
  

@Injectable()
export class TicketService {
  // Define API
  //apiURL = 'https://diamondprojectapi-y6u04o8b.b4a.run/';
  //apiURL = 'http://localhost:3000';

  private apiURL: string = environment.apiUrl; 

  
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

// submit ticket
submitTicket(ticketObject: FormGroup): Observable<TicketInterface> {
  //console.log('record', ticketObject);
  return this.http
    .post<TicketInterface>(this.apiURL + `/ticket/submit/`, ticketObject, { withCredentials: true })
    .pipe(retry(1), catchError(this.handleError));
}


   
}