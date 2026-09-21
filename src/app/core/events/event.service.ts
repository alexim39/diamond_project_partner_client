import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { CreateEventPayload, EventCommentEnvelope, EventCommentsEnvelope, EventEnvelope, EventsEnvelope, RsvpEnvelope, RsvpStatus } from './event.models';

/** Group events + RSVP → backend `/v1/events/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly api = inject(ApiClient);

  upcoming(limit = 20): Observable<EventsEnvelope> {
    return this.api.get<EventsEnvelope>(`v1/events/upcoming?limit=${limit}`);
  }

  mine(): Observable<EventsEnvelope> {
    return this.api.get<EventsEnvelope>('v1/events/mine');
  }

  create(payload: CreateEventPayload): Observable<EventEnvelope> {
    return this.api.post<EventEnvelope>('v1/events', payload);
  }

  update(eventId: string, payload: CreateEventPayload): Observable<EventEnvelope> {
    return this.api.put<EventEnvelope>(`v1/events/${eventId}`, payload);
  }

  rsvp(eventId: string, status: RsvpStatus): Observable<RsvpEnvelope> {
    return this.api.post<RsvpEnvelope>(`v1/events/${eventId}/rsvp`, { status });
  }

  cancel(eventId: string): Observable<unknown> {
    return this.api.post(`v1/events/${eventId}/cancel`, {});
  }

  /** Feature/unfeature at top (1 slot per scope, server-enforced). */
  feature(eventId: string, featured: boolean): Observable<EventEnvelope> {
    return this.api.post<EventEnvelope>(`v1/events/${eventId}/feature`, { featured });
  }

  /** Discussion thread — comments + one-level replies (no likes by design). */
  comments(eventId: string): Observable<EventCommentsEnvelope> {
    return this.api.get<EventCommentsEnvelope>(`v1/events/${eventId}/comments`);
  }

  addComment(eventId: string, body: string, parentId?: string | null): Observable<EventCommentEnvelope> {
    return this.api.post<EventCommentEnvelope>(`v1/events/${eventId}/comments`, {
      body, ...(parentId ? { parentId } : {}),
    });
  }

  deleteComment(eventId: string, commentId: string): Observable<unknown> {
    return this.api.delete(`v1/events/${eventId}/comments/${commentId}`);
  }
}
