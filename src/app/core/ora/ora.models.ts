import { ApiEnvelope } from '../../core/auth/auth.models';

export interface OraContext {
  displayName: string;
  level: string;
  levelLabel: string;
  next: string | null;
  nextLabel: string | null;
  percent: number;
  greeting: string;
  starters: string[];
}

export type OraContextEnvelope = ApiEnvelope<OraContext>;

export interface OraChatReply {
  conversationId: string;
  reply: string;
}

export type OraChatEnvelope = ApiEnvelope<OraChatReply>;

export interface OraConversationSummary {
  id: string;
  title: string;
  updatedAt: string | null;
}

export type OraConversationsEnvelope = ApiEnvelope<{ items: OraConversationSummary[] }>;

export interface OraMessage {
  role: 'user' | 'assistant';
  content: string;
  at: string | null;
}

export interface OraConversation {
  id: string;
  title: string;
  messages: OraMessage[];
}

export type OraConversationEnvelope = ApiEnvelope<OraConversation>;
