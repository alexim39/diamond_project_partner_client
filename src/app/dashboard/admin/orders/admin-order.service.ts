import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../_common/services/api.service';

export interface OrderRow {
  _id: string;
  partner: string;
  products: Array<{ product: { _id: string; name: string; price: number } | null; quantity: number }>;
  totalCost: number;
  orderStatus: string;
  createdAt: string;
  owner: { username: string; name: string; phone: string | null } | null;
}

/** Admin product orders → legacy `/products/orders/*` (role-gated server-side). */
@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  constructor(private apiService: ApiService) {}

  queue(status = 'Pending', skip = 0, limit = 50): Observable<{ data: OrderRow[]; meta: { total: number } }> {
    return this.apiService.get<any>(
      `products/orders?status=${encodeURIComponent(status)}&skip=${skip}&limit=${limit}`,
      undefined, undefined, true,
    );
  }

  decide(id: string, status: 'Fulfilled' | 'Cancelled'): Observable<any> {
    return this.apiService.patch<any>(`products/orders/${id}`, { status }, undefined, true);
  }
}
