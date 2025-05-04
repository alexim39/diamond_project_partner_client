import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ApiService } from '../../../_common/services/api.service';

export interface ProductInterface {
    img: string;
    name: string;
    price: number;
    desc?: string;
    _id: string;
    quantity?: number;
    description?: string;
}
  
export interface ProductObjectInterface {

  message: string;
  data: Array<ProductInterface>;
}
  

@Injectable()
export class ProductService {constructor(private apiService: ApiService) {}



  // get all products
  getAllProducts(): Observable<ProductObjectInterface> {
      return this.apiService.get<ProductObjectInterface>(`products/getAll`, undefined, undefined, true);
  }

  checkout(formObject: any): Observable<ProductInterface[]> {

    return this.apiService.post<ProductInterface[]>(`products/cart`, formObject, undefined, true);
  }

   // get all products ordered by
   getAllOrderBy(partnerId: string): Observable<ProductObjectInterface> {

      return this.apiService.get<ProductObjectInterface>(`products/getAllOrderBy/${partnerId}`, undefined, undefined, true);
  }
   
}