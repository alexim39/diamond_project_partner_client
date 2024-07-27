import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export interface ProductInterface {
    img: string;
    name: string;
    price: number;
    desc?: string;
    _id: string;
}
  
export interface ProductObjectInterface {

  message: string;
  data: Array<ProductInterface>;
}
  

@Injectable()
export class ProductService {
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


  // get all products
  getAllProducts(): Observable<ProductObjectInterface> {
    return this.http
      .get<ProductObjectInterface>(this.api + `/products/getAll`, { withCredentials: true })
      .pipe(retry(1), catchError(this.handleError));
  }
   
}