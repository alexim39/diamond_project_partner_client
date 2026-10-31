import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  AnnounceEnvelope, Contact, ContactsEnvelope, MessageEnvelope, MessagesEnvelope, PeopleEnvelope,
  RouteEnvelope, SmsFallbackEnvelope, TeamAnnounceEnvelope, UnreadEnvelope,
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

  announceToTeam(teamId: string, title: string, body: string): Observable<TeamAnnounceEnvelope> {
    return this.api.post<TeamAnnounceEnvelope>('v1/messages/team-announcements', { teamId, title, body });
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

  thread(counterpartId: string, limit = 100): Observable<MessagesEnvelope> {
    return this.api.get<MessagesEnvelope>(`v1/messages/thread/${counterpartId}?limit=${limit}`);
  }

  unreadCount(): Observable<UnreadEnvelope> {
    return this.api.get<UnreadEnvelope>('v1/messages/unread-count');
  }

  contacts(): Observable<ContactsEnvelope> {
    return this.api.get<ContactsEnvelope>('v1/messages/contacts');
  }

  /** Live-chat routing intel: presence, masked number, per-page SMS rate. */
  routeInfo(counterpartId: string): Observable<RouteEnvelope> {
    return this.api.get<RouteEnvelope>(`v1/messages/route/${encodeURIComponent(counterpartId)}`);
  }

  /** Approved SMS fallback to an offline counterpart (wallet-charged server-side). */
  sendSmsFallback(to: string, body: string): Observable<SmsFallbackEnvelope> {
    return this.api.post<SmsFallbackEnvelope>('v1/messages/sms-fallback', { to, body });
  }

  /** Global people search for starting chats (safe fields only). */
  people(q: string): Observable<PeopleEnvelope> {
    return this.api.get<PeopleEnvelope>(`v1/messages/people?q=${encodeURIComponent(q)}`);
  }
}
