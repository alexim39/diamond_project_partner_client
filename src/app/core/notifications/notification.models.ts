import { ApiEnvelope } from '../../core/auth/auth.models';

export type FeedKind = 'followup' | 'inactive' | 'conversion' | 'release';

export interface FeedItem {
  id: string;
  kind: FeedKind;
  urgency: boolean;
  title: string;
  body: string;
  icon: string;
  tag: string;
  link: string | null;
  at: string;
}

export interface FeedEnvelope extends ApiEnvelope<{ items: FeedItem[]; total: number; unreadCount: number }> {
  data: { items: FeedItem[]; total: number; unreadCount: number };
}
