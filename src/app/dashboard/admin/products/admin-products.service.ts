import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';
import { ApiEnvelope } from '../../../core/auth/auth.models';

export interface AdminProduct {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  desc?: string;
  img?: string;
}

export interface ProductForm {
  name: string;
  price: number | null;
  desc: string;
  img: string;
}

/** Product catalog admin → legacy `/products` admin endpoints (role-gated server-side). */
@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private readonly api = inject(ApiClient);

  list(): Observable<ApiEnvelope<AdminProduct[]>> {
    return this.api.get<ApiEnvelope<AdminProduct[]>>('products/getAll');
  }

  create(form: ProductForm): Observable<ApiEnvelope<AdminProduct>> {
    return this.api.post<ApiEnvelope<AdminProduct>>('products', {
      name: form.name.trim(),
      price: Number(form.price),
      ...(form.desc.trim() ? { desc: form.desc.trim() } : {}),
      ...(form.img.trim() ? { img: form.img.trim() } : {}),
    });
  }

  update(id: string, form: Partial<ProductForm>): Observable<ApiEnvelope<AdminProduct>> {
    const body: Record<string, unknown> = {};
    if (form.name !== undefined) body['name'] = form.name.trim();
    if (form.price !== undefined && form.price !== null) body['price'] = Number(form.price);
    if (form.desc !== undefined) body['desc'] = form.desc.trim();
    if (form.img !== undefined) body['img'] = form.img.trim();
    return this.api.patch<ApiEnvelope<AdminProduct>>(`products/${id}`, body);
  }
}
