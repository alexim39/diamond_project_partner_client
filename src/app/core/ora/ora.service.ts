import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  OraChatEnvelope,
  OraContextEnvelope,
  OraConversationEnvelope,
  OraConversationsEnvelope,
} from './ora.models';

/** Ora AI assistant → backend `/v1/ora/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class OraService {
  private readonly api = inject(ApiClient);

  context(): Observable<OraContextEnvelope> {
    return this.api.get<OraContextEnvelope>('v1/ora/context');
  }

  chat(message: string, conversationId?: string): Observable<OraChatEnvelope> {
    return this.api.post<OraChatEnvelope>('v1/ora/chat', {
      message,
      ...(conversationId ? { conversationId } : {}),
    });
  }

  conversations(limit = 20): Observable<OraConversationsEnvelope> {
    return this.api.get<OraConversationsEnvelope>(`v1/ora/conversations?limit=${limit}`);
  }

  conversation(id: string): Observable<OraConversationEnvelope> {
    return this.api.get<OraConversationEnvelope>(`v1/ora/conversations/${id}`);
  }

  deleteConversation(id: string): Observable<unknown> {
    return this.api.delete(`v1/ora/conversations/${id}`);
  }
}
