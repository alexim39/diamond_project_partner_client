import { ApiEnvelope } from '../../core/auth/auth.models';

export type MessageKind = 'direct' | 'announcement' | 'broadcast';

export interface DirectoryLabel {
  username: string;
  name: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  kind: MessageKind;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender?: DirectoryLabel | null;
  recipient?: DirectoryLabel | null;
}

export interface Contact {
  id: string;
  username: string;
  name: string;
  relation: 'upline' | 'downline';
}

export interface MessagesEnvelope extends ApiEnvelope<Message[]> {
  data: Message[];
}

export interface MessageEnvelope extends ApiEnvelope<Message> {
  data: Message;
}

export interface ContactsEnvelope extends ApiEnvelope<Contact[]> {
  data: Contact[];
}

export interface UnreadEnvelope extends ApiEnvelope<{ unread: number }> {
  data: { unread: number };
}

export interface AnnounceResult {
  inserted: number;
  scope: 'direct' | 'all';
}

export interface AnnounceEnvelope extends ApiEnvelope<AnnounceResult> {
  data: AnnounceResult;
}
