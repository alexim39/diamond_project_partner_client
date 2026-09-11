import { ApiEnvelope } from '../../core/auth/auth.models';

export type AudienceScope = 'global' | 'team' | 'leadership';
export type RsvpStatus = 'going' | 'interested' | 'declined';

export interface RsvpCounts {
  going: number;
  interested: number;
  declined: number;
  total: number;
}

export interface CommunityEvent {
  id: string;
  authorId: string;
  title: string;
  body: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  scope: AudienceScope;
  createdAt: string;
  author: { username: string; name: string } | null;
  rsvps: RsvpCounts;
  myRsvp: RsvpStatus | null;
}

export interface EventsEnvelope extends ApiEnvelope<{ items: CommunityEvent[]; viewerLevel?: string | null; total?: number }> {
  data: { items: CommunityEvent[]; viewerLevel?: string | null; total?: number };
}

export interface EventEnvelope extends ApiEnvelope<CommunityEvent> {
  data: CommunityEvent;
}

export interface RsvpEnvelope extends ApiEnvelope<{ rsvp: unknown; counts: RsvpCounts }> {
  data: { rsvp: unknown; counts: RsvpCounts };
}

export interface CreateEventPayload {
  title: string;
  body: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  scope: AudienceScope;
}
