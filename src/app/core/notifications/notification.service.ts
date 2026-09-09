import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { FeedEnvelope } from './notification.models';

/** Unified notification feed → backend `/v1/notifications/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiClient);

  feed(limit = 100): Observable<FeedEnvelope> {
    return this.api.get<FeedEnvelope>(`v1/notifications/mine?limit=${limit}`);
  }

  markRead(ids: string[]): Observable<unknown> {
    return this.api.post('v1/notifications/read', { ids });
  }
}
