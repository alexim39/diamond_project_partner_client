import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { CreateEventPayload, EventEnvelope, EventsEnvelope, RsvpEnvelope, RsvpStatus } from './event.models';

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

  rsvp(eventId: string, status: RsvpStatus): Observable<RsvpEnvelope> {
    return this.api.post<RsvpEnvelope>(`v1/events/${eventId}/rsvp`, { status });
  }

  cancel(eventId: string): Observable<unknown> {
    return this.api.post(`v1/events/${eventId}/cancel`, {});
  }
}
