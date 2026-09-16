import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api-client.service';

export interface ReviewCodeRow {
  id: string;
  code: string;
  status: string;
  createdAt: string | null;
  issuer: { username: string; name: string } | null;
  prospect: { name: string; phone: string } | null;
}

export interface ReviewQueueSummary {
  Pending: number;
  Approved: number;
  Rejected: number;
  Used: number;
}

export interface ReviewQueueEnvelope {
  message: string;
  success: boolean;
  data: { items: ReviewCodeRow[]; total: number; summary: ReviewQueueSummary | null };
}

/** Admin code review → live `/v1/reservations/*` (role-gated server-side). */
@Injectable({ providedIn: 'root' })
export class AdminReservationService {
  private readonly api = inject(ApiClient);

  queue(status = 'Pending', skip = 0, limit = 50, q = ''): Observable<ReviewQueueEnvelope> {
    const query = new URLSearchParams({
      status, skip: String(skip), limit: String(limit), q: q.trim(),
    });
    return this.api.get<ReviewQueueEnvelope>(`v1/reservations/queue?${query.toString()}`);
  }

  decide(id: string, status: 'Approved' | 'Rejected'): Observable<unknown> {
    return this.api.patch(`v1/reservations/${id}`, { status });
  }

  remove(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`v1/reservations/${id}`);
  }
}
