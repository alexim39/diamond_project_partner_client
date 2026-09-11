import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import {
  CommentEnvelope, CommentsEnvelope, CreatePostPayload, DirectoryEnvelope,
  FeedEnvelope, PostEnvelope, ToggleEnvelope,
} from './community.models';

/** Community feed → backend `/v1/community/*`. Fully typed. */
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly api = inject(ApiClient);

  feed(before?: string, limit = 20): Observable<FeedEnvelope> {
    const query = new URLSearchParams({ limit: String(limit), ...(before ? { before } : {}) });
    return this.api.get<FeedEnvelope>(`v1/community/feed?${query.toString()}`);
  }

  create(payload: CreatePostPayload): Observable<PostEnvelope> {
    return this.api.post<PostEnvelope>('v1/community', payload);
  }

  toggleLike(postId: string): Observable<ToggleEnvelope> {
    return this.api.post<ToggleEnvelope>(`v1/community/${postId}/like`, {});
  }

  toggleCommentLike(commentId: string): Observable<ToggleEnvelope> {
    return this.api.post<ToggleEnvelope>(`v1/community/comments/${commentId}/like`, {});
  }

  directory(query: string): Observable<DirectoryEnvelope> {
    const params = new URLSearchParams({ q: query });
    return this.api.get<DirectoryEnvelope>(`v1/community/directory?${params.toString()}`);
  }

  comments(postId: string): Observable<CommentsEnvelope> {
    return this.api.get<CommentsEnvelope>(`v1/community/${postId}/comments`);
  }

  addComment(postId: string, body: string, parentId?: string): Observable<CommentEnvelope> {
    return this.api.post<CommentEnvelope>(`v1/community/${postId}/comments`, {
      body,
      ...(parentId ? { parentId } : {}),
    });
  }

  toggleSave(postId: string): Observable<PostEnvelope> {
    return this.api.post<PostEnvelope>(`v1/community/${postId}/save`, {});
  }

  report(postId: string, reason = ''): Observable<unknown> {
    return this.api.post(`v1/community/${postId}/report`, { reason });
  }
}
