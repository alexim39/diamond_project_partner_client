// paystack.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';


export interface TransactionInterface {
  message: string;
  data: Array<{
    amount: number;
    reference: string;
    status: string;
    paymentStatus?: boolean;
    date: Date;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PaystackService {
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

  // confirm payment
  confirmPayment(reference: string, partnerId: string): Observable<any> {
    return this.http
      .post<any>(this.apiURL + `/billing/confirm-payment`, { reference, partnerId: partnerId }, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

   // get transactions
   getTransactions(partnerId: string): Observable<any> {
    return this.http
      .get<any>(this.apiURL + `/billing/transaction/${partnerId}`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // withdraw request
  withdrawRequest(formData: any): Observable<any> {
    //console.log('data ',formData)
    return this.http
      .post<any>(this.apiURL + `/billing/withdraw-request`, formData, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Initialize Paystack payment
  payWithPaystack(email: string, amount: number, callback: (response: any) => void): void {
    const handler = (window as any).PaystackPop.setup({
      key: 'pk_live_ef4b274402e6786a901e106596f1904e3e08a713', // Replace with your Paystack public key
      email: email,
      amount: amount * 100, // Paystack expects the amount in kobo
      currency: 'NGN',
      ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Generate a random reference number
      callback: (response: any) => {
        // Payment was successful
        callback(response);
      },
      onClose: () => {
        console.log('Payment closed');
      }
    });
    handler.openIframe();
  }
}
