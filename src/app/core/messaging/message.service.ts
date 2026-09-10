import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  AnnounceEnvelope, ContactsEnvelope, MessageEnvelope,
  MessagesEnvelope, UnreadEnvelope,
} from './message.models';

/** Team communication → backend `/v1/messages/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly api = inject(ApiClient);

  sendDirect(to: string, body: string): Observable<MessageEnvelope> {
    return this.api.post<MessageEnvelope>('v1/messages', { to, body });
  }

  announce(title: string, body: string, scope: 'direct' | 'all'): Observable<AnnounceEnvelope> {
    return this.api.post<AnnounceEnvelope>('v1/messages/announcements', { title, body, scope });
  }

  inbox(limit = 50): Observable<MessagesEnvelope> {
    return this.api.get<MessagesEnvelope>(`v1/messages/inbox?limit=${limit}`);
  }

  sent(limit = 50): Observable<MessagesEnvelope> {
    return this.api.get<MessagesEnvelope>(`v1/messages/sent?limit=${limit}`);
  }

  markRead(messageId: string): Observable<MessageEnvelope> {
    return this.api.post<MessageEnvelope>(`v1/messages/${messageId}/read`, {});
  }

  unreadCount(): Observable<UnreadEnvelope> {
    return this.api.get<UnreadEnvelope>('v1/messages/unread-count');
  }

  contacts(): Observable<ContactsEnvelope> {
    return this.api.get<ContactsEnvelope>('v1/messages/contacts');
  }
}
