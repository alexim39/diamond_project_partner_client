import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  CenterListEnvelope,
  FeedEnvelope,
  NotificationPreferences,
  PreferencesEnvelope,
} from './notification.models';

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

  /** N1: unified stored + derived list. */
  list(params: { unread?: boolean; q?: string; limit?: number } = {}): Observable<CenterListEnvelope> {
    const qs = new URLSearchParams();
    if (params.unread) qs.set('unread', 'true');
    if (params.q?.trim()) qs.set('q', params.q.trim());
    if (params.limit) qs.set('limit', String(params.limit));
    const suffix = qs.size ? `?${qs.toString()}` : '';
    return this.api.get<CenterListEnvelope>(`v1/notifications/list${suffix}`);
  }

  markStoredRead(id: string): Observable<unknown> {
    return this.api.post(`v1/notifications/${id}/read`, {});
  }

  archiveStored(id: string): Observable<unknown> {
    return this.api.post(`v1/notifications/${id}/archive`, {});
  }

  deleteStored(id: string): Observable<unknown> {
    return this.api.delete(`v1/notifications/${id}`);
  }

  bulk(action: 'read-all' | 'archive-all'): Observable<unknown> {
    return this.api.post('v1/notifications/bulk', { action });
  }

  getPreferences(): Observable<PreferencesEnvelope> {
    return this.api.get<PreferencesEnvelope>('v1/notifications/preferences');
  }

  updatePreferences(prefs: NotificationPreferences): Observable<PreferencesEnvelope> {
    return this.api.put<PreferencesEnvelope>('v1/notifications/preferences', prefs);
  }
}
